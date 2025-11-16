/**
 * Grammar Service
 * 
 * Service for grammar extraction and pattern analysis
 */

import { GrammarExtractor } from '../../src/canvasl/nlp/grammar-extractor.js';

export class GrammarService {
  constructor() {
    this.extractor = new GrammarExtractor();
    this.grammarCache = new Map();
  }

  /**
   * Extract grammar from document
   * 
   * @param {string} uri - Document URI
   * @param {string} content - Document content
   * @returns {object} Grammar patterns
   */
  extractGrammar(uri, content) {
    // Check cache
    const cacheKey = `${uri}:${content.length}`;
    if (this.grammarCache.has(cacheKey)) {
      return this.grammarCache.get(cacheKey);
    }
    
    const grammar = this.extractor.extractGrammar(content);
    this.grammarCache.set(cacheKey, grammar);
    
    return grammar;
  }

  /**
   * Get grammar rules for template generation
   * 
   * @param {string} uri - Document URI
   * @param {string} content - Document content
   * @returns {object} Grammar rules
   */
  getGrammarRules(uri, content) {
    const grammar = this.extractGrammar(uri, content);
    return grammar.grammarRules || [];
  }

  /**
   * Get keywords from grammar
   * 
   * @param {string} uri - Document URI
   * @param {string} content - Document content
   * @returns {Array} Keywords
   */
  getKeywords(uri, content) {
    const grammar = this.extractGrammar(uri, content);
    return grammar.keywords || [];
  }

  /**
   * Get API calls from grammar
   * 
   * @param {string} uri - Document URI
   * @param {string} content - Document content
   * @returns {Array} API calls
   */
  getAPICalls(uri, content) {
    const grammar = this.extractGrammar(uri, content);
    return grammar.apiCalls || [];
  }

  /**
   * Clear cache for URI
   * 
   * @param {string} uri - Document URI
   */
  clearCache(uri) {
    const keysToDelete = [];
    this.grammarCache.forEach((value, key) => {
      if (key.startsWith(uri)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.grammarCache.delete(key));
  }
}

