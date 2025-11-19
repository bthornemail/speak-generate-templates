# Org Mode Bipartite Canvas Architecture

**Version 1.0 — January 2025**  
**Org Mode as Primary Format for CanvasL Templates**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Org Mode as Bipartite to Canvas API](#2-org-mode-as-bipartite-to-canvas-api)
3. [Source Blocks Bipartite with SVG](#3-source-blocks-bipartite-with-svg)
4. [Noweb Source Block Composition](#4-noweb-source-block-composition)
5. [JSONL References as Property Drawer](#5-jsonl-references-as-property-drawer)
6. [CanvasL as Extension of JSONL/JSON Canvas Spec](#6-canvasl-as-extension-of-jsonljson-canvas-spec)
7. [Layout Order and Organization for Topology](#7-layout-order-and-organization-for-topology)
8. [BIP32/39/44 Path Mapping](#8-bip323944-path-mapping)
9. [Component Projection from Source Block Headers](#9-component-projection-from-source-block-headers)
10. [Markdown as Tanglable Source Blocks](#10-markdown-as-tanglable-source-blocks)
11. [Protocol Handlers for RPC Commands](#11-protocol-handlers-for-rpc-commands)
12. [Blackboard Pattern for MVC Decoupling](#12-blackboard-pattern-for-mvc-decoupling)
13. [Implementation Plan](#13-implementation-plan)
14. [Examples](#14-examples)
15. [Benefits Summary](#15-benefits-summary)
16. [Migration Guide](#16-migration-guide)

---

## 1. Executive Summary

### 1.1 Current State

The CANVASL system currently uses **Markdown+YAML frontmatter** as the primary template format:

- **YAML Frontmatter**: Contains template metadata, adjacency structure, macros, validation rules
- **Markdown Body**: Contains documentation and content
- **winkNLP Engine**: Parses free text and extracts grammar patterns
- **AST Builder**: Constructs abstract syntax trees from NLP analysis

**Limitations**:
- YAML frontmatter is separate from body content (no structural relationship)
- Source blocks cannot be directly projected to Canvas
- No tangling/export system for extracting code blocks
- Limited support for protocol handlers in source blocks
- Property metadata scattered across frontmatter

### 1.2 Proposed State

**Org Mode as Primary Format**:

- **Org Mode Document**: Single file containing structure, metadata, and source blocks
- **Property Drawer**: Stores CANVASL metadata (CIDs, signatures, JSONL references)
- **Source Blocks**: Tanglable code blocks that project to Canvas via protocol handlers
- **Hierarchical Structure**: Org headings map to Canvas topology (chain complex dimensions)
- **Export System**: Like Emacs org-mode, supports multiple export formats

### 1.3 Key Benefits

1. **Comonadic Structure**: Org Mode file (affine plane) → Source blocks (projective plane)
2. **Tangling**: Extract source blocks to separate files or project to Canvas
3. **Protocol Handlers**: Source blocks can reference `canvasl://`, `file://`, `webrtc://` protocols
4. **Modularity**: Source blocks as reusable components
5. **Decoupling**: Blackboard pattern via property drawer (MVC separation)
6. **Topology**: Org structure directly maps to Canvas topology
7. **Collaboration**: RPC canvas environment with local-first representations

---

## 2. Org Mode as Bipartite to Canvas API

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────┐
│      Org Mode Document (Affine)        │
│  - Hierarchical headings                │
│  - Property drawers                     │
│  - Source blocks                        │
│  - Markdown body                        │
└─────────────────────────────────────────┘
              │
              │ Parse AST
              ▼
┌─────────────────────────────────────────┐
│      Property Drawer (Blackboard)      │
│  - CANVASL_CID                          │
│  - CANVASL_PARENT                       │
│  - CANVASL_JSONL_REF                    │
│  - CANVASL_SIGNATURE                    │
└─────────────────────────────────────────┘
              │
              │ Extract Source Blocks
              ▼
┌─────────────────────────────────────────┐
│    Source Blocks (Projective)          │
│  - SVG blocks                           │
│  - Code blocks                          │
│  - Markdown blocks                      │
│  - RPC command blocks                   │
└─────────────────────────────────────────┘
              │
              │ Project via Protocol Handlers
              ▼
┌─────────────────────────────────────────┐
│         Canvas API                      │
│  - Node creation                        │
│  - Topology mapping                     │
│  - Component projection                 │
└─────────────────────────────────────────┘
```

### 2.2 Key Mappings

| Org Mode Element | Canvas API Element | Mapping Type |
|------------------|-------------------|--------------|
| **Heading** | **Node** | 1:1 mapping |
| **Heading Level** | **Chain Complex Dimension** | Level → C₀-C₄ |
| **Heading Order** | **Canvas Layout Order** | Sequential |
| **Property Drawer** | **JSONL Metadata** | Properties → JSONL entries |
| **Source Block** | **Canvas Component** | Block → Projection |
| **`:tangle` directive** | **Protocol Handler** | Target → Handler |
| **`:header-args:canvasl:*`** | **CanvasL Properties** | Args → Metadata |

### 2.3 Bipartite Structure

The system implements a **bipartite graph** where:

- **Left Partition (Affine)**: Org Mode document structure
  - Editable, compositional, hierarchical
  - Represents the "source of truth"
  - Contains all metadata and content

- **Right Partition (Projective)**: Canvas API projections
  - Extracted, computed, projected
  - Represents the "rendered view"
  - Contains only projected components

- **Edges**: Source block projections via protocol handlers
  - `canvasl://` → Canvas API
  - `file://` → Local file system
  - `webrtc://` → Peer-to-peer sync

---

## 3. Source Blocks Bipartite with SVG

### 3.1 SVG Source Block Syntax

```org
* SVG Component
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://component.svg :header-args:canvasl:projection "projective" :header-args:canvasl:dimension "2D"
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="blue"/>
  <text x="50" y="50" text-anchor="middle" fill="white">Component</text>
</svg>
#+END_SRC
```

### 3.2 Bipartite Mapping

**Source Block Header → Metadata**:
- `:tangle canvas://component.svg` → Projection target
- `:header-args:canvasl:projection "projective"` → Projection type
- `:header-args:canvasl:dimension "2D"` → Chain complex dimension

**Source Block Body → Content**:
- SVG content → Canvas projection
- Code content → Execution result → Canvas projection
- Markdown content → Rendered HTML → Canvas projection

**Tangle Directive → Protocol Handler**:
- `canvas://` → Canvas API protocol handler
- `file://` → File system protocol handler
- `webrtc://` → WebRTC protocol handler

### 3.3 Projection Pipeline

```
1. Parse Org Mode AST
   ↓
2. Extract source blocks with `:tangle` directives
   ↓
3. Parse source block headers (`:header-args:canvasl:*`)
   ↓
4. Execute/extract source block content
   ↓
5. Register protocol handler if needed
   ↓
6. Project to Canvas API via protocol handler
   ↓
7. Update Canvas topology based on heading hierarchy
```

### 3.4 Supported Source Block Types

| Source Type | Projection Target | Protocol Handler |
|-------------|------------------|------------------|
| **svg** | Canvas SVG component | `canvas://` |
| **javascript** | Canvas code component | `canvas://` |
| **canvasl** | CanvasL directive | `canvasl://` |
| **markdown** | Canvas markdown component | `canvas://` |
| **jsonl** | JSONL data projection | `file://` or `canvas://` |
| **yaml** | YAML config projection | `file://` or `canvas://` |

---

## 4. Noweb Source Block Composition

### 4.1 Overview

**Noweb** is an Org Mode feature that enables source block composition through reference and inheritance. Source blocks can reference other source blocks using `<<block-name>>` syntax, creating a composition system where properties and content are inherited.

### 4.2 Noweb Syntax

```org
* Base Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+NAME: base-svg
#+BEGIN_SRC svg :tangle canvas://base.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC

* Composed Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://composed.svg :header-args:canvasl:projection "projective" :noweb yes
<<base-svg>>
<text x="50" y="50" text-anchor="middle" fill="white">Composed</text>
#+END_SRC
```

### 4.3 Property Inheritance

**Inheritable Properties**:
- `:header-args:canvasl:*` properties are inherited from referenced blocks
- Property drawer properties (`CANVASL_*`) can be inherited
- `:tangle` targets can be composed

**Example**:
```org
* Base Block
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+NAME: base-block
#+BEGIN_SRC javascript :tangle canvas://base.js :header-args:canvasl:projection "projective" :header-args:canvasl:dimension "2D"
export function Base() {
  return <div>Base Component</div>;
}
#+END_SRC

* Composed Block
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC javascript :tangle canvas://composed.js :header-args:canvasl:projection "projective" :noweb yes
<<base-block>>
export function Composed() {
  return <div><Base /> + Composed</div>;
}
#+END_SRC
```

### 4.4 Noweb Expansion Pipeline

```
1. Parse Org Mode AST
   ↓
2. Identify source blocks with `:noweb yes`
   ↓
3. Resolve `<<block-name>>` references
   ↓
4. Expand referenced blocks into current block
   ↓
5. Inherit properties from referenced blocks
   ↓
6. Merge properties (local overrides referenced)
   ↓
7. Project expanded source block to Canvas
```

### 4.5 Noweb Benefits

1. **Code Reuse**: Share common code blocks across multiple components
2. **Property Inheritance**: Inherit CanvasL properties from base blocks
3. **Composition**: Build complex components from simple building blocks
4. **Maintainability**: Update base blocks to update all composed blocks
5. **Modularity**: Create reusable component libraries

### 4.6 Noweb with CanvasL Properties

```org
* Base Component with Properties
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:CANVASL_PROTOCOL: canvasl://
:END:

#+NAME: base-with-props
#+BEGIN_SRC svg :tangle canvas://base.svg :header-args:canvasl:projection "projective" :header-args:canvasl:dimension "2D" :header-args:canvasl:protocol "canvasl://"
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC

* Composed Component (Inherits Properties)
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://composed.svg :header-args:canvasl:projection "projective" :noweb yes
<<base-with-props>>
<text x="50" y="50" text-anchor="middle" fill="white">Composed</text>
#+END_SRC
```

**Result**: The composed component inherits `:header-args:canvasl:dimension "2D"` and `:header-args:canvasl:protocol "canvasl://"` from the base block.

---

## 5. JSONL References as Property Drawer

### 5.1 Property Drawer Structure

```org
* Component Name
:PROPERTIES:
:CANVASL_CID: bafyreiabc123...
:CANVASL_PARENT: bafyreidef456...
:CANVASL_SIGNATURE: 0x1234abcd...
:CANVASL_JSONL_REF: file://path/to/data.jsonl
:CANVASL_DIMENSION: 2D
:CANVASL_TOPOLOGY: {"nodes": [...], "edges": [...]}
:CANVASL_PROTOCOL: canvasl://
:END:
```

### 5.2 JSONL Integration

**Property Drawer → JSONL Mapping**:

Each heading with a property drawer generates one JSONL entry:

```jsonl
{"id": "component-name", "type": "component", "cid": "bafyreiabc123...", "parent": "bafyreidef456...", "signature": "0x1234abcd...", "jsonlRef": "file://path/to/data.jsonl", "dimension": "2D", "topology": {"nodes": [...], "edges": [...]}, "protocol": "canvasl://"}
```

**Property Drawer as Blackboard**:

The property drawer serves as the **blackboard pattern** mediator:

- **Model**: Org Mode AST (source of truth)
- **Blackboard**: Property drawer (shared metadata)
- **View**: Canvas projection (rendered view)
- **Controller**: Protocol handlers (command execution)

### 5.3 Required Properties

| Property | Required | Description |
|----------|----------|-------------|
| `CANVASL_CID` | **MUST** | Content identifier (SHA-256 hash) |
| `CANVASL_PARENT` | **MUST** | Parent CID for DAG causality |
| `CANVASL_SIGNATURE` | **MUST** | Digital signature for verification |
| `CANVASL_JSONL_REF` | **SHOULD** | Reference to JSONL data file |
| `CANVASL_DIMENSION` | **SHOULD** | Chain complex dimension (0D-4D) |
| `CANVASL_TOPOLOGY` | **MAY** | Topology structure (nodes, edges) |
| `CANVASL_PROTOCOL` | **MAY** | Protocol handler type |

---

## 6. CanvasL as Extension of JSONL/JSON Canvas Spec

### 6.1 Format Hierarchy

```
JSON Canvas (0D) → JSONL (1D) → CanvasL (Extended JSONL)
```

**Format Progression**:
- **0D (JSON Canvas)**: Points, labeled nodes
- **1D (JSONL)**: Ordered edges, sequential data
- **2D (GeoJSON)**: Polygons, geometric structures
- **3D (TopoJSON)**: Shared arcs, topological structures
- **4D (CanvasL)**: Full context, evolution contexts

### 6.2 CanvasL Extensions

**Directives**:
```canvasl
@version 1.0
@schema canvasl-org-mode
@dimension 2D
```

**R5RS Function Calls**:
```canvasl
{"type": "r5rs-call", "function": "r5rs:church-add", "args": [2, 3]}
```

**Dimension References**:
```canvasl
{"dimension": "2D", "chainComplex": {"C0": [...], "C1": [...], "C2": [...]}}
```

**Protocol Handlers**:
```canvasl
{"protocol": "canvasl://", "target": "component.svg", "rpc": true}
```

### 6.3 Org Mode → CanvasL Mapping

| Org Mode Element | CanvasL Element | Conversion |
|------------------|-----------------|------------|
| **Document Structure** | **Layout Order** | Heading hierarchy → Sequential order |
| **Headings** | **Node Hierarchy** | Heading levels → Nested nodes |
| **Source Blocks** | **R5RS Calls** | Code blocks → Function calls |
| **Property Drawer** | **Metadata** | Properties → JSONL entries |
| **Markdown Body** | **Documentation** | Body content → Comments |

### 6.4 Conversion Algorithm

```
1. Parse Org Mode AST
   ↓
2. Extract heading hierarchy
   ↓
3. Map headings to CanvasL nodes
   ↓
4. Extract source blocks → R5RS calls
   ↓
5. Extract property drawers → JSONL metadata
   ↓
6. Generate CanvasL layout directives
   ↓
7. Compute boundary relationships (∂ₙ)
   ↓
8. Output CanvasL format
```

---

## 7. Layout Order and Organization for Topology

### 7.1 Org Document Structure → Canvas Topology

```org
* Root Node (C₄)
** Context Node (C₃)
*** Interface Node (C₂)
**** Document Node (C₂)
***** Edge Node (C₁)
****** Keyword Node (C₀)
```

**Mapping**:
- **Heading Level 1** → **C₄** (Evolution contexts)
- **Heading Level 2** → **C₃** (Interface triples)
- **Heading Level 3** → **C₂** (Documents/faces)
- **Heading Level 4** → **C₂** (Documents/faces)
- **Heading Level 5** → **C₁** (Edges/connections)
- **Heading Level 6** → **C₀** (Keywords/vertices)

### 7.2 Topology Mapping Rules

1. **Heading Level → Chain Complex Dimension**:
   - Level 1 → C₄
   - Level 2 → C₃
   - Level 3-4 → C₂
   - Level 5 → C₁
   - Level 6+ → C₀

2. **Heading Order → Canvas Layout Order**:
   - Sequential reading order determines layout position
   - Sibling headings at same level → Horizontal layout
   - Child headings → Nested/vertical layout

3. **Boundary Relationships**:
   - Parent heading → Child headings form boundary
   - Boundary operator ∂ₙ: Cₙ → Cₙ₋₁
   - Must satisfy ∂² = 0 (boundary of boundary is zero)

### 7.3 Layout Algorithm

```javascript
function computeCanvasLayout(orgAST) {
  const layout = [];
  const dimensionMap = { 1: 4, 2: 3, 3: 2, 4: 2, 5: 1, 6: 0 };
  
  function traverse(heading, parentId = null) {
    const level = heading.level;
    const dimension = dimensionMap[level] || 0;
    const nodeId = heading.id;
    
    // Create Canvas node
    const node = {
      id: nodeId,
      dimension: dimension,
      parent: parentId,
      boundary: [],
      position: layout.length // Sequential order
    };
    
    // Process children (boundary)
    heading.children.forEach(child => {
      const childNode = traverse(child, nodeId);
      node.boundary.push(childNode.id);
    });
    
    layout.push(node);
    return node;
  }
  
  orgAST.headings.forEach(heading => traverse(heading));
  return layout;
}
```

---

## 8. BIP32/39/44 Path Mapping

### 8.1 Overview

The heading hierarchy (C₄-C₀) directly maps to **BIP32/39/44 hierarchical deterministic (HD) wallet paths**, enabling cryptographic addressing and key derivation for each component in the Org Mode document structure.

### 8.2 BIP32/39/44 Path Structure

**Standard BIP44 Path Format**:
```
m / purpose' / coin_type' / account' / change / address_index
```

**Example**:
```
m/44'/60'/0'/0/0  →  C₀ (Keyword)
m/44'/60'/0'/0/1  →  C₁ (Edge)
m/44'/60'/0'/0/2  →  C₂ (Document)
m/44'/60'/0'/0/3  →  C₃ (Interface Triple)
m/44'/60'/0'/0/4  →  C₄ (Evolution Context)
```

### 8.3 Heading Level → BIP32 Path Mapping

**Direct Mapping**:
- **Heading Level 1** (C₄) → `m/44'/60'/0'/0/4` (Evolution contexts)
- **Heading Level 2** (C₃) → `m/44'/60'/0'/0/3` (Interface triples)
- **Heading Level 3-4** (C₂) → `m/44'/60'/0'/0/2` (Documents/faces)
- **Heading Level 5** (C₁) → `m/44'/60'/0'/0/1` (Edges/connections)
- **Heading Level 6+** (C₀) → `m/44'/60'/0'/0/0` (Keywords/vertices)

**Hierarchical Path Derivation**:
```
Root (Level 1):     m/44'/60'/0'/0/4
  └─ Context (Level 2):  m/44'/60'/0'/0/3
      └─ Interface (Level 3): m/44'/60'/0'/0/2
          └─ Document (Level 4): m/44'/60'/0'/0/2
              └─ Edge (Level 5): m/44'/60'/0'/0/1
                  └─ Keyword (Level 6): m/44'/60'/0'/0/0
```

### 8.4 BIP32 Path Computation Algorithm

```javascript
function computeBIP32Path(heading, basePath = "m/44'/60'/0'/0") {
  const dimensionMap = { 1: 4, 2: 3, 3: 2, 4: 2, 5: 1, 6: 0 };
  const dimension = dimensionMap[heading.level] || 0;
  
  // Base path: m/44'/60'/0'/0
  // Append dimension as address_index
  const path = `${basePath}/${dimension}`;
  
  // For nested headings, append sequential index
  if (heading.parent) {
    const siblingIndex = heading.parent.children.indexOf(heading);
    return `${path}/${siblingIndex}`;
  }
  
  return path;
}
```

### 8.5 Property Drawer Integration

**BIP32 Path in Property Drawer**:
```org
* Component
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0x...
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/2
:CANVASL_DIMENSION: 2D
:END:
```

**Automatic Path Generation**:
- BIP32 path is automatically computed from heading level
- Path is stored in property drawer as `CANVASL_BIP32_PATH`
- Path is used for cryptographic key derivation
- Path is used for file system addressing

### 8.6 Cryptographic Key Derivation

**Key Derivation from BIP32 Path**:
```javascript
import { HDNodeWallet } from 'ethers';

function deriveKeyFromPath(mnemonic, bip32Path) {
  const wallet = HDNodeWallet.fromMnemonic(mnemonic, bip32Path);
  return {
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
    address: wallet.address
  };
}

// Derive key for component
const componentPath = "m/44'/60'/0'/0/2";
const keys = deriveKeyFromPath(mnemonic, componentPath);

// Sign component CID with derived key
const signature = await wallet.signMessage(componentCID);
```

### 8.7 File System Addressing

**BIP32 Path → File System Path**:
```
m/44'/60'/0'/0/0  →  /opfs/ledger/44/60/0/0/0.json     (C₀)
m/44'/60'/0'/0/1  →  /opfs/ledger/44/60/0/0/1.jsonl   (C₁)
m/44'/60'/0'/0/2  →  /opfs/ledger/44/60/0/0/2.yaml    (C₂)
m/44'/60'/0'/0/3  →  /opfs/ledger/44/60/0/0/3.md      (C₃)
m/44'/60'/0'/0/4  →  /opfs/ledger/44/60/0/0/4.canvasl (C₄)
```

**Path Mapping Function**:
```javascript
function bip32PathToFilePath(bip32Path, dimension) {
  // Extract path components: m/44'/60'/0'/0/2 → [44, 60, 0, 0, 2]
  const components = bip32Path
    .replace(/^m\//, '')
    .replace(/'/g, '')
    .split('/')
    .map(Number);
  
  // Map dimension to file extension
  const extensions = { 0: 'json', 1: 'jsonl', 2: 'yaml', 3: 'md', 4: 'canvasl' };
  const extension = extensions[dimension] || 'json';
  
  // Construct file path
  const filePath = `/opfs/ledger/${components.join('/')}.${extension}`;
  return filePath;
}
```

### 8.8 Benefits of BIP32/39/44 Integration

1. **Cryptographic Addressing**: Each component has a unique cryptographic address
2. **Key Derivation**: Derive keys for signing and encryption from mnemonic
3. **Hierarchical Structure**: BIP32 paths mirror Org Mode heading hierarchy
4. **File System Mapping**: Direct mapping from BIP32 paths to file system paths
5. **Security**: Each component can be signed with its own derived key
6. **Deterministic**: Same mnemonic + path = same keys (reproducible)

### 8.9 Complete Example

```org
* Root Component (C₄)
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0x...
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/4
:CANVASL_DIMENSION: 4D
:END:

** Context Component (C₃)
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: bafy... (parent CID)
:CANVASL_SIGNATURE: 0x...
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/3
:CANVASL_DIMENSION: 3D
:END:

*** Interface Component (C₂)
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: bafy... (parent CID)
:CANVASL_SIGNATURE: 0x...
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/2
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://interface.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="blue"/>
</svg>
#+END_SRC
```

**Key Derivation**:
- Root component: Derive key from `m/44'/60'/0'/0/4`
- Context component: Derive key from `m/44'/60'/0'/0/3`
- Interface component: Derive key from `m/44'/60'/0'/0/2`

**File System Storage**:
- Root: `/opfs/ledger/44/60/0/0/4.canvasl`
- Context: `/opfs/ledger/44/60/0/0/3.md`
- Interface: `/opfs/ledger/44/60/0/0/2.yaml`

---

## 9. Component Projection from Source Block Headers

### 9.1 Source Block Header Syntax

```org
#+BEGIN_SRC javascript :tangle canvas://component.js :header-args:canvasl:projection "projective" :header-args:canvasl:dimension "2D" :header-args:canvasl:protocol "canvasl://"
// Component code
export function Component() {
  return <div>Hello World</div>;
}
#+END_SRC
```

### 9.2 Header Args Mapping

| Header Arg | Purpose | Example |
|------------|---------|---------|
| `:tangle` | Projection target | `canvas://component.js` |
| `:header-args:canvasl:projection` | Projection type | `"projective"` or `"affine"` |
| `:header-args:canvasl:dimension` | Chain complex dimension | `"2D"` |
| `:header-args:canvasl:protocol` | Protocol handler | `"canvasl://"` |
| `:header-args:canvasl:rpc` | RPC command flag | `"true"` |

### 9.3 Component Projection Pipeline

```
1. Parse source block header
   ↓
2. Extract `:tangle` target (e.g., `canvas://component.js`)
   ↓
3. Extract `:header-args:canvasl:*` properties
   ↓
4. Determine projection type (projective/affine)
   ↓
5. Execute/extract source block content
   ↓
6. Register protocol handler if needed
   ↓
7. Project to Canvas API via protocol handler
   ↓
8. Update Canvas topology based on heading hierarchy
```

### 9.4 Projection Types

**Projective Projection**:
- Extracted, computed, normalized
- Projected to Canvas as rendered component
- Uses `canvas://` protocol handler

**Affine Projection**:
- Raw, editable, compositional
- Projected to Canvas as editable component
- Uses `file://` protocol handler

---

## 10. Markdown as Tanglable Source Blocks

### 10.1 Markdown Source Block Syntax

```org
* Document
:PROPERTIES:
:CANVASL_JSONL_REF: file://document.jsonl
:END:

#+BEGIN_SRC markdown :tangle canvas://document.md :header-args:canvasl:export "html|pdf|canvasl"
# Document Title

This is the document content.

## Section 1

Content for section 1.

## Section 2

Content for section 2.
#+END_SRC
```

### 10.2 Tangle/Export System

**Tangle Operation**:
- Extracts source block content to separate file
- Target specified by `:tangle` directive
- Similar to Emacs org-mode tangle

**Export Operation**:
- Exports Org document to multiple formats
- Formats specified by `:header-args:canvasl:export`
- Supported formats: HTML, PDF, SVG, CanvasL

### 10.3 Export Pipeline

```
1. Parse Org document
   ↓
2. Extract source blocks with `:tangle` directives
   ↓
3. Execute tangle operation (extract content)
   ↓
4. Parse export formats from `:header-args:canvasl:export`
   ↓
5. Export to each format:
   - HTML → Render markdown to HTML
   - PDF → Render markdown to PDF
   - SVG → Render markdown to SVG
   - CanvasL → Convert to CanvasL format
   ↓
6. Project to Canvas API if `canvas://` protocol
```

### 10.4 Export Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| **HTML** | Rendered HTML | Web display |
| **PDF** | PDF document | Printing/sharing |
| **SVG** | SVG graphics | Canvas projection |
| **CanvasL** | CanvasL format | Canvas integration |

---

## 11. Protocol Handlers for RPC Commands

### 11.1 Protocol Handler Registration

```javascript
// Register canvasl:// protocol handler
navigator.registerProtocolHandler(
  'web+canvasl',
  `${window.location.origin}/canvas/%s`,
  'CANVASL Protocol Handler'
);
```

### 11.2 RPC Command Source Blocks

```org
* RPC Command
:PROPERTIES:
:CANVASL_PROTOCOL: canvasl://
:END:

#+BEGIN_SRC canvasl :tangle canvas://rpc-add :header-args:canvasl:rpc "true"
{
  "type": "rpc-call",
  "function": "r5rs:church-add",
  "args": [2, 3]
}
#+END_SRC
```

### 11.3 RPC Command Execution

**Execution Pipeline**:
```
1. Parse source block with `:header-args:canvasl:rpc "true"`
   ↓
2. Extract RPC command from source block body
   ↓
3. Validate RPC command structure
   ↓
4. Route to Canvas API via protocol handler
   ↓
5. Execute RPC command on graph
   ↓
6. Return result to Canvas projection
```

### 11.4 Supported Protocols

| Protocol | Purpose | Handler |
|----------|---------|---------|
| `canvasl://` | Canvas API RPC | Canvas API |
| `file://` | Local file system | File system |
| `webrtc://` | Peer-to-peer sync | WebRTC |
| `mqtt://` | MQTT pub/sub | MQTT broker |

---

## 12. Blackboard Pattern for MVC Decoupling

### 12.1 Architecture

```
┌─────────────────────────────────────────┐
│         Model (Org AST)                 │
│  - Source of truth                      │
│  - Independent of View                 │
└─────────────────────────────────────────┘
              │
              │ Property Drawer (Blackboard)
              ▼
┌─────────────────────────────────────────┐
│      Blackboard (Property Drawer)       │
│  - CANVASL_* properties                 │
│  - Mediates Model-View-Controller       │
│  - Shared state                         │
└─────────────────────────────────────────┘
         │                    │
         │                    │
    ┌────▼────┐         ┌─────▼─────┐
    │  View   │         │ Controller │
    │(Canvas) │         │(Protocol  │
    │         │         │ Handlers) │
    └─────────┘         └───────────┘
```

### 12.2 Decoupling Benefits

1. **Model Independence**: Org AST can change without affecting Canvas view
2. **View Independence**: Canvas view can change without affecting Org AST
3. **Controller Independence**: Protocol handlers can change without affecting Model/View
4. **Blackboard Mediation**: Property drawer mediates all communication

### 12.3 Blackboard Operations

**Read Operations**:
- View reads from property drawer (CANVASL_* properties)
- Controller reads from property drawer (CANVASL_PROTOCOL)

**Write Operations**:
- Model writes to property drawer (updates CANVASL_* properties)
- Controller writes to property drawer (updates CANVASL_PROTOCOL)

**Sync Operations**:
- Property drawer syncs with JSONL references
- Property drawer syncs with Canvas topology

---

## 13. Implementation Plan

### Phase 1: Org Mode Parser Integration

**Tasks**:
1. Integrate Org Mode parser (orgajs or custom)
2. Create Org Mode AST builder
3. Test parser with sample Org documents

**Deliverables**:
- `src/canvasl/org-mode/org-parser.js`
- `src/canvasl/org-mode/org-ast-builder.js`
- Test suite for parser

### Phase 2: Source Block Projection

**Tasks**:
1. Implement source block header parser
2. Implement source block projection pipeline
3. Test projection with sample source blocks

**Deliverables**:
- `src/canvasl/projection/source-block-parser.js`
- `src/canvasl/projection/projection-pipeline.js`
- Test suite for projection

### Phase 3: Property Drawer → JSONL

**Tasks**:
1. Implement property drawer parser
2. Implement property drawer → JSONL converter
3. Test conversion with sample property drawers

**Deliverables**:
- `src/canvasl/property-drawer/property-parser.js`
- `src/canvasl/property-drawer/jsonl-converter.js`
- Test suite for conversion

### Phase 4: CanvasL Extension

**Tasks**:
1. Extend JSONL parser for CanvasL
2. Implement Org Mode → CanvasL converter
3. Test conversion with sample Org documents

**Deliverables**:
- `src/canvasl/org-mode/canvasl-converter.js`
- Extended JSONL parser
- Test suite for conversion

### Phase 5: Protocol Handler Integration

**Tasks**:
1. Extend protocol handler registration
2. Implement RPC command execution
3. Test protocol handlers with sample commands

**Deliverables**:
- Extended `src/main.jsx` protocol handler
- `src/canvasl/protocol/rpc-executor.js`
- Test suite for protocol handlers

### Phase 6: Export System

**Tasks**:
1. Implement tangle system
2. Implement export system
3. Test export with sample Org documents

**Deliverables**:
- `src/canvasl/export/tangle-system.js`
- `src/canvasl/export/export-system.js`
- Test suite for export

---

## 14. Examples

### 14.1 SVG Component Example

```org
* SVG Component
:PROPERTIES:
:CANVASL_CID: bafyreiabc123...
:CANVASL_PARENT: bafyreidef456...
:CANVASL_SIGNATURE: 0x1234abcd...
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://component.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="blue"/>
  <text x="50" y="50" text-anchor="middle" fill="white">Component</text>
</svg>
#+END_SRC
```

### 14.2 RPC Command Example

```org
* RPC Command
:PROPERTIES:
:CANVASL_PROTOCOL: canvasl://
:END:

#+BEGIN_SRC canvasl :tangle canvas://rpc-add :header-args:canvasl:rpc "true"
{
  "type": "rpc-call",
  "function": "r5rs:church-add",
  "args": [2, 3]
}
#+END_SRC
```

### 14.3 Markdown Document Example

```org
* Document
:PROPERTIES:
:CANVASL_JSONL_REF: file://document.jsonl
:END:

#+BEGIN_SRC markdown :tangle canvas://document.md :header-args:canvasl:export "html|canvasl"
# Document Title

This is the document content.

## Section 1

Content for section 1.
#+END_SRC
```

---

## 15. Benefits Summary

### 15.1 Modularity

- **Source blocks as reusable components**: Each source block can be projected independently
- **Component composition**: Source blocks can reference other source blocks
- **Protocol handlers**: Any source type can be projected via protocol handlers

### 15.2 Decoupling

- **MVC separation**: Model (Org AST), View (Canvas), Controller (Protocol handlers) are decoupled
- **Blackboard pattern**: Property drawer mediates all communication
- **Independent evolution**: Each component can evolve independently

### 15.3 Extensibility

- **Any source type**: Any definable source type can be used as source block
- **Protocol handlers**: Custom protocol handlers can be registered
- **Export formats**: Multiple export formats supported

### 15.4 Tangling

- **Emacs org-mode compatibility**: Tangle system works like Emacs org-mode
- **Multiple targets**: Source blocks can tangle to multiple targets
- **Export system**: Supports multiple export formats

### 15.5 Topology

- **Direct mapping**: Org structure directly maps to Canvas topology
- **Chain complex**: Heading levels map to chain complex dimensions
- **Boundary relationships**: Automatic boundary computation

### 15.6 Collaboration

- **RPC canvas environment**: Multiple users can collaborate via RPC
- **Local-first**: Custom local representations of remote data
- **Protocol handlers**: Peer-to-peer sync via protocol handlers

---

## 16. Migration Guide

### 16.1 From Markdown+YAML to Org Mode

**Step 1: Convert YAML Frontmatter to Property Drawer**

**Before (YAML Frontmatter)**:
```yaml
---
id: template-1
dimension: 2
adjacency:
  edges: [e1, e2]
  orientation: [1, -1]
macros:
  - keyword: location
    api: Geolocation API
---
```

**After (Property Drawer)**:
```org
* Template 1
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_DIMENSION: 2D
:CANVASL_ADJACENCY_EDGES: e1 e2
:CANVASL_ADJACENCY_ORIENTATION: 1 -1
:CANVASL_MACROS: location:Geolocation API
:END:
```

**Step 2: Convert Markdown Body to Org Mode**

**Before (Markdown)**:
```markdown
# Template 1

This is the template content.

## Section 1

Content here.
```

**After (Org Mode)**:
```org
* Template 1

This is the template content.

** Section 1

Content here.
```

**Step 3: Extract Code Blocks to Source Blocks**

**Before (Markdown Code Block)**:
````markdown
```javascript
export function Component() {
  return <div>Hello</div>;
}
```
````

**After (Org Source Block)**:
```org
#+BEGIN_SRC javascript :tangle canvas://component.js
export function Component() {
  return <div>Hello</div>;
}
#+END_SRC
```

### 16.2 Migration Tools

**Automated Migration Script**:
```javascript
import { migrateMarkdownToOrg } from './migration/markdown-to-org.js';

const orgContent = await migrateMarkdownToOrg(markdownContent, yamlFrontmatter);
```

**Manual Migration Checklist**:
- [ ] Convert YAML frontmatter to property drawer
- [ ] Convert Markdown headings to Org headings
- [ ] Convert Markdown code blocks to Org source blocks
- [ ] Add `:tangle` directives to source blocks
- [ ] Add `:header-args:canvasl:*` properties
- [ ] Test Org Mode document parsing
- [ ] Test source block projection
- [ ] Test property drawer → JSONL conversion

---

## 17. CanvasL and Org Mode Source Block Relationship Model

### 17.1 Overview

The relationship between CanvasL and Org Mode source blocks is fundamental to understanding how the system works. This section explains:

- **Headings vs Source Blocks**: Structure (Affine) vs Content (Projective)
- **CanvasL as Source Block Type**: Embedding CanvasL directives in Org Mode
- **Self-Encoding**: Org Mode source blocks containing Org Mode source blocks
- **Meta-Templates**: Templates that generate templates
- **Evaluation Model**: How CanvasL and Org Mode source blocks are evaluated
- **Reference Model**: How Noweb, tangle, export, and protocol handlers work together

### 17.2 Headings vs Source Blocks: Structure vs Content

**Headings (Affine Plane - Structure)**:
- Provide hierarchical organization
- Define document structure and navigation
- Contain property drawers with metadata
- Map to Canvas topology (dimensional structure)
- Represent the "source of truth" for document organization

**Source Blocks (Projective Plane - Content)**:
- Contain executable code or data
- Can be projected to Canvas API
- Support Noweb references for composition
- Can be tangled to separate files
- Represent the "rendered view" of content

**Relationship**:
```
Heading (Structure)
  ├─ Property Drawer (Metadata)
  ├─ Source Block 1 (Content)
  ├─ Source Block 2 (Content)
  └─ Child Heading (Nested Structure)
      └─ Source Block 3 (Nested Content)
```

### 17.3 CanvasL as Source Block Type

CanvasL can be embedded as a source block type in Org Mode:

```org
* RPC Command
:PROPERTIES:
:CANVASL_DIMENSION: 3D
:END:

#+BEGIN_SRC canvasl :tangle canvas://rpc-add :header-args:canvasl:rpc "true"
{
  "type": "rpc-call",
  "function": "r5rs:church-add",
  "args": [2, 3]
}
#+END_SRC
```

**CanvasL Source Block Features**:
- Supports CanvasL directives (`@version`, `@schema`, `@dimension`)
- Supports R5RS function calls (`r5rs:church-add`)
- Supports dimension references (`0D` through `7D`)
- Supports protocol handlers (`canvasl://`, `file://`, `webrtc://`)
- Can be evaluated as RPC commands when `:header-args:canvasl:rpc "true"`

### 17.4 Self-Encoding: Org Mode Within Org Mode

Org Mode source blocks can contain nested Org Mode content:

```org
* Meta-Template
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC org :tangle canvas://template.org
* Generated Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://component.svg
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC
#+END_SRC
```

**Self-Encoding Features**:
- Nested Org Mode content is parsed recursively
- Property inheritance flows through nesting levels
- Supports meta-templates (templates generating templates)
- Maximum nesting depth prevents infinite recursion (default: 10 levels)
- Circular references are detected and handled gracefully

### 17.5 Meta-Templates: Templates Generating Templates

Meta-templates are Org Mode source blocks that generate other Org Mode templates:

```org
* Template Generator
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

#+BEGIN_SRC org :tangle canvas://generated-template.org
* <<component-name>> Component
:PROPERTIES:
:CANVASL_DIMENSION: <<dimension>>
:END:

#+BEGIN_SRC <<source-type>> :tangle canvas://<<component-name>>.<<extension>>
<<component-content>>
#+END_SRC
#+END_SRC
```

**Meta-Template Features**:
- Use Noweb references (`<<block-name>>`) for composition
- Generate templates dynamically based on parameters
- Support property inheritance through Noweb expansion
- Can be exported to multiple formats (HTML, PDF, SVG, CanvasL)

### 17.6 Evaluation Model

**CanvasL Source Block Evaluation**:
1. Parse CanvasL content (directives, R5RS calls, dimension references)
2. Validate syntax
3. If RPC flag is set, execute RPC command on graph
4. Otherwise, project to Canvas API as node

**Org Mode Source Block Evaluation**:
1. Expand Noweb references (if `:noweb yes`)
2. Check for self-encoding (nested Org Mode)
3. If self-encoded, parse nested content recursively
4. Project source block content to Canvas API
5. Register protocol handlers if needed

**Evaluation Order**:
```
1. Parse Org Mode document
   ↓
2. Extract source blocks
   ↓
3. Expand Noweb references
   ↓
4. Detect self-encoding
   ↓
5. Parse nested content (if self-encoded)
   ↓
6. Project to Canvas API
   ↓
7. Execute RPC commands (if CanvasL with rpc flag)
```

### 17.7 Reference Model: Noweb, Tangle, Export, Protocol Handlers

**Noweb References** (`<<block-name>>`):
- Enable source block composition
- Inherit properties from referenced blocks
- Support recursive expansion
- Detect and prevent circular references

**Tangle** (`:tangle canvas://file.svg`):
- Extract source block content to separate files
- Support multiple protocol handlers (`canvas://`, `file://`, `webrtc://`)
- Preserve source block structure
- Enable code extraction and reuse

**Export** (`:header-args:canvasl:export "html|pdf|svg|canvasl"`):
- Export Org document to multiple formats
- Preserve document structure
- Generate export previews
- Support format-specific customization

**Protocol Handlers**:
- `canvas://` → Canvas API projection
- `file://` → Local file system
- `webrtc://` → Peer-to-peer sync
- `canvasl://` → RPC command execution

**Integration**:
```
Noweb → Expands references before projection
  ↓
Tangle → Extracts content to files
  ↓
Export → Converts document to formats
  ↓
Protocol Handlers → Routes content to destinations
```

### 17.8 Practical Examples

**Example 1: Basic Source Block with Heading**

```org
* SVG Component
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://component.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC
```

**Example 2: CanvasL RPC Command**

```org
* Add Operation
:PROPERTIES:
:CANVASL_DIMENSION: 3D
:END:

#+BEGIN_SRC canvasl :tangle canvas://rpc-add :header-args:canvasl:rpc "true"
{
  "type": "rpc-call",
  "function": "r5rs:church-add",
  "args": [2, 3]
}
#+END_SRC
```

**Example 3: Self-Encoded Meta-Template**

```org
* Template Generator
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

#+BEGIN_SRC org :tangle canvas://generated.org
* Generated Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://generated.svg
<svg width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="green"/>
</svg>
#+END_SRC
#+END_SRC
```

**Example 4: Noweb Composition**

```org
* Base Component
#+NAME: base-svg
#+BEGIN_SRC svg :tangle canvas://base.svg
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC

* Composed Component
#+BEGIN_SRC svg :tangle canvas://composed.svg :noweb yes
<<base-svg>>
<text x="50" y="50" text-anchor="middle" fill="white">Composed</text>
#+END_SRC
```

---

## References

- [Org Mode Documentation](https://orgmode.org/)
- [Emacs Org Mode Manual](https://orgmode.org/manual/)
- [CanvasL A₁₁ Specification](./01-CanvasL-A11.md)
- [Projective/Affine Architecture](./PROJECTIVE_AFFINE_ARCHITECTURE.md)
- [RFC2119 Keywords](https://www.rfc-editor.org/rfc/rfc2119)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Specification Complete

