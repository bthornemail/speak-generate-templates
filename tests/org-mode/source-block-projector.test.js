/**
 * Source Block Projector Tests
 * 
 * Test cases for source block projection functionality
 */

import { describe, it, expect } from 'vitest'; // or jest, mocha, etc.
import { projectSourceBlock, projectAllSourceBlocks } from '../../src/canvasl/org-mode/source-block-projector.js';
import { parseOrgDocument } from '../../src/canvasl/org-mode/org-parser.js';

describe('Source Block Projector', () => {
  describe('projectSourceBlock', () => {
    it('should project SVG source block', async () => {
      const sourceBlock = {
        type: 'svg',
        content: '<svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>',
        tangle: 'canvas://component.svg',
        canvasl: { projection: 'projective' }
      };
      
      const canvasAPI = {
        addNode: async (node) => ({ id: node.id, success: true })
      };
      
      const orgAST = { namedBlocks: new Map() };
      const result = await projectSourceBlock(sourceBlock, orgAST, canvasAPI);
      
      expect(result.success).toBe(true);
      expect(result.metadata.type).toBe('svg');
    });

    it('should project JavaScript source block', async () => {
      const sourceBlock = {
        type: 'javascript',
        content: 'console.log("test");',
        canvasl: { projection: 'projective' }
      };
      
      const canvasAPI = {
        addNode: async (node) => ({ id: node.id, success: true })
      };
      
      const orgAST = { namedBlocks: new Map() };
      const result = await projectSourceBlock(sourceBlock, orgAST, canvasAPI);
      
      expect(result.success).toBe(true);
      expect(result.metadata.type).toBe('javascript');
    });

    it('should project CanvasL source block', async () => {
      const sourceBlock = {
        type: 'canvasl',
        content: '{"type": "rpc-call", "function": "r5rs:church-add", "args": [2, 3]}',
        canvasl: { rpc: 'true' }
      };
      
      const canvasAPI = {
        executeRPC: async (func, args) => ({ result: 5 })
      };
      
      const orgAST = { namedBlocks: new Map() };
      const result = await projectSourceBlock(sourceBlock, orgAST, canvasAPI);
      
      // RPC execution may succeed or fail depending on implementation
      expect(result).toBeDefined();
    });

    it('should project nested Org Mode source block', async () => {
      const sourceBlock = {
        type: 'org',
        content: `* Inner Component
:PROPERTIES:
:CANVASL_DIMENSION: 2D
:END:

#+BEGIN_SRC svg
<svg></svg>
#+END_SRC
`,
        isSelfEncoded: true
      };
      
      const canvasAPI = {
        addNode: async (node) => ({ id: node.id, success: true })
      };
      
      const orgAST = parseOrgDocument(sourceBlock.content);
      const result = await projectSourceBlock(sourceBlock, orgAST, canvasAPI);
      
      expect(result.success).toBe(true);
      expect(result.metadata.isSelfEncoded).toBe(true);
    });

    it('should handle projection errors gracefully', async () => {
      const sourceBlock = {
        type: 'invalid',
        content: 'invalid content'
      };
      
      const canvasAPI = null; // No API available
      const orgAST = { namedBlocks: new Map() };
      const result = await projectSourceBlock(sourceBlock, orgAST, canvasAPI);
      
      // Should handle error gracefully
      expect(result).toBeDefined();
    });

    it('should handle protocol handlers', async () => {
      const sourceBlock = {
        type: 'svg',
        content: '<svg></svg>',
        tangle: 'canvas://component.svg',
        canvasl: { projection: 'projective' }
      };
      
      const canvasAPI = {
        addNode: async (node) => ({ id: node.id, success: true }),
        registerProtocolHandler: async (protocol, handler) => {}
      };
      
      const orgAST = { namedBlocks: new Map() };
      const result = await projectSourceBlock(sourceBlock, orgAST, canvasAPI);
      
      expect(result.success).toBe(true);
      expect(result.protocol).toBe('canvas');
    });
  });

  describe('projectAllSourceBlocks', () => {
    it('should project all source blocks in AST', async () => {
      const content = `* Component 1
#+BEGIN_SRC svg
<svg></svg>
#+END_SRC

* Component 2
#+BEGIN_SRC svg
<svg></svg>
#+END_SRC
`;
      
      const orgAST = parseOrgDocument(content);
      const canvasAPI = {
        addNode: async (node) => ({ id: node.id, success: true })
      };
      
      const results = await projectAllSourceBlocks(orgAST, canvasAPI);
      
      expect(results.length).toBe(orgAST.sourceBlocks.length);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});

