# WASM ML + HNSW + Automaton Vector Clock State Engines + Meta-Log Blackboard

## Overview

This document describes the integration of WASM ML, HNSW indexing, vector clock state engines, and Meta-Log blackboard for semantic search and distributed causality tracking in automaton systems.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         WASM ML Layer (TensorFlow.js + WASM Backend)        │
│  - Embedding generation for automaton states               │
│  - Semantic similarity computation                         │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              HNSW Graph Index (WASM)                       │
│  - Approximate nearest neighbor search                      │
│  - Fast semantic search over automaton states              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│      Automaton Vector Clock State Engines (0D-7D)          │
│  - Distributed causality tracking                          │
│  - State synchronization via vector clocks                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│         Meta-Log Blackboard (ProLog/DataLog)                │
│  - Vector clock facts and causality rules                   │
│  - Semantic queries and state queries                      │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. WASM ML Engine (`src/canvasl/ml/wasm-ml-engine.js`)

Generates embeddings for automaton states using TensorFlow.js WASM backend.

**Features**:
- Browser-native ML operations
- 384-dimensional embeddings
- Feature extraction from automaton states
- Cosine similarity computation
- Embedding caching

**Usage**:
```javascript
import { WASMMLEngine } from './src/canvasl/ml/wasm-ml-engine.js';

const mlEngine = new WASMMLEngine();
await mlEngine.initialize();

const state = {
  id: 0,
  dimension: 0,
  vectorClock: new Map([[0, 10], [1, 5]]),
  running: true,
  cellCounts: { C0: 10, C1: 5, C2: 2, C3: 0, C4: 0 }
};

const embedding = await mlEngine.embedAutomatonState(state);
```

### 2. HNSW Automaton Index (`src/canvasl/ml/hnsw-automaton-index.js`)

Fast approximate nearest neighbor search over automaton states.

**Features**:
- O(log n) similarity search
- Semantic search over automaton states
- Similar vector clock state discovery
- Index persistence

**Usage**:
```javascript
import { HNSWAutomatonIndex } from './src/canvasl/ml/hnsw-automaton-index.js';

const index = new HNSWAutomatonIndex(metaLog, mlEngine);
await index.initialize();

await index.addAutomatonState(0, state);
const results = await index.semanticSearch(queryState, 10);
```

### 3. Vector Clock (`src/canvasl/automaton/vector-clock.js`)

Distributed causality tracking using vector clocks.

**Features**:
- Happens-before relationship detection
- Concurrent event detection
- Causal chain extraction
- Vector clock merge logic

**Usage**:
```javascript
import { VectorClock } from './src/canvasl/automaton/vector-clock.js';

const clock = new VectorClock(0);
clock.tick(); // Increment own tick
const merged = clock.merge(otherClock);
const happensBefore = clock.happensBefore(otherClock);
```

### 4. ML-Enhanced Automata (`src/canvasl/automaton/ml-vector-clock-automaton.js`)

Base class for automata with ML-enhanced state tracking.

**Features**:
- Automatic embedding generation
- Semantic coordination with similar automata
- ML-based conflict resolution
- Hybrid queries (ProLog + semantic)

**Usage**:
```javascript
import { MLVectorClockAutomaton } from './src/canvasl/automaton/ml-vector-clock-automaton.js';

class MyAutomaton extends MLVectorClockAutomaton {
  async executeTick(swarm) {
    // Automaton-specific logic
  }
}
```

### 5. Unified Blackboard (`src/canvasl/ml/ml-metrolog-blackboard.js`)

Unified API integrating all components.

**Features**:
- Automaton registration
- Semantic search
- Hybrid queries (ProLog + semantic)
- Causality queries

**Usage**:
```javascript
import { MLMetaLogBlackboard } from './src/canvasl/ml/ml-metrolog-blackboard.js';
import { A0_TopologyAutomaton } from './src/canvasl/automaton/dimension-automata/0d-topology-automaton.js';

const blackboard = new MLMetaLogBlackboard();
await blackboard.initialize();

// Register automata
await blackboard.registerAutomaton(new A0_TopologyAutomaton(0, blackboard.metaLog));

// Semantic search
const results = await blackboard.semanticSearch({
  id: -1,
  dimension: 0,
  running: true,
  vectorClock: new Map([[0, 10]]),
  cellCounts: { C0: 1, C1: 0, C2: 0, C3: 0, C4: 0 }
}, 10);

// Hybrid query
const hybridResults = await blackboard.hybridQuery(
  'dimension(A, 0), running(A, true).',
  queryState,
  10
);

// Query causality
const causalChain = await blackboard.queryCausality(0);
```

## Integration with Meta-Log Database

The system integrates with the `meta-log-db` package via `MetaLogAdapter`:

```javascript
import { MetaLogAdapter } from './src/canvasl/meta-log/meta-log-adapter.js';

const metaLog = new MetaLogAdapter({
  indexedDBName: 'canvasl-meta-log',
  enableProlog: true,
  enableDatalog: true
});

await metaLog.initialize();
```

## Data Models

### AutomatonState

```javascript
{
  id: number,                    // Automaton ID (0-10)
  dimension: number,              // Dimension (0D-7D)
  vectorClock: Map<number, number>, // Vector clock: automatonId → tick
  running: boolean,               // Running state
  cellCounts: {                   // Chain complex cell counts
    C0: number,
    C1: number,
    C2: number,
    C3: number,
    C4: number
  },
  betti?: number[],              // Betti numbers
  euler?: number,                 // Euler characteristic
  peerCount?: number,             // Network peer count
  activeAppCount?: number         // Active app count
}
```

## Performance Considerations

- **HNSW Index**: O(log n) search complexity
- **Embedding Generation**: Cached for performance
- **Vector Clock Merge**: O(n) where n is number of automata
- **Meta-Log Queries**: Depends on fact count and rule complexity

## Browser Compatibility

All components work browser-natively:
- TensorFlow.js WASM backend (no GPU required)
- HNSW index with WASM fallback
- IndexedDB for persistence
- No server required

## Dependencies

- `@tensorflow/tfjs@^4.15.0`
- `@tensorflow/tfjs-backend-wasm@^4.15.0`
- `hnswlib-wasm@^0.8.2`
- `meta-log-db` (via npm link or import)

## Future Enhancements

- Pre-trained embedding models
- Incremental HNSW index updates
- Distributed vector clock synchronization
- Advanced conflict resolution strategies
- Performance optimizations

