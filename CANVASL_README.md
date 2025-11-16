# CANVASL A₁₁ Implementation

**Version 1.0** - Live implementation of the peer-to-peer, topologically sound, self-sovereign operating system

## What's Been Built

### ✅ Core Components Implemented

1. **Type Definitions** (`src/canvasl/types.js`)
   - Complete JSDoc types for all CANVASL structures
   - MetaLogNode, ChainComplex, Cell, DAG, etc.

2. **Cryptographic Identity** (`src/canvasl/crypto/`)
   - `cid.js` - SHA-256 content addressing
   - `webauthn.js` - Biometric authentication via WebAuthn

3. **Chain Complex** (`src/canvasl/chain/`)
   - `complex.js` - Chain complex operations (C₀-C₄)
   - Boundary operators (∂₁, ∂₂, ∂₃, ∂₄)
   - Euler characteristic computation
   - `homology.js` - Homology validation (∂² = 0)
   - Betti number computation

4. **Storage Layer** (`src/canvasl/storage/`)
   - `opfs.js` - Origin Private File System for fast local storage
   - `idb.js` - IndexedDB for metadata and indexes
   - MetaLog append-only log

5. **DAG Operations** (`src/canvasl/dag/`)
   - Parent-based causality (no timestamps)
   - LCA (Lowest Common Ancestor) finding
   - Three-way merge algorithm
   - Topological sort

6. **React UI** (`src/canvasl/CANVASL.jsx`)
   - Live chain complex visualization
   - DAG statistics
   - Storage usage display
   - Interactive controls for creating nodes and validating homology

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5173
```

## Key Features

### Mathematical Foundations

- **Chain Complex**: Algebraic topology structure with boundary operators
- **Homology Validation**: Ensures ∂² = 0 (boundary of boundary is zero)
- **Betti Numbers**: Topological invariants (β₀, β₁, β₂, β₃, β₄)
- **Euler Characteristic**: χ = Σ(-1)ⁿ|Cₙ|

### Storage Architecture

| Data Type | Storage | Purpose |
|-----------|---------|---------|
| MetaLogNodes | OPFS `/ledger/` | Fast, private file storage |
| Metadata | IndexedDB `nodes` | Queryable indexes |
| DAG Structure | IndexedDB `dag` | Graph traversal |
| Blobs (>10MB) | OPFS `/blobs/` | Streaming large files |
| MetaLog | OPFS `/metalog/sync.jsonl` | Append-only sync log |

### Cryptographic Guarantees

- **Content Addressing**: SHA-256 CIDs ensure immutability
- **WebAuthn**: Biometric authentication (when supported)
- **Signatures**: ECDSA signatures on all nodes (BIP-32 ready)
- **DAG Causality**: Parent links instead of timestamps

## What's Still Pending

### 🔨 To Be Implemented

1. **BIP-32 Key Derivation**
   - Hierarchical deterministic wallets
   - Signature generation/verification

2. **WebRTC Peer Networking**
   - P2P data channels
   - STUN/TURN configuration
   - Node synchronization

3. **MQTT Discovery**
   - Peer discovery via MQTT broker
   - CID announcement
   - Presence management

4. **11 Automata System**
   - A₀: Genesis (C₀ keywords)
   - A₁: Edge Weaver (C₁ connections)
   - A₂: Face Binder (C₂ documents)
   - A₃: Volume Shaper (C₃ interfaces)
   - A₄: Context Evolver (C₄ evolution)
   - A₅: Sheaf Gluer (Federation)
   - A₆: Homology Checker (∂² = 0)
   - A₇: WebAuthn Oracle
   - A₈: BIP-32 Keymaster
   - A₉: WebRTC Messenger
   - A₁₀: MQTT Herald
   - A₁₁: Master Coordinator

5. **Format Fibration**
   - 0D: JSON Canvas export
   - 1D: JSONL export
   - 2D: GeoJSON export
   - 3D: TopoJSON export
   - 4D: Full CANVASL export

6. **WASM Acceleration**
   - Rust implementation for homology computation
   - Fast TopoJSON/GeoJSON conversion
   - Optimized CID computation

## Usage Examples

### Create a Chain Complex

```javascript
import { createChainComplex, addCell } from './canvasl/chain/complex.js';

const complex = createChainComplex();

// Add a vertex (C₀)
addCell(complex, {
  id: 'vertex-1',
  dim: 0,
  boundary: [],
  data: { label: 'keyword' }
});

// Add an edge (C₁)
addCell(complex, {
  id: 'edge-1',
  dim: 1,
  boundary: ['vertex-1', 'vertex-2'],
  data: { type: 'connection' }
});
```

### Validate Homology

```javascript
import { HomologyValidator } from './canvasl/chain/homology.js';

const validator = new HomologyValidator(complex);

// Check ∂² = 0
const isValid = validator.validate(); // true/false

// Compute Betti numbers
const betti = validator.computeAllBetti(); // [β₀, β₁, β₂, β₃, β₄]
```

### Create a MetaLogNode

```javascript
import { computeCID } from './canvasl/crypto/cid.js';
import { OPFSStore } from './canvasl/storage/opfs.js';

const opfs = new OPFSStore();
await opfs.init();

const node = {
  parent: 'genesis',
  cid: await computeCID({ uri: 'canvasl://example' }),
  uri: 'canvasl://example',
  topo: { type: 'Topology', objects: {}, arcs: [] },
  geo: { type: 'FeatureCollection', features: [] },
  // ... other fields
};

await opfs.writeNode(node.cid, node);
```

### DAG Operations

```javascript
import { createDAG, addNode, findLCA } from './canvasl/dag/operations.js';

const dag = createDAG();

addNode(dag, node1);
addNode(dag, node2);

const lca = findLCA(dag, node1.cid, node2.cid);
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  React UI (CANVASL.jsx)                 │
├─────────────────────────────────────────┤
│  Chain Complex + Homology               │
│  ├─ Boundary Operators (∂₁-∂₄)          │
│  ├─ Homology Validation (∂² = 0)        │
│  └─ Betti Numbers                       │
├─────────────────────────────────────────┤
│  Storage Layer                          │
│  ├─ OPFS (MetaLogNodes, Blobs)          │
│  └─ IndexedDB (Metadata, Indexes)       │
├─────────────────────────────────────────┤
│  DAG Operations                         │
│  ├─ Parent-based Causality              │
│  ├─ LCA Finding                         │
│  └─ Three-way Merge                     │
├─────────────────────────────────────────┤
│  Crypto Layer                           │
│  ├─ Content Addressing (CID)            │
│  └─ WebAuthn                            │
└─────────────────────────────────────────┘
```

## Browser Requirements

- **OPFS**: Chrome 86+, Edge 86+, Safari 15.2+
- **WebAuthn**: Chrome 67+, Firefox 60+, Safari 13+
- **IndexedDB**: All modern browsers
- **ES Modules**: All modern browsers

## Mathematical Background

See `docs/01-CanvasL-A11.md` for complete specification including:
- Sheaf theory foundations
- Chain complex definitions
- Homology group computations
- Byzantine fault tolerance
- M-theory correspondence

## Next Steps

1. **Immediate**: Implement BIP-32 key derivation and signatures
2. **Short-term**: Add WebRTC peer networking
3. **Medium-term**: Build 11 automata system
4. **Long-term**: WASM acceleration and full federation

## Development

```bash
# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

ISC - Brian Thorne

## Repository

https://github.com/bthornemail/chat2d
