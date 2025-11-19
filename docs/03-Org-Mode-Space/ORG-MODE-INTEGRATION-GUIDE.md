# Org Mode Integration Guide

**Version 1.0 — January 2025**  
**Practical Guide for Integrating Org Mode with CanvasL**

---

## Overview

This guide provides practical instructions for integrating Org Mode as the primary format for CanvasL templates. It includes code examples, common patterns, troubleshooting tips, and best practices.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Basic Integration](#2-basic-integration)
3. [Source Block Projection](#3-source-block-projection)
4. [Property Drawer Mapping](#4-property-drawer-mapping)
5. [Protocol Handler Integration](#5-protocol-handler-integration)
6. [Common Patterns](#6-common-patterns)
7. [Troubleshooting](#7-troubleshooting)
8. [Best Practices](#8-best-practices)

---

## 1. Quick Start

### 1.1 Installation

```bash
# Install Org Mode parser (orgajs)
npm install orgajs

# Or use custom parser
npm install @canvasl/org-mode-parser
```

### 1.2 Basic Setup

```javascript
import { OrgModeParser } from '@canvasl/org-mode-parser';
import { CanvasProjection } from '@canvasl/projection';

// Initialize parser
const parser = new OrgModeParser();

// Parse Org Mode document
const orgAST = await parser.parse(orgContent);

// Project to Canvas
const projection = new CanvasProjection(orgAST);
await projection.project();
```

### 1.3 First Org Mode Document

```org
* My First Component
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0x...
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://component.svg
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC
```

---

## 2. Basic Integration

### 2.1 Parsing Org Mode Documents

```javascript
import { OrgModeParser } from '@canvasl/org-mode-parser';

const parser = new OrgModeParser();

// Parse document
const orgAST = await parser.parse(orgContent);

// Access AST structure
console.log('Headings:', orgAST.headings);
console.log('Source Blocks:', orgAST.sourceBlocks);
console.log('Property Drawers:', orgAST.propertyDrawers);
```

### 2.2 Extracting Source Blocks

```javascript
import { SourceBlockExtractor } from '@canvasl/projection';

const extractor = new SourceBlockExtractor(orgAST);

// Extract all source blocks
const sourceBlocks = extractor.extractAll();

// Extract source blocks with tangle directive
const tangledBlocks = extractor.extractTangled();

// Extract source blocks by type
const svgBlocks = extractor.extractByType('svg');
```

### 2.3 Extracting Property Drawers

```javascript
import { PropertyDrawerExtractor } from '@canvasl/property-drawer';

const extractor = new PropertyDrawerExtractor(orgAST);

// Extract all property drawers
const propertyDrawers = extractor.extractAll();

// Extract property drawer for heading
const headingProps = extractor.extractForHeading('my-heading');

// Extract CANVASL_* properties
const canvaslProps = extractor.extractCanvaslProperties();
```

---

## 3. Source Block Projection

### 3.1 Basic Projection

```javascript
import { SourceBlockProjector } from '@canvasl/projection';

const projector = new SourceBlockProjector();

// Project single source block
const result = await projector.project(sourceBlock);

// Project all source blocks
const results = await projector.projectAll(sourceBlocks);

// Project with custom protocol handler
const customResult = await projector.project(sourceBlock, {
  protocol: 'custom://',
  handler: customHandler
});
```

### 3.2 SVG Projection

```org
* SVG Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://component.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC
```

```javascript
// Project SVG source block
const svgBlock = extractor.extractByType('svg')[0];
const projection = await projector.project(svgBlock);

// Access projected SVG
console.log('Projected SVG:', projection.content);
console.log('Canvas Node ID:', projection.nodeId);
```

### 3.3 JavaScript Projection

```org
* JavaScript Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC javascript :tangle canvas://component.js :header-args:canvasl:projection "projective"
export function Component() {
  return <div>Hello World</div>;
}
#+END_SRC
```

```javascript
// Project JavaScript source block
const jsBlock = extractor.extractByType('javascript')[0];
const projection = await projector.project(jsBlock, {
  execute: true, // Execute code before projection
  sandbox: true  // Use sandbox for execution
});
```

### 3.4 RPC Command Projection

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

```javascript
// Project RPC command source block
const rpcBlock = extractor.extractByType('canvasl')[0];
const result = await projector.project(rpcBlock, {
  execute: true,
  protocol: 'canvasl://'
});

// Access RPC result
console.log('RPC Result:', result.value);
```

---

## 4. Property Drawer Mapping

### 4.1 Property Drawer → JSONL Conversion

```javascript
import { PropertyDrawerConverter } from '@canvasl/property-drawer';

const converter = new PropertyDrawerConverter();

// Convert property drawer to JSONL
const jsonl = converter.toJSONL(propertyDrawer);

// Convert all property drawers to JSONL
const jsonlLines = converter.toJSONLAll(propertyDrawers);

// Write JSONL to file
await converter.writeJSONL(jsonlLines, 'output.jsonl');
```

### 4.2 JSONL → Property Drawer Conversion

```javascript
// Convert JSONL to property drawer
const propertyDrawer = converter.fromJSONL(jsonlLine);

// Convert JSONL file to property drawers
const propertyDrawers = await converter.fromJSONLFile('input.jsonl');

// Update Org document with property drawers
await converter.updateOrgDocument(orgAST, propertyDrawers);
```

### 4.3 Property Validation

```javascript
import { PropertyValidator } from '@canvasl/property-drawer';

const validator = new PropertyValidator();

// Validate property drawer
const validation = validator.validate(propertyDrawer);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// Validate specific property
const cidValid = validator.validateProperty(propertyDrawer, 'CANVASL_CID');
```

---

## 5. Protocol Handler Integration

### 5.1 Registering Protocol Handlers

```javascript
import { ProtocolHandlerRegistry } from '@canvasl/protocol';

const registry = new ProtocolHandlerRegistry();

// Register canvasl:// protocol handler
registry.register('canvasl://', async (url) => {
  // Handle canvasl:// URL
  const nodeId = extractNodeId(url);
  return await canvasAPI.getNode(nodeId);
});

// Register file:// protocol handler
registry.register('file://', async (url) => {
  // Handle file:// URL
  const filePath = extractFilePath(url);
  return await fs.readFile(filePath);
});
```

### 5.2 Executing RPC Commands

```javascript
import { RPCExecutor } from '@canvasl/protocol';

const executor = new RPCExecutor();

// Execute RPC command
const result = await executor.execute({
  type: 'rpc-call',
  function: 'r5rs:church-add',
  args: [2, 3]
});

// Execute RPC command from source block
const rpcBlock = extractor.extractByType('canvasl')[0];
const rpcResult = await executor.executeFromSourceBlock(rpcBlock);
```

### 5.3 Protocol Handler Testing

```javascript
import { ProtocolHandlerTester } from '@canvasl/protocol';

const tester = new ProtocolHandlerTester();

// Test protocol handler
const testResult = await tester.test('canvasl://node/123', {
  expectedType: 'node',
  validateResult: true
});

// Test RPC command
const rpcTestResult = await tester.testRPC({
  type: 'rpc-call',
  function: 'r5rs:church-add',
  args: [2, 3]
}, {
  expectedValue: 5
});
```

---

## 6. Common Patterns

### 6.1 Component Template Pattern

```org
* Component Template
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0x...
:CANVASL_DIMENSION: 2D
:CANVASL_JSONL_REF: file://component.jsonl
:END:

#+BEGIN_SRC svg :tangle canvas://component.svg :header-args:canvasl:projection "projective"
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC

#+BEGIN_SRC javascript :tangle canvas://component.js :header-args:canvasl:projection "projective"
export function Component() {
  return <div>Hello World</div>;
}
#+END_SRC
```

### 6.2 Document Template Pattern

```org
* Document Template
:PROPERTIES:
:CANVASL_CID: bafy...
:CANVASL_PARENT: genesis
:CANVASL_SIGNATURE: 0x...
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC markdown :tangle canvas://document.md :header-args:canvasl:export "html|pdf|canvasl"
# Document Title

This is the document content.

## Section 1

Content for section 1.
#+END_SRC
```

### 6.3 RPC Command Pattern

```org
* RPC Command Template
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
```

### 6.4 Nested Component Pattern

```org
* Parent Component
:PROPERTIES:
:CANVASL_DIMENSION: 3D
:END:

** Child Component 1
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://child1.svg
<svg>...</svg>
#+END_SRC

** Child Component 2
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://child2.svg
<svg>...</svg>
#+END_SRC
```

---

## 7. Troubleshooting

### 7.1 Common Issues

**Issue**: Source block not projecting to Canvas

**Solution**:
1. Check `:tangle` directive is present
2. Check `:header-args:canvasl:*` properties are correct
3. Check protocol handler is registered
4. Check source block content is valid

**Issue**: Property drawer not converting to JSONL

**Solution**:
1. Check property drawer syntax is correct
2. Check CANVASL_* properties are present
3. Check property values are valid
4. Check converter is configured correctly

**Issue**: Protocol handler not executing

**Solution**:
1. Check protocol handler is registered
2. Check RPC command format is correct
3. Check protocol handler has correct permissions
4. Check error logs for details

### 7.2 Debugging Tips

**Enable Debug Logging**:
```javascript
import { Logger } from '@canvasl/utils';

Logger.setLevel('debug');

// Now all operations will log debug information
```

**Inspect Org AST**:
```javascript
const orgAST = await parser.parse(orgContent);
console.log('AST:', JSON.stringify(orgAST, null, 2));
```

**Inspect Source Blocks**:
```javascript
const sourceBlocks = extractor.extractAll();
sourceBlocks.forEach(block => {
  console.log('Block:', block.type, block.tangle, block.headerArgs);
});
```

**Inspect Property Drawers**:
```javascript
const propertyDrawers = extractor.extractAll();
propertyDrawers.forEach(props => {
  console.log('Properties:', props.canvasl);
});
```

---

## 8. Best Practices

### 8.1 Org Mode Document Structure

- Use consistent heading levels for chain complex dimensions
- Keep property drawers close to their headings
- Use descriptive heading titles
- Organize source blocks logically

### 8.2 Source Block Organization

- Group related source blocks together
- Use consistent `:tangle` target naming
- Document source blocks with comments
- Test source blocks before projection

### 8.3 Property Drawer Management

- Always include required properties (CID, PARENT, SIGNATURE)
- Use descriptive property values
- Keep property drawers synchronized with JSONL
- Validate properties before use

### 8.4 Protocol Handler Usage

- Register protocol handlers early
- Handle protocol handler errors gracefully
- Test protocol handlers before production use
- Document protocol handler behavior

### 8.5 Performance Optimization

- Parse Org documents once and cache AST
- Project source blocks incrementally
- Cache property drawer conversions
- Optimize protocol handler execution

---

## 9. Self-Encoding and Meta-Templates

### 9.1 Creating Self-Encoding Source Blocks

**Basic Self-Encoding**:

```org
* Nested Document
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC org :tangle canvas://nested.org
* Inner Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://inner.svg
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC
#+END_SRC
```

**Usage**:
```javascript
import { parseOrgDocument, detectSelfEncoding, parseNestedOrgMode } from './org-mode/index.js';

const orgAST = parseOrgDocument(orgContent);
orgAST.sourceBlocks.forEach(block => {
  const selfEncoding = detectSelfEncoding(block);
  if (selfEncoding.isSelfEncoded) {
    const nestedAST = parseNestedOrgMode(block.content, 0);
    console.log('Nested AST:', nestedAST);
  }
});
```

### 9.2 Creating Meta-Templates

**Meta-Template Example**:

```org
* Template Generator
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

#+NAME: component-template
#+BEGIN_SRC org :tangle canvas://template.org
* Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://component.svg
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC
#+END_SRC

* Generate Component
#+BEGIN_SRC org :tangle canvas://generated.org :noweb yes
<<component-template>>
#+END_SRC
```

**Usage**:
```javascript
import { handleMetaTemplate, processSelfEncoding } from './org-mode/index.js';

const orgAST = parseOrgDocument(orgContent);
const processedAST = processSelfEncoding(orgAST);

processedAST.metaTemplates.forEach(template => {
  console.log('Meta-template:', template.name);
  console.log('Generated template:', template.nestedAST);
});
```

### 9.3 Best Practices for Nested Structures

**1. Limit Nesting Depth**:
- Keep nesting levels reasonable (3-5 levels maximum)
- Use cross-document references for deep hierarchies
- Document nesting structure clearly

**2. Property Inheritance**:
- Explicitly set properties at each nesting level
- Document inherited properties
- Use property drawers for metadata

**3. Noweb Composition**:
- Use Noweb references for reusable components
- Name source blocks descriptively
- Document Noweb dependencies

**4. Error Handling**:
- Check for circular references
- Validate nesting depth
- Handle parsing errors gracefully

### 9.4 Troubleshooting Nested Source Blocks

**Problem: Circular Reference Detected**

**Solution**:
```javascript
import { detectCircularReferences } from './org-mode/index.js';

const hasCircular = detectCircularReferences(sourceBlock, namedBlocks);
if (hasCircular) {
  console.error('Circular reference detected in:', sourceBlock.name);
  // Handle circular reference
}
```

**Problem: Maximum Nesting Depth Exceeded**

**Solution**:
- Reduce nesting levels
- Use cross-document references instead
- Increase MAX_NESTING_DEPTH if needed (default: 10)

**Problem: Property Inheritance Not Working**

**Solution**:
- Check property drawer syntax
- Verify parent context has properties
- Use explicit property setting at each level

**Problem: Nested Content Not Parsing**

**Solution**:
- Verify Org Mode syntax in nested content
- Check for syntax errors
- Ensure proper source block delimiters (`#+BEGIN_SRC` / `#+END_SRC`)

### 9.5 Advanced Patterns

**Pattern 1: Template Library**:

```org
* Template Library
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

#+NAME: button-template
#+BEGIN_SRC org :tangle canvas://button-template.org
* Button Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://button.svg
<svg width="100" height="40">
  <rect x="0" y="0" width="100" height="40" fill="blue" rx="5"/>
  <text x="50" y="25" text-anchor="middle" fill="white">Button</text>
</svg>
#+END_SRC
#+END_SRC

#+NAME: card-template
#+BEGIN_SRC org :tangle canvas://card-template.org
* Card Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://card.svg
<svg width="200" height="150">
  <rect x="0" y="0" width="200" height="150" fill="white" stroke="gray" rx="5"/>
  <text x="100" y="75" text-anchor="middle">Card</text>
</svg>
#+END_SRC
#+END_SRC
```

**Pattern 2: Conditional Template Generation**:

```org
* Conditional Generator
:PROPERTIES:
:CANVASL_DIMENSION: 4D
:END:

#+BEGIN_SRC org :tangle canvas://conditional.org
* <<component-type>> Component
:PROPERTIES:
:CANVASL_DIMENSION: <<dimension>>
:END:

#+BEGIN_SRC <<source-type>> :tangle canvas://<<component-name>>.<<extension>>
<<component-content>>
#+END_SRC
#+END_SRC
```

**Note**: Actual conditional logic would require a template engine or macro system.

---

## References

- [Org Mode Bipartite Canvas Architecture](./ORG-MODE-BIPARTITE-CANVAS-ARCHITECTURE.md)
- [Org Mode RFC2119 Specification](./ORG-MODE-BIPARTITE-CANVAS-RFC2119-SPEC.md)
- [Org Mode Examples](./ORG-MODE-EXAMPLES.md)
- [Org Mode Research GUI Requirements](./ORG-MODE-RESEARCH-GUI-REQUIREMENTS.md)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Guide Complete

