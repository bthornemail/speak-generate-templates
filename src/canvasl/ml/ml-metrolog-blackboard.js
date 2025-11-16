/**
 * Unified ML-Meta-Log Blackboard
 * 
 * Integrates WASM ML, HNSW indexing, vector clock state engines, and ProLog/DataLog reasoning
 */

import { HNSWAutomatonIndex } from './hnsw-automaton-index.js';
import { WASMMLEngine } from './wasm-ml-engine.js';
import { MetaLogAdapter } from '../meta-log/meta-log-adapter.js';
import { MetaLogMLRules } from './metrolog-ml-rules.js';

/**
 * Unified ML-Meta-Log Blackboard
 * 
 * Integrates:
 * - WASM ML for embeddings
 * - HNSW for semantic search
 * - Vector clock state engines (automata)
 * - ProLog/DataLog for reasoning
 */
export class MLMetaLogBlackboard {
  constructor(config = {}) {
    this.config = config;
    
    this.mlEngine = new WASMMLEngine();
    this.metaLog = new MetaLogAdapter(config.metaLog || {});
    this.hnswIndex = null; // Will be initialized after metaLog
    this.mlRules = new MetaLogMLRules(this.metaLog);
    
    // Automaton registry
    this.automata = new Map();
    
    this.initialized = false;
  }

  /**
   * Initialize blackboard
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // 1. Initialize WASM ML engine
      await this.mlEngine.initialize();

      // 2. Initialize Meta-Log database
      await this.metaLog.initialize();

      // 3. Initialize HNSW index
      this.hnswIndex = new HNSWAutomatonIndex(this.metaLog, this.mlEngine);
      await this.hnswIndex.initialize();

      // 4. Initialize Meta-Log rules
      await this.mlRules.initializeRules();

      this.initialized = true;
      console.log('[ML-Meta-Log Blackboard] Initialized');
    } catch (error) {
      console.error('[ML-Meta-Log Blackboard] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Register automaton with blackboard
   * 
   * @param {Object} automaton - ML-enhanced automaton instance
   * @returns {Promise<void>}
   */
  async registerAutomaton(automaton) {
    if (!this.initialized) {
      await this.initialize();
    }

    this.automata.set(automaton.id, automaton);

    // Set HNSW index on automaton
    if (automaton.setHNSWIndex) {
      automaton.setHNSWIndex(this.hnswIndex);
    }

    // Add initial state to HNSW index
    const state = automaton.getState();
    await this.hnswIndex.addAutomatonState(automaton.id, state);

    // Store in Meta-Log
    await this.storeAutomatonInMetaLog(automaton.id, state);

    console.log(`[ML-Meta-Log Blackboard] Registered automaton ${automaton.id}`);
  }

  /**
   * Semantic search across all automata
   * 
   * @param {Object|string} query - Query state or text query
   * @param {number} k - Number of results
   * @returns {Promise<Array>} Similar automaton states with similarity scores
   */
  async semanticSearch(query, k = 10) {
    if (!this.initialized) {
      await this.initialize();
    }

    let queryState;

    if (typeof query === 'string') {
      // Convert text query to state (simplified)
      queryState = this.textToState(query);
    } else {
      queryState = query;
    }

    return await this.hnswIndex.semanticSearch(queryState, k);
  }

  /**
   * Hybrid query: ProLog + semantic similarity
   * 
   * @param {string} prologQuery - ProLog query string
   * @param {Object} semanticQuery - Optional semantic query state
   * @param {number} k - Number of results
   * @returns {Promise<Array>} Automaton states
   */
  async hybridQuery(prologQuery, semanticQuery = null, k = 10) {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.mlRules.hybridQuery(prologQuery, semanticQuery, k);
  }

  /**
   * Find automata with similar vector clocks
   * 
   * @param {Map<number, number>} vectorClock - Vector clock to search for
   * @param {number} k - Number of results
   * @returns {Promise<number[]>} Array of automaton IDs
   */
  async findSimilarVectorClocks(vectorClock, k = 10) {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.hnswIndex.findSimilarVectorClocks(vectorClock, k);
  }

  /**
   * Query causality using ProLog
   * 
   * @param {number} automatonId - Automaton ID
   * @returns {Promise<Array>} Causal chain results
   */
  async queryCausality(automatonId) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      return await this.metaLog.prologQuery(`causal_chain(${automatonId}, Chain).`);
    } catch (error) {
      console.error('[ML-Meta-Log Blackboard] Causality query error:', error);
      return [];
    }
  }

  /**
   * Check happens-before relationship
   * 
   * @param {number} a1 - First automaton ID
   * @param {number} a2 - Second automaton ID
   * @returns {Promise<boolean>} True if a1 happens before a2
   */
  async happensBefore(a1, a2) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const results = await this.metaLog.prologQuery(`happens_before(${a1}, ${a2}).`);
      return results.bindings && results.bindings.length > 0;
    } catch (error) {
      console.error('[ML-Meta-Log Blackboard] Happens-before query error:', error);
      return false;
    }
  }

  /**
   * Store automaton in Meta-Log
   * 
   * @param {number} automatonId - Automaton ID
   * @param {Object} state - Automaton state
   * @returns {Promise<void>}
   */
  async storeAutomatonInMetaLog(automatonId, state) {
    if (!this.metaLog) return;

    try {
      // Store vector clock facts
      if (state.vectorClock) {
        const clockFacts = Array.from(state.vectorClock.entries()).map(([peer, tick]) => ({
          predicate: 'automaton_tick',
          args: [automatonId, peer, tick]
        }));

        await this.metaLog.addDataLogFacts(clockFacts);
      }

      // Store state facts
      const stateFacts = [
        {
          predicate: 'automaton_state',
          args: [automatonId, state.dimension || 0, state.running ? 'true' : 'false']
        },
        {
          predicate: 'dimension',
          args: [automatonId, state.dimension || 0]
        }
      ];

      await this.metaLog.addDataLogFacts(stateFacts);
    } catch (error) {
      console.warn(`[ML-Meta-Log Blackboard] Failed to store automaton ${automatonId}:`, error);
    }
  }

  /**
   * Convert text query to state (simplified)
   * 
   * @param {string} text - Text query
   * @returns {Object} Automaton state
   */
  textToState(text) {
    // Simplified text-to-state conversion
    // In production, use NLP to extract features
    return {
      id: -1,
      dimension: 0,
      running: false,
      vectorClock: new Map(),
      cellCounts: { C0: 0, C1: 0, C2: 0, C3: 0, C4: 0 }
    };
  }

  /**
   * Get automaton by ID
   * 
   * @param {number} id - Automaton ID
   * @returns {Object|null} Automaton instance
   */
  getAutomaton(id) {
    return this.automata.get(id) || null;
  }

  /**
   * Get all registered automata
   * 
   * @returns {Array} Array of automaton instances
   */
  getAllAutomata() {
    return Array.from(this.automata.values());
  }
}

