/**
 * ML Type Definitions
 * 
 * Type definitions for automaton states, embeddings, and ML operations
 */

/**
 * Automaton State
 * 
 * @typedef {Object} AutomatonState
 * @property {number} id - Automaton ID (0-10)
 * @property {number} dimension - Dimension (0D-7D)
 * @property {Map<number, number>} vectorClock - Vector clock: automatonId → tick
 * @property {boolean} running - Running state
 * @property {Object} cellCounts - Chain complex cell counts
 * @property {number} cellCounts.C0 - 0-cells count
 * @property {number} cellCounts.C1 - 1-cells count
 * @property {number} cellCounts.C2 - 2-cells count
 * @property {number} cellCounts.C3 - 3-cells count
 * @property {number} cellCounts.C4 - 4-cells count
 * @property {number[]} [betti] - Betti numbers
 * @property {number} [euler] - Euler characteristic
 * @property {number} [peerCount] - Network peer count
 * @property {number} [activeAppCount] - Active app count
 */

/**
 * Vector Clock
 * 
 * @typedef {Map<number, number>} VectorClock
 * Map from automatonId to tick number
 * Example: { 0: 10, 1: 5, 2: 8 }
 * Means: automaton 0 has seen automaton 0's tick 10, automaton 1's tick 5, automaton 2's tick 8
 */

/**
 * Embedding Vector
 * 
 * @typedef {Float32Array} Embedding
 * Float32Array representing embedding vector (typically 384 dimensions)
 */

/**
 * Similarity Search Result
 * 
 * @typedef {Object} SimilarityResult
 * @property {number} automatonId - Automaton ID
 * @property {number} similarity - Similarity score (0-1)
 * @property {AutomatonState} state - Automaton state
 */

/**
 * Feature Vector
 * 
 * @typedef {number[]} FeatureVector
 * Array of normalized feature values extracted from automaton state
 */

export {};

