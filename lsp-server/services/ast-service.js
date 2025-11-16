/**
 * AST Service
 * 
 * Service for AST building and validation
 */

import { ASTBuilder } from '../../src/canvasl/ast/ast-builder.js';
import { ASTValidator } from '../../src/canvasl/ast/ast-validator.js';

export class ASTService {
  constructor() {
    this.builder = new ASTBuilder();
    this.validator = new ASTValidator();
    this.astCache = new Map();
  }

  /**
   * Build AST from document
   * 
   * @param {string} uri - Document URI
   * @param {string} content - Document content
   * @returns {Promise<object>} AST
   */
  async buildAST(uri, content) {
    // Check cache
    const cacheKey = `${uri}:${content.length}`;
    if (this.astCache.has(cacheKey)) {
      return this.astCache.get(cacheKey);
    }
    
    const ast = await this.builder.buildAST(content);
    this.astCache.set(cacheKey, ast);
    
    return ast;
  }

  /**
   * Validate AST
   * 
   * @param {object} ast - AST to validate
   * @returns {object} Validation result
   */
  validateAST(ast) {
    return this.validator.validate(ast);
  }

  /**
   * Build and validate AST
   * 
   * @param {string} uri - Document URI
   * @param {string} content - Document content
   * @returns {Promise<object>} AST and validation result
   */
  async buildAndValidate(uri, content) {
    const ast = await this.buildAST(uri, content);
    const validation = this.validateAST(ast);
    
    return {
      ast,
      validation
    };
  }

  /**
   * Get AST node at position
   * 
   * @param {object} ast - AST
   * @param {number} line - Line number (0-based)
   * @param {number} character - Character position
   * @returns {object|null} AST node at position
   */
  getNodeAtPosition(ast, line, character) {
    // Simple implementation - traverse AST to find node at position
    // In a full implementation, would track position metadata
    return this.findNode(ast, line, character);
  }

  /**
   * Find node at position (recursive)
   * 
   * @param {object} node - AST node
   * @param {number} line - Line number
   * @param {number} character - Character position
   * @returns {object|null} Node at position
   */
  findNode(node, line, character) {
    // Check if node has position metadata
    const nodeLine = node.metadata?.line;
    const nodeChar = node.metadata?.character;
    
    if (nodeLine !== undefined && nodeChar !== undefined) {
      if (nodeLine === line && nodeChar <= character && 
          character <= nodeChar + (node.metadata?.length || 0)) {
        return node;
      }
    }
    
    // Check children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = this.findNode(child, line, character);
        if (found) return found;
      }
    }
    
    // Check frontmatter and body
    if (node.frontmatter) {
      const found = this.findNode(node.frontmatter, line, character);
      if (found) return found;
    }
    
    if (node.body) {
      const found = this.findNode(node.body, line, character);
      if (found) return found;
    }
    
    return null;
  }

  /**
   * Clear cache for URI
   * 
   * @param {string} uri - Document URI
   */
  clearCache(uri) {
    const keysToDelete = [];
    this.astCache.forEach((value, key) => {
      if (key.startsWith(uri)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.astCache.delete(key));
  }
}

