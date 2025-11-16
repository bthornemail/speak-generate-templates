/**
 * HNSW Automaton Index
 * 
 * HNSW graph index for automaton vector clock states
 * Provides fast approximate nearest neighbor search over automaton states
 */

import { WASMMLEngine } from './wasm-ml-engine.js';

// Note: hnswlib-wasm may need to be imported differently
// For now, we'll create a wrapper that can work with the library when available
let HNSWLib = null;

try {
  // Try to import hnswlib-wasm
  // The actual import may vary based on the package structure
  HNSWLib = await import('hnswlib-wasm').catch(() => null);
} catch (error) {
  console.warn('[HNSW] Could not import hnswlib-wasm, using fallback implementation');
}

/**
 * HNSW Graph Index for Automaton Vector Clock States
 */
export class HNSWAutomatonIndex {
  constructor(metaLog, mlEngine) {
    this.metaLog = metaLog;
    this.mlEngine = mlEngine || new WASMMLEngine();
    
    // Mapping: automatonId → index label
    this.automatonToLabel = new Map();
    this.labelToAutomaton = new Map();
    
    // Embedding cache
    this.embeddingCache = new Map();
    
    this.dimension = 384; // Embedding dimension
    this.maxElements = 10000; // Max automata in index
    this.index = null;
    this.initialized = false;
  }

  /**
   * Initialize HNSW index
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    await this.mlEngine.initialize();

    if (HNSWLib) {
      try {
        // Initialize HNSW index with cosine distance
        this.index = new HNSWLib.HierarchicalNSW('cosine', this.dimension);
        this.index.initIndex(this.maxElements);
        this.initialized = true;
        console.log('[HNSW] Index initialized');
      } catch (error) {
        console.warn('[HNSW] Failed to initialize HNSW library, using fallback:', error);
        this.useFallback = true;
      }
    } else {
      this.useFallback = true;
    }

    if (this.useFallback) {
      // Fallback: Use simple linear search with cosine similarity
      this.embeddings = new Map(); // automatonId → embedding
      this.states = new Map(); // automatonId → state
      this.initialized = true;
      console.log('[HNSW] Using fallback linear search');
    }
  }

  /**
   * Add automaton state to HNSW index
   * 
   * @param {number} automatonId - Automaton ID
   * @param {Object} state - Automaton state
   * @returns {Promise<void>}
   */
  async addAutomatonState(automatonId, state) {
    if (!this.initialized) {
      await this.initialize();
    }

    // 1. Generate embedding
    const embedding = await this.mlEngine.embedAutomatonState(state);
    this.embeddingCache.set(automatonId, embedding);

    if (this.useFallback) {
      // Fallback: Store in maps
      this.embeddings.set(automatonId, embedding);
      this.states.set(automatonId, state);
      return;
    }

    // 2. Get or assign label
    let label = this.automatonToLabel.get(automatonId);
    if (label === undefined) {
      label = this.index.getCurrentCount();
      this.automatonToLabel.set(automatonId, label);
      this.labelToAutomaton.set(label, automatonId);
    }

    // 3. Add to HNSW index
    try {
      this.index.addPoint(embedding, label);
    } catch (error) {
      console.error('[HNSW] Error adding point:', error);
      // Fallback to linear search
      this.useFallback = true;
      this.embeddings.set(automatonId, embedding);
      this.states.set(automatonId, state);
    }

    // 4. Store in Meta-Log blackboard
    await this.storeInMetaLog(automatonId, state, embedding);
  }

  /**
   * Semantic search for similar automaton states
   * 
   * @param {Object} queryState - Query automaton state
   * @param {number} k - Number of results
   * @returns {Promise<Array>} Similar automaton states with similarity scores
   */
  async semanticSearch(queryState, k = 10) {
    if (!this.initialized) {
      await this.initialize();
    }

    // 1. Generate query embedding
    const queryEmbedding = await this.mlEngine.embedAutomatonState(queryState);

    if (this.useFallback) {
      // Fallback: Linear search with cosine similarity
      const results = [];
      
      for (const [automatonId, embedding] of this.embeddings) {
        const similarity = this.mlEngine.cosineSimilarity(queryEmbedding, embedding);
        results.push({
          automatonId,
          similarity,
          state: this.states.get(automatonId)
        });
      }

      // Sort by similarity and return top k
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, k);
    }

    // 2. HNSW approximate nearest neighbors
    try {
      const [labels, distances] = this.index.searchKnn(queryEmbedding, k);

      // 3. Retrieve automaton states
      const results = await Promise.all(
        labels.map(async (label, i) => {
          const automatonId = this.labelToAutomaton.get(label);
          const state = await this.getStateFromMetaLog(automatonId);
          return {
            automatonId,
            similarity: 1 - distances[i], // Convert distance to similarity
            state
          };
        })
      );

      return results;
    } catch (error) {
      console.error('[HNSW] Search error:', error);
      // Fallback to linear search
      return this.semanticSearch(queryState, k); // Will use fallback
    }
  }

  /**
   * Find automata with similar vector clock states
   * 
   * @param {Map<number, number>} vectorClock - Vector clock to search for
   * @param {number} k - Number of results
   * @returns {Promise<number[]>} Array of automaton IDs
   */
  async findSimilarVectorClocks(vectorClock, k = 10) {
    // Create query state from vector clock
    const queryState = {
      id: -1, // Query state
      vectorClock,
      dimension: 0,
      running: false,
      cellCounts: { C0: 0, C1: 0, C2: 0, C3: 0, C4: 0 }
    };

    const results = await this.semanticSearch(queryState, k);
    return results.map(r => r.automatonId);
  }

  /**
   * Update automaton state in index
   * 
   * @param {number} automatonId - Automaton ID
   * @param {Object} newState - New automaton state
   * @returns {Promise<void>}
   */
  async updateAutomatonState(automatonId, newState) {
    // For HNSW, we can't remove points, so we add the new state
    // The old state will be overwritten in the label mapping
    await this.addAutomatonState(automatonId, newState);
  }

  /**
   * Store automaton state and embedding in Meta-Log
   * 
   * @param {number} automatonId - Automaton ID
   * @param {Object} state - Automaton state
   * @param {Float32Array} embedding - Embedding vector
   * @returns {Promise<void>}
   */
  async storeInMetaLog(automatonId, state, embedding) {
    if (!this.metaLog) return;

    try {
      // Store state facts as DataLog facts
      const facts = [
        {
          predicate: 'automaton_state',
          args: [
            automatonId,
            state.dimension || 0,
            state.running ? 'true' : 'false'
          ]
        },
        {
          predicate: 'automaton_cells',
          args: [
            automatonId,
            state.cellCounts?.C0 || 0,
            state.cellCounts?.C1 || 0,
            state.cellCounts?.C2 || 0
          ]
        }
      ];

      // Add facts to DataLog
      if (this.metaLog.datalog && this.metaLog.datalog.addFacts) {
        this.metaLog.datalog.addFacts(facts);
      }

      // Store vector clock facts
      if (state.vectorClock) {
        const clockFacts = Array.from(state.vectorClock.entries()).map(([peer, tick]) => ({
          predicate: 'automaton_tick',
          args: [automatonId, peer, tick]
        }));

        if (this.metaLog.datalog && this.metaLog.datalog.addFacts) {
          this.metaLog.datalog.addFacts(clockFacts);
        }
      }

      // Store embedding facts (first 10 dimensions as example)
      const embeddingFacts = [];
      for (let i = 0; i < Math.min(10, embedding.length); i++) {
        embeddingFacts.push({
          predicate: 'automaton_embedding',
          args: [automatonId, i, embedding[i]]
        });
      }

      if (this.metaLog.datalog && this.metaLog.datalog.addFacts) {
        this.metaLog.datalog.addFacts(embeddingFacts);
      }
    } catch (error) {
      console.warn('[HNSW] Failed to store in Meta-Log:', error);
    }
  }

  /**
   * Retrieve automaton state from Meta-Log
   * 
   * @param {number} automatonId - Automaton ID
   * @returns {Promise<Object>} Automaton state
   */
  async getStateFromMetaLog(automatonId) {
    if (!this.metaLog) {
      throw new Error('Meta-Log not available');
    }

    try {
      // Query DataLog for automaton state
      const stateQuery = `automaton_state(${automatonId}, ?Dimension, ?Running)`;
      const stateResults = await this.metaLog.datalogQuery(stateQuery);

      if (stateResults.facts && stateResults.facts.length > 0) {
        const fact = stateResults.facts[0];
        const dimension = fact.args[1];
        const running = fact.args[2] === 'true';

        // Query cell counts
        const cellsQuery = `automaton_cells(${automatonId}, ?C0, ?C1, ?C2)`;
        const cellsResults = await this.metaLog.datalogQuery(cellsQuery);

        let cellCounts = { C0: 0, C1: 0, C2: 0, C3: 0, C4: 0 };
        if (cellsResults.facts && cellsResults.facts.length > 0) {
          const cellsFact = cellsResults.facts[0];
          cellCounts = {
            C0: cellsFact.args[1] || 0,
            C1: cellsFact.args[2] || 0,
            C2: cellsFact.args[3] || 0,
            C3: 0,
            C4: 0
          };
        }

        // Query vector clock
        const clockQuery = `automaton_tick(${automatonId}, ?Peer, ?Tick)`;
        const clockResults = await this.metaLog.datalogQuery(clockQuery);
        const vectorClock = new Map();

        if (clockResults.facts) {
          for (const fact of clockResults.facts) {
            const peer = fact.args[1];
            const tick = fact.args[2];
            vectorClock.set(peer, tick);
          }
        }

        return {
          id: automatonId,
          dimension,
          running,
          vectorClock,
          cellCounts
        };
      }

      throw new Error(`Automaton state not found: ${automatonId}`);
    } catch (error) {
      console.error('[HNSW] Error retrieving state from Meta-Log:', error);
      throw error;
    }
  }

  /**
   * Clear index
   */
  clear() {
    this.automatonToLabel.clear();
    this.labelToAutomaton.clear();
    this.embeddingCache.clear();
    if (this.useFallback) {
      this.embeddings.clear();
      this.states.clear();
    }
  }
}

