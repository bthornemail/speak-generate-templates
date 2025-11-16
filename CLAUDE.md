# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**read-speak-generate** (repo: speak-create) is a React + Vite application implementing CANVASL (Canvas Language) - a voice-controlled web application system with mathematical foundations in sheaf theory and algebraic topology.

**Current Implementation**: React 19 + Vite 7 web application (JavaScript, not TypeScript)
**Design Documentation**: Complete mathematical formalization in `docs/` directory

The system combines:
- Voice-controlled web applications via Web Speech API
- W3C API macros for browser functionality (geolocation, notifications, storage, WebGL, etc.)
- Sheaf-theoretic mathematical foundations for distributed consistency
- M-theory inspired architecture with 11 autonomous automata
- Homological validation using algebraic topology (chain complexes, Betti numbers)
- Byzantine fault tolerance via topological invariants

## Development Commands

### Essential Commands
```bash
# Start development server (runs on --host for network access)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Development Workflow
- Vite dev server includes HMR (Hot Module Replacement)
- Edit `src/App.jsx` to see changes instantly
- Dev server accessible on local network via `--host` flag

## Current Project Structure

```
src/
  App.jsx         # Main React component
  main.jsx        # React app entry point
  App.css         # Component styles
  index.css       # Global styles
  assets/         # Static assets
public/           # Public static files
docs/             # Mathematical design docs (CANVASL theory)
dist/             # Production build output (generated)
```

## Planned Architecture (from docs/)

### Mathematical Foundation (Sheaf Theory)
The CANVASL design is based on sheaf theory over a discrete 11-point topological space:

- **Base Space**: 11 discrete autonomous automata (A₁...A₁₁) representing M-theory dimensions
- **Local Data**: Chain complexes with 5 graded pieces (C₀ through C₄):
  - C₀: Keywords (0-cells, vertices)
  - C₁: Edges with types `[schema, identifier]` (1-cells)
  - C₂: Documents/Templates with frontmatter (2-cells, faces)
  - C₃: Interface triples (3-cells, solids)
  - C₄: Evolution contexts (4-cells, hypervolumes)
- **Boundary Operators**: ∂ₙ: Cₙ → Cₙ₋₁ satisfying ∂ₙ ∘ ∂ₙ₊₁ = 0
- **Consistency**: Global consistency requires Ȟ¹(X, K) = 0 (first sheaf cohomology vanishes)

### Planned Components (To Be Implemented)

1. **CANVASL Templates** (C₂ cells)
   - YAML frontmatter with voice I/O configuration
   - Macro definitions mapping keywords to W3C APIs
   - Adjacency structure defining boundary maps
   - Validation rules (homology, Byzantine, accessibility)

2. **Type-Based Resolution** (Functors)
   - Resolution functors Res_S for each schema S
   - Schemas: `google_drive`, `redis_key`, `node_id`, `web_api`, `file`, `http`, `peer`
   - Restriction maps for sheaf gluing
   - Natural transformations between schemas

3. **Homological Validation**
   - Betti numbers βₙ = rank(Hₙ) measure topological features
   - Euler characteristic χ = Σ(-1)ⁿβₙ
   - Merkle trees over homological invariants for Byzantine consensus
   - Boundary square verification: ∂ₙ ∘ ∂ₙ₊₁ = 0

4. **Autonomous Automata**
   - Self-contained agents that load/execute templates
   - Maintain chain complex state with persistence
   - Autonomous behavior loops (execution, self-modification, garbage collection)
   - Peer federation with CRDT-style state merging

## Tech Stack

- **Framework**: React 19.2
- **Build Tool**: Vite 7.2
- **Language**: JavaScript (JSX)
- **Linting**: ESLint 9 with React Hooks and React Refresh plugins
- **Module System**: ES Modules (`type: "module"`)

## ESLint Configuration

Custom rules in `eslint.config.js`:
- Ignores `dist/` directory
- React Hooks rules via `eslint-plugin-react-hooks`
- React Refresh for Fast Refresh support
- Custom rule: `no-unused-vars` allows uppercase constants (e.g., `const API_KEY`)

## Implementation Guidance

### CANVASL Template Format (To Implement)
Templates will be Markdown files with YAML frontmatter:

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
```

### Web Speech API Integration
When implementing voice features:
- Check browser support: `window.SpeechRecognition || window.webkitSpeechRecognition`
- Continuous recognition requires restart on `onend` event
- Keywords matched case-insensitively in transcripts
- Speech synthesis must await completion before next utterance

### Homological Validation (Future)
When implementing chain complex operations:
1. Compute boundary matrices for all dimensions
2. Verify ∂ₙ ∘ ∂ₙ₊₁ = 0 (boundary square condition)
3. Compute Betti numbers to check topology preservation
4. Ensure H¹ = 0 for global consistency

## M-Theory Correspondence

The design maps 11 automata to M-theory dimensions:
- A₁...A₁₀: 10D type IIA/IIB superstring theory
- A₁₁: 11th dimension (M-theory uplift)

Chain complex dimensions correspond to physical branes:
- C₀ (vertices) ↔ D0-branes
- C₁ (edges) ↔ fundamental strings
- C₂ (faces) ↔ D2-branes, worldsheets
- C₃ (solids) ↔ D3-branes
- C₄ (hypervolumes) ↔ M5-branes wrapping S¹

E₈×E₈ structure: A₁...A₅ form first E₈, A₆...A₁₀ form second E₈.

## Design Documentation

Comprehensive mathematical formalization in `docs/`:
- `01-canvasl-macros.md`: Sheaf theory, chain complexes, homology, TypeScript examples
- `02-templates-macros.md`: Template compiler, Web Speech API handlers, W3C macros
- `03-federated-autonomous-system.md`: Complete autonomous automaton implementation

These docs contain production-ready TypeScript implementations that can be adapted to the React/JavaScript codebase.

## Repository Information

- **Package Name**: `read-speak-generate` (private)
- **Repository**: https://github.com/bthornemail/chat2d
- **Author**: Brian Thorne
- **Current State**: Vite + React scaffold, CANVASL theory documented in `docs/`
