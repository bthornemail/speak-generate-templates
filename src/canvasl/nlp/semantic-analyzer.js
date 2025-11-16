/**
 * Semantic Analyzer
 * 
 * Semantic analysis utilities for template generation and validation
 * Uses WordNet for semantic understanding
 */

import { WordNetEngine } from './wordnet-engine.js';

export class SemanticAnalyzer {
  constructor() {
    this.wordnet = new WordNetEngine();
    this.initialized = false;
  }

  /**
   * Initialize semantic analyzer
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this.initialized) {
      await this.wordnet.initialize();
      this.initialized = true;
    }
  }

  /**
   * Expand keywords using semantic relationships
   * 
   * @param {Array} keywords - Initial keywords
   * @returns {Promise<Array>} Expanded keywords
   */
  async expandKeywords(keywords) {
    await this.initialize();
    return await this.wordnet.expandKeywords(keywords);
  }

  /**
   * Suggest templates based on semantic similarity
   * 
   * @param {string} userIntent - User intent text
   * @param {Array} existingTemplates - Existing templates
   * @returns {Promise<Array>} Suggested templates
   */
  async suggestTemplates(userIntent, existingTemplates = []) {
    await this.initialize();
    
    const intentKeywords = this.extractKeywords(userIntent);
    const suggestions = [];
    
    for (const template of existingTemplates) {
      const templateKeywords = this.extractTemplateKeywords(template);
      const similarity = await this.calculateTemplateSimilarity(
        intentKeywords,
        templateKeywords
      );
      
      if (similarity > 0.3) {
        suggestions.push({
          template,
          similarity,
          matchedKeywords: this.findMatchedKeywords(intentKeywords, templateKeywords)
        });
      }
    }
    
    // Sort by similarity
    return suggestions.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Extract keywords from text
   * 
   * @param {string} text - Text to extract keywords from
   * @returns {Array} Extracted keywords
   */
  extractKeywords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const keywords = [];
    
    words.forEach(word => {
      // Remove punctuation
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 2) {
        keywords.push(cleanWord);
      }
    });
    
    return keywords;
  }

  /**
   * Extract keywords from template
   * 
   * @param {object} template - Template object
   * @returns {Array} Template keywords
   */
  extractTemplateKeywords(template) {
    const keywords = [];
    
    if (template.frontmatter) {
      // Extract from speech keywords
      if (template.frontmatter.speech?.input?.keywords) {
        keywords.push(...template.frontmatter.speech.input.keywords);
      }
      
      // Extract from macros
      if (template.frontmatter.macros) {
        template.frontmatter.macros.forEach(macro => {
          if (macro.keyword) {
            keywords.push(macro.keyword);
          }
        });
      }
    }
    
    return keywords.map(k => k.toLowerCase());
  }

  /**
   * Calculate similarity between intent and template keywords
   * 
   * @param {Array} intentKeywords - Intent keywords
   * @param {Array} templateKeywords - Template keywords
   * @returns {Promise<number>} Similarity score (0-1)
   */
  async calculateTemplateSimilarity(intentKeywords, templateKeywords) {
    if (intentKeywords.length === 0 || templateKeywords.length === 0) {
      return 0.0;
    }
    
    let totalSimilarity = 0;
    let matches = 0;
    
    for (const intentKw of intentKeywords) {
      let maxSimilarity = 0;
      
      for (const templateKw of templateKeywords) {
        const similarity = await this.wordnet.calculateSimilarity(intentKw, templateKw);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
      
      if (maxSimilarity > 0) {
        totalSimilarity += maxSimilarity;
        matches++;
      }
    }
    
    // Average similarity weighted by matches
    return matches > 0 ? totalSimilarity / intentKeywords.length : 0.0;
  }

  /**
   * Find matched keywords between intent and template
   * 
   * @param {Array} intentKeywords - Intent keywords
   * @param {Array} templateKeywords - Template keywords
   * @returns {Array} Matched keyword pairs
   */
  async findMatchedKeywords(intentKeywords, templateKeywords) {
    const matches = [];
    
    for (const intentKw of intentKeywords) {
      for (const templateKw of templateKeywords) {
        const similarity = await this.wordnet.calculateSimilarity(intentKw, templateKw);
        if (similarity > 0.5) {
          matches.push({
            intent: intentKw,
            template: templateKw,
            similarity
          });
        }
      }
    }
    
    return matches;
  }

  /**
   * Validate template semantics
   * 
   * @param {object} template - Template to validate
   * @returns {Promise<object>} Validation result
   */
  async validateTemplateSemantics(template) {
    await this.initialize();
    
    const errors = [];
    const warnings = [];
    
    // Check keyword consistency
    if (template.frontmatter?.speech?.input?.keywords) {
      const keywords = template.frontmatter.speech.input.keywords;
      const macros = template.frontmatter.macros || [];
      
      // Check if all keywords have corresponding macros
      for (const keyword of keywords) {
        const hasMacro = macros.some(m => m.keyword === keyword);
        if (!hasMacro) {
          warnings.push(`Keyword "${keyword}" has no corresponding macro`);
        }
      }
      
      // Check if all macros have keywords
      for (const macro of macros) {
        if (macro.keyword && !keywords.includes(macro.keyword)) {
          warnings.push(`Macro keyword "${macro.keyword}" not in speech keywords`);
        }
      }
    }
    
    // Check semantic consistency of keywords
    if (template.frontmatter?.speech?.input?.keywords) {
      const keywords = template.frontmatter.speech.input.keywords;
      const semanticGroups = await this.groupKeywordsSemantically(keywords);
      
      if (semanticGroups.length > 1) {
        warnings.push(`Keywords may belong to different semantic groups: ${semanticGroups.map(g => g.join(', ')).join('; ')}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Group keywords by semantic similarity
   * 
   * @param {Array} keywords - Keywords to group
   * @returns {Promise<Array>} Groups of semantically similar keywords
   */
  async groupKeywordsSemantically(keywords) {
    const groups = [];
    const processed = new Set();
    
    for (const keyword of keywords) {
      if (processed.has(keyword)) continue;
      
      const group = [keyword];
      processed.add(keyword);
      
      for (const otherKeyword of keywords) {
        if (processed.has(otherKeyword)) continue;
        
        const similarity = await this.wordnet.calculateSimilarity(keyword, otherKeyword);
        if (similarity > 0.6) {
          group.push(otherKeyword);
          processed.add(otherKeyword);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }

  /**
   * Map user intent to CANVASL constructs
   * 
   * @param {string} userIntent - User intent text
   * @returns {Promise<object>} Mapped CANVASL constructs
   */
  async mapIntentToCanvasl(userIntent) {
    await this.initialize();
    
    const keywords = this.extractKeywords(userIntent);
    const expandedKeywords = await this.wordnet.expandKeywords(keywords);
    const canvaslKeywords = this.wordnet.mapToCanvaslKeywords(expandedKeywords);
    
    return {
      originalKeywords: keywords,
      expandedKeywords,
      canvaslKeywords,
      suggestedAPIs: this.mapKeywordsToAPIs(canvaslKeywords)
    };
  }

  /**
   * Map keywords to CANVASL APIs
   * 
   * @param {Array} keywords - Keywords to map
   * @returns {Array} Suggested APIs
   */
  mapKeywordsToAPIs(keywords) {
    const apiMap = {
      'location': { api: 'geolocation', method: 'getCurrentPosition' },
      'notify': { api: 'notifications', method: 'showNotification' },
      'save': { api: 'indexeddb', method: 'put' },
      'copy': { api: 'clipboard', method: 'writeText' },
      'render': { api: 'webgl', method: 'drawArrays' },
      'camera': { api: 'mediadevices', method: 'getUserMedia' },
      'microphone': { api: 'mediadevices', method: 'getUserMedia' }
    };
    
    return keywords
      .filter(k => apiMap[k])
      .map(k => ({ keyword: k, ...apiMap[k] }));
  }
}

