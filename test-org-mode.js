/**
 * Simple test script for Org Mode integration
 * Run with: node test-org-mode.js
 */

import { parseOrgDocument, extractHeadings, extractSourceBlocks } from './src/canvasl/org-mode/org-parser.js';
import { parseCanvaslSourceBlock } from './src/canvasl/org-mode/canvasl-source-block-parser.js';
import { expandNowebReferences } from './src/canvasl/org-mode/noweb-expander.js';
import { detectSelfEncoding } from './src/canvasl/org-mode/self-encoding-handler.js';

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    console.error(error.stack);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('🧪 Testing Org Mode Integration\n');

// Test 1: Basic Org Mode parsing
test('Parse basic Org Mode document', () => {
  const content = `* Heading 1
Some content

* Heading 2
More content
`;
  const ast = parseOrgDocument(content);
  assert(ast !== null && ast !== undefined, 'AST should be defined');
  assert(Array.isArray(ast.headings), 'Headings should be an array');
  assert(Array.isArray(ast.sourceBlocks), 'Source blocks should be an array');
});

// Test 2: Extract headings
test('Extract headings with hierarchy', () => {
  const content = `* Level 1
** Level 2
*** Level 3
`;
  const ast = parseOrgDocument(content);
  const headings = extractHeadings(ast);
  assert(headings.length > 0, 'Should extract at least one heading');
});

// Test 3: Extract source blocks
test('Extract source blocks', () => {
  const content = `* Component
#+BEGIN_SRC svg
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="blue"/>
</svg>
#+END_SRC
`;
  const ast = parseOrgDocument(content);
  const blocks = extractSourceBlocks(ast);
  assert(blocks.length > 0, 'Should extract at least one source block');
  assert(blocks[0].type === 'svg' || blocks[0].type === 'block.src', 'Source block should have type');
});

// Test 4: Parse CanvasL source block
test('Parse CanvasL source block', () => {
  const content = `{
  "type": "rpc-call",
  "function": "r5rs:church-add",
  "args": [2, 3]
}`;
  const result = parseCanvaslSourceBlock(content);
  assert(result !== null && result !== undefined, 'Parse result should be defined');
  assert(Array.isArray(result.r5rsCalls), 'Should extract R5RS calls');
});

// Test 5: Detect self-encoding
test('Detect self-encoding in source block', () => {
  const sourceBlock = {
    type: 'org',
    content: `* Inner Heading
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg
<svg></svg>
#+END_SRC
`
  };
  const result = detectSelfEncoding(sourceBlock);
  assert(result !== null && result !== undefined, 'Self-encoding result should be defined');
  assert(typeof result.isSelfEncoded === 'boolean', 'Should have isSelfEncoded boolean');
});

// Test 6: Noweb expansion
test('Expand Noweb references', () => {
  const namedBlocks = new Map();
  namedBlocks.set('base', {
    name: 'base',
    type: 'svg',
    content: '<circle cx="50" cy="50" r="40"/>',
    headerArgs: {}
  });
  
  const sourceBlock = {
    name: 'composed',
    type: 'svg',
    content: '<<base>>\n<text>Composed</text>',
    noweb: true,
    headerArgs: {}
  };
  
  const result = expandNowebReferences(sourceBlock, namedBlocks);
  assert(result !== null && result !== undefined, 'Expansion result should be defined');
  assert(result.content.includes('<circle'), 'Should include base content');
});

// Test 7: Property drawer extraction
test('Extract property drawers', () => {
  const content = `* Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:CANVASL_CID: bafy...
:END:
`;
  const ast = parseOrgDocument(content);
  assert(Array.isArray(ast.propertyDrawers), 'Property drawers should be an array');
});

// Test 8: Complex Org Mode document
test('Parse complex Org Mode document', () => {
  const content = `* Main Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:CANVASL_CID: bafy...
:END:

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
`;
  const ast = parseOrgDocument(content);
  assert(ast !== null && ast !== undefined, 'AST should be defined');
  assert(ast.headings.length > 0, 'Should have headings');
  assert(ast.sourceBlocks.length > 0, 'Should have source blocks');
  assert(ast.namedBlocks.size > 0, 'Should have named blocks');
});

// Test 9: CanvasL RPC command
test('Parse CanvasL RPC command', () => {
  const content = `{
  "type": "rpc-call",
  "function": "r5rs:church-add",
  "args": [2, 3]
}`;
  const result = parseCanvaslSourceBlock(content);
  assert(result.r5rsCalls.length > 0, 'Should extract R5RS calls');
  assert(result.r5rsCalls[0].function === 'r5rs:church-add', 'Should extract correct function name');
});

// Test 10: Self-encoding detection
test('Detect self-encoding in nested Org Mode', () => {
  const sourceBlock = {
    type: 'org',
    content: `* Inner Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg :tangle canvas://inner.svg
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red"/>
</svg>
#+END_SRC
`
  };
  const result = detectSelfEncoding(sourceBlock);
  assert(result.isSelfEncoded === true, 'Should detect self-encoding');
});

console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed');
  process.exit(1);
}

