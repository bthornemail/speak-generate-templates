/**
 * Grammar Extractor
 * 
 * Extracts grammar patterns from markdown content using NLP analysis
 * Builds grammar rules for CANVASL template generation
 */

import { WinkNLPEngine } from './winknlp-engine.js';

export class GrammarExtractor {
  constructor() {
    this.nlpEngine = new WinkNLPEngine();
    this.grammarRules = new Map();
  }

  /**
   * Extract grammar patterns from markdown content
   * 
   * @param {string} mdContent - Markdown content
   * @returns {object} Grammar patterns
   */
  extractGrammar(mdContent) {
    const analysis = this.nlpEngine.analyzeMarkdown(mdContent);
    const canvaslEntities = this.nlpEngine.extractCanvaslEntities(mdContent);
    
    return {
      keywords: this.extractKeywordPatterns(canvaslEntities.keywords, analysis),
      apiCalls: this.extractAPICallPatterns(canvaslEntities.apiCalls, analysis),
      templateStructure: this.extractTemplateStructurePatterns(analysis),
      grammarRules: this.buildGrammarRules(analysis, canvaslEntities)
    };
  }

  /**
   * Extract keyword patterns
   * 
   * @param {Array} keywords - Extracted keywords
   * @param {object} analysis - NLP analysis
   * @returns {Array} Keyword patterns
   */
  extractKeywordPatterns(keywords, analysis) {
    return keywords.map(kw => ({
      pattern: kw.text,
      type: 'keyword',
      pos: kw.pos || 'NOUN',
      lemma: kw.lemma || kw.text,
      context: this.findKeywordContext(kw.text, analysis),
      confidence: kw.confidence || 1.0
    }));
  }

  /**
   * Find context around keyword
   * 
   * @param {string} keyword - Keyword text
   * @param {object} analysis - NLP analysis
   * @returns {object} Context information
   */
  findKeywordContext(keyword, analysis) {
    const contexts = [];
    
    analysis.sentences.forEach(sentence => {
      if (sentence.text.toLowerCase().includes(keyword.toLowerCase())) {
        const tokens = sentence.tokens;
        const keywordIndex = tokens.findIndex(t => 
          t.toLowerCase() === keyword.toLowerCase()
        );
        
        if (keywordIndex >= 0) {
          contexts.push({
            sentence: sentence.text,
            before: tokens.slice(Math.max(0, keywordIndex - 3), keywordIndex),
            after: tokens.slice(keywordIndex + 1, keywordIndex + 4),
            position: keywordIndex
          });
        }
      }
    });
    
    return contexts;
  }

  /**
   * Extract API call patterns
   * 
   * @param {Array} apiCalls - Extracted API calls
   * @param {object} analysis - NLP analysis
   * @returns {Array} API call patterns
   */
  extractAPICallPatterns(apiCalls, analysis) {
    return apiCalls.map(api => ({
      pattern: `${api.api}.${api.method}`,
      api: api.api,
      method: api.method,
      type: 'api-call',
      context: this.findAPIContext(api, analysis)
    }));
  }

  /**
   * Find context around API call
   * 
   * @param {object} apiCall - API call object
   * @param {object} analysis - NLP analysis
   * @returns {object} Context information
   */
  findAPIContext(apiCall, analysis) {
    const contexts = [];
    
    analysis.sentences.forEach(sentence => {
      const text = sentence.text.toLowerCase();
      if (text.includes(apiCall.api.toLowerCase()) || 
          text.includes(apiCall.method.toLowerCase())) {
        contexts.push({
          sentence: sentence.text,
          tokens: sentence.tokens
        });
      }
    });
    
    return contexts;
  }

  /**
   * Extract template structure patterns
   * 
   * @param {object} analysis - NLP analysis
   * @returns {object} Template structure patterns
   */
  extractTemplateStructurePatterns(analysis) {
    const structure = {
      frontmatter: this.extractFrontmatterStructure(analysis),
      body: this.extractBodyStructure(analysis),
      macros: this.extractMacroStructure(analysis)
    };
    
    return structure;
  }

  /**
   * Extract frontmatter structure
   * 
   * @param {object} analysis - NLP analysis
   * @returns {object} Frontmatter structure
   */
  extractFrontmatterStructure(analysis) {
    const patterns = [];
    
    // Look for YAML key-value patterns
    analysis.tokens.forEach((token, index) => {
      if (token.text === ':' && index > 0) {
        const keyToken = analysis.tokens[index - 1];
        const valueToken = analysis.tokens[index + 1];
        
        patterns.push({
          key: keyToken.text,
          value: valueToken ? valueToken.text : null,
          type: 'yaml-key-value',
          position: index
        });
      }
    });
    
    return {
      patterns,
      structure: this.inferYAMLStructure(patterns)
    };
  }

  /**
   * Infer YAML structure from patterns
   * 
   * @param {Array} patterns - YAML patterns
   * @returns {object} Inferred structure
   */
  inferYAMLStructure(patterns) {
    const structure = {
      topLevel: [],
      nested: {}
    };
    
    patterns.forEach(pattern => {
      if (pattern.key.includes('.')) {
        // Nested structure
        const parts = pattern.key.split('.');
        let current = structure.nested;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = pattern.value;
      } else {
        // Top-level key
        structure.topLevel.push({
          key: pattern.key,
          value: pattern.value
        });
      }
    });
    
    return structure;
  }

  /**
   * Extract body structure
   * 
   * @param {object} analysis - NLP analysis
   * @returns {object} Body structure
   */
  extractBodyStructure(analysis) {
    const structure = {
      headers: [],
      lists: [],
      paragraphs: []
    };
    
    analysis.tokens.forEach(token => {
      if (token.text.startsWith('#')) {
        const level = token.text.match(/^#+/)[0].length;
        const text = token.text.replace(/^#+\s*/, '');
        structure.headers.push({
          level,
          text,
          type: 'markdown-header'
        });
      }
    });
    
    return structure;
  }

  /**
   * Extract macro structure
   * 
   * @param {object} analysis - NLP analysis
   * @returns {Array} Macro structures
   */
  extractMacroStructure(analysis) {
    const macros = [];
    
    // Look for macro patterns: keyword, api, method
    analysis.dependencies.forEach(dep => {
      if (dep.relation === 'nmod' && this.nlpEngine.isKeywordPattern(dep.token)) {
        macros.push({
          keyword: dep.token,
          context: dep.parent,
          relation: dep.relation,
          structure: 'macro-definition'
        });
      }
    });
    
    return macros;
  }

  /**
   * Build grammar rules from analysis
   * 
   * @param {object} analysis - NLP analysis
   * @param {object} canvaslEntities - CANVASL entities
   * @returns {Array} Grammar rules
   */
  buildGrammarRules(analysis, canvaslEntities) {
    const rules = [];
    
    // Rule 1: Keyword patterns
    canvaslEntities.keywords.forEach(kw => {
      rules.push({
        type: 'keyword-rule',
        pattern: kw.text,
        rule: `KEYWORD -> "${kw.text}"`,
        examples: this.findExamples(kw.text, analysis)
      });
    });
    
    // Rule 2: API call patterns
    canvaslEntities.apiCalls.forEach(api => {
      rules.push({
        type: 'api-call-rule',
        pattern: `${api.api}.${api.method}`,
        rule: `API_CALL -> ${api.api} "." ${api.method}`,
        examples: this.findExamples(`${api.api}.${api.method}`, analysis)
      });
    });
    
    // Rule 3: Template structure rules
    const templateStructure = canvaslEntities.templateStructure;
    if (templateStructure.frontmatterPatterns.length > 0) {
      rules.push({
        type: 'template-structure-rule',
        pattern: 'frontmatter',
        rule: 'FRONTMATTER -> YAML_KEY_VALUE*',
        examples: templateStructure.frontmatterPatterns
      });
    }
    
    return rules;
  }

  /**
   * Find examples of pattern in analysis
   * 
   * @param {string} pattern - Pattern to find
   * @param {object} analysis - NLP analysis
   * @returns {Array} Example sentences
   */
  findExamples(pattern, analysis) {
    const examples = [];
    
    analysis.sentences.forEach(sentence => {
      if (sentence.text.toLowerCase().includes(pattern.toLowerCase())) {
        examples.push(sentence.text);
      }
    });
    
    return examples.slice(0, 3); // Return up to 3 examples
  }

  /**
   * Generate grammar rules for template generation
   * 
   * @param {string} mdContent - Markdown content
   * @returns {object} Grammar rules for template generation
   */
  generateTemplateGrammar(mdContent) {
    const grammar = this.extractGrammar(mdContent);
    
    return {
      keywords: grammar.keywords.map(k => k.pattern),
      apiCalls: grammar.apiCalls.map(a => a.pattern),
      structure: grammar.templateStructure,
      rules: grammar.grammarRules
    };
  }
}

