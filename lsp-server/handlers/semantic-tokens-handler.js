/**
 * Semantic Tokens Handler
 * 
 * Provides semantic token highlighting
 */

import { ASTService } from '../services/ast-service.js';
import { GrammarService } from '../services/grammar-service.js';

export class SemanticTokensHandler {
  constructor(astService, grammarService) {
    this.ast = astService;
    this.grammar = grammarService;
  }

  /**
   * Handle semantic tokens request
   * 
   * @param {object} params - Semantic tokens parameters
   * @param {string} params.textDocument.uri - Document URI
   * @param {string} content - Document content
   * @returns {Promise<object>} Semantic tokens
   */
  async handleSemanticTokens(params, content) {
    const uri = params.textDocument.uri;
    const tokens = [];
    
    // Get grammar patterns
    const keywords = this.grammar.getKeywords(uri, content);
    const apiCalls = this.grammar.getAPICalls(uri, content);
    
    const lines = content.split('\n');
    
    // Add keyword tokens
    keywords.forEach(keyword => {
      lines.forEach((line, lineIndex) => {
        const index = line.indexOf(keyword.pattern);
        if (index >= 0) {
          tokens.push({
            line: lineIndex,
            char: index,
            length: keyword.pattern.length,
            tokenType: 14, // Keyword
            tokenModifiers: 0
          });
        }
      });
    });
    
    // Add API call tokens
    apiCalls.forEach(apiCall => {
      const pattern = `${apiCall.api}.${apiCall.method}`;
      lines.forEach((line, lineIndex) => {
        const index = line.indexOf(pattern);
        if (index >= 0) {
          tokens.push({
            line: lineIndex,
            char: index,
            length: pattern.length,
            tokenType: 2, // Method
            tokenModifiers: 0
          });
        }
      });
    });
    
    // Convert to LSP semantic tokens format
    return {
      data: this.encodeTokens(tokens)
    };
  }

  /**
   * Encode tokens to LSP format
   * 
   * @param {Array} tokens - Token array
   * @returns {Array} Encoded token data
   */
  encodeTokens(tokens) {
    // Sort tokens by line and character
    tokens.sort((a, b) => {
      if (a.line !== b.line) return a.line - b.line;
      return a.char - b.char;
    });
    
    const data = [];
    let prevLine = 0;
    let prevChar = 0;
    
    tokens.forEach(token => {
      const deltaLine = token.line - prevLine;
      const deltaChar = deltaLine === 0 ? token.char - prevChar : token.char;
      
      data.push(
        deltaLine,
        deltaChar,
        token.length,
        token.tokenType,
        token.tokenModifiers
      );
      
      prevLine = token.line;
      prevChar = token.char;
    });
    
    return data;
  }
}

