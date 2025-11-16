/**
 * ML-Enhanced Vector Clock Automaton
 * 
 * Integrates WASM ML embeddings and HNSW indexing with vector clock state
 */

import { VectorClockAutomaton } from './vector-clock-automaton.js';
import { HNSWAutomatonIndex } from '../ml/hnsw-automaton-index.js';
import { WASMMLEngine } from '../ml/wasm-ml-engine.js';

/**
 * ML-Enhanced Vector Clock Automaton
 * 
 * Base class for automata with ML-enhanced state tracking
 */
export class MLVectorClockAutomaton extends VectorClockAutomaton {
  constructor(id, metaLog = null) {
    super(id, metaLog);
    
    this.mlEngine = new WASMMLEngine();
    this.hnswIndex = null; // Will be initialized when blackboard is available
    
    // Initialize ML engine
    this.mlEngine.initialize().catch(error => {
      console.warn(`[Automaton ${id}] ML engine initialization warning:`, error);
    });
  }

  /**
   * Set HNSW index (called by blackboard)
   * 
   * @param {HNSWAutomatonIndex} index - HNSW index instance
   */
  setHNSWIndex(index) {
    this.hnswIndex = index;
  }

  /**
   * Tick with ML-enhanced state tracking
   * 
   * @param {Object} swarm - Swarm context
   * @returns {Promise<void>}
   */
  async tick(swarm = null) {
    // 1. Standard vector clock tick
    await super.tick(swarm);

    // 2. Generate embedding for current state
    const state = this.getState();
    
    try {
      const embedding = await this.mlEngine.embedAutomatonState(state);

      // 3. Update HNSW index if available
      if (this.hnswIndex) {
        await this.hnswIndex.addAutomatonState(this.id, state);
      }

      // 4. Find similar automata using semantic search
      if (this.hnswIndex) {
        const similarAutomata = await this.hnswIndex.semanticSearch(state, 5);

        // 5. Coordinate with similar automata
        await this.coordinateWithSimilar(similarAutomata, swarm);
      }
    } catch (error) {
      console.warn(`[Automaton ${this.id}] ML tick error:`, error);
    }

    // 6. Execute automaton-specific logic
    await this.executeTick(swarm);
  }

  /**
   * Coordinate with semantically similar automata
   * 
   * @param {Array} similarAutomata - Array of similar automata with similarity scores
   * @param {Object} swarm - Swarm context
   * @returns {Promise<void>}
   */
  async coordinateWithSimilar(similarAutomata, swarm) {
    for (const similar of similarAutomata) {
      if (similar.similarity > 0.8 && similar.automatonId !== this.id) {
        // High similarity - coordinate
        const message = {
          type: 'coordinate',
          from: this.id,
          similarity: similar.similarity,
          vectorClock: this.vectorClock.toMap()
        };

        await this.send(similar.automatonId, message);
      }
    }
  }

  /**
   * Receive with ML-enhanced conflict resolution
   * 
   * @param {number} from - Sender automaton ID
   * @param {Object} message - Received message
   * @returns {Promise<void>}
   */
  async receive(from, message) {
    // 1. Standard vector clock merge
    await super.receive(from, message);

    // 2. Check for conflicts using semantic similarity
    if (message.type === 'state_update' && message.state) {
      const remoteState = message.state;
      const localState = this.getState();

      try {
        // Check if states are semantically similar but causally concurrent
        const localEmbedding = await this.mlEngine.embedAutomatonState(localState);
        const remoteEmbedding = await this.mlEngine.embedAutomatonState(remoteState);

        const similarity = this.mlEngine.cosineSimilarity(localEmbedding, remoteEmbedding);

        if (similarity > 0.9) {
          // Very similar states - resolve conflict
          await this.resolveSemanticConflict(localState, remoteState, from);
        }
      } catch (error) {
        console.warn(`[Automaton ${this.id}] ML conflict resolution error:`, error);
      }
    }

    // 3. Execute automaton-specific receive
    await this.executeReceive(from, message);
  }

  /**
   * Resolve semantic conflicts using ML + Meta-Log
   * 
   * @param {Object} localState - Local automaton state
   * @param {Object} remoteState - Remote automaton state
   * @param {number} from - Sender automaton ID
   * @returns {Promise<void>}
   */
  async resolveSemanticConflict(localState, remoteState, from) {
    if (!this.metaLog) return;

    try {
      // Query Meta-Log for conflict resolution strategy
      const dimension = this.state.dimension || 0;
      
      // Determine strategy based on dimension
      let strategy = 'vector_clock_lww'; // Default: Last-write-wins
      
      if (dimension === 0 || dimension === 1 || dimension === 6 || dimension === 7) {
        strategy = 'semantic_similarity';
      } else if (dimension === 2 || dimension === 5) {
        strategy = 'homology_preservation';
      }

      switch (strategy) {
        case 'semantic_similarity':
          // Use ML similarity for resolution
          const localEmbedding = await this.mlEngine.embedAutomatonState(localState);
          const remoteEmbedding = await this.mlEngine.embedAutomatonState(remoteState);
          
          // For now, keep local state if similarity is very high (simplified)
          // In production, would use query context to determine which is better
          break;

        case 'vector_clock_lww':
          // Last-write-wins based on vector clock
          const localMax = Math.max(...Array.from(localState.vectorClock.values()));
          const remoteMax = Math.max(...Array.from(remoteState.vectorClock.values()));

          if (remoteMax > localMax) {
            // Remote is newer, merge
            await this.mergeState(remoteState);
          }
          break;

        case 'homology_preservation':
          // Use topological validation
          const localValid = await this.validateHomology(localState);
          const remoteValid = await this.validateHomology(remoteState);

          if (remoteValid && !localValid) {
            await this.mergeState(remoteState);
          }
          break;
      }
    } catch (error) {
      console.warn(`[Automaton ${this.id}] Conflict resolution error:`, error);
    }
  }

  /**
   * Query similar automata using ProLog + HNSW
   * 
   * @param {string} prologConstraints - ProLog query constraints
   * @param {number} k - Number of results
   * @returns {Promise<Array>} Similar automaton states
   */
  async querySimilarAutomata(prologConstraints, k = 10) {
    if (!this.metaLog || !this.hnswIndex) {
      return [];
    }

    try {
      // 1. Query Meta-Log for automata matching ProLog constraints
      const matchingResults = await this.metaLog.prologQuery(prologConstraints);

      // 2. Get states for matching automata
      const states = [];
      for (const result of matchingResults.bindings || []) {
        const automatonId = result.AutomatonId || result.id || result.A;
        if (automatonId !== undefined) {
          try {
            const state = await this.hnswIndex.getStateFromMetaLog(automatonId);
            states.push(state);
          } catch (error) {
            // Skip if state not found
          }
        }
      }

      // 3. Rank by semantic similarity to current state
      const currentState = this.getState();
      const currentEmbedding = await this.mlEngine.embedAutomatonState(currentState);

      const ranked = await Promise.all(
        states.map(async (state) => {
          const embedding = await this.mlEngine.embedAutomatonState(state);
          const similarity = this.mlEngine.cosineSimilarity(currentEmbedding, embedding);
          return { state, similarity };
        })
      );

      // 4. Sort by similarity and return top k
      return ranked
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, k)
        .map(r => r.state);
    } catch (error) {
      console.error(`[Automaton ${this.id}] Query similar automata error:`, error);
      return [];
    }
  }

  /**
   * Merge state (override in subclasses)
   * 
   * @param {Object} state - State to merge
   * @returns {Promise<void>}
   */
  async mergeState(state) {
    // Override in subclasses for specific merge logic
    this.state = { ...this.state, ...state };
    this.vectorClock = VectorClock.fromObject(this.id, state.vectorClock || {});
  }

  /**
   * Validate homology (override in subclasses)
   * 
   * @param {Object} state - State to validate
   * @returns {Promise<boolean>} True if valid
   */
  async validateHomology(state) {
    // Override in subclasses for homology validation
    // For now, return true (no validation)
    return true;
  }
}

