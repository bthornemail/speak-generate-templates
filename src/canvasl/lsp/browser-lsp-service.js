/**
 * Browser-Native LSP Service
 * 
 * Provides LSP-like features directly in the browser without requiring a server
 * Falls back to local implementations when server is unavailable
 */

import { GrammarExtractor } from '../nlp/grammar-extractor.js';
import { ASTBuilder } from '../ast/ast-builder.js';
import { ASTValidator } from '../ast/ast-validator.js';
import { SemanticAnalyzer } from '../nlp/semantic-analyzer.js';

export class BrowserLSPService {
  constructor() {
    this.grammarExtractor = new GrammarExtractor();
    this.astBuilder = new ASTBuilder();
    this.astValidator = new ASTValidator();
    this.semanticAnalyzer = new SemanticAnalyzer();
    this.documentCache = new Map();
  }

  /**
   * Get completion suggestions (browser-native)
   * 
   * @param {string} content - Document content
   * @param {number} line - Line number (0-based)
   * @param {number} character - Character position
   * @returns {Promise<Array>} Completion items
   */
  async getCompletions(content, line, character) {
    const grammar = this.grammarExtractor.extractGrammar(content);
    const keywords = grammar.keywords || [];
    const apiCalls = grammar.apiCalls || [];
    
    const lines = content.split('\n');
    const currentLine = lines[line] || '';
    const beforeCursor = currentLine.substring(0, character);
    
    const completions = [];
    
    // Keyword completions
    if (this.isInKeywordContext(beforeCursor)) {
      keywords.forEach(kw => {
        completions.push({
          label: kw.pattern,
          kind: 14, // Keyword
          detail: 'CANVASL Keyword',
          documentation: `Keyword: ${kw.pattern}`,
          insertText: kw.pattern
        });
      });
    }
    
    // API completions
    if (this.isInAPIContext(beforeCursor)) {
      apiCalls.forEach(api => {
        completions.push({
          label: `${api.api}.${api.method}`,
          kind: 2, // Method
          detail: `API: ${api.api}`,
          documentation: `API call: ${api.api}.${api.method}()`,
          insertText: `${api.api}.${api.method}()`
        });
      });
    }
    
    // YAML key completions
    if (this.isInYAMLContext(beforeCursor)) {
      const yamlKeys = this.getYAMLKeys();
      yamlKeys.forEach(key => {
        completions.push({
          label: key,
          kind: 5, // Property
          detail: 'YAML Key',
          documentation: `YAML key: ${key}`,
          insertText: `${key}: `
        });
      });
    }
    
    return completions;
  }

  /**
   * Get diagnostics (browser-native)
   * 
   * @param {string} content - Document content
   * @returns {Promise<Array>} Diagnostics
   */
  async getDiagnostics(content) {
    const diagnostics = [];
    
    try {
      const ast = await this.astBuilder.buildAST(content);
      const validation = this.astValidator.validate(ast);
      
      validation.errors.forEach((error, index) => {
        diagnostics.push({
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
          },
          severity: 1, // Error
          message: error,
          source: 'canvasl-ast'
        });
      });
      
      validation.warnings.forEach((warning, index) => {
        diagnostics.push({
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
          },
          severity: 2, // Warning
          message: warning,
          source: 'canvasl-ast'
        });
      });
    } catch (error) {
      diagnostics.push({
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 }
        },
        severity: 1,
        message: `AST build error: ${error.message}`,
        source: 'canvasl-ast'
      });
    }
    
    return diagnostics;
  }

  /**
   * Get hover information (browser-native)
   * 
   * @param {string} content - Document content
   * @param {number} line - Line number
   * @param {number} character - Character position
   * @returns {Promise<object|null>} Hover information
   */
  async getHover(content, line, character) {
    const lines = content.split('\n');
    const currentLine = lines[line] || '';
    const beforeCursor = currentLine.substring(0, character);
    const afterCursor = currentLine.substring(character);
    
    const word = this.getWordAtPosition(beforeCursor, afterCursor);
    if (!word) return null;
    
    const grammar = this.grammarExtractor.extractGrammar(content);
    const keywords = grammar.keywords || [];
    const apiCalls = grammar.apiCalls || [];
    
    // Check if it's a keyword
    const keyword = keywords.find(k => k.pattern === word);
    if (keyword) {
      return {
        contents: {
          kind: 'markdown',
          value: `**Keyword**: ${keyword.pattern}\n\nType: ${keyword.type}\nConfidence: ${keyword.confidence || 1.0}`
        },
        range: {
          start: { line, character: beforeCursor.lastIndexOf(word) },
          end: { line, character: character }
        }
      };
    }
    
    // Check if it's an API
    const apiCall = apiCalls.find(a => a.api === word || a.method === word);
    if (apiCall) {
      return {
        contents: {
          kind: 'markdown',
          value: `**API Call**: ${apiCall.api}.${apiCall.method}()\n\nAPI: ${apiCall.api}\nMethod: ${apiCall.method}`
        },
        range: {
          start: { line, character: beforeCursor.lastIndexOf(word) },
          end: { line, character: character }
        }
      };
    }
    
    return null;
  }

  /**
   * Check if in keyword context
   */
  isInKeywordContext(beforeCursor) {
    const lower = beforeCursor.toLowerCase();
    return lower.includes('keywords:') || 
           lower.includes('keywords: [') ||
           lower.includes('speech:') ||
           lower.includes('input:');
  }

  /**
   * Check if in API context
   */
  isInAPIContext(beforeCursor) {
    const lower = beforeCursor.toLowerCase();
    return lower.includes('api:') ||
           lower.includes('method:') ||
           lower.includes('macros:');
  }

  /**
   * Check if in YAML context
   */
  isInYAMLContext(beforeCursor) {
    return true; // Assume YAML context in frontmatter
  }

  /**
   * Get YAML keys
   */
  getYAMLKeys() {
    return [
      'type', 'id', 'dimension', 'adjacency', 'speech', 'macros',
      'validates', 'features', 'edges', 'orientation', 'input', 'output',
      'lang', 'continuous', 'interimResults', 'keywords', 'voice',
      'rate', 'pitch', 'volume', 'keyword', 'api', 'method', 'params',
      'homology', 'byzantine', 'accessibility', 'version', 'category', 'generated'
    ];
  }

  /**
   * Get word at position
   */
  getWordAtPosition(beforeCursor, afterCursor) {
    const beforeMatch = beforeCursor.match(/(\w+)$/);
    const afterMatch = afterCursor.match(/^(\w+)/);
    
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

