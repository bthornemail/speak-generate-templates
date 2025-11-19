# Org Mode Bipartite Canvas Integration RFC2119 Specification

**Version 1.0 — January 2025**  
**Formal Specification for Org Mode Integration with CanvasL**

---

## Status of This Document

This document specifies the integration of Org Mode as the primary format for CanvasL templates, including source block projection, property drawer mapping, and protocol handler integration. This specification uses RFC 2119 keywords to indicate requirement levels.

**Keywords**: The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Terminology](#2-terminology)
3. [Org Mode Document Structure Requirements](#3-org-mode-document-structure-requirements)
4. [Source Block Requirements](#4-source-block-requirements)
5. [Noweb Source Block Composition Requirements](#5-noweb-source-block-composition-requirements)
6. [Property Drawer Requirements](#6-property-drawer-requirements)
7. [CanvasL Extension Requirements](#7-canvasl-extension-requirements)
8. [Protocol Handler Requirements](#8-protocol-handler-requirements)
9. [Bipartite Mapping Requirements](#9-bipartite-mapping-requirements)
10. [Layout and Topology Requirements](#10-layout-and-topology-requirements)
11. [BIP32/39/44 Path Mapping Requirements](#11-bip323944-path-mapping-requirements)
12. [Export and Tangle Requirements](#12-export-and-tangle-requirements)
13. [Blackboard Pattern Requirements](#13-blackboard-pattern-requirements)
14. [Validation Requirements](#14-validation-requirements)
15. [Security Requirements](#15-security-requirements)
16. [Implementation Requirements](#16-implementation-requirements)

---

## 1. Introduction

### 1.1 Scope

This specification defines the requirements for integrating Org Mode as the primary format for CanvasL templates, including:

- Org Mode document structure and syntax
- Source block projection to Canvas API
- Property drawer mapping to JSONL format
- CanvasL format extensions
- Protocol handler registration and execution
- Bipartite mapping between Org Mode and Canvas API
- Layout and topology computation
- Export and tangle operations
- Blackboard pattern implementation

### 1.2 Purpose

The purpose of this specification is to:

1. Define a formal standard for Org Mode integration with CanvasL
2. Enable source block projection to Canvas API
3. Enable property drawer mapping to JSONL format
4. Enable protocol handler integration for RPC commands
5. Enable bipartite mapping between Org Mode and Canvas API
6. Enable layout and topology computation from Org structure
7. Enable export and tangle operations like Emacs org-mode

### 1.3 RFC 2119 Keyword Usage

This specification uses RFC 2119 keywords to indicate requirement levels:

- **MUST** / **REQUIRED** / **SHALL**: Absolute requirement
- **MUST NOT** / **SHALL NOT**: Absolute prohibition
- **SHOULD** / **RECOMMENDED**: Recommended but not required
- **SHOULD NOT** / **NOT RECOMMENDED**: Discouraged but not prohibited
- **MAY** / **OPTIONAL**: Optional feature

---

## 2. Terminology

### 2.1 Org Mode Terms

- **Org Mode Document**: A plain-text document following Org Mode syntax
- **Heading**: A line starting with one or more asterisks (`*`)
- **Property Drawer**: A drawer containing key-value properties (`:PROPERTIES:` ... `:END:`)
- **Source Block**: A code block delimited by `#+BEGIN_SRC` and `#+END_SRC`
- **Tangle**: Extract source block content to separate file
- **Export**: Convert Org document to another format (HTML, PDF, etc.)

### 2.2 Canvas API Terms

- **Canvas API**: The API for creating and managing Canvas nodes
- **Node**: A Canvas element representing a component or data structure
- **Topology**: The structure of nodes and their relationships
- **Chain Complex**: Mathematical structure with dimensions C₀ through C₄
- **Boundary Operator**: Operator ∂ₙ mapping Cₙ → Cₙ₋₁

### 2.3 Bipartite Mapping Terms

- **Affine Plane**: Org Mode document (editable, compositional)
- **Projective Plane**: Canvas API projection (extracted, computed)
- **Bipartite Graph**: Graph with two partitions (Affine ↔ Projective)
- **Protocol Handler**: Handler for custom protocols (`canvasl://`, `file://`, etc.)

---

## 3. Org Mode Document Structure Requirements

### 3.1 Document Syntax

**REQ-3.1.1**: Org Mode documents **MUST** follow Org Mode syntax as defined in the [Org Mode Manual](https://orgmode.org/manual/).

**REQ-3.1.2**: Org Mode documents **SHOULD** use UTF-8 encoding.

**REQ-3.1.3**: Org Mode documents **MAY** include Org Mode directives (e.g., `#+TITLE:`, `#+AUTHOR:`).

### 3.2 Property Drawers

**REQ-3.2.1**: Property drawers **MUST** contain CANVASL_* properties for CanvasL integration.

**REQ-3.2.2**: Property drawers **SHALL** follow Org Mode property drawer syntax (`:PROPERTIES:` ... `:END:`).

**REQ-3.2.3**: Property drawers **SHOULD** be associated with headings.

**REQ-3.2.4**: Property drawers **MAY** contain custom properties in addition to CANVASL_* properties.

### 3.3 Headings

**REQ-3.3.1**: Headings **SHOULD** map to Canvas nodes.

**REQ-3.3.2**: Heading levels **SHOULD** map to chain complex dimensions (C₀-C₄).

**REQ-3.3.3**: Heading order **SHOULD** determine Canvas layout order.

**REQ-3.3.4**: Headings **MAY** have property drawers.

**REQ-3.3.5**: Headings **MAY** have source blocks.

### 3.4 Source Blocks

**REQ-3.4.1**: Source blocks **MUST** use `:tangle` directive for Canvas projection.

**REQ-3.4.2**: Source blocks **SHALL** follow Org Mode source block syntax (`#+BEGIN_SRC` ... `#+END_SRC`).

**REQ-3.4.3**: Source blocks **SHOULD** use `:header-args:canvasl:*` for CanvasL properties.

**REQ-3.4.4**: Source blocks **MAY** be nested within headings.

---

## 4. Source Block Requirements

### 4.1 Tangle Directive

**REQ-4.1.1**: Source blocks **MUST** have `:tangle` directive for Canvas projection.

**REQ-4.1.2**: The `:tangle` directive **SHALL** specify the projection target (e.g., `canvas://component.svg`).

**REQ-4.1.3**: The `:tangle` directive **SHOULD** use protocol handlers (`canvas://`, `file://`, `webrtc://`).

**REQ-4.1.4**: The `:tangle` directive **MAY** specify multiple targets.

### 4.2 Header Args

**REQ-4.2.1**: Source blocks **MUST** use `:header-args:canvasl:*` for CanvasL properties.

**REQ-4.2.2**: The `:header-args:canvasl:projection` property **SHOULD** specify projection type (`"projective"` or `"affine"`).

**REQ-4.2.3**: The `:header-args:canvasl:dimension` property **SHOULD** specify chain complex dimension (`"0D"` through `"4D"`).

**REQ-4.2.4**: The `:header-args:canvasl:protocol` property **SHOULD** specify protocol handler type.

**REQ-4.2.5**: The `:header-args:canvasl:rpc` property **MUST** be `"true"` for RPC command source blocks.

### 4.3 Source Block Types

**REQ-4.3.1**: Source blocks **SHOULD** support SVG source type for Canvas projection.

**REQ-4.3.2**: Source blocks **SHOULD** support JavaScript source type for code projection.

**REQ-4.3.3**: Source blocks **SHOULD** support CanvasL source type for RPC commands.

**REQ-4.3.4**: Source blocks **SHOULD** support Markdown source type for document projection.

**REQ-4.3.5**: Source blocks **MAY** support other source types (JSONL, YAML, etc.).

### 4.4 Projection Pipeline

**REQ-4.4.1**: Source block projection **MUST** follow the projection pipeline:
1. Parse source block header
2. Extract `:tangle` target
3. Extract `:header-args:canvasl:*` properties
4. Execute/extract source block content
5. Register protocol handler if needed
6. Project to Canvas API via protocol handler

**REQ-4.4.2**: Source block projection **SHALL** validate source block headers before projection.

**REQ-4.4.3**: Source block projection **SHOULD** handle projection errors gracefully.

---

## 5. Noweb Source Block Composition Requirements

### 5.1 Noweb Syntax

**REQ-5.1.1**: Source blocks **SHOULD** support Noweb syntax (`<<block-name>>`) for composition.

**REQ-5.1.2**: Source blocks **MUST** use `:noweb yes` header argument to enable Noweb expansion.

**REQ-5.1.3**: Source blocks **SHALL** use `#+NAME:` directive to name blocks for Noweb reference.

**REQ-5.1.4**: Noweb references **SHALL** resolve to named source blocks.

### 5.2 Property Inheritance

**REQ-5.2.1**: Noweb expansion **SHOULD** inherit `:header-args:canvasl:*` properties from referenced blocks.

**REQ-5.2.2**: Property drawer properties (`CANVASL_*`) **MAY** be inherited through Noweb composition.

**REQ-5.2.3**: Local properties **SHALL** override inherited properties.

**REQ-5.2.4**: Noweb expansion **SHOULD** merge properties from all referenced blocks.

### 5.3 Noweb Expansion

**REQ-5.3.1**: Noweb expansion **MUST** occur before source block projection.

**REQ-5.3.2**: Noweb expansion **SHALL** resolve all `<<block-name>>` references recursively.

**REQ-5.3.3**: Noweb expansion **SHOULD** handle circular references gracefully.

**REQ-5.3.4**: Noweb expansion **SHOULD** preserve source block content structure.

---

## 6. Property Drawer Requirements

### 6.1 Required Properties

**REQ-6.1.1**: Property drawers **MUST** contain `CANVASL_CID` for content addressing.

**REQ-6.1.2**: Property drawers **MUST** contain `CANVASL_PARENT` for DAG causality.

**REQ-6.1.3**: Property drawers **MUST** contain `CANVASL_SIGNATURE` for digital signatures.

**REQ-6.1.4**: Property drawers **SHOULD** contain `CANVASL_JSONL_REF` for JSONL references.

**REQ-6.1.5**: Property drawers **SHOULD** contain `CANVASL_DIMENSION` for chain complex dimension.

**REQ-6.1.6**: Property drawers **MAY** contain `CANVASL_TOPOLOGY` for topology structure.

**REQ-6.1.7**: Property drawers **MAY** contain `CANVASL_PROTOCOL` for protocol handler type.

### 6.2 Property Format

**REQ-6.2.1**: Property values **MUST** follow Org Mode property syntax.

**REQ-6.2.2**: Property values **SHOULD** be valid for their intended use (CIDs, signatures, etc.).

**REQ-6.2.3**: Property values **MAY** contain multiple values separated by spaces.

### 6.3 JSONL Mapping

**REQ-6.3.1**: Property drawers **MUST** map to JSONL format.

**REQ-6.3.2**: Each heading with property drawer **SHALL** generate one JSONL entry.

**REQ-6.3.3**: Property drawer properties **SHALL** map to JSONL object properties.

**REQ-6.3.4**: Property drawer → JSONL conversion **SHOULD** preserve all CANVASL_* properties.

---

## 7. CanvasL Extension Requirements

### 6.1 Format Extension

**REQ-6.1.1**: CanvasL **MUST** extend JSONL format.

**REQ-6.1.2**: CanvasL **SHALL** support JSONL syntax (one JSON object per line).

**REQ-6.1.3**: CanvasL **SHOULD** support CanvasL-specific extensions (directives, R5RS calls, etc.).

### 6.2 Directives

**REQ-6.2.1**: CanvasL **MUST** support `@version` directive.

**REQ-6.2.2**: CanvasL **SHOULD** support `@schema` directive.

**REQ-6.2.3**: CanvasL **SHOULD** support `@dimension` directive.

**REQ-6.2.4**: CanvasL **MAY** support other directives.

### 6.3 R5RS Function Calls

**REQ-6.3.1**: CanvasL **MUST** support R5RS function calls in JSONL format.

**REQ-6.3.2**: R5RS function calls **SHALL** use `{"type": "r5rs-call", "function": "...", "args": [...]}` format.

**REQ-6.3.3**: R5RS function calls **SHOULD** be executable by the Canvas API.

### 6.4 Dimension References

**REQ-6.4.1**: CanvasL **SHOULD** support dimension references (`{"dimension": "2D"}`).

**REQ-6.4.2**: Dimension references **SHALL** specify chain complex dimension (0D-4D).

### 6.5 Org Mode → CanvasL Conversion

**REQ-6.5.1**: Org Mode → CanvasL conversion **MUST** preserve document structure.

**REQ-6.5.2**: Org Mode → CanvasL conversion **SHALL** map headings to CanvasL nodes.

**REQ-6.5.3**: Org Mode → CanvasL conversion **SHOULD** map source blocks to R5RS calls.

**REQ-6.5.4**: Org Mode → CanvasL conversion **SHALL** map property drawers to JSONL metadata.

---

## 8. Protocol Handler Requirements

### 7.1 Protocol Registration

**REQ-7.1.1**: Protocol handlers **MUST** register `canvasl://` protocol.

**REQ-7.1.2**: Protocol handlers **SHALL** use `navigator.registerProtocolHandler()` API.

**REQ-7.1.3**: Protocol handlers **SHOULD** support `file://` protocol.

**REQ-7.1.4**: Protocol handlers **SHOULD** support `webrtc://` protocol.

**REQ-7.1.5**: Protocol handlers **MAY** support other protocols.

### 7.2 RPC Command Execution

**REQ-7.2.1**: Protocol handlers **MUST** execute RPC commands on graph.

**REQ-7.2.2**: RPC commands **SHALL** be validated before execution.

**REQ-7.2.3**: RPC commands **SHOULD** return execution results.

**REQ-7.2.4**: RPC command execution **SHOULD** handle errors gracefully.

### 7.3 Protocol Routing

**REQ-7.3.1**: Protocol handlers **MUST** route to Canvas API.

**REQ-7.3.2**: Protocol routing **SHALL** determine target based on protocol type.

**REQ-7.3.3**: Protocol routing **SHOULD** handle protocol handler conflicts.

---

## 9. Bipartite Mapping Requirements

### 8.1 Affine Plane Mapping

**REQ-8.1.1**: Org Mode document **MUST** map to Affine plane.

**REQ-8.1.2**: Affine plane **SHALL** represent editable, compositional structure.

**REQ-8.1.3**: Affine plane **SHOULD** be the source of truth.

### 8.2 Projective Plane Mapping

**REQ-8.2.1**: Source blocks **MUST** map to Projective plane.

**REQ-8.2.2**: Projective plane **SHALL** represent extracted, computed projections.

**REQ-8.2.3**: Projective plane **SHOULD** be the rendered view.

### 8.3 Blackboard Pattern Mapping

**REQ-8.3.1**: Property drawer **MUST** map to Blackboard pattern.

**REQ-8.3.2**: Blackboard pattern **SHALL** mediate Model-View-Controller communication.

**REQ-8.3.3**: Blackboard pattern **SHOULD** maintain consistency between Affine and Projective planes.

### 8.4 Bipartite Sync

**REQ-8.4.1**: Bipartite sync **MUST** maintain consistency between Affine and Projective planes.

**REQ-8.4.2**: Bipartite sync **SHALL** update Projective plane when Affine plane changes.

**REQ-8.4.3**: Bipartite sync **SHOULD** update Affine plane when Projective plane changes.

**REQ-8.4.4**: Bipartite sync **SHOULD** handle conflicts gracefully.

---

## 10. Layout and Topology Requirements

### 9.1 Heading Hierarchy Mapping

**REQ-9.1.1**: Org heading hierarchy **MUST** map to Canvas topology.

**REQ-9.1.2**: Heading level **SHALL** map to chain complex dimension.

**REQ-9.1.3**: Heading order **SHOULD** determine Canvas layout order.

**REQ-9.1.4**: Heading hierarchy **SHALL** preserve parent-child relationships.

### 9.2 Chain Complex Dimension Mapping

**REQ-9.2.1**: Heading level 1 **SHOULD** map to C₄ (Evolution contexts).

**REQ-9.2.2**: Heading level 2 **SHOULD** map to C₃ (Interface triples).

**REQ-9.2.3**: Heading level 3-4 **SHOULD** map to C₂ (Documents/faces).

**REQ-9.2.4**: Heading level 5 **SHOULD** map to C₁ (Edges/connections).

**REQ-9.2.5**: Heading level 6+ **SHOULD** map to C₀ (Keywords/vertices).

### 9.3 Boundary Relationships

**REQ-9.3.1**: Layout algorithm **MUST** compute boundary relationships.

**REQ-9.3.2**: Boundary relationships **SHALL** satisfy ∂² = 0 (boundary of boundary is zero).

**REQ-9.3.3**: Boundary relationships **SHOULD** map parent headings to child headings.

### 9.4 Layout Algorithm

**REQ-9.4.1**: Layout algorithm **MUST** parse Org Mode AST.

**REQ-9.4.2**: Layout algorithm **SHALL** extract heading hierarchy.

**REQ-9.4.3**: Layout algorithm **SHALL** map headings to chain complex cells.

**REQ-9.4.4**: Layout algorithm **SHALL** compute boundary relationships.

**REQ-9.4.5**: Layout algorithm **SHALL** generate CanvasL layout directives.

---

## 11. BIP32/39/44 Path Mapping Requirements

### 11.1 BIP32 Path Structure

**REQ-11.1.1**: BIP32 paths **MUST** follow BIP44 standard format: `m/purpose'/coin_type'/account'/change/address_index`.

**REQ-11.1.2**: BIP32 paths **SHALL** use hardened derivation (') for purpose, coin_type, and account levels.

**REQ-11.1.3**: BIP32 paths **SHOULD** use standard Ethereum coin type (60').

### 11.2 Heading Level → BIP32 Path Mapping

**REQ-11.2.1**: Heading levels **MUST** map to BIP32 path address_index based on chain complex dimension.

**REQ-11.2.2**: Heading Level 1 (C₄) **SHALL** map to address_index 4.

**REQ-11.2.3**: Heading Level 2 (C₃) **SHALL** map to address_index 3.

**REQ-11.2.4**: Heading Level 3-4 (C₂) **SHALL** map to address_index 2.

**REQ-11.2.5**: Heading Level 5 (C₁) **SHALL** map to address_index 1.

**REQ-11.2.6**: Heading Level 6+ (C₀) **SHALL** map to address_index 0.

### 11.3 Property Drawer Integration

**REQ-11.3.1**: Property drawers **SHOULD** contain `CANVASL_BIP32_PATH` property.

**REQ-11.3.2**: BIP32 paths **SHALL** be automatically computed from heading level if not specified.

**REQ-11.3.3**: BIP32 paths **SHALL** be stored in property drawer for key derivation.

### 11.4 Cryptographic Key Derivation

**REQ-11.4.1**: Implementations **MUST** support key derivation from BIP32 paths.

**REQ-11.4.2**: Key derivation **SHALL** use BIP39 mnemonic and BIP32 path.

**REQ-11.4.3**: Key derivation **SHOULD** use HDNodeWallet from ethers.js or equivalent.

**REQ-11.4.4**: Derived keys **SHALL** be used for signing component CIDs.

### 11.5 File System Addressing

**REQ-11.5.1**: BIP32 paths **SHOULD** map to file system paths.

**REQ-11.5.2**: File system paths **SHALL** preserve BIP32 path structure.

**REQ-11.5.3**: File extensions **SHALL** map to chain complex dimensions (0D→json, 1D→jsonl, 2D→yaml, 3D→md, 4D→canvasl).

---

## 12. Export and Tangle Requirements

### 10.1 Tangle System

**REQ-10.1.1**: Tangle system **MUST** extract source block content.

**REQ-10.1.2**: Tangle system **SHALL** use `:tangle` directive to determine target.

**REQ-10.1.3**: Tangle system **SHOULD** support multiple tangle targets.

**REQ-10.1.4**: Tangle system **SHOULD** follow Emacs org-mode tangle patterns.

### 10.2 Export System

**REQ-10.2.1**: Export system **MUST** support multiple export formats.

**REQ-10.2.2**: Export system **SHALL** support HTML export format.

**REQ-10.2.3**: Export system **SHOULD** support PDF export format.

**REQ-10.2.4**: Export system **SHOULD** support SVG export format.

**REQ-10.2.5**: Export system **SHOULD** support CanvasL export format.

**REQ-10.2.6**: Export system **SHOULD** follow Emacs org-mode export patterns.

### 10.3 Export Pipeline

**REQ-10.3.1**: Export pipeline **MUST** parse Org document.

**REQ-10.3.2**: Export pipeline **SHALL** extract source blocks with `:tangle` directives.

**REQ-10.3.3**: Export pipeline **SHALL** execute tangle operation.

**REQ-10.3.4**: Export pipeline **SHALL** parse export formats from `:header-args:canvasl:export`.

**REQ-10.3.5**: Export pipeline **SHALL** export to each specified format.

---

## 13. Blackboard Pattern Requirements

### 11.1 Property Drawer as Blackboard

**REQ-11.1.1**: Property drawer **MUST** serve as blackboard metadata.

**REQ-11.1.2**: Property drawer **SHALL** mediate Model-View-Controller communication.

**REQ-11.1.3**: Property drawer **SHOULD** maintain consistency between components.

### 11.2 Model Independence

**REQ-11.2.1**: Model (Org AST) **MUST** be independent of View (Canvas).

**REQ-11.2.2**: Model **SHALL** be the source of truth.

**REQ-11.2.3**: Model **SHOULD** update property drawer when changed.

### 11.3 View Independence

**REQ-11.3.1**: View (Canvas) **MUST** be independent of Model (Org AST).

**REQ-11.3.2**: View **SHALL** read from property drawer.

**REQ-11.3.3**: View **SHOULD** update property drawer when changed.

### 11.4 Controller Independence

**REQ-11.4.1**: Controller (Protocol handlers) **MUST** be independent of Model and View.

**REQ-11.4.2**: Controller **SHALL** execute commands via protocol handlers.

**REQ-11.4.3**: Controller **SHOULD** update property drawer when executing commands.

---

## 14. Validation Requirements

### 12.1 Org Mode Parser Validation

**REQ-12.1.1**: Org Mode parser **MUST** validate Org syntax.

**REQ-12.1.2**: Org Mode parser **SHALL** report syntax errors.

**REQ-12.1.3**: Org Mode parser **SHOULD** validate property drawer syntax.

**REQ-12.1.4**: Org Mode parser **SHOULD** validate source block syntax.

### 12.2 Property Drawer Validation

**REQ-12.2.1**: Property drawer **MUST** validate CANVASL_* properties.

**REQ-12.2.2**: Property drawer **SHALL** validate required properties (CID, PARENT, SIGNATURE).

**REQ-12.2.3**: Property drawer **SHOULD** validate property values (CIDs, signatures, etc.).

### 12.3 Source Block Validation

**REQ-12.3.1**: Source blocks **MUST** validate `:tangle` targets.

**REQ-12.3.2**: Source blocks **SHALL** validate `:header-args:canvasl:*` properties.

**REQ-12.3.3**: Source blocks **SHOULD** validate source block content.

### 12.4 Canvas Projection Validation

**REQ-12.4.1**: Canvas projection **SHOULD** validate topology.

**REQ-12.4.2**: Canvas projection **SHOULD** validate boundary relationships (∂² = 0).

**REQ-12.4.3**: Canvas projection **SHOULD** validate chain complex dimensions.

---

## 15. Security Requirements

### 13.1 Protocol Handler Validation

**REQ-13.1.1**: Protocol handlers **MUST** validate RPC commands.

**REQ-13.1.2**: Protocol handlers **SHALL** validate command structure.

**REQ-13.1.3**: Protocol handlers **SHOULD** validate command permissions.

**REQ-13.1.4**: Protocol handlers **SHOULD** handle malicious commands gracefully.

### 13.2 Signature Validation

**REQ-13.2.1**: Property drawer **MUST** validate signatures (CANVASL_SIGNATURE).

**REQ-13.2.2**: Signature validation **SHALL** verify digital signatures.

**REQ-13.2.3**: Signature validation **SHOULD** verify signature against CID.

### 13.3 Source Block Validation

**REQ-13.3.1**: Source blocks **SHOULD** validate content before projection.

**REQ-13.3.2**: Source blocks **SHOULD** sanitize content for security.

**REQ-13.3.3**: Source blocks **SHOULD** handle malicious content gracefully.

### 13.4 Access Control

**REQ-13.4.1**: Canvas API **MUST** enforce access control.

**REQ-13.4.2**: Access control **SHALL** verify user permissions.

**REQ-13.4.3**: Access control **SHOULD** log access attempts.

---

## 16. Implementation Requirements

### 14.1 Org Mode Parser

**REQ-14.1.1**: Implementations **MUST** use Org Mode AST parser.

**REQ-14.1.2**: Implementations **SHOULD** support orgajs or custom parser.

**REQ-14.1.3**: Implementations **SHALL** parse Org Mode syntax correctly.

**REQ-14.1.4**: Implementations **SHOULD** handle Org Mode extensions.

### 14.2 Source Block Projection

**REQ-14.2.1**: Implementations **MUST** support source block projection.

**REQ-14.2.2**: Implementations **SHALL** support `:tangle` directive.

**REQ-14.2.3**: Implementations **SHALL** support `:header-args:canvasl:*` properties.

**REQ-14.2.4**: Implementations **SHOULD** support multiple source block types.

### 14.3 Protocol Handler Registration

**REQ-14.3.1**: Implementations **MUST** support protocol handler registration.

**REQ-14.3.2**: Implementations **SHALL** register `canvasl://` protocol.

**REQ-14.3.3**: Implementations **SHOULD** support multiple protocol handlers.

**REQ-14.3.4**: Implementations **SHOULD** handle protocol handler conflicts.

### 14.4 Property Drawer → JSONL

**REQ-14.4.1**: Implementations **MUST** support property drawer → JSONL conversion.

**REQ-14.4.2**: Implementations **SHALL** preserve all CANVASL_* properties.

**REQ-14.4.3**: Implementations **SHOULD** validate property drawer properties.

---

## 17. Self-Encoding Requirements

### 17.1 Nested Org Mode Source Blocks

**REQ-17.1.1**: Implementations **MUST** support nested Org Mode source blocks (Org Mode source blocks containing Org Mode content).

**REQ-17.1.2**: Implementations **MUST** support CanvasL source blocks containing nested Org Mode source blocks.

**REQ-17.1.3**: Implementations **SHALL** parse nested Org Mode content recursively.

**REQ-17.1.4**: Implementations **SHALL** preserve property inheritance through nesting levels.

**REQ-17.1.5**: Implementations **MUST** handle circular references gracefully.

**REQ-17.1.6**: Implementations **SHALL** enforce a maximum nesting depth to prevent infinite recursion (default: 10 levels).

**REQ-17.1.7**: Implementations **SHOULD** detect self-encoding automatically.

**REQ-17.1.8**: Implementations **SHOULD** provide metadata about nesting depth and structure.

### 17.2 Property Inheritance

**REQ-17.2.1**: Implementations **MUST** inherit properties from parent context to nested content.

**REQ-17.2.2**: Implementations **SHALL** allow nested content to override inherited properties.

**REQ-17.2.3**: Implementations **SHOULD** preserve property inheritance chain for debugging.

### 17.3 Circular Reference Handling

**REQ-17.3.1**: Implementations **MUST** detect circular references in self-encoded content.

**REQ-17.3.2**: Implementations **SHALL** prevent infinite recursion when circular references are detected.

**REQ-17.3.3**: Implementations **SHOULD** report circular references with context information.

**REQ-17.3.4**: Implementations **MAY** allow controlled circular references with explicit depth limits.

---

## 18. Meta-Template Requirements

### 18.1 Template Generation

**REQ-18.1.1**: Implementations **MUST** support templates that generate other templates (meta-templates).

**REQ-18.1.2**: Implementations **SHALL** use Noweb composition for meta-template generation.

**REQ-18.1.3**: Implementations **SHALL** support tangle/export operations on meta-templates.

**REQ-18.1.4**: Implementations **SHOULD** support parameter substitution in meta-templates.

**REQ-18.1.5**: Implementations **SHOULD** enable batch template generation from meta-templates.

### 18.2 Meta-Template Composition

**REQ-18.2.1**: Implementations **MUST** support Noweb references in meta-template source blocks.

**REQ-18.2.2**: Implementations **SHALL** expand Noweb references before template generation.

**REQ-18.2.3**: Implementations **SHALL** support property inheritance through Noweb expansion.

**REQ-18.2.4**: Implementations **SHOULD** support multiple levels of meta-template nesting.

### 18.3 Template Export

**REQ-18.3.1**: Implementations **MUST** support exporting meta-templates to multiple formats.

**REQ-18.3.2**: Implementations **SHALL** support HTML, PDF, SVG, and CanvasL export formats.

**REQ-18.3.3**: Implementations **SHALL** preserve document structure in exported templates.

**REQ-18.3.4**: Implementations **SHOULD** generate export previews for meta-templates.

---

## References

- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) - Key words for use in RFCs to Indicate Requirement Levels
- [Org Mode Manual](https://orgmode.org/manual/) - Org Mode Documentation
- [CanvasL A₁₁ Specification](./01-CanvasL-A11.md) - CanvasL Complete Specification
- [Org Mode Bipartite Canvas Architecture](./ORG-MODE-BIPARTITE-CANVAS-ARCHITECTURE.md) - Architecture Document

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Specification Complete

