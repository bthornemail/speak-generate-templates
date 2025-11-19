# CanvasL Org Protocol Glossary

**Version 1.0 — January 2025**  
**Terminology and Definitions for CanvasL Org Protocol Integration**

---

## Overview

This glossary defines terms used in the CanvasL Org Protocol integration, including protocol handlers, RPC commands, source block projection, and protocol routing. Terms are organized by category for easy reference.

---

## Table of Contents

1. [Protocol Handler Terms](#1-protocol-handler-terms)
2. [RPC Command Terms](#2-rpc-command-terms)
3. [Source Block Terms](#3-source-block-terms)
4. [Canvas API Terms](#4-canvas-api-terms)
5. [Org Mode Terms](#5-org-mode-terms)
6. [Integration Terms](#6-integration-terms)
7. [Security Terms](#7-security-terms)
8. [Performance Terms](#8-performance-terms)

---

## 1. Protocol Handler Terms

### Protocol Handler
A browser API mechanism that allows web applications to register custom URL schemes (e.g., `canvasl://`, `file://`, `webrtc://`) and handle navigation to those URLs. Protocol handlers route URLs to application handlers for execution.

**Related Terms**: Protocol Registration, Protocol Routing, Protocol Scheme

### Protocol Registration
The process of registering a protocol handler with the browser via `navigator.registerProtocolHandler()`. Registration requires user permission and specifies the protocol scheme and handler URL pattern.

**Related Terms**: Protocol Handler, Protocol Scheme, Handler URL Pattern

### Protocol Scheme
The URL scheme prefix (e.g., `canvasl://`, `file://`, `webrtc://`) that identifies a protocol handler. Schemes must follow URL scheme syntax and be registered before use.

**Related Terms**: Protocol Handler, Protocol Registration, Handler URL Pattern

### Handler URL Pattern
The URL pattern template used during protocol handler registration. The pattern includes placeholders (e.g., `%s`) that are replaced with the actual URL when the protocol handler is invoked.

**Related Terms**: Protocol Registration, Protocol Handler, Protocol Scheme

### Protocol Routing
The process of routing a protocol handler URL to the appropriate application handler. Routing involves parsing the URL, identifying the handler, and executing the handler with the URL parameters.

**Related Terms**: Protocol Handler, Handler Execution, URL Parsing

### Handler Execution
The process of executing a protocol handler with a URL. Execution involves parsing the URL, extracting parameters, and invoking the application handler logic.

**Related Terms**: Protocol Handler, Protocol Routing, URL Parsing

### Protocol Handler Conflict
A situation where multiple protocol handlers are registered for the same scheme. Conflicts require resolution strategies (priority, versioning, user selection) to determine which handler executes.

**Related Terms**: Protocol Handler, Conflict Resolution, Handler Priority

### Conflict Resolution
The process of resolving protocol handler conflicts when multiple handlers are registered for the same scheme. Resolution strategies include priority-based selection, versioning, and user selection.

**Related Terms**: Protocol Handler Conflict, Handler Priority, Handler Versioning

### Handler Priority
A ranking system that determines which protocol handler executes when multiple handlers are registered for the same scheme. Priority can be based on registration order, version, or user preference.

**Related Terms**: Protocol Handler Conflict, Conflict Resolution, Handler Versioning

### Handler Versioning
A mechanism for managing multiple versions of protocol handlers. Versioning allows handlers to coexist and enables migration between versions.

**Related Terms**: Protocol Handler, Handler Priority, Handler Migration

### Handler Migration
The process of migrating from one protocol handler version to another. Migration involves updating handler registrations, migrating data, and ensuring compatibility.

**Related Terms**: Handler Versioning, Protocol Handler, Handler Compatibility

### Handler Compatibility
The ability of protocol handlers to work together without conflicts. Compatibility involves ensuring handlers don't interfere with each other and can coexist.

**Related Terms**: Protocol Handler, Handler Versioning, Handler Migration

---

## 2. RPC Command Terms

### RPC Command
A Remote Procedure Call command embedded in an Org Mode source block. RPC commands execute via protocol handlers and trigger Canvas API operations.

**Related Terms**: Source Block, Protocol Handler, Canvas API

### RPC Command Execution
The process of executing an RPC command. Execution involves parsing the command, validating parameters, and invoking the Canvas API operation.

**Related Terms**: RPC Command, Command Parsing, Command Validation

### Command Parsing
The process of parsing an RPC command from a source block. Parsing involves extracting the command name, parameters, and options from the source block content.

**Related Terms**: RPC Command, Command Validation, Source Block

### Command Validation
The process of validating an RPC command before execution. Validation involves checking command syntax, parameter types, and permissions.

**Related Terms**: RPC Command, Command Parsing, Command Execution

### Command Composition
The process of composing multiple RPC commands into a single operation. Composition enables complex operations through command chaining and dependency resolution.

**Related Terms**: RPC Command, Command Chaining, Command Dependencies

### Command Chaining
The process of chaining multiple RPC commands together. Chaining enables sequential execution of commands with shared context.

**Related Terms**: RPC Command, Command Composition, Command Execution

### Command Dependencies
Relationships between RPC commands that determine execution order. Dependencies ensure commands execute in the correct order and share required context.

**Related Terms**: RPC Command, Command Composition, Command Execution

### Command Transaction
A group of RPC commands that execute atomically. Transactions ensure all commands succeed or all commands fail, maintaining data consistency.

**Related Terms**: RPC Command, Command Rollback, Command Commit

### Command Rollback
The process of undoing RPC command execution when a transaction fails. Rollback restores the system to the state before transaction execution.

**Related Terms**: Command Transaction, Command Commit, Command Execution

### Command Commit
The process of finalizing RPC command execution in a transaction. Commit makes transaction changes permanent and releases locks.

**Related Terms**: Command Transaction, Command Rollback, Command Execution

### Command Error Recovery
The process of recovering from RPC command execution errors. Error recovery involves retry mechanisms, fallback strategies, and error reporting.

**Related Terms**: RPC Command, Command Execution, Error Handling

---

## 3. Source Block Terms

### Source Block
An Org Mode code block delimited by `#+BEGIN_SRC` and `#+END_SRC`. Source blocks contain code that can be projected to Canvas API via protocol handlers.

**Related Terms**: Org Mode, Tangle Directive, Header Arguments

### Tangle Directive
An Org Mode source block header argument (`:tangle`) that specifies the projection target for the source block. The tangle directive uses protocol handlers to route projection.

**Related Terms**: Source Block, Protocol Handler, Projection Target

### Projection Target
The destination for source block projection, specified in the `:tangle` directive. Projection targets use protocol handlers (e.g., `canvas://component.svg`) to route projection.

**Related Terms**: Source Block, Tangle Directive, Protocol Handler

### Header Arguments
Org Mode source block header arguments (`:header-args:*`) that specify source block properties. CanvasL uses `:header-args:canvasl:*` for CanvasL-specific properties.

**Related Terms**: Source Block, CanvasL Properties, Projection Properties

### CanvasL Properties
Source block header arguments prefixed with `canvasl:` (e.g., `:header-args:canvasl:projection`). CanvasL properties control source block projection behavior.

**Related Terms**: Header Arguments, Source Block, Projection Properties

### Projection Properties
CanvasL properties that control source block projection (e.g., `projection`, `dimension`, `protocol`, `rpc`). Projection properties determine how source blocks are projected to Canvas API.

**Related Terms**: CanvasL Properties, Source Block, Projection Pipeline

### Projection Pipeline
The sequence of steps for projecting a source block to Canvas API: parse header → extract tangle target → extract properties → execute content → register handler → project to Canvas.

**Related Terms**: Source Block, Projection Target, Protocol Handler

### Projection Type
The type of projection (`projective` or `affine`) specified in `:header-args:canvasl:projection`. Projection types determine how source blocks are projected to Canvas API.

**Related Terms**: Projection Properties, Bipartite Mapping, Affine Plane

### Source Block Type
The language or format of a source block (e.g., `svg`, `javascript`, `canvasl`, `markdown`). Source block types determine how source block content is processed.

**Related Terms**: Source Block, Projection Pipeline, Content Processing

### Content Processing
The process of processing source block content before projection. Content processing involves parsing, validation, and transformation based on source block type.

**Related Terms**: Source Block, Source Block Type, Projection Pipeline

---

## 4. Canvas API Terms

### Canvas API
The API for creating and managing Canvas nodes. Canvas API provides operations for node creation, updates, queries, and topology management.

**Related Terms**: Canvas Node, Node Creation, Topology

### Canvas Node
A Canvas element representing a component or data structure. Nodes have properties, relationships, and topology information.

**Related Terms**: Canvas API, Node Properties, Node Relationships

### Node Creation
The process of creating a Canvas node via Canvas API. Node creation involves specifying node properties, relationships, and topology information.

**Related Terms**: Canvas API, Canvas Node, Node Properties

### Node Properties
Properties associated with a Canvas node (e.g., `id`, `type`, `metadata`). Node properties define node characteristics and behavior.

**Related Terms**: Canvas Node, Node Creation, Node Metadata

### Node Relationships
Relationships between Canvas nodes (e.g., parent-child, sibling, dependency). Relationships define node topology and structure.

**Related Terms**: Canvas Node, Topology, DAG Structure

### Topology
The structure of Canvas nodes and their relationships. Topology defines how nodes are organized and connected in the Canvas.

**Related Terms**: Canvas Node, Node Relationships, Chain Complex

### Chain Complex
A mathematical structure with dimensions C₀ through C₄. Chain complexes define Canvas topology and enable topological validation.

**Related Terms**: Topology, Boundary Operator, Homology

### Boundary Operator
An operator ∂ₙ mapping Cₙ → Cₙ₋₁ in a chain complex. Boundary operators define topology structure and enable homology validation.

**Related Terms**: Chain Complex, Homology, Topological Validation

### Homology
The mathematical property that boundary of boundary is zero (∂² = 0). Homology ensures topological consistency in Canvas structures.

**Related Terms**: Chain Complex, Boundary Operator, Topological Validation

### Topological Validation
The process of validating Canvas topology using chain complexes and homology. Validation ensures topological consistency (∂² = 0).

**Related Terms**: Chain Complex, Homology, Boundary Operator

---

## 5. Org Mode Terms

### Org Mode Document
A plain-text document following Org Mode syntax. Org Mode documents contain headings, property drawers, source blocks, and other Org Mode elements.

**Related Terms**: Org Mode, Heading, Property Drawer

### Heading
A line starting with one or more asterisks (`*`) in an Org Mode document. Headings define document hierarchy and can map to Canvas nodes.

**Related Terms**: Org Mode Document, Heading Level, Document Hierarchy

### Heading Level
The depth of a heading in the document hierarchy, determined by the number of asterisks. Heading levels can map to chain complex dimensions (C₀-C₄).

**Related Terms**: Heading, Document Hierarchy, Chain Complex

### Property Drawer
A drawer containing key-value properties (`:PROPERTIES:` ... `:END:`) in an Org Mode document. Property drawers store CanvasL metadata and map to JSONL format.

**Related Terms**: Org Mode Document, Property, JSONL Mapping

### Property
A key-value pair in a property drawer. Properties store metadata and can be prefixed with `CANVASL_*` for CanvasL integration.

**Related Terms**: Property Drawer, Property Value, CanvasL Properties

### Property Value
The value associated with a property key in a property drawer. Property values follow Org Mode property syntax and can contain multiple values.

**Related Terms**: Property, Property Drawer, Property Syntax

### JSONL Mapping
The process of mapping property drawers to JSONL format. Each heading with a property drawer generates one JSONL entry with property values.

**Related Terms**: Property Drawer, JSONL Format, Property Mapping

---

## 6. Integration Terms

### Bipartite Mapping
The mapping between Org Mode documents (Affine Plane) and Canvas API projections (Projective Plane). Bipartite mapping enables bidirectional sync between Org Mode and Canvas.

**Related Terms**: Affine Plane, Projective Plane, Bipartite Graph

### Affine Plane
The Org Mode document side of bipartite mapping. Affine Plane represents editable, compositional Org Mode documents.

**Related Terms**: Bipartite Mapping, Projective Plane, Org Mode Document

### Projective Plane
The Canvas API projection side of bipartite mapping. Projective Plane represents extracted, computed Canvas projections.

**Related Terms**: Bipartite Mapping, Affine Plane, Canvas API

### Bipartite Graph
A graph with two partitions (Affine ↔ Projective) representing bipartite mapping. Bipartite graphs enable bidirectional sync between Org Mode and Canvas.

**Related Terms**: Bipartite Mapping, Affine Plane, Projective Plane

### Bipartite Sync
The process of synchronizing changes between Affine Plane (Org Mode) and Projective Plane (Canvas API). Bipartite sync ensures consistency between both sides.

**Related Terms**: Bipartite Mapping, Affine Plane, Projective Plane

### MetaLog Blackboard
A blackboard pattern implementation that coordinates Org Mode parsing, source block projection, and Canvas API operations. MetaLog blackboard enables MVC decoupling.

**Related Terms**: Blackboard Pattern, MVC Decoupling, MetaLog

### Blackboard Pattern
A design pattern where components communicate via a shared blackboard. The blackboard pattern enables decoupled, event-driven architecture.

**Related Terms**: MetaLog Blackboard, MVC Decoupling, Component Communication

### MVC Decoupling
The separation of Model (Canvas API), View (Canvas rendering), and Controller (Org Mode parsing) components. MVC decoupling enables independent development and testing.

**Related Terms**: Blackboard Pattern, Component Separation, Architecture

---

## 7. Security Terms

### URL Validation
The process of validating protocol handler URLs before execution. URL validation prevents malicious URLs and ensures security.

**Related Terms**: Protocol Handler, Security, URL Parsing

### Permission Management
The process of managing protocol handler permissions. Permission management includes registration, revocation, and audit.

**Related Terms**: Protocol Handler, Security, Permission Revocation

### Permission Revocation
The process of revoking protocol handler permissions. Permission revocation prevents unauthorized protocol handler execution.

**Related Terms**: Permission Management, Security, Protocol Handler

### Audit Logging
The process of logging protocol handler execution for security auditing. Audit logging enables security monitoring and compliance.

**Related Terms**: Security, Protocol Handler, Execution Logging

### Execution Sandboxing
The process of isolating protocol handler execution in a sandbox. Sandboxing prevents protocol handlers from accessing unauthorized resources.

**Related Terms**: Security, Protocol Handler, Execution Isolation

---

## 8. Performance Terms

### Routing Performance
The performance of protocol handler routing. Routing performance affects overall system responsiveness.

**Related Terms**: Protocol Routing, Performance, Latency

### Execution Latency
The time delay between protocol handler invocation and execution completion. Execution latency affects user experience.

**Related Terms**: Protocol Handler, Performance, Routing Performance

### Caching Strategy
A strategy for caching protocol handler routes and results. Caching strategies improve performance by reducing redundant operations.

**Related Terms**: Performance, Protocol Handler, Route Caching

### Route Caching
The process of caching protocol handler routes for faster routing. Route caching improves routing performance.

**Related Terms**: Caching Strategy, Protocol Routing, Performance

### Load Testing
The process of testing protocol handler performance under load. Load testing identifies performance bottlenecks and scalability limits.

**Related Terms**: Performance, Protocol Handler, Scalability

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Glossary Complete

