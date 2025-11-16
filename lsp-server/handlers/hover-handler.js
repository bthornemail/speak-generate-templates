/**
 * Hover Handler
 * 
 * Provides hover information for CANVASL constructs
 */

import { ASTService } from '../services/ast-service.js';
import { GrammarService } from '../services/grammar-service.js';
import { SemanticService } from '../services/semantic-service.js';

export class HoverHandler {
  constructor(astService, grammarService, semanticService) {
    this.ast = astService;
    this.grammar = grammarService;
    this.semantic = semanticService;
  }

  /**
   * Handle hover request
   * 
   * @param {object} params - Hover parameters
   * @param {string} params.textDocument.uri - Document URI
   * @param {object} params.position - Cursor position
   * @param {string} content - Document content
   * @returns {Promise<object|null>} Hover information
   */
  async handleHover(params, content) {
    const uri = params.textDocument.uri;
    const position = params.position;
    
    // Get AST
    const ast = await this.ast.buildAST(uri, content);
    
    // Find node at position
    const node = this.ast.getNodeAtPosition(ast, position.line, position.character);
    
    if (!node) {
      // Try to get information from grammar
      return this.getGrammarHover(params, content);
    }
    
    // Build hover information from node
    return this.buildHoverFromNode(node);
  }

  /**
   * Get hover information from grammar
   * 
   * @param {object} params - Hover parameters
   * @param {string} content - Document content
   * @returns {object|null} Hover information
   */
  getGrammarHover(params, content) {
    const context = this.getContextAtPosition(content, params.position);
    const word = this.getWordAtPosition(context);
    
    if (!word) return null;
    
    // Check if it's a keyword
    const keywords = this.grammar.getKeywords(params.textDocument.uri, content);
    const keyword = keywords.find(k => k.pattern === word);
    if (keyword) {
      return {
        contents: {
          kind: 'markdown',
          value: `**Keyword**: ${keyword.pattern}\n\nType: ${keyword.type}\nConfidence: ${keyword.confidence || 1.0}`
        },
        range: {
          start: { line: params.position.line, character: context.beforeCursor.lastIndexOf(word) },
          end: { line: params.position.line, character: params.position.character }
        }
      };
    }
    
    // Check if it's an API
    const apiCalls = this.grammar.getAPICalls(params.textDocument.uri, content);
    const apiCall = apiCalls.find(a => a.api === word || a.method === word);
    if (apiCall) {
      return {
        contents: {
          kind: 'markdown',
          value: `**API Call**: ${apiCall.api}.${apiCall.method}()\n\nAPI: ${apiCall.api}\nMethod: ${apiCall.method}`
        },
        range: {
          start: { line: params.position.line, character: context.beforeCursor.lastIndexOf(word) },
          end: { line: params.position.line, character: params.position.character }
        }
      };
    }
    
    return null;
  }

  /**
   * Build hover information from AST node
   * 
   * @param {object} node - AST node
   * @returns {object} Hover information
   */
  buildHoverFromNode(node) {
    let contents = '';
    
    switch (node.type) {
      case 'Macro':
        contents = `**Macro**: ${node.keyword}\n\nAPI: ${node.api}\nMethod: ${node.method}`;
        if (node.params && Object.keys(node.params).length > 0) {
          contents += `\nParams: ${JSON.stringify(node.params)}`;
        }
        break;
      
      case 'Keyword':
        contents = `**Keyword**: ${node.keyword}`;
        if (node.context) {
          contents += `\n\nContext: ${node.context}`;
        }
        break;
      
      case 'API':
        contents = `**API**: ${node.api}.${node.method}()\n\nAPI: ${node.api}\nMethod: ${node.method}`;
        if (node.params && Object.keys(node.params).length > 0) {
          contents += `\nParams: ${JSON.stringify(node.params)}`;
        }
        break;
      
      case 'YAMLKeyValue':
        contents = `**YAML Key**: ${node.key}\n\nValue: ${JSON.stringify(node.value)}`;
        break;
      
      default:
        contents = `**${node.type}**`;
    }
    
    return {
      contents: {
        kind: 'markdown',
        value: contents
      }
    };
  }

  /**
   * Get context at position
   * 
   * @param {string} content - Document content
   * @param {object} position - Cursor position
   * @returns {object} Context information
   */
  getContextAtPosition(content, position) {
    const lines = content.split('\n');
    const line = lines[position.line] || '';
    const beforeCursor = line.substring(0, position.character);
    const afterCursor = line.substring(position.character);
    
    return {
      line,
      beforeCursor,
      afterCursor,
      lineNumber: position.line,
      character: position.character
    };
  }

  /**
   * Get word at position
   * 
   * @param {object} context - Context information
   * @returns {string|null} Word at position
   */
  getWordAtPosition(context) {
    const before = context.beforeCursor;
    const after = context.afterCursor;
    
    // Match word characters
    const beforeMatch = before.match(/(\w+)$/);
    const afterMatch = after.match(/^(\w+)/);
    
    if (beforeMatch && afterMatch) {
      return beforeMatch[1] + afterMatch[1];
    } else if (beforeMatch) {
      return beforeMatch[1];
    } else if (afterMatch) {
      return afterMatch[1];
    }
    
    return null;
  }
}

