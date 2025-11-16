/**
 * Integration Example
 * 
 * Example usage of WASM ML + HNSW + Vector Clock + Meta-Log integration
 */

import { MLMetaLogBlackboard } from './ml-metrolog-blackboard.js';
import { A0_TopologyAutomaton } from '../automaton/dimension-automata/0d-topology-automaton.js';

/**
 * Example: Basic blackboard usage
 */
export async function basicExample() {
  // Initialize blackboard
  const blackboard = new MLMetaLogBlackboard();
  await blackboard.initialize();

  // Register automata
  const automaton0 = new A0_TopologyAutomaton(0, blackboard.metaLog);
  await blackboard.registerAutomaton(automaton0);

  // Semantic search
  const results = await blackboard.semanticSearch({
    id: -1,
    dimension: 0,
    running: true,
    vectorClock: new Map([[0, 10]]),
    cellCounts: { C0: 1, C1: 0, C2: 0, C3: 0, C4: 0 }
  }, 10);

  console.log('Semantic search results:', results);

  // Hybrid query
  const hybridResults = await blackboard.hybridQuery(
    'dimension(A, 0), running(A, true).',
    null,
    10
  );

  console.log('Hybrid query results:', hybridResults);

  // Query causality
  const causalChain = await blackboard.queryCausality(0);
  console.log('Causal chain:', causalChain);
}

/**
 * Example: Multiple automata coordination
 */
export async function coordinationExample() {
  const blackboard = new MLMetaLogBlackboard();
  await blackboard.initialize();

  // Register multiple automata
  const automaton0 = new A0_TopologyAutomaton(0, blackboard.metaLog);
  const automaton1 = new A0_TopologyAutomaton(1, blackboard.metaLog);

  await blackboard.registerAutomaton(automaton0);
  await blackboard.registerAutomaton(automaton1);

  // Tick automata
  await automaton0.tick();
  await automaton1.tick();

  // Send message between automata
  await automaton0.send(1, {
    type: 'coordinate',
    data: { message: 'Hello from automaton 0' }
  });

  // Find similar vector clocks
  const similar = await blackboard.findSimilarVectorClocks(
    automaton0.vectorClock.toMap(),
    5
  );

  console.log('Similar automata:', similar);
}

// Run examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  basicExample().catch(console.error);
}

