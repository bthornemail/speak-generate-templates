# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CANVASL A₁₁** is a fully operational React + Vite application implementing a peer-to-peer, topologically sound operating system based on sheaf theory and algebraic topology. The system is voice-controlled, content-addressed, and mathematically validated.

**Status**: ✅ Fully Operational (not a scaffold - complete implementation)

**Tech Stack**: React 19 + Vite 7 + JavaScript (not TypeScript)

**Key Features**:
- Voice-controlled interface via Web Speech API
- Content-addressed storage (OPFS + IndexedDB)
- Homological validation (chain complexes, Betti numbers)
- Interactive projective/affine canvas views
- MCP and LSP servers for external integration
- WASM-based ML engine (TensorFlow.js)
- NLP processing with wink-nlp
- CodeMirror-based markdown editor with YAML frontmatter

## Development Commands

```bash
# Development server (accessible on local network)
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview

# MCP Servers
npm run mcp:server      # CANVASL MCP server
npm run mcp:opencode    # OpenCode MCP server
npm run mcp:test        # Test MCP servers

# LSP Servers
npm run lsp:server      # CANVASL LSP server
npm run lsp:bridge      # WebSocket bridge for browser LSP
```

## Project Architecture

### Core System (`src/canvasl/`)

The CANVASL system is organized into cohesive subsystems:

**Storage Layer** (`storage/`):
- `opfs.js`: Origin Private File System adapter for fast local file storage
- `idb.js`: IndexedDB adapter for queryable node storage
- Both use content addressing (SHA-256 CIDs)

**Chain Complex System** (`chain/`):
- `complex.js`: Chain complex data structure (C₀ through C₄)
- `homology.js`: Betti number computation and homological validation
- Validates ∂² = 0 (boundary of boundary is zero)

**DAG Management** (`dag/`):
- `operations.js`: Parent-based causality without timestamps
- `merge.js`: Three-way merge algorithms for distributed nodes
- Content-addressed hypergraph structure

**Cryptographic Primitives** (`crypto/`):
- `cid.js`: Content identifier (CID) generation using SHA-256
- `webauthn.js`: WebAuthn registration for authentication
- `signature.js`: Digital signatures for node verification

**Voice Interface** (`speech/`):
- `recognition.js`: Web Speech API wrapper for voice input
- `synthesis.js`: Speech synthesis for audio feedback
- `template-generator.js`: Generates CANVASL YAML from voice keywords
- `frontmatter-parser.js`: Parses/validates YAML frontmatter
- `voice-macros.js`: Macro expansion for W3C APIs
- `template-library.js`: Template storage and retrieval
- `command-history.js`: Voice command history tracking
- `export-handler.js`: Export templates to various formats
- `file-upload-handler.js`: File upload processing

**Machine Learning** (`ml/`):
- `wasm-ml-engine.js`: TensorFlow.js WASM backend
- `model-import-export.js`: ML model serialization

**NLP Processing** (`nlp/`):
- Integration with wink-nlp for text analysis
- Semantic understanding of voice commands

**LSP Integration** (`lsp/`):
- `canvasl-language.js`: Language definitions for LSP

**AST Processing** (`ast/`):
- Abstract syntax tree operations for CANVASL templates

**Autonomous Automata** (`automaton/`):
- Self-contained agents (A₁ through A₁₁)
- Autonomous execution loops

**Agents** (`agents/`):
- Agent coordination and orchestration

**Canvas Rendering** (`canvas/`):
- Low-level canvas operations for visualization

**Icons** (`icons/`):
- SVG icon components

**Meta-Log** (`meta-log/`):
- MetaLogNode structure for DAG nodes

### Main Components

**`CANVASL.jsx`**: Main React component orchestrating the entire system
- Initializes storage (OPFS + IndexedDB)
- Creates chain complex and DAG structures
- Manages state for Betti numbers, Euler characteristic
- Handles node creation and selection
- Coordinates speech interface and canvas rendering

**`ProjectiveCanvas.jsx`**: Interactive canvas visualization
- Projective plane rendering with affine coordinate views
- DAG structure visualization (parent-child relationships)
- Node selection and interaction
- Circular layout algorithm for node positioning

**`SpeechInterface.jsx`**: Voice command interface
- Continuous speech recognition
- Command parsing and execution
- Template generation from voice input
- Audio feedback via speech synthesis

### UI Components (`src/components/`)

**`AffineMarkdownEditor.jsx`**: CodeMirror-based markdown editor
- YAML frontmatter support
- Real-time parsing and validation
- Template loading and editing

**`AffineSVGComposer.jsx`**: SVG composition interface
- Visual editing of SVG elements
- Affine transformation controls

**`AgenticChatDashboard.jsx`**: Chat interface for agent interaction
- Multi-agent conversation UI
- Command execution interface

**`StarsBackground.jsx`**: Animated background
- Beautiful stars animation for visual depth

**Affine Components** (`affine/`):
- Specialized affine transformation components

### External Servers

**MCP Server** (`mcp-server/`):
- Model Context Protocol server exposing CANVASL operations
- Tools: `generate_template`, `parse_markdown`, `validate_template`, `compute_homology`, etc.
- JSON-RPC 2.0 over stdio
- See `mcp-server/README.md` for full tool list

**LSP Server** (`lsp-server/`):
- Language Server Protocol for CANVASL templates
- WebSocket bridge for browser-based LSP
- Provides completion, validation, hover information

## Key Implementation Details

### Chain Complex Structure

The system implements a 5-dimensional chain complex:
- **C₀**: Keywords (0-cells, vertices)
- **C₁**: Edges with types `[schema, identifier]`
- **C₂**: Documents/Templates with frontmatter
- **C₃**: Interface triples
- **C₄**: Evolution contexts

Boundary operators ∂ₙ: Cₙ → Cₙ₋₁ satisfy ∂² = 0 (verified by `HomologyValidator`)

### CANVASL Template Format

Templates are Markdown files with YAML frontmatter:

```yaml
---
type: canvasl-template
id: unique-template-id
dimension: 2

adjacency:
  edges: [e1, e2, e3, e4]
  orientation: [+1, +1, -1, -1]

speech:
  input:
    lang: en-US
    continuous: true
    keywords: [location, notify, save]
  output:
    voice: Google US English
    rate: 1.0

macros:
  - keyword: location
    api: geolocation
    method: getCurrentPosition
    params: { enableHighAccuracy: true }
    type: [web_api, geolocation]
---

# Template Content

Markdown content here...
```

### Voice Commands

The system recognizes:
- **"generate template for [keywords]"** - Generate YAML template from keywords
- **"parse md"** - Parse current Markdown frontmatter
- **"create node"** - Create new MetaLogNode in DAG
- **"validate homology"** - Check topological consistency (∂² = 0)
- **"show stats"** - Display Betti numbers and Euler characteristic

### Content Addressing

All nodes use SHA-256 based Content Identifiers (CIDs):
- Immutable references to content
- Cryptographic verification
- Deduplication via content addressing

### Storage Strategy

**OPFS (Origin Private File System)**:
- Fast, private file storage
- Direct file system access
- Used for bulk content storage

**IndexedDB**:
- Queryable indexed database
- Node metadata and relationships
- Used for DAG traversal and queries

Both stores maintain consistency via CID-based addressing.

## Vite Configuration

Special handling for CodeMirror modules:
- Deduplication of `@codemirror/*` and `@lezer/*` packages
- Forced re-optimization to prevent version conflicts
- CommonJS transformation for mixed ES/CommonJS modules

This prevents the "Unrecognized extension value in extension set" error.

## ESLint Configuration

- Uses flat config format (`eslint.config.js`)
- Ignores `dist/` directory
- React Hooks rules for proper hook usage
- React Refresh for Fast Refresh support
- Custom rule: `no-unused-vars` allows uppercase constants (e.g., `const API_KEY`)

## Mathematical Foundations

### Sheaf Theory
The system is based on sheaf theory over 11 discrete points (autonomous automata A₁...A₁₁):
- Local data: Chain complexes at each automaton
- Gluing: Restriction maps ensure consistency
- Cohomology: H¹ = 0 ensures global consistency

### M-Theory Correspondence
- A₁...A₁₀: 10D type IIA/IIB superstring theory
- A₁₁: 11th dimension (M-theory uplift)
- Chain dimensions map to physical branes (D0, strings, D2, D3, M5)
- E₈×E₈ structure: A₁...A₅ (first E₈), A₆...A₁₀ (second E₈)

### Homological Invariants
- Betti numbers βₙ measure topological features
- Euler characteristic χ = Σ(-1)ⁿβₙ
- Merkle trees over homological invariants for Byzantine consensus

## Documentation

Comprehensive documentation in `docs/`:
- **`CANVASL-DEMONSTRATION.md`**: Complete demonstration guide (Who, What, When, Where, Why, How)
- **`MCP-SERVER.md`**: MCP server documentation
- **`NLP-LSP-INTEGRATION.md`**: NLP and LSP integration details
- **`WASM-ML-INTEGRATION.md`**: WASM ML engine documentation
- **`SPEECH_FEATURES_IMPLEMENTATION.md`**: Voice interface details
- **`PROJECTIVE_AFFINE_ARCHITECTURE.md`**: Canvas architecture
- **`01-CanvasL-A11.md`**: Core CANVASL specification
- **`00-Inbox/`**: Design documents and planning materials

## Browser Requirements

- Chrome/Edge 25+ (recommended - full support)
- Safari 14.1+ (partial support)
- Firefox (limited Web Speech API support)
- Requires microphone access for voice features

## Repository Information

- **Package Name**: `read-speak-generate` (private)
- **Repository**: https://github.com/bthornemail/chat2d
- **Author**: Brian Thorne
- **License**: Private
- **Version**: 1.0.0
