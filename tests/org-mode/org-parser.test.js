/**
 * Org Mode Parser Tests
 * 
 * Test cases for Org Mode parser functionality
 */

import { describe, it, expect } from 'vitest'; // or jest, mocha, etc.
import { parseOrgDocument, extractHeadings, extractSourceBlocks, extractPropertyDrawers } from '../../src/canvasl/org-mode/org-parser.js';

describe('Org Mode Parser', () => {
  describe('parseOrgDocument', () => {
    it('should parse basic Org Mode document', () => {
      const content = `* Heading 1
Some content

* Heading 2
More content
`;
      const ast = parseOrgDocument(content);
      expect(ast).toBeDefined();
      expect(ast.headings).toBeDefined();
      expect(ast.sourceBlocks).toBeDefined();
    });

    it('should extract headings with hierarchy', () => {
      const content = `* Level 1
** Level 2
*** Level 3
`;
      const ast = parseOrgDocument(content);
      expect(ast.headings.length).toBeGreaterThan(0);
    });

    it('should extract source blocks', () => {
      const content = `* Component
#+BEGIN_SRC svg
<svg></svg>
#+END_SRC
`;
      const ast = parseOrgDocument(content);
      expect(ast.sourceBlocks.length).toBeGreaterThan(0);
    });

    it('should extract property drawers', () => {
      const content = `* Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:
`;
      const ast = parseOrgDocument(content);
      expect(ast.propertyDrawers.length).toBeGreaterThan(0);
    });

    it('should handle Noweb references', () => {
      const content = `#+NAME: base
#+BEGIN_SRC svg
<circle/>
#+END_SRC

#+BEGIN_SRC svg :noweb yes
<<base>>
#+END_SRC
`;
      const ast = parseOrgDocument(content);
      expect(ast.namedBlocks.size).toBeGreaterThan(0);
    });

    it('should handle self-encoding (nested Org Mode)', () => {
      const content = `* Outer
#+BEGIN_SRC org
* Inner
#+BEGIN_SRC svg
<svg></svg>
#+END_SRC
#+END_SRC
`;
      const ast = parseOrgDocument(content);
      expect(ast.sourceBlocks.length).toBeGreaterThan(0);
    });

    it('should handle CanvasL source blocks', () => {
      const content = `* RPC Command
#+BEGIN_SRC canvasl :header-args:canvasl:rpc "true"
{
  "type": "rpc-call",
  "function": "r5rs:church-add"
}
#+END_SRC
`;
      const ast = parseOrgDocument(content);
      const canvaslBlock = ast.sourceBlocks.find(b => b.type === 'canvasl');
      expect(canvaslBlock).toBeDefined();
    });

    it('should handle tangle operations', () => {
      const content = `* Component
#+BEGIN_SRC svg :tangle canvas://component.svg
<svg></svg>
#+END_SRC
`;
      const ast = parseOrgDocument(content);
      const block = ast.sourceBlocks[0];
      expect(block.tangle).toBe('canvas://component.svg');
    });

    it('should handle export operations', () => {
      const content = `* Document
#+BEGIN_SRC markdown :header-args:canvasl:export "html|pdf"
# Document
#+END_SRC
`;
      const ast = parseOrgDocument(content);
      expect(ast.sourceBlocks.length).toBeGreaterThan(0);
    });
  });

  describe('extractHeadings', () => {
    it('should extract all headings from AST', () => {
      const content = `* H1
** H2
* H3
`;
      const ast = parseOrgDocument(content);
      const headings = extractHeadings(ast);
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('extractSourceBlocks', () => {
    it('should extract all source blocks from AST', () => {
      const content = `#+BEGIN_SRC svg
<svg></svg>
#+END_SRC
`;
      const ast = parseOrgDocument(content);
      const blocks = extractSourceBlocks(ast);
      expect(blocks.length).toBeGreaterThan(0);
    });
  });

  describe('extractPropertyDrawers', () => {
    it('should extract all property drawers from AST', () => {
      const content = `* Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:
`;
      const ast = parseOrgDocument(content);
      const drawers = extractPropertyDrawers(ast);
      expect(drawers.length).toBeGreaterThan(0);
    });
  });
});

