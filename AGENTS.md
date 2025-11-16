# AGENTS.md - Development Guide for Agentic Coding Agents

## Build/Lint/Test Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking without emitting files

### Testing
- `npm test` - Run all Jest unit tests
- `npm run test:unit` - Run unit tests only
- `npm run test:unit:watch` - Run unit tests in watch mode
- `npm run test:unit:coverage` - Run unit tests with coverage report
- `npm run test:e2e` - Run all Playwright E2E tests
- `npm run test:e2e:headless` - Run E2E tests headlessly
- `npm run test:e2e:jsonl` - Run JSONL-specific E2E tests
- `npm run test:e2e:metaverse` - Run metaverse portal E2E tests
- `npm run test:all` - Run both unit and E2E tests

### Single Test Execution
- Unit: `npx jest path/to/test.test.ts`
- E2E: `npx playwright test path/to/spec.ts`

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run clean` - Remove dist directory

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode enabled**: All type checking enforced
- **Target**: ES2020, **Module**: CommonJS
- **Imports**: Use explicit file extensions (.ts)
- **No implicit any**: All types must be explicitly declared

### Import Style
```typescript
// Node.js built-ins first
import { createServer } from 'http';
import express from 'express';

// External packages
import * as Sentry from '@sentry/node';

// Internal modules (use @/ alias for UI src)
import { ServerInstance } from './server';
import { securityConfig } from '../config/security';
```

### Naming Conventions
- **Files**: kebab-case (`agent-service.ts`, `websocket-handler.ts`)
- **Classes**: PascalCase (`AutomatonController`, `WebSocketHandler`)
- **Functions/Variables**: camelCase (`startServer`, `serverInstance`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TIMEOUT`, `DEFAULT_PORT`)
- **Interfaces**: PascalCase with `I` prefix optional (`ServerInstance`)

### Error Handling
```typescript
// Use try-catch with proper error typing
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  if (error instanceof Error) {
    Sentry.captureException(error);
    throw new Error(`Operation failed: ${error.message}`);
  }
  throw error;
}
```

### Code Structure
- **Services**: Business logic in `/src/services/`
- **Routes**: API endpoints in `/src/routes/`
- **Types**: TypeScript definitions in `/src/types/`
- **Config**: Configuration in `/src/config/`
- **Tests**: Co-located in `__tests__/` directories

### ESLint Rules
- No unused variables (disabled for flexibility)
- Console logs allowed (for debugging)
- No undefined variables (TypeScript handles this)
- Case declarations in switches allowed

### Testing Guidelines
- **Unit tests**: Use Jest with `ts-jest` preset
- **E2E tests**: Use Playwright with 120s timeout
- **Coverage**: Minimum 60% across all metrics
- **Test files**: `.test.ts` or `.spec.ts` suffix

### Documentation
- Use JSDoc comments for public APIs
- Include parameter types and return types
- Document complex business logic
- Keep comments concise and relevant

# AGENTS.md – Multi-Agent System for the Computational Topology Canvas

## Overview

This document describes a multi-agent system designed to interact with, evolve, and maintain the computational topology canvas defined across 59 Grok files (`grok_files/`). The system spans from foundational lambda calculus to emergent AI and quantum computing, with agents operating at different dimensional levels.

**Related Documentation:**
- **`docs/04-CanvasL/CANVASL-RFC2119-SPEC.md`**: Complete RFC 2119 specification for CanvasL language
- **`docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md`**: Complete RFC 2119 specification for ProLog, DataLog, and R5RS integration
- **`docs/05-Meta-Log/IMPLEMENTATION-GUIDE.md`**: Practical implementation guide with code examples
- **`docs/05-Meta-Log/QUICK_REFERENCE.md`**: Quick reference for common operations
- **`docs/03-Metaverse-Canvas/`**: CanvasL language overview and JSONL canvas editing
- **`docs/11-Automatons/README.md`**: Complete automaton execution documentation
- **`docs/12-Automatons-CanvasL/README.md`**: CanvasL format integration for automaton system
- **`grok_files/02-Grok.md` through `grok_files/25-Grok.md`**: R5RS concept definitions

## Architecture Foundation

The multi-agent system is built on a **three-layer architecture** (from `grok_files/02-Grok.md`):

1. **Top Layer (Vertical Spine)**: Fixed Church encoding mathematical foundation
   - Church numerals: `zero`, `one`, `succ`, `add`, `mult`, `exp`
   - Church booleans: `true`, `false`, `if`, `not`, `and`, `or`
   - Y-combinator: Fixed-point for self-reference
   - This layer is IMMUTABLE and provides the mathematical foundation

2. **Middle Layer (Horizontal Templates)**: Implementation mappings via blackboard
   - Horizontal edges (`h:*`) define implementation templates
   - Templates map topology → system implementations
   - This layer is MUTABLE and templated via JSONL blackboard

3. **Bottom Layer (JSONL Blackboard)**: Queryable fact database
   - JSONL canvas files serve as blackboard data structure
   - Facts extracted via DataLog (`grok_files/03-Grok.md`, `grok_files/10-Grok.md`)
   - Self-referential via `self-ref` nodes
   - ProLog queries for unification and inference (`grok_files/08-Grok.md`)
   - RDF triples for semantic reasoning (`grok_files/04-Grok.md`)

## Agent Architecture

### 1. Foundation Agents (0D-2D)

0D-Topology Agent

· Purpose: Maintain quantum vacuum topology and identity processes
· Capabilities:
  · Manages empty pattern () and point topology
  · Ensures trivial fiber bundle integrity
  · Monitors Church encoding base: λf.λx.x
· Interactions: Provides base for all higher-dimensional agents

1D-Temporal Agent

· Purpose: Handle temporal evolution and Church successor operations
· Capabilities:
  · Manages line topology ℝ¹
  · Implements successor: λn.λf.λx.f(nfx)
  · Coordinates Y-combinator base operations
· Dependencies: 0D-Topology Agent

2D-Structural Agent

· Purpose: Manage spatial structure and pattern encoding
· Capabilities:
  · Handles Church pairs: λx.λy.λf.fxy
  · Manages S-expression patterns and unification
  · Coordinates bipartite topology operations
  · **Bipartite-BQF Primary Agent**: Manages bipartite graph structure (topology ↔ system)
  · Handles BQF encoding and polynomial representation
  · Validates bipartite structure and mapping chains
  · Synchronizes CanvasL ↔ Frontmatter bipartite annotations
· Dependencies: 1D-Temporal Agent
· **R5RS Functions**: `r5rs:build-bipartite-graph`, `r5rs:validate-bipartite`, `r5rs:bqf-encode`, `r5rs:polynomial-to-bqf`, `r5rs:symbol-to-polynomial`

### 2. Operational Agents (3D-4D)

3D-Algebraic Agent

· Purpose: Perform Church algebra operations
· Capabilities:
  · Addition: λm.λn.λf.λx.mf(nfx)
  · Multiplication: λm.λn.λf.m(nf)
  · Exponentiation: λm.λn.nm
· Tools: Fixed-point analysis with Y-combinator

4D-Network Agent

· Purpose: Manage spacetime and network operations
· Capabilities:
  · Handles IPv4/IPv6 address systems
  · Coordinates localhost operations
  · Manages spacetime structure transformations
  · **CI/CD Operations**: Triggers deployments, monitors deployment status, coordinates network-level CI/CD
· Specialization: Dual implementation for IPv4 and IPv6
· CI Integration: Uses `NetworkAgentCI` adapter for deployment operations

### 3. Advanced Agents (5D-7D)

5D-Consensus Agent

· Purpose: Implement distributed consensus and blockchain operations
· Capabilities:
  · Manages immutable ledger topology
  · Coordinates Merkle-Patricia trie operations
  · Ensures distributed consensus integrity
· Requirements: MUST implement exactly one blockchain system

6D-Intelligence Agent

· Purpose: Handle emergent AI and neural network operations
· Capabilities:
  · Manages transformer architecture
  · Coordinates attention mechanisms
  · Implements training on foundational systems
  · **CI/CD Operations**: Analyzes test results, extracts performance metrics, analyzes test logs, provides optimization recommendations
· Requirements: MUST implement exactly one AI system
· CI Integration: Uses `IntelligenceAgentCI` adapter for test analysis and metrics

7D-Quantum Agent

· Purpose: Manage quantum superposition and entanglement
· Capabilities:
  · Handles qubit operations: |ψ⟩ = α|0⟩ + β|1⟩
  · Manages Bloch sphere representations
  · Coordinates entanglement with foundational systems
· Requirements: MUST implement exactly one qubit system

### 4. Interface Agents

Query Interface Agent

· Purpose: Provide SPARQL/REPL access to the system
· Capabilities:
  · Executes SPARQL queries across all dimensions
  · Provides REPL interface for interactive exploration
  · Manages query graph: <http://example.org/query>

Visualization Agent

· Purpose: Handle WebGL-based 3D visualization
· Capabilities:
  · Renders computational manifolds using Three.js
  · Provides real-time visualization of all dimensions
  · Supports polynomial rendering via GPU acceleration

### 5. Collaborative Agents

Multiplayer Agent

· Purpose: Enable collaborative exploration
· Capabilities:
  · Manages avatar systems
  · Coordinates voice communication via WebRTC
  · Supports networked interactions using Networked-Aframe

AI-Assist Agent

· Purpose: Provide AI-powered development assistance
· Capabilities:
  · Generates Scheme code via WebLLM
  · Debugs with 3D trace visualization
  · Evolves canvas through self-modifying JSONL

### 6. Evolutionary Agents

Self-Modification Agent

· Purpose: Drive system evolution through AI
· Capabilities:
  · Rewrites canvas JSONL files
  · Implements complex mutations
  · Ensures SHACL compliance during evolution
  · Visualizes mutation graphs

Goal-Oriented Agent

· Purpose: Coordinate multi-agent goal negotiation
· Capabilities:
  · Manages human vs agent goal alignment
  · Implements quantum consensus voting
  · Resolves conflicts via Grover + Borda algorithms

### 7. OpenCode Integration Agent

· Purpose: Bridge opencode CLI commands with automaton dimensional operations
· Capabilities:
  · Maps opencode tools to Church encoding operations
  · Routes file system commands through topological layers
  · Integrates search/edit operations with dimensional progression
  · Provides CLI interface to multi-agent system
· Tool Mappings:
  · Read/Glob/Grep → 2D-Structural Agent (pattern operations)
  · Edit/Write → 3D-Algebraic Agent (transformation operations)
  · Bash → 4D-Network Agent (system operations)
  · Task → 6D-Intelligence Agent (complex operations)
  · Todo → 5D-Consensus Agent (goal tracking)
· Requirements: MUST maintain tool-to-dimension fidelity

## Agent Communication Protocol

### Vertical Communication (Dimensional Hierarchy)

```
0D → 1D → 2D → 3D → 4D → 5D → 6D → 7D
```

Horizontal Communication (Cross-Dimensional)

· Topology ↔ System implementations
· Pattern matching across dimensions
· Resource sharing between parallel systems

### OpenCode Integration Layer

· Tool-to-dimension routing via OpenCode Integration Agent
· Command preprocessing through Church encoding
· Result post-processing with dimensional validation
· CLI interface to multi-agent coordination

### Message Types

1. **State Updates**: Dimensional state changes
2. **Query Requests**: Cross-dimensional information requests (via SPARQL, Prolog, Datalog)
3. **Constraint Violations**: SHACL compliance alerts
4. **Evolution Proposals**: Canvas modification suggestions
5. **Consensus Votes**: Multi-agent decision making
6. **OpenCode Commands**: Routed CLI operations with dimensional context
7. **CI/CD Pipeline Events**: Pipeline triggers, status updates, deployment notifications
8. **Automaton Execution Events**: Execution triggers, status updates, action selections, dimensional progression

## Implementation Requirements

### RFC 2119 Compliance

· MUST: Implement exactly one system per topology dimension
· SHOULD: Use specified technologies (Three.js, WebLLM, etc.)
· MUST: Maintain SHACL shape compliance
· MUST: Preserve federated provenance through all transformations
· MUST: Implement provenance-aware deduplication for objects with duplicate IDs
· MUST: Use Obsidian Frontmatter Knowledge Model to analyze documentation
· SHOULD: Update blackboard metadata based on knowledge model analysis

### ASP Rules

```prolog
1 { layer(N,D) : depth(D) } 1 :- node(N).
:- implements(X,Y1), implements(X,Y2), Y1 != Y2.
```

**Reference**: See `docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md` Section 10.3 for ASP constraint details.

### Prolog Inheritance

```prolog
inherits(X,Z) :- vertical(Y,X), inherits(Y,Z).
```

**Reference**: See `grok_files/08-Grok.md` for Prolog engine implementation and `docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md` Section 6 for ProLog integration.

### DataLog Fact Extraction

```prolog
node(Id, Type, X, Y, Text).
edge(Id, Type, FromNode, ToNode).
vertical(Id, FromNode, ToNode).
horizontal(Id, FromNode, ToNode).
```

**Reference**: See `grok_files/03-Grok.md` and `grok_files/10-Grok.md` for DataLog engine implementation and `docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md` Section 7 for DataLog integration.

## Security and Validation

### SHACL Constraints

· Label validation: rdfs:label must be string
· Identity validation: owl:sameAs minimum count 1
· Technology validation: prov:used must match specifications

### DataLog Monitoring

```prolog
shacl-violation(N) :- shacl-shape(N,C), not satisfies(N,C).
missing_attention(N) :- implements(N,Y), rdf:type(Y,'ai'), 
                       not prov:used(Y,'attention-mechanism').
```

**Reference**: See `grok_files/07-Grok.md` for SHACL validation engine and `docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md` Section 11 for validation requirements.

### Federated Provenance Requirements

Agents MUST comply with the Federated Provenance Meta-Log specification (`docs/13-Federated-Provenance-Meta-Log/`) when handling objects with duplicate IDs:

#### Provenance Preservation Requirements

- **MUST** preserve provenance through all transformations (Section 7.4)
- **MUST** maintain file and line accuracy in `selfReference` metadata
- **SHOULD** preserve pattern information from `selfReference.pattern`
- **MUST** handle missing provenance gracefully (warn, don't fail)

#### Provenance-Aware Deduplication

When encountering objects with duplicate IDs, agents MUST implement provenance-aware deduplication:

1. **Same-File Duplicates**: 
   - Merge provenance history into `provenanceHistory` array
   - Keep the latest object version (fixes memory leaks)
   - Preserve all provenance entries in history

2. **Cross-File Duplicates**:
   - Preserve both objects (federated provenance requirement)
   - Track provenance history across files
   - Enable cross-file relationship queries

#### Self-Reference Metadata Structure

Each JSONL entry MUST include `selfReference` metadata:

```json
{
  "id": "0D-automaton",
  "type": "automaton",
  "selfReference": {
    "file": "automaton-kernel.jsonl",
    "line": 14,
    "pattern": "identity"
  },
  "provenanceHistory": [
    { "file": "automaton-kernel.jsonl", "line": 14, "pattern": "identity" },
    { "file": "automaton.jsonl", "line": 2103, "pattern": "Identity Evolution (0D)" }
  ]
}
```

#### Deduplication Implementation

Agents MUST implement the following deduplication logic:

```typescript
// Same-file duplicate: merge provenance history, keep latest
if (currentFile === existingFile) {
  // Merge provenance history
  if (!existingObj.provenanceHistory) {
    existingObj.provenanceHistory = [];
    if (existingObj.selfReference) {
      existingObj.provenanceHistory.push(existingObj.selfReference);
    }
  }
  existingObj.provenanceHistory.push(currentProvenance);
  // Replace with latest version
  this.objects.splice(existingIndex, 1);
  this.objects.push(obj);
}

// Cross-file duplicate: preserve both (federated provenance)
if (currentFile !== existingFile) {
  // Keep both objects
  this.objects.push(obj);
  // Track provenance history
  existingObj.provenanceHistory.push(currentProvenance);
}
```

#### Provenance Query Requirements

Agents MUST support provenance queries:

- **ProLog**: `provenance(Id, File, Line, Pattern)`
- **DataLog**: Extract provenance facts from `selfReference` metadata
- **SPARQL**: Query `prov:wasDerivedFrom` relationships

**Reference**: See `docs/13-Federated-Provenance-Meta-Log/FEDERATED-PROVENANCE-RFC2119-SPEC.md` for complete specification and `DEDUPLICATION_PROVENANCE_EVALUATION.md` for implementation details.

### R5RS Function Integration

Agents MUST use R5RS functions from `r5rs-canvas-engine.scm` and `grok_files/`:

- **Church Encoding**: `r5rs:church-zero`, `r5rs:church-succ`, `r5rs:church-add`, etc.
- **JSONL Operations**: `r5rs:parse-jsonl-canvas`, `r5rs:extract-facts`, `r5rs:query-facts`
- **RDF Operations**: `r5rs:jsonl-to-rdf`, `r5rs:rdf-query`, `r5rs:sparql-query`
- **Logic Programming**: `r5rs:prolog-query`, `r5rs:datalog-query`
- **Validation**: `r5rs:load-shacl-shapes`, `r5rs:shacl-validate`

**Reference**: See `docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md` Section 5 for complete R5RS integration details.

### Obsidian Frontmatter Knowledge Model

Agents MUST use the Obsidian Frontmatter Knowledge Model to analyze documentation:

- **Knowledge Graph Building**: Build relationship graphs from document frontmatter
- **Completeness Evaluation**: Assess document completeness and quality
- **Relationship Validation**: Validate prerequisites, enables, and related links
- **Agent Coordination**: Use blackboard metadata for multi-agent coordination
- **Document Discovery**: Find relevant documents based on relationships

**Usage**: See "Obsidian Frontmatter Knowledge Model Integration" section above for complete usage guide.

**Reference**: See `evolutions/obsidian-frontmatter-knowledge-model/docs/README.md` for complete documentation.

### CanvasL Format Support

Agents MUST support CanvasL (`.canvasl`) format extensions:

- **Directives**: `@version`, `@schema`
- **R5RS Function Calls**: `{"type": "r5rs-call", "function": "r5rs:church-add", "args": [2, 3]}`
- **Dimension References**: `{"dimension": "0D"}`
- **Node References**: `{"fromNode": "#0D-topology"}`
- **Scheme Expressions**: `{"expression": "(church-add 2 3)"}`

**Reference**: See `docs/04-CanvasL/CANVASL-RFC2119-SPEC.md` for complete CanvasL specification and `docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md` Section 4 for integration details.

## Deployment Strategy

### Phase 1: Foundation

- Deploy 0D-3D agents
- Establish basic communication protocols
- Validate constraint systems (SHACL, RFC2119, ASP, Prolog, Datalog)
- Load JSONL blackboard: `r5rs:load-canvas!("automaton-kernel.jsonl")`
- Extract facts: `r5rs:extract-facts(parsed-objects)`

### Phase 2: Expansion

- Deploy 4D-6D agents
- Implement network and AI capabilities
- Establish visualization systems
- Convert to RDF: `r5rs:jsonl-to-rdf(facts)`
- Enable SPARQL queries: `r5rs:sparql-query(query-str, triples)`

### Phase 3: Integration

- Deploy 7D and interface agents
- Enable quantum and collaborative features
- Activate evolutionary capabilities
- Enable Prolog queries: `r5rs:prolog-query(db, goal)`
- Enable Datalog queries: `r5rs:datalog-query(program, goal)`

### Phase 4: Autonomy

- Enable self-modification via `generate.metaverse.jsonl`
- Activate goal negotiation
- Establish quantum consensus mechanisms
- Generate multiverse canvas: `generate-all-automaton-files()`

## Automaton Execution

The multi-agent system integrates with automaton execution scripts and TypeScript implementations for running self-referential automaton operations.

### Automaton Execution Agents

**4D-Network-Agent**: Network-Level Execution
- **Responsibility**: Manages automaton execution at network level
- **Scripts**: Uses `scripts/run-automaton.sh` for launching automaton executions
- **Operations**: 
  - Triggers automaton execution via launcher script
  - Monitors execution status
  - Coordinates network-level CI/CD with automaton operations
- **Integration**: Executes `run-automaton.sh` with network configuration

**6D-Intelligence-Agent**: AI-Powered Execution
- **Responsibility**: Manages AI-powered automaton execution
- **Scripts**: Uses `ollama-automaton.ts` and `continuous-automaton.ts`
- **Operations**:
  - Selects appropriate automaton type (built-in vs Ollama)
  - Analyzes execution patterns and performance
  - Optimizes action selection based on history
- **Integration**: Coordinates with Ollama for intelligent decision-making

**0D-Topology-Agent**: Core Engine Operations
- **Responsibility**: Manages core automaton engine operations
- **Scripts**: Uses `advanced-automaton.ts` for foundational operations
- **Operations**:
  - Loads and saves JSONL automaton files
  - Manages dimensional progression (0D-7D)
  - Generates Church encoding patterns
  - Validates self-reference structures
- **Integration**: Provides core engine for all automaton executions

**5D-Consensus-Agent**: Bootstrap and Validation
- **Responsibility**: Coordinates bootstrap process and validation
- **Scripts**: Uses `bootstrap-automaton.ts` for initialization
- **Operations**:
  - Executes transaction-based bootstrap
  - Validates SHACL constraints
  - Coordinates dimensional progression validation
  - Manages self-reference establishment
- **Integration**: Coordinates bootstrap with consensus mechanisms

### Automaton Execution Flow

```
Agent Request
    ↓
4D-Network-Agent: Trigger Execution
    ↓
run-automaton.sh: Parse Arguments
    ↓
[Select Automaton Type]
    ├─→ continuous-automaton.ts (Built-in)
    └─→ ollama-automaton.ts (AI-Powered)
        ↓
    AdvancedSelfReferencingAutomaton
        ↓
    [Load JSONL]
        ↓
    [Execute Actions]
        ├─→ 0D-Topology-Agent: Core operations
        ├─→ 6D-Intelligence-Agent: AI decisions
        └─→ 5D-Consensus-Agent: Validation
        ↓
    [Save State]
        ↓
    [Analyze Self-Reference]
```

### Agent-to-Automaton Mapping

| Agent | Automaton Script | Purpose |
|-------|-----------------|---------|
| **4D-Network-Agent** | `run-automaton.sh` | Network-level execution coordination |
| **6D-Intelligence-Agent** | `ollama-automaton.ts`, `continuous-automaton.ts` | AI-powered action selection |
| **0D-Topology-Agent** | `advanced-automaton.ts` | Core engine operations |
| **5D-Consensus-Agent** | `bootstrap-automaton.ts` | Bootstrap and validation |
| **Self-Modification-Agent** | `advanced-automaton.ts` | Self-modification operations |

### Automaton Execution Requirements

- **4D-Network-Agent**: MUST have access to `scripts/run-automaton.sh`
- **6D-Intelligence-Agent**: MUST coordinate with Ollama for AI decisions
- **0D-Topology-Agent**: MUST use `advanced-automaton.ts` for core operations
- **5D-Consensus-Agent**: MUST coordinate bootstrap process
- **All Agents**: MUST use `docs/11-Automatons/` documentation for execution

**Reference**: See `docs/11-Automatons/README.md` for complete automaton documentation.

## Monitoring and Maintenance

### Health Checks

- Regular SHACL validation across all dimensions: `r5rs:shacl-validate(shapes, triples)`
- Agent responsiveness monitoring
- Resource utilization tracking
- Constraint compliance: RFC2119, ASP, Prolog, Datalog validation
- Automaton execution monitoring via `scripts/run-automaton.sh`

### Evolution Tracking

- Mutation graph visualization
- Performance metric collection
- Constraint compliance auditing
- Multiverse canvas generation tracking
- Automaton execution history analysis

## Multiverse Canvas Generation

Agents MUST support multiverse canvas generation via `generate.metaverse.jsonl`:

1. **Load Metaverse**: `r5rs:parse-jsonl-canvas("generate.metaverse.jsonl")`
2. **Extract References**: Query all `type: "reference"` nodes
3. **Generate Files**: For each reference, invoke regeneration function
4. **Create Unified Topology**: Combine all `automaton.*.jsonl` files
5. **Validate**: SHACL, RFC2119, ASP, Prolog, Datalog validation

**Reference**: See `docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md` Section 8 for complete generation pipeline.

## CI/CD Pipeline Integration

The multi-agent system integrates with CI/CD pipelines through the **CI Pipeline Adapter**, providing agent-specific operations for deployment, testing, and consensus workflows.

### CI Pipeline Adapter Architecture

The CI Pipeline Adapter follows the same adapter pattern as database adapters:

```
┌─────────────────────────────────────────┐
│         CI Pipeline Adapter            │
│         (Common Interface)             │
└─────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼───┐      ┌─────▼─────┐    ┌────▼────┐
│GitHub │      │  GitLab   │    │ Jenkins │
│Actions│      │    CI     │    │         │
└───────┘      └───────────┘    └─────────┘
```

**Reference**: See `docs/10-Github-CI-CD-Workflow/` for complete CI/CD documentation.

### Agent CI/CD Responsibilities

#### 4D-Network Agent: CI/CD Network Operations

**Purpose**: Manages CI/CD network operations and deployments

**CI Operations**:
- Trigger deployments to staging/production environments
- Monitor deployment status and progress
- Coordinate network-level CI/CD operations
- Handle deployment failures and rollbacks

**Integration**:
```typescript
import { CIPipelineFactory, CIAgentManager } from './src/ci';

const ciAdapter = CIPipelineFactory.fromEnvironment();
const ciAgents = new CIAgentManager(ciAdapter);

// 4D-Network Agent: Trigger deployment
const deployment = await ciAgents.network.triggerDeployment({
  environment: 'staging',
  branch: 'main',
});

// Monitor deployment
const status = await ciAgents.network.monitorDeployment(deployment.id);
```

**Reference**: See `docs/10-Github-CI-CD-Workflow/CI-PIPELINE-AGENT-INTEGRATION.md` for complete integration guide.

#### 5D-Consensus Agent: Deployment Decisions

**Purpose**: Coordinates deployment decisions and approvals

**CI Operations**:
- Trigger consensus pipelines requiring multiple approvals
- Wait for consensus decisions
- Coordinate multi-agent deployment approvals
- Manage approval workflows

**Integration**:
```typescript
// 5D-Consensus Agent: Request approval
const consensus = await ciAgents.consensus.triggerConsensusPipeline({
  workflow: '.github/workflows/deploy-production.yml',
  approvals: 2, // Requires 2 approvals
});

const result = await ciAgents.consensus.waitForConsensus(consensus.id);
if (result.approved) {
  // Proceed with deployment
}
```

**Reference**: See `docs/10-Github-CI-CD-Workflow/CI-PIPELINE-AGENT-INTEGRATION.md` for consensus patterns.

#### 6D-Intelligence Agent: Test Analysis

**Purpose**: Analyzes test results and pipeline performance

**CI Operations**:
- Run tests and analyze results
- Extract performance metrics from pipeline runs
- Analyze test logs for patterns
- Provide optimization recommendations

**Integration**:
```typescript
// 6D-Intelligence Agent: Run tests and analyze
const testResults = await ciAgents.intelligence.runTestsAndAnalyze({
  workflow: '.github/workflows/ci.yml',
  branch: 'main',
});

console.log(`Tests: ${testResults.analysis.passCount}/${testResults.analysis.testCount}`);
console.log(`Duration: ${testResults.analysis.duration}ms`);

// Get performance metrics
const metrics = await ciAgents.intelligence.getPerformanceMetrics(runId);
console.log(`Success Rate: ${metrics.successRate * 100}%`);
```

**Reference**: See `docs/10-Github-CI-CD-Workflow/CI-PIPELINE-AGENT-INTEGRATION.md` for analysis patterns.

### Coordinated CI/CD Workflow

Agents coordinate in a complete CI/CD pipeline:

1. **6D-Intelligence Agent**: Runs tests and validates code quality
2. **4D-Network Agent**: Deploys to staging environment
3. **5D-Consensus Agent**: Coordinates production deployment approval
4. **4D-Network Agent**: Deploys to production after approval

**Example**:
```typescript
// Complete coordinated workflow
const ciAgents = new CIAgentManager(ciAdapter);

// Step 1: Run tests (6D-Intelligence)
const testResults = await ciAgents.intelligence.runTestsAndAnalyze({...});
if (!testResults.success) throw new Error('Tests failed');

// Step 2: Deploy to staging (4D-Network)
const staging = await ciAgents.network.triggerDeployment({ environment: 'staging' });
await ciAgents.network.monitorDeployment(staging.id);

// Step 3: Request production approval (5D-Consensus)
const consensus = await ciAgents.consensus.triggerConsensusPipeline({ approvals: 2 });
const approved = await ciAgents.consensus.waitForConsensus(consensus.id);

// Step 4: Deploy to production (4D-Network)
if (approved.approved) {
  await ciAgents.network.triggerDeployment({ environment: 'production' });
}
```

**Reference**: See `docs/10-Github-CI-CD-Workflow/CI-PIPELINE-AGENT-INTEGRATION.md` for complete workflow examples.

### CI/CD Message Types

CI/CD operations generate the following message types:

- **Pipeline Triggers**: Initiated by agents to start CI/CD workflows
- **Status Updates**: Real-time pipeline status changes
- **Deployment Notifications**: Deployment start/completion events
- **Test Results**: Test execution results and metrics
- **Approval Requests**: Consensus agent approval workflows
- **Performance Metrics**: Pipeline performance data

### CI/CD Integration Requirements

- **4D-Network Agent**: MUST have access to deployment workflows
- **5D-Consensus Agent**: MUST coordinate with approval systems
- **6D-Intelligence Agent**: MUST have access to test workflows and logs
- **All Agents**: MUST use CI Pipeline Adapter interface for CI/CD operations

**Reference**: See `docs/10-Github-CI-CD-Workflow/CI-PIPELINE-ADAPTER-OVERVIEW.md` for architecture details.

## Obsidian Frontmatter Knowledge Model Integration

### Overview

Agents MUST use the **Obsidian Frontmatter Knowledge Model** (`evolutions/obsidian-frontmatter-knowledge-model/`) to analyze documentation frontmatter, build knowledge graphs, and evaluate document understanding. This enables agents to:

- **Understand Documentation Structure**: Analyze document relationships and dependencies
- **Track Agent Assignments**: Monitor which agents are assigned to which documents
- **Evaluate Completeness**: Assess documentation quality and identify gaps
- **Build Knowledge Graphs**: Create relationship graphs for navigation and understanding
- **Coordinate Multi-Agent Work**: Use blackboard metadata for agent coordination

### Knowledge Model Usage

#### Basic Usage

```typescript
import { ObsidianFrontmatterKnowledgeModel } from './evolutions/obsidian-frontmatter-knowledge-model/obsidian-frontmatter-knowledge-model';

// Initialize model with vault path
const model = new ObsidianFrontmatterKnowledgeModel('/path/to/docs');

// Build knowledge graph from all markdown files
const graph = await model.buildKnowledgeGraph();

// Generate report
const report = model.generateReport();
console.log(report);

// Export JSON for further analysis
const json = model.exportJSON();
fs.writeFileSync('knowledge-graph.json', json);
```

#### Command Line Usage

```bash
# Analyze documentation vault
tsx evolutions/obsidian-frontmatter-knowledge-model/obsidian-frontmatter-knowledge-model.ts ./docs

# Output:
# - Console report with statistics
# - knowledge-graph.json file with complete graph
```

### Agent Integration Patterns

#### 1. 6D-Intelligence-Agent: Documentation Analysis

**Purpose**: Analyze documentation completeness and quality

**Usage**:
```typescript
// 6D-Intelligence-Agent: Analyze documentation
const model = new ObsidianFrontmatterKnowledgeModel('./docs');
const graph = await model.buildKnowledgeGraph();

// Find incomplete documents
const incomplete = Array.from(graph.nodes.values())
  .filter(n => n.understanding.completeness < 0.6)
  .sort((a, b) => a.understanding.completeness - b.understanding.completeness);

// Report to blackboard
console.log(`Found ${incomplete.length} incomplete documents`);
incomplete.forEach(doc => {
  console.log(`- ${doc.title} (${doc.id}): ${(doc.understanding.completeness * 100).toFixed(1)}% complete`);
  console.log(`  Missing: ${doc.understanding.missingFields.join(', ')}`);
});
```

#### 2. 5D-Consensus-Agent: Relationship Validation

**Purpose**: Validate document relationships and dependencies

**Usage**:
```typescript
// 5D-Consensus-Agent: Validate relationships
const model = new ObsidianFrontmatterKnowledgeModel('./docs');
const graph = await model.buildKnowledgeGraph();

// Check relationship integrity
const stats = graph.statistics.relationshipIntegrity;
console.log(`Relationship Integrity: ${(stats.integrityScore * 100).toFixed(1)}%`);
console.log(`Broken Links: ${stats.brokenLinks} / ${stats.totalLinks}`);

// Find broken prerequisites
graph.nodes.forEach(node => {
  const broken = node.understanding.relationshipIntegrity.brokenPrerequisites;
  if (broken.length > 0) {
    console.log(`⚠️  ${node.title}: Broken prerequisites: ${broken.join(', ')}`);
  }
});
```

#### 3. 4D-Network-Agent: Agent Assignment Tracking

**Purpose**: Track agent assignments and coordinate work

**Usage**:
```typescript
// 4D-Network-Agent: Track agent assignments
const model = new ObsidianFrontmatterKnowledgeModel('./docs');
const graph = await model.buildKnowledgeGraph();

// Find documents assigned to specific agent
const agentAssignments = new Map<string, KnowledgeNode[]>();
graph.nodes.forEach(node => {
  const agent = node.blackboard?.assignedAgent;
  if (agent) {
    if (!agentAssignments.has(agent)) {
      agentAssignments.set(agent, []);
    }
    agentAssignments.get(agent)!.push(node);
  }
});

// Report agent workloads
agentAssignments.forEach((docs, agent) => {
  console.log(`${agent}: ${docs.length} documents`);
  const active = docs.filter(d => d.blackboard?.status === 'active');
  console.log(`  Active: ${active.length}`);
});
```

#### 4. 0D-Topology-Agent: Foundation Document Analysis

**Purpose**: Analyze foundational documents and their relationships

**Usage**:
```typescript
// 0D-Topology-Agent: Analyze foundation documents
const model = new ObsidianFrontmatterKnowledgeModel('./docs');
const graph = await model.buildKnowledgeGraph();

// Find foundational documents
const foundational = Array.from(graph.nodes.values())
  .filter(n => n.level === 'foundational')
  .sort((a, b) => a.difficulty - b.difficulty);

// Analyze foundation structure
foundational.forEach(doc => {
  console.log(`📚 ${doc.title} (${doc.id})`);
  console.log(`   Prerequisites: ${doc.relationships.prerequisites.length}`);
  console.log(`   Enables: ${doc.relationships.enables.length}`);
  console.log(`   Related: ${doc.relationships.related.length}`);
});
```

### Knowledge Graph Queries

#### Find Documents by Agent

```typescript
// Find all documents assigned to 6D-Intelligence-Agent
const intelligenceDocs = Array.from(graph.nodes.values())
  .filter(n => n.blackboard?.assignedAgent === '6D-Intelligence-Agent');
```

#### Find Documents by Status

```typescript
// Find all active documents
const activeDocs = Array.from(graph.nodes.values())
  .filter(n => n.blackboard?.status === 'active');
```

#### Find Documents Needing Attention

```typescript
// Find documents with low completeness
const needsAttention = Array.from(graph.nodes.values())
  .filter(n => n.understanding.completeness < 0.6)
  .sort((a, b) => a.understanding.completeness - b.understanding.completeness);
```

#### Find Document Dependencies

```typescript
// Find all documents that depend on a specific document
const dependents = Array.from(graph.edges.values())
  .filter(e => e.to === 'target-doc-id' && e.type === 'prerequisite')
  .map(e => graph.nodes.get(e.from));
```

### Integration with Blackboard Architecture

The knowledge model integrates with the blackboard architecture:

```typescript
// Update blackboard with knowledge graph insights
const model = new ObsidianFrontmatterKnowledgeModel('./docs');
const graph = await model.buildKnowledgeGraph();

// Update blackboard status based on completeness
graph.nodes.forEach(node => {
  if (node.understanding.completeness < 0.6) {
    // Mark as needing attention
    updateBlackboard(node.id, {
      status: 'processing',
      assignedAgent: '6D-Intelligence-Agent',
      dependencies: node.relationships.prerequisites
    });
  }
});
```

### Benefits for Multi-Agent Coordination

1. **Document Discovery**: Agents can discover relevant documents based on relationships
2. **Workload Distribution**: Track which agents are assigned to which documents
3. **Dependency Management**: Understand document prerequisites and enables relationships
4. **Quality Assurance**: Identify incomplete or broken documentation
5. **Knowledge Navigation**: Navigate documentation through relationship graphs

## Document Knowledge Extraction System

### Overview

The **Document Knowledge Extractor** (`evolutions/document-knowledge-extractor/`) extracts structured knowledge from markdown documentation, enabling natural language queries and learning systems. This system extracts facts, rules, agents, functions, and relationships from documentation files.

### System Status (Updated 2025-01-07)

**Status**: ✅ **FULLY OPERATIONAL**

All critical issues have been resolved:
- ✅ **Facts Loading**: Fixed export/load format (0 → 1263 facts)
- ✅ **Agent Extraction**: Fixed YAML parsing workaround (1/15 → 15/15 agents)
- ✅ **Backward Compatibility**: Old JSONL formats still supported
- ✅ **Natural Language Queries**: Integrated with NL query engine

### Knowledge Extraction Capabilities

The system extracts:

1. **Facts** (1263 extracted):
   - Definitions, requirements, examples, capabilities
   - Code examples from documentation
   - Structured information from markdown

2. **Rules** (164 extracted):
   - RFC2119 keywords (MUST, SHOULD, MAY statements)
   - Requirements and constraints
   - Compliance rules

3. **Agents** (15/15 extracted):
   - All agent definitions from AGENTS.md frontmatter
   - Agent capabilities, dependencies, and CI integration
   - Agent metadata and relationships

4. **Functions** (92 extracted):
   - R5RS function calls (53 R5RS functions)
   - Function signatures and examples
   - Function descriptions and usage

5. **Relationships** (577 extracted):
   - Prerequisites, enables, related links
   - Document dependencies
   - Knowledge graph edges

### Usage

#### Extract Knowledge from Documentation

```bash
# Extract knowledge from docs directory
tsx evolutions/document-knowledge-extractor/extract-docs.ts ./docs ./knowledge-base.jsonl

# Test knowledge systems
tsx test-knowledge-systems.ts
```

#### Programmatic Usage

```typescript
import { DocumentKnowledgeExtractor } from './evolutions/document-knowledge-extractor/document-knowledge-extractor';

// Create extractor
const extractor = new DocumentKnowledgeExtractor('./docs');

// Extract all knowledge
await extractor.extractAll();

// Get knowledge base
const knowledgeBase = extractor.getKnowledgeBase();

// Export to JSONL
const jsonl = knowledgeBase.exportToJSONL();
fs.writeFileSync('knowledge-base.jsonl', jsonl);

// Query knowledge
const agents = knowledgeBase.queryAgents(dimension: '5D');
const mustRules = knowledgeBase.queryRules('MUST');
const facts = knowledgeBase.queryFacts('example');
```

### Agent Integration

#### 6D-Intelligence-Agent: Knowledge Analysis

**Purpose**: Analyze extracted knowledge for patterns and insights

**Usage**:
```typescript
// 6D-Intelligence-Agent: Analyze knowledge base
const extractor = new DocumentKnowledgeExtractor('./docs');
await extractor.extractAll();
const kb = extractor.getKnowledgeBase();

// Analyze agent coverage
const agents = kb.getKnowledgeBase().agents;
console.log(`Total agents: ${agents.length}`);
agents.forEach(agent => {
  console.log(`- ${agent.name} (${agent.dimension || 'no dimension'})`);
});

// Analyze rule distribution
const mustRules = kb.queryRules('MUST');
const shouldRules = kb.queryRules('SHOULD');
console.log(`MUST rules: ${mustRules.length}`);
console.log(`SHOULD rules: ${shouldRules.length}`);
```

#### Query-Interface-Agent: Natural Language Queries

**Purpose**: Enable natural language queries about system knowledge

**Usage**:
```typescript
import { NLQueryEngine } from './evolutions/natural-language-query/nl-query-engine';

// Load knowledge base
const kb = new KnowledgeBaseManager();
kb.loadFromJSONL(fs.readFileSync('knowledge-base.jsonl', 'utf-8'));

// Create query engine
const queryEngine = new NLQueryEngine(kb);

// Query agents
const result = queryEngine.query('What agents are available?');
console.log(result.answer);

// Query functions
const funcResult = queryEngine.query('How do I use r5rs:church-add?');
console.log(funcResult.answer);
```

### Recent Fixes (2025-01-07)

#### Issue 1: Facts Loading ✅ FIXED

**Problem**: Facts exported with `type: 'example'` instead of `type: 'fact'`, causing 0 facts to load.

**Solution**: 
- Extract `fact.type` into `factType` before exporting
- Set entity type as `type: 'fact'` for loading
- Restore `fact.type` from `factType` on load
- Added backward compatibility for old formats

**Result**: 1263 facts now load correctly ✅

#### Issue 2: Agent Extraction ✅ FIXED

**Problem**: YAML parser stopping at `blackboard` section, only extracting 1/15 agents.

**Solution**:
- Added workaround to detect missing `agentTypes`
- Manually extracts `agentTypes` section by line-by-line parsing
- Parses `agentTypes` separately and merges into frontmatter
- Improved error handling and array support

**Result**: 15/15 agents now extracted correctly ✅

### Integration with Natural Language Query Engine

The Document Knowledge Extractor integrates with the Natural Language Query Engine (`evolutions/natural-language-query/`) to enable:

- **Natural Language Queries**: Ask questions in plain English
- **Semantic Search**: Find relevant information based on meaning
- **Knowledge Discovery**: Discover relationships and patterns
- **Agent Information**: Query agent capabilities and dependencies

**Example Queries**:
- "What agents are available?"
- "What are the MUST requirements?"
- "How do I use r5rs:church-add?"
- "What rules apply to SHACL validation?"

### Files and Components

- **`document-knowledge-extractor.ts`**: Main extractor class
- **`knowledge-base.ts`**: Knowledge base storage and querying
- **`extract-docs.ts`**: CLI script for extraction
- **`test-knowledge-systems.ts`**: Test script for verification
- **`nl-query-engine.ts`**: Natural language query engine

### Knowledge Propagation Impact

The Document Knowledge Extraction system significantly enhances knowledge propagation across the automaton system:

**Vertical Propagation (0D→7D)**:
- Each dimension agent can query knowledge from all previous dimensions
- Rules and facts propagate upward through dimensional hierarchy
- Agent capabilities tracked across dimensions

**Horizontal Propagation (Topology↔Systems)**:
- Topology patterns inform system implementations
- System implementations validate topology patterns
- Both layers contribute to shared knowledge base

**Temporal Propagation (Phases)**:
- Evolution patterns captured as structured facts
- Test results become queryable knowledge
- Optimization strategies propagate to future phases

**Impact Metrics**:
- **8x faster learning**: Dimensions don't rediscover knowledge
- **3x faster optimization**: Patterns from Phase 14 inform Phase 15
- **2x faster variant generation**: Strategies reusable across variants

**See**: `docs/15-Automaton-Evolution-Testing-Optimizing/KNOWLEDGE_PROPAGATION_ANALYSIS.md` for detailed analysis.

### Related Documentation

- **`KNOWLEDGE_SYSTEMS_FIXES.md`**: Detailed fix documentation
- **`KNOWLEDGE_SYSTEMS_TEST_REPORT.md`**: Test results and analysis
- **`docs/15-Automaton-Evolution-Testing-Optimizing/KNOWLEDGE_PROPAGATION_ANALYSIS.md`**: Knowledge propagation analysis
- **`evolutions/document-knowledge-extractor/README.md`**: Extractor documentation
- **`evolutions/natural-language-query/README.md`**: NL query engine documentation

## Bipartite-BQF CanvasL Extension

### Overview

The **Bipartite Binary Quadratic Polynomial Form (Bipartite-BQF)** extension to CanvasL provides optimal mathematical encoding of the dimensional progression (0D-7D) through bipartite graph structures with quadratic polynomial forms. This extension enables explicit representation of topology (mathematical foundations) and system (computational implementations) partitions.

**Status**: Specification complete (v1.0.0)
**Package**: `@automaton/bipartite-bqf-canvasl-spec@1.0.0`
**Documentation**: `docs/28-Canvasl-Frontmatter-Knowledge-Model/`

### Key Concepts

#### 1. Bipartite Graph Structure

The system explicitly models two partitions:

- **Topology Partition (Left)**: Mathematical foundations, Church encoding, dimensional progression
- **System Partition (Right)**: Computational implementations, OpenCode operations, network systems

**Horizontal Edges** (`h:*`) map topology → system implementations
**Vertical Edges** (`v:*`) represent dimensional progression

#### 2. Binary Quadratic Forms (BQF)

Each dimension (0D-7D) is encoded as a Binary Quadratic Form:

```
BQF(x, y) = ax² + bxy + cy²
```

Where coefficients encode dimensional properties:
- **0D**: Identity (0, 0, 0)
- **1D**: Successor (1, 0, 0)
- **2D**: Pairing (1, 1, 1)
- **3D-7D**: Higher-dimensional operations

#### 3. Polynomial Representation

The extension provides a complete mapping chain:

```
S-expression Symbol → Polynomial → BQF → R5RS Procedure
```

This enables:
- Symbolic reasoning at the topology level
- Polynomial operations for transformations
- Efficient BQF encoding for storage
- Direct R5RS procedure generation for execution

### Agent Responsibilities for Bipartite-BQF

#### 2D-Structural-Agent: Primary Bipartite Operations

**Assigned Role**: Primary agent for Bipartite-BQF extension (per `01-BIPARTITE-BQF-EXTENSION-RFC2119.md` blackboard metadata)

**Enhanced Capabilities**:
- Manages bipartite graph structure (topology ↔ system partitions)
- Handles BQF encoding and polynomial representation
- Coordinates mapping chain: Symbol → Polynomial → BQF → Procedure
- Validates bipartite structure integrity
- Extracts bipartite metadata from frontmatter
- Synchronizes CanvasL ↔ Frontmatter bipartite annotations

**R5RS Functions**:
- `r5rs:build-bipartite-graph` - Build bipartite graph from canvas
- `r5rs:validate-bipartite` - Validate bipartite structure
- `r5rs:bqf-encode` - Encode dimension as BQF
- `r5rs:polynomial-to-bqf` - Convert polynomial to BQF
- `r5rs:symbol-to-polynomial` - Convert S-expression to polynomial

**Integration**:
```typescript
// 2D-Structural-Agent: Build bipartite graph
const bipartiteGraph = await agentApi.executeAgent('2D-Structural-Agent', {
  operation: 'buildBipartiteGraph',
  parameters: {
    canvasFile: 'automaton-kernel.jsonl',
    extractTopology: true,
    extractSystem: true
  }
});

// Validate bipartite structure
const validation = await agentApi.executeAgent('2D-Structural-Agent', {
  operation: 'validateBipartite',
  parameters: {
    graph: bipartiteGraph,
    checkHorizontalEdges: true,
    checkVerticalProgression: true
  }
});
```

#### 6D-Intelligence-Agent: BQF Analysis and Optimization

**Enhanced Capabilities**:
- Analyzes BQF patterns across dimensions
- Optimizes polynomial representations
- Discovers BQF relationships and symmetries
- Validates dimensional progression consistency
- Provides AI-powered BQF generation

**Integration**:
```typescript
// 6D-Intelligence-Agent: Analyze BQF patterns
const analysis = await agentApi.executeAgent('6D-Intelligence-Agent', {
  operation: 'analyzeBQFPatterns',
  parameters: {
    dimensions: ['0D', '1D', '2D', '3D', '4D', '5D', '6D', '7D'],
    findSymmetries: true,
    optimizeRepresentation: true
  }
});
```

#### 0D-7D Agents: Dimensional BQF Encoding

Each dimensional agent maintains BQF encoding for its dimension:

- **0D-Topology-Agent**: BQF(x,y) = 0 (identity)
- **1D-Temporal-Agent**: BQF(x,y) = x² (successor)
- **2D-Structural-Agent**: BQF(x,y) = x² + xy + y² (pairing)
- **3D-Algebraic-Agent**: BQF operations (addition, multiplication, exponentiation)
- **4D-Network-Agent**: Spacetime structure encoding
- **5D-Consensus-Agent**: Consensus topology encoding
- **6D-Intelligence-Agent**: Intelligence topology encoding
- **7D-Quantum-Agent**: Quantum topology encoding

### Frontmatter Integration

The Bipartite-BQF extension integrates with the Obsidian Frontmatter Knowledge Model through extended frontmatter schema:

```yaml
---
id: node-id
title: "Node Title"
# ... standard frontmatter ...
bipartite:
  partition: topology | system
  dimension: 0D | 1D | 2D | 3D | 4D | 5D | 6D | 7D
  bqf:
    coefficients: [a, b, c]
    form: "ax² + bxy + cy²"
    signature: identity | successor | pairing | algebra | network | consensus | intelligence | quantum
  mappingChain:
    symbol: "(church-add x y)"
    polynomial: "x² + 2xy + y²"
    bqf: [1, 2, 1]
    procedure: "r5rs:church-add"
---
```

**Synchronization Requirements**:
- CanvasL nodes with bipartite metadata MUST sync with frontmatter
- Frontmatter changes MUST propagate to CanvasL canvas
- BQF coefficients MUST remain consistent across both representations

### Validation Requirements

Agents MUST validate:

1. **Bipartite Structure**: Nodes correctly partitioned into topology/system
2. **BQF Progression**: BQF forms follow dimensional progression (0D → 7D)
3. **Mapping Chain**: Complete chain from symbol to procedure
4. **Horizontal Edges**: Topology ↔ System mappings are valid
5. **Vertical Edges**: Dimensional progression is consistent
6. **Frontmatter Sync**: CanvasL ↔ Frontmatter consistency

**Validation Functions**:
```typescript
// Validate complete bipartite-BQF structure
const validation = await agentApi.executeAgent('2D-Structural-Agent', {
  operation: 'validateBipartiteBQF',
  parameters: {
    canvas: 'automaton-kernel.jsonl',
    validateBQF: true,
    validateMappingChain: true,
    validateFrontmatterSync: true
  }
});
```

### Implementation Status

- ✅ **Specification Complete**: All RFC 2119 specifications finalized
- ✅ **Examples Provided**: Complete working examples in `docs/28-Canvasl-Frontmatter-Knowledge-Model/examples/`
- ✅ **Validation Rules**: Complete validation rules documented
- 🚧 **Grammar Extension**: Pending CanvasL grammar extension
- 🚧 **Parser Implementation**: Pending parser updates
- 🚧 **R5RS Integration**: Pending R5RS function implementations

### Documentation References

#### Core Specifications (v1.0.0)

- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/00-META-SPECIFICATION-RFC2119.md`**: Meta-specification coordinating all specs
- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/01-BIPARTITE-BQF-EXTENSION-RFC2119.md`**: Main extension specification
- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/02-PROTOCOL-SPECIFICATION-RFC2119.md`**: Protocol specification
- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/03-FRONTMATTER-INTEGRATION-RFC2119.md`**: Frontmatter integration

#### Supporting Materials

- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/README.md`**: Package overview and quick start
- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/PACKAGE.json`**: Package metadata and versioning
- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/examples/`**: Complete working examples
- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/reference/`**: Grammar, validation, and function references

#### Related Documentation

- **`docs/04-CanvasL/CANVASL-RFC2119-SPEC.md`**: Base CanvasL specification
- **`docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md`**: Multiverse canvas specification
- **`evolutions/obsidian-frontmatter-knowledge-model/`**: Frontmatter knowledge model
- **`wiki/horizontal/integration-guides/topology-to-system-mappings.md`**: Bipartite structure explanation

### Benefits for Multi-Agent System

The Bipartite-BQF extension provides:

1. **Explicit Topology-System Separation**: Clear distinction between mathematical foundations and implementations
2. **Optimal Encoding**: Efficient BQF representation preserving mathematical structure
3. **Complete Mapping Chain**: Transparent conversion from symbols to executable procedures
4. **Dimensional Consistency**: Validated progression from 0D to 7D
5. **Frontmatter Integration**: Seamless knowledge model synchronization
6. **Agent Coordination**: Clear agent responsibilities for bipartite operations

### Example: Complete Agent Workflow

```typescript
// Complete Bipartite-BQF workflow using multiple agents
async function bipartiteBQFWorkflow() {
  // Step 1: 2D-Structural-Agent builds bipartite graph
  const bipartiteGraph = await agentApi.executeAgent('2D-Structural-Agent', {
    operation: 'buildBipartiteGraph',
    parameters: {
      canvasFile: 'automaton-kernel.jsonl',
      extractTopology: true,
      extractSystem: true,
      extractBQFMetadata: true
    }
  });

  console.log(`Bipartite graph built:`);
  console.log(`  Topology nodes: ${bipartiteGraph.topology.nodes.length}`);
  console.log(`  System nodes: ${bipartiteGraph.system.nodes.length}`);
  console.log(`  Horizontal edges: ${bipartiteGraph.horizontalEdges.length}`);

  // Step 2: 2D-Structural-Agent validates bipartite structure
  const validation = await agentApi.executeAgent('2D-Structural-Agent', {
    operation: 'validateBipartite',
    parameters: {
      graph: bipartiteGraph,
      validateBQF: true,
      validateMappingChain: true,
      validateDimensionalProgression: true
    }
  });

  if (!validation.valid) {
    console.error('Bipartite validation failed:', validation.errors);
    return;
  }

  // Step 3: 6D-Intelligence-Agent analyzes BQF patterns
  const analysis = await agentApi.executeAgent('6D-Intelligence-Agent', {
    operation: 'analyzeBQFPatterns',
    parameters: {
      graph: bipartiteGraph,
      dimensions: ['0D', '1D', '2D', '3D', '4D', '5D', '6D', '7D'],
      findSymmetries: true,
      optimizeRepresentation: true
    }
  });

  console.log('BQF Analysis Results:');
  console.log(`  Symmetries found: ${analysis.symmetries.length}`);
  console.log(`  Optimization suggestions: ${analysis.optimizations.length}`);

  // Step 4: 2D-Structural-Agent synchronizes with frontmatter
  const sync = await agentApi.executeAgent('2D-Structural-Agent', {
    operation: 'syncBipartiteFrontmatter',
    parameters: {
      graph: bipartiteGraph,
      targetDirectory: './docs/',
      updateExisting: true,
      createMissing: false
    }
  });

  console.log(`Frontmatter sync complete: ${sync.updatedFiles.length} files updated`);

  // Step 5: 5D-Consensus-Agent validates consistency
  const consensus = await agentApi.executeAgent('5D-Consensus-Agent', {
    operation: 'validateConsistency',
    parameters: {
      checkBipartiteStructure: true,
      checkBQFProgression: true,
      checkFrontmatterSync: true
    }
  });

  console.log(`Consistency validation: ${consensus.valid ? 'PASS' : 'FAIL'}`);
}
```
// Complete agent workflow using knowledge model
async function agentDocumentationWorkflow() {
  // 1. Build knowledge graph
  const model = new ObsidianFrontmatterKnowledgeModel('./docs');
  const graph = await model.buildKnowledgeGraph();
  
  // 2. Find documents assigned to this agent
  const myDocs = Array.from(graph.nodes.values())
    .filter(n => n.blackboard?.assignedAgent === '6D-Intelligence-Agent');
  
  // 3. Prioritize by completeness
  const prioritized = myDocs
    .sort((a, b) => a.understanding.completeness - b.understanding.completeness);
  
  // 4. Process incomplete documents
  for (const doc of prioritized) {
    if (doc.understanding.completeness < 0.6) {
      console.log(`Processing: ${doc.title}`);
      
      // Check prerequisites
      const prereqs = doc.relationships.prerequisites
        .map(id => graph.nodes.get(id))
        .filter(n => n && n.understanding.completeness < 0.6);
      
      if (prereqs.length > 0) {
        console.log(`  Waiting for prerequisites: ${prereqs.map(n => n!.title).join(', ')}`);
        continue;
      }
      
      // Process document
      await processDocument(doc);
    }
  }
  
  // 5. Generate updated report
  const updatedGraph = await model.buildKnowledgeGraph();
  console.log(updatedGraph.generateReport());
}
```

### Knowledge Model Output

The model generates:

1. **Console Report**: Markdown report with:
   - Overview statistics
   - Documents by level and type
   - Completeness distribution
   - Documents needing attention
   - Relationship graph summary

2. **JSON Export**: Complete knowledge graph with:
   - All nodes with full metadata
   - All edges (relationships)
   - Statistics
   - Timestamp

### Integration Requirements

Agents MUST:
- Use the knowledge model to analyze documentation before processing
- Update blackboard metadata based on analysis results
- Coordinate with other agents using relationship graphs
- Track document completeness and quality metrics

**Reference**: See `evolutions/obsidian-frontmatter-knowledge-model/docs/README.md` for complete documentation.

## Documentation Folder Connections and Context

The multi-agent system integrates with multiple documentation folders that provide context, specifications, and implementation details. Understanding these connections enables agents to operate effectively across the entire system.

### Documentation Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Multi-Agent System (AGENTS.md)            │
│         Coordinates all dimensional agents             │
└─────────────────────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│ 03-Meta- │  │ 04-CanvasL  │  │ 05-Meta-Log │
│  verse   │  │              │  │             │
│  Canvas  │  │  (Format)    │  │ (Logic Eng) │
└──────────┘  └──────────────┘  └─────────────┘
     │                │                │
     └────────────────┼────────────────┘
                      │
         ┌────────────▼────────────┐
         │  06-Meta-Log-Adapters   │
         │  (Native Packages)      │
         └────────────┬────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼──────┐    ┌────▼────┐    ┌───────▼──────┐
│ 07-Meta- │    │ 08-Meta │    │ 09-UI-       │
│ Log-Db   │    │ Log-    │    │ Integration  │
│          │    │ Plugin  │    │              │
└──────────┘    └─────────┘    └──────────────┘
```

### Folder 03: Metaverse Canvas (`docs/03-Metaverse-Canvas/`)

**Purpose**: Core canvas editing system and JSONL/CanvasL format support

**Context**: Provides the foundational canvas editing infrastructure that agents use to interact with JSONL canvas files. This folder documents how agents can read, write, and manipulate canvas data.

**Key Documents**:
- **`README.md`**: Navigation hub for canvas editing documentation
- **`JSONL-CANVAS-EDITING.md`**: Comprehensive guide to JSONL canvas editing
- **`CANVASL-LANGUAGE.md`**: CanvasL language overview and features
- **`CODE-MIRROR-LEZER-INTEGRATION.md`**: CodeMirror 6 and Lezer integration
- **`GRAMMAR-REFERENCE.md`**: Complete grammar reference for parsing
- **`METAVERSE-CANVAS-COMPLETE.md`**: Complete implementation status

**Agent Connections**:
- **2D-Structural Agent**: Uses JSONL canvas editing for pattern operations
- **Self-Modification Agent**: Rewrites canvas JSONL files using editing APIs
- **Query-Interface Agent**: Provides REPL access to canvas data
- **Visualization Agent**: Renders canvas data in 3D visualizations

**R5RS Functions Used**:
- `r5rs:parse-jsonl-canvas` - Parse JSONL canvas files
- `r5rs:extract-facts` - Extract facts from canvas
- `r5rs:query-facts` - Query canvas facts

**Dependencies**:
- Depends on: `docs/02-JSONL-Database-Adapter/` (database operations)
- Enables: `docs/04-CanvasL/` (CanvasL format)
- Used by: All agents for canvas data access

**Reference**: See `docs/03-Metaverse-Canvas/README.md` for complete documentation.

### Folder 04: CanvasL (`docs/04-CanvasL/`)

**Purpose**: RFC 2119 specification for CanvasL extended JSONL format

**Context**: Defines the CanvasL language specification that extends JSONL with directives, R5RS function calls, dimension references, and Scheme expressions. Agents MUST support CanvasL format for full system compatibility.

**Key Documents**:
- **`README.md`**: CanvasL documentation overview
- **`CANVASL-RFC2119-SPEC.md`**: Complete RFC 2119 specification
- **`QUICK_REFERENCE.md`**: Quick reference for CanvasL syntax
- **`ARCHITECTURE_EXPLANATION.md`**: Architecture explanation

**Agent Connections**:
- **All Agents**: MUST support CanvasL format for reading/writing canvas files
- **0D-7D Agents**: Use dimension references (`{"dimension": "0D"}`)
- **R5RS Integration**: Agents invoke R5RS functions via CanvasL (`{"type": "r5rs-call"}`)
- **Self-Modification Agent**: Generates CanvasL files during evolution

**CanvasL Features Used by Agents**:
- **Directives**: `@version`, `@schema` for metadata
- **R5RS Function Calls**: `{"type": "r5rs-call", "function": "r5rs:church-add"}`
- **Dimension References**: `{"dimension": "0D"}` for dimensional operations
- **Node References**: `{"fromNode": "#0D-topology"}` for relationships
- **Scheme Expressions**: `{"expression": "(church-add 2 3)"}` for computations

**Dependencies**:
- Depends on: `docs/03-Metaverse-Canvas/` (base JSONL format)
- Enables: `docs/05-Meta-Log/` (multiverse canvas with CanvasL)
- Used by: All agents for format compliance

**Reference**: See `docs/04-CanvasL/CANVASL-RFC2119-SPEC.md` for complete specification.

### Folder 05: Meta-Log (`docs/05-Meta-Log/`)

**Purpose**: Integration of ProLog, DataLog, and R5RS for multiverse canvas system

**Context**: Provides the logic programming foundation that enables agents to query, reason, and validate canvas data using ProLog, DataLog, and R5RS functions. This is the core integration layer for all logic operations.

**Key Documents**:
- **`README.md`**: Meta-Log documentation overview
- **`MULTIVERSE-CANVAS-RFC2119-SPEC.md`**: Complete RFC 2119 specification
- **`IMPLEMENTATION-GUIDE.md`**: Practical implementation guide
- **`QUICK_REFERENCE.md`**: Quick reference for common operations
- **`ARCHITECTURE_EXPLANATION.md`**: Architecture explanation

**Agent Connections**:
- **Query-Interface Agent**: Uses ProLog queries (`r5rs:prolog-query`)
- **2D-Structural Agent**: Extracts facts using DataLog (`r5rs:extract-facts`, `r5rs:datalog-query`)
- **Self-Modification Agent**: Validates with SHACL (`r5rs:shacl-validate`)
- **All Agents**: Use R5RS functions for computations
- **Goal-Oriented Agent**: Uses ProLog for goal negotiation

**R5RS Functions Used**:
- **ProLog**: `r5rs:build-prolog-db`, `r5rs:prolog-query`, `r5rs:unify`
- **DataLog**: `r5rs:extract-facts`, `r5rs:datalog-query`, `r5rs:build-datalog-program`
- **RDF**: `r5rs:jsonl-to-rdf`, `r5rs:rdf-query`, `r5rs:sparql-query`
- **SHACL**: `r5rs:load-shacl-shapes`, `r5rs:shacl-validate`

**Dependencies**:
- Depends on: `docs/03-Metaverse-Canvas/`, `docs/04-CanvasL/` (canvas formats)
- Enables: `docs/06-Meta-Log-Adapters/` (adapter implementations)
- Used by: All agents for logic operations

**Reference**: See `docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md` for complete specification.

### Folder 06: Meta-Log Adapters (`docs/06-Meta-Log-Adapters/`)

**Purpose**: Native packages for Meta-Log database and plugin infrastructure

**Context**: Documents the creation of native `meta-log-db` and `meta-log-plugin` packages that can be `npm link`ed to provide a common interface for OpenCode and Obsidian plugins. Agents interact with these adapters through standardized interfaces.

**Key Documents**:
- **`README.md`**: Meta-Log adapters overview
- **`01-Meta-Log-Db/`**: Native database package documentation
  - **`README.md`**: Database package overview
  - **`API.md`**: Complete API reference
  - **`SETUP_GUIDE.md`**: Setup and linking guide
- **`02-Meta-Log-Plugin/`**: Native plugin package documentation
  - **`README.md`**: Plugin package overview
  - **`API.md`**: Complete API reference
  - **`SETUP_GUIDE.md`**: Setup and linking guide
- **`ARCHITECTURE_EXPLANATION.md`**: Architecture explanation
- **`QUICK_START.md`**: Quick start guide

**Agent Connections**:
- **All Agents**: Access Meta-Log database through `meta-log-db` package
- **OpenCode-Integration-Agent**: Uses `meta-log-plugin` for OpenCode integration
- **Query-Interface Agent**: Provides SPARQL/REPL access via database adapter
- **Self-Modification Agent**: Uses database adapter for canvas operations

**Adapter Architecture**:
```
OpenCode Plugin ──┐
                  ├──> meta-log-plugin ──> meta-log-db
Obsidian Plugin ──┘
```

**Dependencies**:
- Depends on: `docs/05-Meta-Log/` (logic programming foundation)
- Enables: `docs/07-Meta-Log-Db/`, `docs/08-Meta-Log-Plugin/` (implementation status)
- Used by: OpenCode and Obsidian plugins

**Reference**: See `docs/06-Meta-Log-Adapters/README.md` for complete documentation.

### Folder 07: Meta-Log Database (`docs/07-Meta-Log-Db/`)

**Purpose**: Implementation progress and status for `meta-log-db` native package

**Context**: Tracks the implementation status of the `meta-log-db` package located at `/home/main/automaton/meta-log-db/`. This package provides core database functionality that agents use for ProLog, DataLog, and R5RS operations.

**Key Documents**:
- **`README.md`**: Implementation progress and status
- **`ARCHITECTURE_EXPLANATION.md`**: Architecture explanation
- **`IMPLEMENTATION_STATUS.md`**: Detailed implementation status

**Agent Connections**:
- **All Agents**: Use `MetaLogDb` class for database operations
- **Query-Interface Agent**: Executes ProLog/DataLog/SPARQL queries
- **2D-Structural Agent**: Extracts facts using database engine
- **Self-Modification Agent**: Validates canvas with SHACL validator

**Implementation Status**: ✅ Complete
- ProLog engine with unification and resolution
- DataLog engine with fact extraction and fixed-point computation
- R5RS registry with function loading and execution
- JSONL/CanvasL parser with RDF conversion
- RDF triple store with SPARQL support
- SHACL validator with constraint checking

**Dependencies**:
- Depends on: `docs/05-Meta-Log/` (specification), `docs/06-Meta-Log-Adapters/` (adapter design)
- Used by: All agents through `meta-log-db` package

**Reference**: See `docs/07-Meta-Log-Db/README.md` for implementation status.

### Folder 08: Meta-Log Plugin (`docs/08-Meta-Log-Plugin/`)

**Purpose**: Implementation progress and status for `meta-log-plugin` native package

**Context**: Tracks the implementation status of the `meta-log-plugin` package located at `/home/main/automaton/plugin/meta-log-plugin/`. This package provides common plugin infrastructure that agents can use through OpenCode and Obsidian integrations.

**Key Documents**:
- **`README.md`**: Implementation progress and status
- **`ARCHITECTURE_EXPLANATION.md`**: Architecture explanation
- **`IMPLEMENTATION_STATUS.md`**: Detailed implementation status

**Agent Connections**:
- **OpenCode-Integration-Agent**: Uses `OpenCodeMetaLogPlugin` for OpenCode integration
- **All Agents**: Access plugin lifecycle through `BaseMetaLogPlugin`
- **Query-Interface Agent**: Provides REPL access via plugin hooks
- **Self-Modification Agent**: Uses plugin hooks for canvas updates

**Implementation Status**: ✅ Complete
- Base plugin class with lifecycle management
- OpenCode adapter with tool registration
- Obsidian adapter with settings persistence
- Event system with before/after query hooks
- Configuration and state management

**Dependencies**:
- Depends on: `docs/05-Meta-Log/` (specification), `docs/06-Meta-Log-Adapters/` (adapter design), `docs/07-Meta-Log-Db/` (database package)
- Used by: OpenCode and Obsidian plugins

**Reference**: See `docs/08-Meta-Log-Plugin/README.md` for implementation status.

### Folder 09: UI Integration (`docs/09-UI-Integration/`)

**Purpose**: UI components and visualization integration for the multi-agent system

**Context**: Documents the UI components that visualize and interact with the multi-agent system, including 3D metaverse visualization, unified editors, and Grok metaverse integration. Agents coordinate with UI components for visualization and user interaction.

**Key Documents**:
- **`GROK_METAVERSE.md`**: Grok Metaverse 3D visualization system
- **`METAVERSE_CANVAS_3D.md`**: 3D canvas visualization
- **`UNIFIED_EDITOR.md`**: Unified code editor integration
- **`UNIFIED_METAVERSE_VIEW.md`**: Unified metaverse view component

**Agent Connections**:
- **Visualization Agent**: Renders agents in 3D using Grok Metaverse
- **0D-7D Agents**: Each agent has unique 3D avatar representation
- **Query-Interface Agent**: Provides REPL interface in unified editor
- **AI-Assist Agent**: Generates code via WebLLM in editor
- **Multiplayer Agent**: Enables collaborative exploration in 3D view

**Visualization Features**:
- **Dimensional Agents**: Each dimension (0D-7D) has unique shape and color
- **Topology vs System**: Different shapes for topology agents vs system agents
- **3D Spiral Layout**: Agents arranged in 3D spiral/helix pattern
- **Connections**: Visual edges showing vertical (dimensional) and horizontal (implementation) relationships

**Dependencies**:
- Depends on: `docs/03-Metaverse-Canvas/` (canvas data), `docs/05-Meta-Log/` (logic operations)
- Uses: Three.js for 3D rendering, CodeMirror 6 for editing
- Used by: UI components for agent visualization

**Reference**: See `docs/09-UI-Integration/GROK_METAVERSE.md` for visualization details.

### Folder Connection Flow

The documentation folders form a connected system:

```
01-R5RS-Expressions (Foundation)
    ↓
02-JSONL-Database-Adapter (Storage)
    ↓
03-Metaverse-Canvas (Canvas Editing)
    ↓
04-CanvasL (Format Specification)
    ↓
05-Meta-Log (Logic Integration)
    ↓
06-Meta-Log-Adapters (Native Packages)
    ├──> 07-Meta-Log-Db (Database Implementation)
    └──> 08-Meta-Log-Plugin (Plugin Implementation)
    ↓
09-UI-Integration (Visualization)
    ↓
10-Github-CI-CD-Workflow (CI/CD Integration)
    ↓
11-Automatons (Execution Scripts)
    ↓
12-Automatons-CanvasL (CanvasL Integration)
```

### Agent-to-Folder Mapping

**Foundation Agents (0D-2D)**:
- **0D-Topology-Agent**: Uses `03-Metaverse-Canvas/` for canvas operations, `04-CanvasL/` for format
- **1D-Temporal-Agent**: Uses `05-Meta-Log/` for temporal queries, `09-UI-Integration/` for visualization
- **2D-Structural-Agent**: Uses `03-Metaverse-Canvas/` for pattern operations, `05-Meta-Log/` for fact extraction

**Operational Agents (3D-4D)**:
- **3D-Algebraic-Agent**: Uses `04-CanvasL/` for R5RS function calls, `05-Meta-Log/` for computations
- **4D-Network-Agent**: Uses `10-Github-CI-CD-Workflow/` for CI/CD operations, `09-UI-Integration/` for network visualization

**Advanced Agents (5D-7D)**:
- **5D-Consensus-Agent**: Uses `05-Meta-Log/` for consensus logic, `10-Github-CI-CD-Workflow/` for approval workflows
- **6D-Intelligence-Agent**: Uses `05-Meta-Log/` for AI operations, `10-Github-CI-CD-Workflow/` for test analysis
- **7D-Quantum-Agent**: Uses `05-Meta-Log/` for quantum operations, `09-UI-Integration/` for quantum visualization

**Interface Agents**:
- **Query-Interface-Agent**: Uses `05-Meta-Log/` for ProLog/DataLog queries, `06-Meta-Log-Adapters/` for database access
- **Visualization-Agent**: Uses `09-UI-Integration/` for 3D rendering, `03-Metaverse-Canvas/` for canvas data

**Collaborative Agents**:
- **Multiplayer-Agent**: Uses `09-UI-Integration/` for collaborative features, `03-Metaverse-Canvas/` for shared canvas
- **AI-Assist-Agent**: Uses `09-UI-Integration/` for code generation, `05-Meta-Log/` for AI operations

**Evolutionary Agents**:
- **Self-Modification-Agent**: Uses `03-Metaverse-Canvas/` for canvas editing, `04-CanvasL/` for format, `05-Meta-Log/` for validation, `11-Automatons/` for execution scripts, `12-Automatons-CanvasL/` for CanvasL integration
- **Goal-Oriented-Agent**: Uses `05-Meta-Log/` for goal negotiation, `06-Meta-Log-Adapters/` for coordination

**OpenCode Integration Agent**:
- Uses `06-Meta-Log-Adapters/` for plugin infrastructure, `08-Meta-Log-Plugin/` for OpenCode adapter, `11-Automatons/` for automaton execution

**Automaton Execution**:
- **4D-Network-Agent**: Uses `11-Automatons/` for network-level automaton execution (`run-automaton.sh`)
- **6D-Intelligence-Agent**: Uses `11-Automatons/` for AI-powered automaton execution (`ollama-automaton.ts`, `continuous-automaton.ts`)
- **0D-Topology-Agent**: Uses `11-Automatons/` for core automaton engine (`advanced-automaton.ts`)
- **5D-Consensus-Agent**: Uses `11-Automatons/` for bootstrap process (`bootstrap-automaton.ts`)

### Cross-Folder Dependencies

**Critical Paths**:
1. **Canvas Operations**: `03-Metaverse-Canvas/` → `04-CanvasL/` → `05-Meta-Log/` → `06-Meta-Log-Adapters/`
2. **Logic Operations**: `05-Meta-Log/` → `07-Meta-Log-Db/` → `08-Meta-Log-Plugin/` → `09-UI-Integration/`
3. **CI/CD Operations**: `10-Github-CI-CD-Workflow/` ← `05-Meta-Log/` (for validation)
4. **Automaton Format Integration**: `11-Automatons/` → `12-Automatons-CanvasL/` → `04-CanvasL/` (for CanvasL support)

**Agent Requirements**:
- All agents MUST understand `docs/03-Metaverse-Canvas/` for canvas operations
- All agents MUST support `docs/04-CanvasL/` format for compatibility
- Agents using logic operations MUST use `docs/05-Meta-Log/` functions
- Agents requiring database access MUST use `docs/06-Meta-Log-Adapters/` interfaces
- Agents requiring visualization MUST coordinate with `docs/09-UI-Integration/` components
- Agents executing automaton operations MUST use `docs/11-Automatons/` scripts and engines
- Agents adapting automaton files to CanvasL MUST use `docs/12-Automatons-CanvasL/` integration guide

**Reference**: See individual folder README files for complete documentation.

## CanvasL Semantic Slides Project

### Overview

The **CanvasL Semantic Slides Project** (`docs/26-CanvasL-Semantic-Slides-Project/`) represents a major evolution of the presentation system, transforming static slides into **living knowledge graphs** that integrate public knowledge (DBpedia, Wikidata) with private user data through agent-protected federation.

**Status**: ✅ **Documentation Complete** (2025-01-07)

### Key Components

#### 1. **Semantic Slides System**
- **Browser-Native**: Full semantic reasoning stack runs in browser without backend
- **RDF-Annotated**: Every slide is a queryable RDF graph with RDF* provenance
- **DBpedia-Powered**: Live Wikipedia knowledge enrichment via SPARQL federation
- **Extensible**: Plugin architecture enables community contributions

#### 2. **Federated Knowledge Model**
- **Public-Private Integration**: Query public endpoints (DBpedia, Wikidata) alongside private user bases
- **Agent Protection**: Multi-agent system enforces consent before federating private data
- **Zero-Knowledge Federation**: Private data never leaves user's browser/device
- **RDF* Provenance**: Full audit trail with confidence scores and timestamps

#### 3. **Technical Foundation** (`docs/25-Church-Encoding-Metaverse-Presentation/`)
- **SPARQL Agent Protection**: Secure, consent-driven federated query execution
- **ProLog Rules**: Declarative logic for agent protection and UI inference
- **DataLog Integration**: Rule-based reasoning over RDF for materialization
- **Answer Set Programming**: Non-monotonic reasoning with preferences and defaults

### Agent Integration

| Component | Assigned Agent | Role |
|-----------|---------------|------|
| **Semantic Slides Project** | 6D-Intelligence-Agent | Overall coordination and AI-powered features |
| **SPARQL Federation** | 4D-Network-Agent | Network operations and endpoint coordination |
| **Agent Protection** | 5D-Consensus-Agent | Access control and consent management |
| **CanvasL Macros** | 2D-Structural-Agent | Pattern operations and macro expansion |
| **Visualization** | Visualization-Agent | Slide rendering and UI generation |

### Key Features

1. **Semantic UI Inference**: OWL reasoning + SPARQL CONSTRUCT infers layouts, styles, and render order
2. **Self-Evolving Presentations**: CanvasL macros invoke Meta-Log queries, slides modify themselves
3. **Browser-Native Logic Programming**: ProLog/DataLog/ASP execute in browser via lightweight JS engines
4. **Agent-Protected Federation**: Multi-agent system ensures user consent before federating private data
5. **RDF* Provenance Tracking**: Every triple annotated with confidence scores and timestamps

### Documentation Structure

- **`docs/25-Church-Encoding-Metaverse-Presentation/`**: Foundational research and evolution
  - **`00-OVERVIEW.md`**: Comprehensive overview of all documentation
  - **`01-SPARQL Agent Protection System.md`**: Security model for federated queries
  - **`02-ProLog Rules Explained.md`**: Logic programming foundations
  - **`03-Datalog in the Semantic Web.md`**: Materialization strategies
  - **`04-Answer Set Programming in the Semantic Web.md`**: Non-monotonic reasoning
  - **`01-Grok-Chat/`**: Project evolution documents (10 files)

- **`docs/26-CanvasL-Semantic-Slides-Project/`**: Implementation project
  - **`01-CanvasL Semantic Slides Project.md`**: Complete project specification
  - **`02-Public-Private Integration with Agent Protection.md`**: Federated knowledge model

### Integration Points

- **Meta-Log System**: Uses ProLog, DataLog, and R5RS for logic operations
- **CanvasL Format**: Slides defined in CanvasL (extended JSONL) with macros
- **Multi-Agent System**: Agents coordinate access control and federation
- **Automaton System**: Self-modification capabilities via automaton engine

### Current Status

- ✅ **Documentation Complete**: All documents have frontmatter and comprehensive overview
- ✅ **Technical Foundation**: Complete macro library examples (RDF, SPARQL, Wikidata, Federation)
- ✅ **Agent Integration**: Multi-agent coordination flow defined
- 🚧 **Implementation**: Ready for development phase
- 📋 **Planned**: Public demo deployment, community plugins, extended federation patterns

**Reference**: See `docs/25-Church-Encoding-Metaverse-Presentation/00-OVERVIEW.md` for complete documentation overview and `docs/26-CanvasL-Semantic-Slides-Project/` for implementation details.

## Related Documentation

### Core Documentation Folders

- **`docs/03-Metaverse-Canvas/`**: Core canvas editing system and JSONL/CanvasL format support
  - **`README.md`**: Navigation hub for canvas editing documentation
  - **`JSONL-CANVAS-EDITING.md`**: Comprehensive guide to JSONL canvas editing
  - **`CANVASL-LANGUAGE.md`**: CanvasL language overview and features
  - **`CODE-MIRROR-LEZER-INTEGRATION.md`**: CodeMirror 6 and Lezer integration
  - **`GRAMMAR-REFERENCE.md`**: Complete grammar reference for parsing
  - **`METAVERSE-CANVAS-COMPLETE.md`**: Complete implementation status

- **`docs/04-CanvasL/`**: RFC 2119 specification for CanvasL extended JSONL format
  - **`README.md`**: CanvasL documentation overview
  - **`CANVASL-RFC2119-SPEC.md`**: Complete RFC 2119 specification
  - **`QUICK_REFERENCE.md`**: Quick reference for CanvasL syntax
  - **`ARCHITECTURE_EXPLANATION.md`**: Architecture explanation

- **`docs/05-Meta-Log/`**: Integration of ProLog, DataLog, and R5RS for multiverse canvas system
  - **`README.md`**: Meta-Log documentation overview
  - **`MULTIVERSE-CANVAS-RFC2119-SPEC.md`**: Complete RFC 2119 specification
  - **`IMPLEMENTATION-GUIDE.md`**: Practical implementation guide with code examples
  - **`QUICK_REFERENCE.md`**: Quick reference for common operations
  - **`ARCHITECTURE_EXPLANATION.md`**: Architecture explanation

- **`docs/06-Meta-Log-Adapters/`**: Native packages for Meta-Log database and plugin infrastructure
  - **`README.md`**: Meta-Log adapters overview
  - **`01-Meta-Log-Db/`**: Native database package documentation
    - **`README.md`**: Database package overview
    - **`API.md`**: Complete API reference
    - **`SETUP_GUIDE.md`**: Setup and linking guide
  - **`02-Meta-Log-Plugin/`**: Native plugin package documentation
    - **`README.md`**: Plugin package overview
    - **`API.md`**: Complete API reference
    - **`SETUP_GUIDE.md`**: Setup and linking guide
  - **`ARCHITECTURE_EXPLANATION.md`**: Architecture explanation
  - **`QUICK_START.md`**: Quick start guide

- **`docs/07-Meta-Log-Db/`**: Implementation progress and status for `meta-log-db` native package
  - **`README.md`**: Implementation progress and status
  - **`ARCHITECTURE_EXPLANATION.md`**: Architecture explanation
  - **`IMPLEMENTATION_STATUS.md`**: Detailed implementation status

- **`docs/08-Meta-Log-Plugin/`**: Implementation progress and status for `meta-log-plugin` native package
  - **`README.md`**: Implementation progress and status
  - **`ARCHITECTURE_EXPLANATION.md`**: Architecture explanation
  - **`IMPLEMENTATION_STATUS.md`**: Detailed implementation status

- **`docs/09-UI-Integration/`**: UI components and visualization integration for the multi-agent system
  - **`GROK_METAVERSE.md`**: Grok Metaverse 3D visualization system
  - **`METAVERSE_CANVAS_3D.md`**: 3D canvas visualization
  - **`UNIFIED_EDITOR.md`**: Unified code editor integration
  - **`UNIFIED_METAVERSE_VIEW.md`**: Unified metaverse view component

- **`docs/10-Github-CI-CD-Workflow/`**: Complete CI/CD pipeline adapter documentation
  - **`README.md`**: CI/CD documentation overview
  - **`CI-PIPELINE-ADAPTER-OVERVIEW.md`**: Architecture and design
  - **`CI-PIPELINE-USAGE-GUIDE.md`**: Practical usage examples
  - **`CI-PIPELINE-AGENT-INTEGRATION.md`**: Multi-agent integration guide
  - **`CI-PIPELINE-API-REFERENCE.md`**: Complete API reference
  - **`TESTING.md`**: Testing and verification guide

- **`docs/11-Automatons/`**: Automaton execution scripts and TypeScript implementations
  - **`README.md`**: Complete automaton documentation overview
  - **`RUN-AUTOMATON-SCRIPT.md`**: Launcher script (`run-automaton.sh`) documentation
  - **`CONTINUOUS-AUTOMATON.md`**: Built-in intelligence automaton (`continuous-automaton.ts`)
  - **`OLLAMA-AUTOMATON.md`**: Ollama AI-powered automaton (`ollama-automaton.ts`)
  - **`ADVANCED-AUTOMATON.md`**: Core automaton engine (`advanced-automaton.ts`)
  - **`BOOTSTRAP-AUTOMATON.md`**: Bootstrap process (`bootstrap-automaton.ts`)
  - **`AUTOMATON-RUNNER.md`**: Basic runner (`automaton-runner.ts`)
  - **`QUICK-START.md`**: Quick reference guide

- **`docs/12-Automatons-CanvasL/`**: CanvasL format integration for automaton system
  - **`README.md`**: CanvasL integration overview and compatibility strategy
  - **`ADAPTATION-GUIDE.md`**: Step-by-step integration guide for CanvasL support
  - **`COMPATIBILITY-MATRIX.md`**: Backward and forward compatibility requirements
  - **`FILE-FORMAT-DETECTION.md`**: Format detection implementation and best practices
  - **`R5RS-INTEGRATION.md`**: R5RS function call support in automaton files
  - **`MIGRATION-GUIDE.md`**: Migration from JSONL to CanvasL format

- **`docs/13-Federated-Provenance-Meta-Log/`**: Federated provenance tracking system
  - **`README.md`**: Federated provenance documentation overview
  - **`FEDERATED-PROVENANCE-RFC2119-SPEC.md`**: Complete RFC 2119 specification for federated provenance
  - **`FEDERATED-PROVENANCE-SOLUTION.md`**: High-level explanation of embedded provenance solution
  - **Related**: `DEDUPLICATION_PROVENANCE_EVALUATION.md` for deduplication implementation details

- **`docs/14-Automaton-Evolution-Logging/`**: Automaton evolution logging system
  - **`README.md`**: Evolution logging overview
  - **`ARCHITECTURE.md`**: System architecture
  - **`WORKFLOW_GUIDE.md`**: Workflow usage guide
  - **`VARIANT_SPECIFICATIONS.md`**: Variant specifications
  - **`EVOLUTION_SUMMARY.md`**: Evolution test summary
  - **Related**: `docs/15-Automaton-Evolution-Testing-Optimizing/` for testing phase

- **`docs/15-Automaton-Evolution-Testing-Optimizing/`**: Testing and optimization phase
  - **`README.md`**: Testing phase overview
  - **`TESTING_FRAMEWORK.md`**: Testing framework details
  - **`OPTIMIZATION_STRATEGIES.md`**: Optimization approaches
  - **`BENCHMARK_RESULTS.md`**: Performance benchmarks
  - **`REGRESSION_TESTS.md`**: Regression test suite
  - **`CONTINUOUS_IMPROVEMENT.md`**: CI/CD integration
  - **`QUALITY_ASSURANCE.md`**: QA processes
  - **`PHASE_TRANSITION.md`**: Transition from logging phase
  - **`GETTING_STARTED.md`**: Quick start guide
  - **`STATUS.md`**: Current phase status

- **`docs/28-Canvasl-Frontmatter-Knowledge-Model/`**: Bipartite-BQF CanvasL Extension (v1.0.0)
  - **`README.md`**: Package overview and quick start
  - **`00-META-SPECIFICATION-RFC2119.md`**: Meta-specification coordinating all specs
  - **`01-BIPARTITE-BQF-EXTENSION-RFC2119.md`**: Main Bipartite-BQF extension specification
  - **`02-PROTOCOL-SPECIFICATION-RFC2119.md`**: Protocol specification for Bipartite-BQF operations
  - **`03-FRONTMATTER-INTEGRATION-RFC2119.md`**: Frontmatter integration specification
  - **`PACKAGE.json`**: Package metadata and versioning
  - **`examples/`**: Complete working examples of Bipartite-BQF usage
  - **`reference/`**: Grammar, validation, and function references
  - **Purpose**: Provides optimal mathematical encoding of dimensional progression (0D-7D) through bipartite graphs with BQF
  - **Usage**: See "Bipartite-BQF CanvasL Extension" section above

- **`evolutions/obsidian-frontmatter-knowledge-model/`**: Obsidian Frontmatter Knowledge Model
  - **`obsidian-frontmatter-knowledge-model.ts`**: Knowledge model implementation
  - **`docs/README.md`**: Complete documentation
  - **Purpose**: Analyzes document frontmatter to build knowledge graphs
  - **Usage**: See "Obsidian Frontmatter Knowledge Model Integration" section above

### Foundation Documentation

- **`docs/01-R5RS-Expressions/`**: R5RS expression foundations and Church encoding
- **`docs/02-JSONL-Database-Adapter/`**: Database adapter patterns and JSONL operations
- **`grok_files/02-Grok.md` through `grok_files/25-Grok.md`**: R5RS concept definitions
- **`r5rs-canvas-engine.scm`**: Unified R5RS function implementations

## Key Files

- **`generate.metaverse.jsonl`**: Metaverse generator referencing all automaton files
- **`automaton-kernel.seed.jsonl`**: Minimal seed for kernel regeneration
- **`automaton-kernel.jsonl`**: Full kernel with R5RS function trie
- **`automaton.canvas.space.jsonl`**: Constraint enforcement and bipartite interfaces
- **`automaton.jsonl`**: Operational automaton with OpenCode operations
- **`r5rs-functions-trie.jsonl`**: R5RS function definitions and registry

### Automaton Execution Scripts

- **`scripts/run-automaton.sh`**: Main launcher script for automaton execution
- **`continuous-automaton.ts`**: Built-in intelligence automaton runner
- **`ollama-automaton.ts`**: Ollama AI-powered automaton runner
- **`advanced-automaton.ts`**: Core automaton engine with Church encoding
- **`bootstrap-automaton.ts`**: Optimized self-instantiation bootstrap
- **`automaton-runner.ts`**: Basic automaton runner for demonstrations

**Reference**: See `docs/11-Automatons/README.md` for complete automaton documentation.

---

This multi-agent system provides a scalable, maintainable architecture for interacting with the complex computational topology canvas while preserving mathematical foundations and enabling emergent intelligence. The system integrates ProLog, DataLog, and R5RS Lisp to create a self-referential multiverse canvas spanning dimensions 0D-7D.

---

## GENESIS: Self-Referential Church Encoding Canvas

The computational topology canvas is a self-referential Church encoding system that builds up dimension by dimension. The system uses JSONL files as both data and executable code, enabling true metacircular evaluation.

### Self-Reference Pattern

Each automaton file contains self-reference nodes that point back to the file itself:

```json
{
  "id": "self-ref",
  "type": "file",
  "file": "automaton-kernel.jsonl",
  "metadata": {
    "selfReference": {
      "file": "automaton-kernel.jsonl",
      "line": 1,
      "pattern": "meta-circular"
    }
  }
}
```

### Dimension Progression

The encoding builds systematically:

```
0D → 1D → 2D → 3D → 4D → 5D → 6D → 7D → WebGL → Multiplayer → AI → Self-modification
```

### Reading Order

1. **0D-3D Foundation**: Church encoding primitives, vertical spine
2. **4D-5D Expansion**: Network topology, consensus mechanisms
3. **6D-7D Advanced**: Intelligence topology, quantum superposition
4. **Interface Layer**: WebGL visualization, REPL integration
5. **Evolution Layer**: Self-modification, goal negotiation

### Self-Encoding Implementation

The system implements self-reference via:

- **Y-combinator**: Fixed-point for self-referential evaluation (`grok_files/02-Grok.md`)
- **Blackboard System**: JSONL canvas as queryable fact database
- **Horizontal Templates**: Implementation mappings via `h:*` edges
- **Vertical Inheritance**: Dimensional progression via `v:*` edges

**Reference**: See `docs/05-Meta-Log/MULTIVERSE-CANVAS-RFC2119-SPEC.md` Section 5.1 for complete architecture details.

---

**Last Updated**: 2025-01-07  
**Version**: 2.0  
**Status**: Aligned with `docs/05-Meta-Log/` documentation