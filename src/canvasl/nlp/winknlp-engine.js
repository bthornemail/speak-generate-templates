/**
 * WinkNLP Engine
 * 
 * NLP engine using wink-nlp for grammar extraction and analysis
 * Provides tokenization, POS tagging, NER, and dependency parsing
 */

import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

export class WinkNLPEngine {
  constructor() {
    this.nlp = winkNLP(model);
    this.its = this.nlp.its;
  }

  /**
   * Analyze markdown content and extract NLP features
   * 
   * @param {string} mdContent - Markdown content to analyze
   * @returns {object} Analysis result with tokens, entities, and dependencies
   */
  analyzeMarkdown(mdContent) {
    if (!mdContent || typeof mdContent !== 'string') {
      throw new Error('Invalid markdown content');
    }

    const doc = this.nlp.readDoc(mdContent);
    
    return {
      tokens: doc.tokens().map(t => ({
        text: t.out(),
        pos: t.pos(),
        lemma: t.lemma(),
        type: t.type()
      })),
      entities: doc.entities().map(e => ({
        text: e.out(),
        type: e.type(),
        confidence: e.confidence ? e.confidence() : 1.0
      })),
      sentences: doc.sentences().map(s => ({
        text: s.out(),
        tokens: s.tokens().map(t => t.out())
      })),
      dependencies: this.extractDependencies(doc)
    };
  }

  /**
   * Extract dependency relationships from document
   * 
   * @param {object} doc - winknlp document
   * @returns {Array} Array of dependency relationships
   */
  extractDependencies(doc) {
    const dependencies = [];
    
    doc.tokens().forEach(t => {
      const parent = t.parent();
      if (parent) {
        dependencies.push({
          token: t.out(),
          parent: parent.out(),
          relation: t.parentRelation(),
          pos: t.pos(),
          parentPos: parent.pos()
        });
      }
    });
    
    return dependencies;
  }

  /**
   * Extract CANVASL-specific entities from markdown
   * 
   * @param {string} mdContent - Markdown content
   * @returns {object} Extracted CANVASL entities
   */
  extractCanvaslEntities(mdContent) {
    const analysis = this.analyzeMarkdown(mdContent);
    
    return {
      keywords: this.extractKeywords(analysis),
      apiCalls: this.extractAPICalls(analysis),
      macros: this.extractMacros(analysis),
      templateStructure: this.extractTemplateStructure(analysis)
    };
  }

  /**
   * Extract keywords from analysis
   * 
   * @param {object} analysis - NLP analysis result
   * @returns {Array} Array of keyword entities
   */
  extractKeywords(analysis) {
    // Look for keywords in entities and tokens
    const keywords = [];
    
    // Check entities for keyword-like patterns
    analysis.entities.forEach(e => {
      if (e.type === 'KEYWORD' || this.isKeywordPattern(e.text)) {
        keywords.push({
          text: e.text,
          type: 'keyword',
          confidence: e.confidence || 1.0
        });
      }
    });
    
    // Check tokens for keyword patterns
    analysis.tokens.forEach(t => {
      if (this.isKeywordPattern(t.text)) {
        keywords.push({
          text: t.text,
          type: 'keyword',
          pos: t.pos,
          lemma: t.lemma
        });
      }
    });
    
    return [...new Map(keywords.map(k => [k.text, k])).values()]; // Remove duplicates
  }

  /**
   * Check if text matches keyword pattern
   * 
   * @param {string} text - Text to check
   * @returns {boolean} True if matches keyword pattern
   */
  isKeywordPattern(text) {
    const keywordPatterns = [
      /^(location|notify|save|copy|render|camera|microphone)$/i,
      /^[a-z]+$/i // Simple lowercase word
    ];
    
    return keywordPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Extract API calls from analysis
   * 
   * @param {object} analysis - NLP analysis result
   * @returns {Array} Array of API call patterns
   */
  extractAPICalls(analysis) {
    const apiCalls = [];
    
    // Look for API call patterns: api.method() or api.method
    analysis.tokens.forEach((token, index) => {
      const nextToken = analysis.tokens[index + 1];
      
      if (this.isAPIName(token.text) && nextToken && this.isMethodName(nextToken.text)) {
        apiCalls.push({
          api: token.text,
          method: nextToken.text,
          pos: token.pos,
          fullText: `${token.text}.${nextToken.text}`
        });
      }
    });
    
    return apiCalls;
  }

  /**
   * Check if text is an API name
   * 
   * @param {string} text - Text to check
   * @returns {boolean} True if looks like API name
   */
  isAPIName(text) {
    const apiNames = [
      'geolocation', 'notifications', 'indexeddb', 'clipboard',
      'webgl', 'mediadevices', 'speech', 'storage'
    ];
    
    return apiNames.some(api => text.toLowerCase().includes(api.toLowerCase()));
  }

  /**
   * Check if text is a method name
   * 
   * @param {string} text - Text to check
   * @returns {boolean} True if looks like method name
   */
  isMethodName(text) {
    // Method names typically start with lowercase and contain camelCase
    return /^[a-z][a-zA-Z0-9]*$/.test(text);
  }

  /**
   * Extract macros from analysis
   * 
   * @param {object} analysis - NLP analysis result
   * @returns {Array} Array of macro patterns
   */
  extractMacros(analysis) {
    const macros = [];
    
    // Look for macro patterns in dependencies
    analysis.dependencies.forEach(dep => {
      if (dep.relation === 'nmod' && this.isKeywordPattern(dep.token)) {
        macros.push({
          keyword: dep.token,
          context: dep.parent,
          relation: dep.relation
        });
      }
    });
    
    return macros;
  }

  /**
   * Extract template structure patterns
   * 
   * @param {object} analysis - NLP analysis result
   * @returns {object} Template structure patterns
   */
  extractTemplateStructure(analysis) {
    return {
      frontmatterPatterns: this.extractFrontmatterPatterns(analysis),
      bodyPatterns: this.extractBodyPatterns(analysis),
      macroPatterns: this.extractMacros(analysis),
      keywordPatterns: this.extractKeywords(analysis)
    };
  }

  /**
   * Extract frontmatter patterns
   * 
   * @param {object} analysis - NLP analysis result
   * @returns {Array} Frontmatter patterns
   */
  extractFrontmatterPatterns(analysis) {
    // Look for YAML-like patterns
    const patterns = [];
    
    analysis.tokens.forEach((token, index) => {
      if (token.text === ':' && index > 0) {
        const key = analysis.tokens[index - 1];
        patterns.push({
          key: key.text,
          type: 'yaml-key-value',
          pos: key.pos
        });
      }
    });
    
    return patterns;
  }

  /**
   * Extract body patterns
   * 
   * @param {object} analysis - NLP analysis result
   * @returns {Array} Body patterns
   */
  extractBodyPatterns(analysis) {
    // Look for markdown patterns (headers, lists, etc.)
    const patterns = [];
    
    analysis.tokens.forEach(token => {
      if (token.text.startsWith('#')) {
        patterns.push({
          type: 'markdown-header',
          level: token.text.match(/^#+/)[0].length,
          text: token.text.replace(/^#+\s*/, '')
        });
      }
    });
    
    return patterns;
  }

  /**
   * Get sentiment/confidence score for text
   * 
   * @param {string} text - Text to analyze
   * @returns {number} Confidence score (0-1)
   */
  getConfidenceScore(text) {
    const doc = this.nlp.readDoc(text);
    const tokens = doc.tokens();
    
    // Simple confidence based on token count and entity recognition
    const entityCount = doc.entities().length;
    const tokenCount = tokens.length;
    
    if (tokenCount === 0) return 0;
    
    // Higher confidence if we have entities and reasonable token count
    return Math.min(1.0, (entityCount * 0.3 + Math.min(tokenCount / 10, 0.7)));
  }
}

