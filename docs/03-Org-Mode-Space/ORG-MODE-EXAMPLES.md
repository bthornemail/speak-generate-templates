# Org Mode Examples

**Version 1.0 — January 2025**  
**Complete Examples of Org Mode Templates for CanvasL**

---

## Overview

This document provides complete, working examples of Org Mode templates for CanvasL, demonstrating various patterns, source block types, and integration scenarios.

---

## Table of Contents

1. [Basic Examples](#1-basic-examples)
2. [Source Block Examples](#2-source-block-examples)
3. [Noweb Composition Examples](#3-noweb-composition-examples)
4. [Property Drawer Examples](#4-property-drawer-examples)
5. [BIP32/39/44 Path Examples](#5-bip323944-path-examples)
6. [Canvas Projection Examples](#6-canvas-projection-examples)
7. [RPC Command Examples](#7-rpc-command-examples)
8. [Export Examples](#8-export-examples)
9. [Complex Examples](#9-complex-examples)

---

## 1. Basic Examples

### 1.1 Simple Component

```org
* Simple SVG Component
:PROPERTIES:
:CANVASL_CID: bafyreihdwdcefgh4dqkjvcyuzjgq2zv2c3xv6r5c2uk5hhj7v2ffx5xnoe
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0x1234567890abcdef1234567890abcdef12345678
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://simple-component.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" fill="blue" stroke="black" stroke-width="2"/>
  <text x="50" y="50" text-anchor="middle" fill="white" font-size="16">Hello</text>
</svg>
#+END_SRC
```

### 1.2 Component with Documentation

```org
* Documented Component
:PROPERTIES:
:CANVASL_CID: bafyreigvxfl6yrdq6w5vqj5vqj5vqj5vqj5vqj5vqj5vqj5vqj5vqj5vqj
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0xabcdef1234567890abcdef1234567890abcdef12
:CANVASL_DIMENSION: 2D
:END:

This component demonstrates a documented SVG component with
both visual representation and code.

#+BEGIN_SRC svg :tangle canvas://documented-component.svg :header-args:canvasl:projection "projective"
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="green" opacity="0.7"/>
  <text x="100" y="100" text-anchor="middle" fill="white" font-size="24" font-weight="bold">
    Documented
  </text>
</svg>
#+END_SRC

The component above creates a green circle with text overlay.
```

---

## 2. Source Block Examples

### 2.1 SVG Source Block

```org
* SVG Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://svg-component.svg :header-args:canvasl:projection "projective" :header-args:canvasl:dimension "2D"
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="50" y="50" width="200" height="100" fill="url(#grad1)" stroke="black" stroke-width="3"/>
  <text x="150" y="110" text-anchor="middle" fill="white" font-size="20" font-weight="bold">
    Gradient Box
  </text>
</svg>
#+END_SRC
```

### 2.2 JavaScript Source Block

```org
* JavaScript Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC javascript :tangle canvas://js-component.js :header-args:canvasl:projection "projective" :header-args:canvasl:dimension "2D"
export function JSComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
}
#+END_SRC
```

### 2.3 Markdown Source Block

```org
* Markdown Document
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC markdown :tangle canvas://markdown-doc.md :header-args:canvasl:export "html|pdf|canvasl"
# Markdown Document

This is a markdown document that can be exported to multiple formats.

## Section 1

Content for section 1.

### Subsection 1.1

Content for subsection 1.1.

## Section 2

Content for section 2.

- Item 1
- Item 2
- Item 3
#+END_SRC
```

### 2.4 CanvasL Source Block (RPC Command)

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

### 2.5 JSONL Source Block

```org
* JSONL Data
:PROPERTIES:
:CANVASL_DIMENSION: 1D
:END:

#+BEGIN_SRC jsonl :tangle canvas://data.jsonl
{"id": "node1", "type": "node", "data": {"value": 1}}
{"id": "node2", "type": "node", "data": {"value": 2}}
{"id": "node3", "type": "node", "data": {"value": 3}}
#+END_SRC
```

---

## 3. Noweb Composition Examples

### 3.1 Basic Noweb Composition

```org
* Base SVG Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+NAME: base-circle
#+BEGIN_SRC svg :tangle canvas://base-circle.svg :header-args:canvasl:projection "projective" :header-args:canvasl:dimension "2D"
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC

* Composed Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://composed.svg :header-args:canvasl:projection "projective" :noweb yes
<<base-circle>>
<text x="50" y="50" text-anchor="middle" fill="white" font-size="16">Composed</text>
#+END_SRC
```

### 3.2 Noweb with Property Inheritance

```org
* Base Component with Properties
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:CANVASL_PROTOCOL: canvasl://
:END:

#+NAME: base-with-props
#+BEGIN_SRC javascript :tangle canvas://base.js :header-args:canvasl:projection "projective" :header-args:canvasl:dimension "2D" :header-args:canvasl:protocol "canvasl://"
export function Base() {
  return <div>Base Component</div>;
}
#+END_SRC

* Composed Component (Inherits Properties)
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC javascript :tangle canvas://composed.js :header-args:canvasl:projection "projective" :noweb yes
<<base-with-props>>
export function Composed() {
  return <div><Base /> + Composed</div>;
}
#+END_SRC
```

### 3.3 Nested Noweb Composition

```org
* Base Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+NAME: base-svg
#+BEGIN_SRC svg :tangle canvas://base.svg
<svg width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="blue"/>
</svg>
#+END_SRC

* Middle Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+NAME: middle-svg
#+BEGIN_SRC svg :tangle canvas://middle.svg :noweb yes
<<base-svg>>
<circle cx="50" cy="50" r="30" fill="red"/>
#+END_SRC

* Final Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://final.svg :noweb yes
<<middle-svg>>
<text x="50" y="50" text-anchor="middle" fill="white">Final</text>
#+END_SRC
```

---

## 4. Property Drawer Examples

### 4.1 Complete Property Drawer

```org
* Complete Component
:PROPERTIES:
:CANVASL_CID: bafyreihdwdcefgh4dqkjvcyuzjgq2zv2c3xv6r5c2uk5hhj7v2ffx5xnoe
:CANVASL_PARENT: bafyreigvxfl6yrdq6w5vqj5vqj5vqj5vqj5vqj5vqj5vqj5vqj5vqj
:CANVASL_SIGNATURE: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12
:CANVASL_JSONL_REF: file://component.jsonl
:CANVASL_DIMENSION: 2D
:CANVASL_TOPOLOGY: {"nodes": ["node1", "node2"], "edges": [{"from": "node1", "to": "node2"}]}
:CANVASL_PROTOCOL: canvasl://
:END:

Component content here...
```

### 4.2 Minimal Property Drawer

```org
* Minimal Component
:PROPERTIES:
:CANVASL_CID: bafyreihdwdcefgh4dqkjvcyuzjgq2zv2c3xv6r5c2uk5hhj7v2ffx5xnoe
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0x1234567890abcdef1234567890abcdef12345678
:END:

Component content here...
```

### 4.3 Property Drawer with Custom Properties

```org
* Custom Component
:PROPERTIES:
:CANVASL_CID: bafyreihdwdcefgh4dqkjvcyuzjgq2zv2c3xv6r5c2uk5hhj7v2ffx5xnoe
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0x1234567890abcdef1234567890abcdef12345678
:CUSTOM_PROPERTY: custom-value
:ANOTHER_PROPERTY: another-value
:END:

Component content here...
```

---

## 5. BIP32/39/44 Path Examples

### 5.1 Basic BIP32 Path Mapping

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
:CANVASL_PARENT: bafy...
:CANVASL_SIGNATURE: 0x...
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/3
:CANVASL_DIMENSION: 3D
:END:

*** Interface Component (C₂)
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: bafy...
:CANVASL_SIGNATURE: 0x...
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/2
:CANVASL_DIMENSION: 2D
:END:

**** Document Component (C₂)
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: bafy...
:CANVASL_SIGNATURE: 0x...
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/2
:CANVASL_DIMENSION: 2D
:END:

***** Edge Component (C₁)
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: bafy...
:CANVASL_SIGNATURE: 0x...
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/1
:CANVASL_DIMENSION: 1D
:END:

****** Keyword Component (C₀)
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: bafy...
:CANVASL_SIGNATURE: 0x...
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/0
:CANVASL_DIMENSION: 0D
:END:
```

### 5.2 Hierarchical BIP32 Path Derivation

```org
* Root (Level 1, C₄)
:PROPERTIES:
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/4
:END:

** Context (Level 2, C₃)
:PROPERTIES:
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/3
:END:

*** Interface (Level 3, C₂)
:PROPERTIES:
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/2
:END:

**** Document (Level 4, C₂)
:PROPERTIES:
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/2
:END:

***** Edge (Level 5, C₁)
:PROPERTIES:
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/1
:END:

****** Keyword (Level 6, C₀)
:PROPERTIES:
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/0
:END:
```

### 5.3 BIP32 Path with Key Derivation

```org
* Component with Cryptographic Keys
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0x...
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/2
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC javascript :tangle canvas://key-derivation.js
import { HDNodeWallet } from 'ethers';

// Derive key from BIP32 path
const mnemonic = "abandon abandon abandon ..."; // From BIP39
const wallet = HDNodeWallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/2");

// Sign component CID
const signature = await wallet.signMessage(componentCID);

console.log('Address:', wallet.address);
console.log('Signature:', signature);
#+END_SRC
```

### 5.4 BIP32 Path → File System Mapping

```org
* Component with File System Mapping
:PROPERTIES:
:CANVASL_BIP32_PATH: m/44'/60'/0'/0/2
:CANVASL_DIMENSION: 2D
:CANVASL_FILE_PATH: /opfs/ledger/44/60/0/0/2.yaml
:END:

#+BEGIN_SRC yaml :tangle canvas://component.yaml
# Component stored at /opfs/ledger/44/60/0/0/2.yaml
# BIP32 path: m/44'/60'/0'/0/2
# Dimension: 2D
component:
  id: component-1
  type: document
  data: ...
#+END_SRC
```

---

## 6. Canvas Projection Examples

### 6.1 Single Component Projection

```org
* Single Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://single-component.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC
```

**Projection Result**:
- Creates Canvas node with ID "single-component"
- Projects SVG to Canvas as component
- Maps to chain complex dimension 2D

### 6.2 Multiple Component Projection

```org
* Parent Component
:PROPERTIES:
:CANVASL_DIMENSION: 3D
:END:

** Child Component 1
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://child1.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="red"/>
</svg>
#+END_SRC

** Child Component 2
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://child2.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="green"/>
</svg>
#+END_SRC
```

**Projection Result**:
- Creates parent Canvas node (3D)
- Creates child Canvas nodes (2D)
- Establishes parent-child relationships
- Projects SVGs to Canvas as components

---

## 7. RPC Command Examples

### 7.1 Simple RPC Command

```org
* Add Numbers
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

**Execution Result**:
- Executes RPC command on Canvas graph
- Returns result: 5
- Updates Canvas state

### 7.2 Complex RPC Command

```org
* Complex RPC Command
:PROPERTIES:
:CANVASL_PROTOCOL: canvasl://
:END:

#+BEGIN_SRC canvasl :tangle canvas://rpc-complex :header-args:canvasl:rpc "true"
{
  "type": "rpc-call",
  "function": "r5rs:church-mult",
  "args": [
    {
      "type": "r5rs-call",
      "function": "r5rs:church-add",
      "args": [2, 3]
    },
    4
  ]
}
#+END_SRC
```

**Execution Result**:
- Executes nested RPC commands
- First adds 2 + 3 = 5
- Then multiplies 5 * 4 = 20
- Returns result: 20

### 7.3 RPC Command with Error Handling

```org
* RPC Command with Error Handling
:PROPERTIES:
:CANVASL_PROTOCOL: canvasl://
:END:

#+BEGIN_SRC canvasl :tangle canvas://rpc-safe :header-args:canvasl:rpc "true"
{
  "type": "rpc-call",
  "function": "r5rs:church-add",
  "args": [2, 3],
  "errorHandling": {
    "onError": "return-null",
    "logErrors": true
  }
}
#+END_SRC
```

---

## 8. Export Examples

### 8.1 HTML Export

```org
* HTML Document
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC markdown :tangle canvas://html-doc.md :header-args:canvasl:export "html"
# HTML Document

This document will be exported to HTML.

## Section 1

Content for section 1.

## Section 2

Content for section 2.
#+END_SRC
```

**Export Result**:
- Generates HTML file
- Renders markdown as HTML
- Includes styling and structure

### 8.2 PDF Export

```org
* PDF Document
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC markdown :tangle canvas://pdf-doc.md :header-args:canvasl:export "pdf"
# PDF Document

This document will be exported to PDF.

## Section 1

Content for section 1.
#+END_SRC
```

**Export Result**:
- Generates PDF file
- Renders markdown as PDF
- Includes page breaks and formatting

### 8.3 Multiple Format Export

```org
* Multi-Format Document
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC markdown :tangle canvas://multi-doc.md :header-args:canvasl:export "html|pdf|svg|canvasl"
# Multi-Format Document

This document will be exported to multiple formats.

## Section 1

Content for section 1.
#+END_SRC
```

**Export Result**:
- Generates HTML file
- Generates PDF file
- Generates SVG file
- Generates CanvasL file

---

## 9. Complex Examples

### 9.1 Complete Template with All Features

```org
* Complete Template
:PROPERTIES:
:CANVASL_CID: bafyreihdwdcefgh4dqkjvcyuzjgq2zv2c3xv6r5c2uk5hhj7v2ffx5xnoe
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12
:CANVASL_JSONL_REF: file://template.jsonl
:CANVASL_DIMENSION: 4D
:CANVASL_TOPOLOGY: {"nodes": ["node1", "node2", "node3"], "edges": [{"from": "node1", "to": "node2"}, {"from": "node2", "to": "node3"}]}
:CANVASL_PROTOCOL: canvasl://
:END:

This is a complete template demonstrating all Org Mode integration features.

** SVG Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://svg-component.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC

** JavaScript Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC javascript :tangle canvas://js-component.js :header-args:canvasl:projection "projective"
export function Component() {
  return <div>Hello World</div>;
}
#+END_SRC

** RPC Command
:PROPERTIES:
:CANVASL_PROTOCOL: canvasl://
:END:

#+BEGIN_SRC canvasl :tangle canvas://rpc-command :header-args:canvasl:rpc "true"
{
  "type": "rpc-call",
  "function": "r5rs:church-add",
  "args": [2, 3]
}
#+END_SRC

** Markdown Document
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC markdown :tangle canvas://markdown-doc.md :header-args:canvasl:export "html|pdf|canvasl"
# Markdown Document

Content here.
#+END_SRC
```

### 9.2 Hierarchical Component Structure

```org
* Root Component (C₄)
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

** Context Component (C₃)
:PROPERTIES:
:CANVASL_DIMENSION: 3D
:END:

*** Interface Component (C₂)
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://interface.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="blue"/>
</svg>
#+END_SRC

**** Document Component (C₂)
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC markdown :tangle canvas://document.md :header-args:canvasl:export "html"
# Document

Content here.
#+END_SRC

***** Edge Component (C₁)
:PROPERTIES:
:CANVASL_DIMENSION: 1D
:END:

#+BEGIN_SRC jsonl :tangle canvas://edge.jsonl
{"from": "node1", "to": "node2"}
#+END_SRC

****** Keyword Component (C₀)
:PROPERTIES:
:CANVASL_DIMENSION: 0D
:END:

#+BEGIN_SRC json :tangle canvas://keyword.json
{"keyword": "location"}
#+END_SRC
```

**Projection Result**:
- Creates hierarchical Canvas structure
- Maps heading levels to chain complex dimensions
- Establishes boundary relationships (∂ₙ)
- Projects all source blocks to Canvas

---

## 10. Self-Encoding and Meta-Template Examples

### 10.1 Org Mode Source Block Containing Org Mode Source Block

**Basic Self-Encoding**:

```org
* Nested Org Mode Document
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC org :tangle canvas://nested.org
* Inner Heading
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://inner.svg
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red"/>
</svg>
#+END_SRC
#+END_SRC
```

**Features**:
- Outer Org Mode source block contains complete Org Mode document
- Inner headings and source blocks are parsed recursively
- Property inheritance flows from outer to inner context
- Maximum nesting depth prevents infinite recursion

### 10.2 CanvasL Source Block Containing Org Mode Source Block

**CanvasL with Nested Org Mode**:

```org
* CanvasL Template Generator
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

#+BEGIN_SRC canvasl :tangle canvas://template.canvasl
@version 1.0
@schema canvasl

* Generated Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://generated.svg
<svg width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="blue"/>
</svg>
#+END_SRC
#+END_SRC
```

**Features**:
- CanvasL source block contains Org Mode structure
- CanvasL directives (`@version`, `@schema`) are preserved
- Nested Org Mode is parsed and projected separately
- Supports both CanvasL and Org Mode evaluation models

### 10.3 Meta-Template Example (Template Generating Template)

**Template Generator**:

```org
* Component Template Generator
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

#+NAME: component-template
#+BEGIN_SRC org :tangle canvas://<<component-name>>.org
* <<component-name>> Component
:PROPERTIES:
:CANVASL_CID: <<cid>>
:CANVASL_DIMENSION: <<dimension>>
:END:

#+BEGIN_SRC <<source-type>> :tangle canvas://<<component-name>>.<<extension>>
<<component-content>>
#+END_SRC
#+END_SRC

* Generate Button Component
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

#+BEGIN_SRC org :tangle canvas://button.org :noweb yes
<<component-template>>
#+END_SRC
```

**Noweb Parameter Substitution** (conceptual - would need parameter passing):

```org
* Button Component (Generated)
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://button.svg
<svg width="100" height="40">
  <rect x="0" y="0" width="100" height="40" fill="blue" rx="5"/>
  <text x="50" y="25" text-anchor="middle" fill="white">Button</text>
</svg>
#+END_SRC
```

**Features**:
- Meta-template generates other templates
- Uses Noweb references for composition
- Supports parameter substitution (conceptual)
- Enables template reuse and variation

### 10.4 Nested Evaluation Examples

**Multi-Level Nesting**:

```org
* Level 1: Outer Template
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

#+BEGIN_SRC org :tangle canvas://level1.org
* Level 2: Middle Template
:PROPERTIES:
:CANVASL_DIMENSION: 3D
:END:

#+BEGIN_SRC org :tangle canvas://level2.org
* Level 3: Inner Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://component.svg
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="green"/>
</svg>
#+END_SRC
#+END_SRC
#+END_SRC
```

**Evaluation Order**:
1. Parse Level 1 Org Mode document
2. Detect self-encoding in Level 1 source block
3. Parse Level 2 Org Mode document (nested)
4. Detect self-encoding in Level 2 source block
5. Parse Level 3 Org Mode document (nested)
6. Extract Level 3 SVG source block
7. Project SVG to Canvas API

**Features**:
- Supports multiple nesting levels (up to MAX_NESTING_DEPTH)
- Property inheritance flows through all levels
- Each level maintains its own context
- Circular references are detected and prevented

### 10.5 Cross-Document Reference Examples

**Referencing External Org Mode Document**:

```org
* Main Document
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC org :tangle canvas://main.org
* Component Reference
:PROPERTIES:
:CANVASL_JSONL_REF: file://external-component.org
:END:

#+BEGIN_SRC canvasl :tangle canvas://reference.canvasl
{
  "type": "reference",
  "target": "file://external-component.org",
  "protocol": "file://"
}
#+END_SRC
#+END_SRC
```

**External Component Document** (`external-component.org`):

```org
* External Component
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://external.svg
<svg width="100" height="100">
  <rect x="20" y="20" width="60" height="60" fill="purple"/>
</svg>
#+END_SRC
```

**Features**:
- References external Org Mode documents via protocol handlers
- Supports `file://`, `canvas://`, `webrtc://` protocols
- Enables modular template composition
- Maintains document boundaries and contexts

### 10.6 Self-Encoding with Noweb Composition

**Combining Self-Encoding and Noweb**:

```org
* Base Template
#+NAME: base-template
#+BEGIN_SRC org :tangle canvas://base.org
* Base Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://base.svg
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC
#+END_SRC

* Composed Template
#+BEGIN_SRC org :tangle canvas://composed.org :noweb yes
<<base-template>>

* Additional Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://additional.svg
<svg width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="green"/>
</svg>
#+END_SRC
#+END_SRC
```

**Features**:
- Self-encoded Org Mode blocks can use Noweb references
- Noweb expansion happens before nested parsing
- Enables template composition at multiple levels
- Supports complex template hierarchies

### 10.7 Meta-Template with Parameter Substitution

**Parameterized Template Generation** (conceptual):

```org
* Parameterized Generator
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

#+NAME: param-template
#+BEGIN_SRC org :tangle canvas://<<name>>.org
* <<name>> Component
:PROPERTIES:
:CANVASL_DIMENSION: <<dimension>>
:CANVASL_CID: <<cid>>
:END:

#+BEGIN_SRC <<type>> :tangle canvas://<<name>>.<<ext>>
<<content>>
#+END_SRC
#+END_SRC

* Generate Multiple Components
#+BEGIN_SRC org :tangle canvas://generated.org :noweb yes
<<param-template>>
#+END_SRC
```

**Note**: Actual parameter substitution would require a template engine or macro system. This example shows the conceptual structure.

**Features**:
- Meta-templates can generate multiple variations
- Parameters enable template customization
- Supports batch template generation
- Enables template libraries and component systems

---

## References

- [Org Mode Bipartite Canvas Architecture](./ORG-MODE-BIPARTITE-CANVAS-ARCHITECTURE.md)
- [Org Mode Integration Guide](./ORG-MODE-INTEGRATION-GUIDE.md)
- [Org Mode RFC2119 Specification](./ORG-MODE-BIPARTITE-CANVAS-RFC2119-SPEC.md)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Examples Complete

