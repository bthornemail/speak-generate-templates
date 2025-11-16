/**
 * Completion Handler
 * 
 * Provides autocomplete suggestions based on grammar patterns
 */

import { GrammarService } from '../services/grammar-service.js';
import { ASTService } from '../services/ast-service.js';
import { SemanticService } from '../services/semantic-service.js';

export class CompletionHandler {
  constructor(grammarService, astService, semanticService) {
    this.grammar = grammarService;
    this.ast = astService;
    this.semantic = semanticService;
  }

  /**
   * Handle completion request
   * 
   * @param {object} params - Completion parameters
   * @param {string} params.textDocument.uri - Document URI
   * @param {object} params.position - Cursor position
   * @param {string} content - Document content
   * @returns {Promise<Array>} Completion items
   */
  async handleCompletion(params, content) {
    const uri = params.textDocument.uri;
    const position = params.position;
    
    // Get grammar patterns
    const grammar = this.grammar.extractGrammar(uri, content);
    const keywords = this.grammar.getKeywords(uri, content);
    const apiCalls = this.grammar.getAPICalls(uri, content);
    
    // Get context at position
    const context = this.getContextAtPosition(content, position);
    
    // Generate completions based on context
    const completions = [];
    
    // Add keyword completions
    if (this.isInKeywordContext(context)) {
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
    
    // Add API completions
    if (this.isInAPIContext(context)) {
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
    
    // Add YAML key completions
    if (this.isInYAMLContext(context)) {
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
    
    // Add macro completions
    if (this.isInMacroContext(context)) {
      const macroKeys = ['keyword', 'api', 'method', 'params', 'type'];
      macroKeys.forEach(key => {
        completions.push({
          label: key,
          kind: 5, // Property
          detail: 'Macro Property',
          documentation: `Macro property: ${key}`,
          insertText: `${key}: `
        });
      });
    }
    
    return completions;
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
   * Check if in keyword context
   * 
   * @param {object} context - Context information
   * @returns {boolean} True if in keyword context
   */
  isInKeywordContext(context) {
    const before = context.beforeCursor.toLowerCase();
    
    // Check if we're in keywords array or speech.input.keywords
    return before.includes('keywords:') || 
           before.includes('keywords: [') ||
           before.includes('speech:') ||
           before.includes('input:');
  }

  /**
   * Check if in API context
   * 
   * @param {object} context - Context information
   * @returns {boolean} True if in API context
   */
  isInAPIContext(context) {
    const before = context.beforeCursor.toLowerCase();
    
    return before.includes('api:') ||
           before.includes('method:') ||
           before.includes('macros:');
  }

  /**
   * Check if in YAML context
   * 
   * @param {object} context - Context information
   * @returns {boolean} True if in YAML context
   */
  isInYAMLContext(context) {
    // Check if we're in frontmatter (between --- markers)
    const lines = context.lineNumber;
    // Simple check - in practice would track frontmatter boundaries
    return true; // Assume YAML context in frontmatter
  }

  /**
   * Check if in macro context
   * 
   * @param {object} context - Context information
   * @returns {boolean} True if in macro context
   */
  isInMacroContext(context) {
    const before = context.beforeCursor.toLowerCase();
    
    return before.includes('macros:') ||
           before.includes('- keyword:');
  }

  /**
   * Get YAML keys for CANVASL templates
   * 
   * @returns {Array} YAML keys
   */
  getYAMLKeys() {
    return [
      'type',
      'id',
      'dimension',
      'adjacency',
      'speech',
      'macros',
      'validates',
      'features',
      'edges',
      'orientation',
      'input',
      'output',
      'lang',
      'continuous',
      'interimResults',
      'keywords',
      'voice',
      'rate',
      'pitch',
      'volume',
      'keyword',
      'api',
      'method',
      'params',
      'homology',
      'byzantine',
      'accessibility',
      'version',
      'category',
      'generated'
    ];
  }
}

