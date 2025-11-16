/**
 * AST Builder
 * 
 * Builds AST representation of CANVASL templates from NLP analysis
 */

import { TemplateNode, FrontmatterNode, MacroNode, KeywordNode, APINode, BodyNode, YAMLKeyValueNode } from './ast-template.js';
import { extractFrontmatter } from '../speech/frontmatter-parser.js';
import { WinkNLPEngine } from '../nlp/winknlp-engine.js';
import { SemanticAnalyzer } from '../nlp/semantic-analyzer.js';

export class ASTBuilder {
  constructor(nlpEngine = null, semanticAnalyzer = null) {
    this.nlp = nlpEngine || new WinkNLPEngine();
    this.semantic = semanticAnalyzer || new SemanticAnalyzer();
  }

  /**
   * Build AST from markdown content
   * 
   * @param {string} mdContent - Markdown content
   * @returns {Promise<TemplateNode>} Template AST
   */
  async buildAST(mdContent) {
    const nlpAnalysis = this.nlp.analyzeMarkdown(mdContent);
    let frontmatterData = null;
    
    try {
      const parsed = extractFrontmatter(mdContent);
      frontmatterData = parsed;
    } catch (error) {
      // No frontmatter found, continue with body only
    }
    
    const frontmatterAST = frontmatterData 
      ? this.buildFrontmatterAST(frontmatterData, nlpAnalysis)
      : null;
    
    const bodyAST = this.buildBodyAST(mdContent, nlpAnalysis);
    
    const templateAST = new TemplateNode(frontmatterAST, bodyAST);
    templateAST.setMetadata('grammar', this.extractGrammarPatterns(nlpAnalysis));
    templateAST.setMetadata('nlpAnalysis', nlpAnalysis);
    
    return templateAST;
  }

  /**
   * Build frontmatter AST
   * 
   * @param {object} frontmatter - Parsed frontmatter
   * @param {object} nlpAnalysis - NLP analysis
   * @returns {FrontmatterNode} Frontmatter AST
   */
  buildFrontmatterAST(frontmatter, nlpAnalysis) {
    const frontmatterNode = new FrontmatterNode();
    
    // Process each key-value pair
    Object.entries(frontmatter).forEach(([key, value]) => {
      const kvNode = this.buildKeyValueAST(key, value, nlpAnalysis);
      frontmatterNode.addChild(kvNode);
      frontmatterNode.addKeyValue(key, value);
    });
    
    // Extract macros
    if (frontmatter.macros && Array.isArray(frontmatter.macros)) {
      frontmatter.macros.forEach(macro => {
        const macroNode = this.buildMacroAST(macro, nlpAnalysis);
        frontmatterNode.addChild(macroNode);
      });
    }
    
    // Extract keywords
    if (frontmatter.speech?.input?.keywords) {
      frontmatter.speech.input.keywords.forEach(keyword => {
        const keywordNode = new KeywordNode(keyword);
        frontmatterNode.addChild(keywordNode);
      });
    }
    
    return frontmatterNode;
  }

  /**
   * Build key-value AST node
   * 
   * @param {string} key - YAML key
   * @param {*} value - YAML value
   * @param {object} nlpAnalysis - NLP analysis
   * @returns {ASTNode} Key-value AST node
   */
  buildKeyValueAST(key, value, nlpAnalysis) {
    const kvNode = new YAMLKeyValueNode(key, value);
    
    // Add semantic metadata if value is a string
    if (typeof value === 'string') {
      const semanticInfo = this.extractSemanticInfo(value, nlpAnalysis);
      kvNode.setMetadata('semantic', semanticInfo);
    }
    
    // Handle nested objects
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        const nestedNode = this.buildKeyValueAST(nestedKey, nestedValue, nlpAnalysis);
        kvNode.addChild(nestedNode);
      });
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object') {
          const itemNode = this.buildKeyValueAST(`[${index}]`, item, nlpAnalysis);
          kvNode.addChild(itemNode);
        }
      });
    }
    
    return kvNode;
  }

  /**
   * Build macro AST
   * 
   * @param {object} macro - Macro object
   * @param {object} nlpAnalysis - NLP analysis
   * @returns {MacroNode} Macro AST node
   */
  buildMacroAST(macro, nlpAnalysis) {
    const macroNode = new MacroNode(
      macro.keyword,
      macro.api,
      macro.method,
      macro.params || {}
    );
    
    // Add API node
    const apiNode = new APINode(macro.api, macro.method, macro.params);
    macroNode.addChild(apiNode);
    
    // Add keyword node
    const keywordNode = new KeywordNode(macro.keyword);
    macroNode.addChild(keywordNode);
    
    // Add semantic metadata
    const semanticInfo = this.extractSemanticInfo(macro.keyword, nlpAnalysis);
    macroNode.setMetadata('semantic', semanticInfo);
    
    return macroNode;
  }

  /**
   * Build body AST
   * 
   * @param {string} mdContent - Markdown content
   * @param {object} nlpAnalysis - NLP analysis
   * @returns {BodyNode} Body AST node
   */
  buildBodyAST(mdContent, nlpAnalysis) {
    // Extract body content (everything after frontmatter)
    const parts = mdContent.split(/^---\s*$/m);
    const bodyContent = parts.length >= 3 
      ? parts.slice(2).join('---').trim()
      : mdContent;
    
    const bodyNode = new BodyNode(bodyContent, {
      headers: this.extractHeaders(bodyContent, nlpAnalysis),
      paragraphs: this.extractParagraphs(bodyContent, nlpAnalysis),
      lists: this.extractLists(bodyContent, nlpAnalysis)
    });
    
    return bodyNode;
  }

  /**
   * Extract headers from body
   * 
   * @param {string} bodyContent - Body content
   * @param {object} nlpAnalysis - NLP analysis
   * @returns {Array} Header structures
   */
  extractHeaders(bodyContent, nlpAnalysis) {
    const headers = [];
    const lines = bodyContent.split('\n');
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#+)\s+(.+)$/);
      if (match) {
        headers.push({
          level: match[1].length,
          text: match[2],
          line: index + 1
        });
      }
    });
    
    return headers;
  }

  /**
   * Extract paragraphs from body
   * 
   * @param {string} bodyContent - Body content
   * @param {object} nlpAnalysis - NLP analysis
   * @returns {Array} Paragraph structures
   */
  extractParagraphs(bodyContent, nlpAnalysis) {
    const paragraphs = [];
    const blocks = bodyContent.split(/\n\s*\n/);
    
    blocks.forEach((block, index) => {
      if (block.trim() && !block.trim().startsWith('#')) {
        paragraphs.push({
          text: block.trim(),
          index,
          tokens: this.nlp.analyzeMarkdown(block).tokens.length
        });
      }
    });
    
    return paragraphs;
  }

  /**
   * Extract lists from body
   * 
   * @param {string} bodyContent - Body content
   * @param {object} nlpAnalysis - NLP analysis
   * @returns {Array} List structures
   */
  extractLists(bodyContent, nlpAnalysis) {
    const lists = [];
    const lines = bodyContent.split('\n');
    let currentList = null;
    
    lines.forEach((line, index) => {
      const match = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
      if (match) {
        if (!currentList || currentList.indent !== match[1].length) {
          if (currentList) lists.push(currentList);
          currentList = {
            indent: match[1].length,
            items: [],
            type: match[2].match(/\d/) ? 'ordered' : 'unordered'
          };
        }
        currentList.items.push({
          text: match[3],
          line: index + 1
        });
      } else if (currentList && line.trim() === '') {
        lists.push(currentList);
        currentList = null;
      }
    });
    
    if (currentList) lists.push(currentList);
    
    return lists;
  }

  /**
   * Extract grammar patterns from NLP analysis
   * 
   * @param {object} nlpAnalysis - NLP analysis
   * @returns {object} Grammar patterns
   */
  extractGrammarPatterns(nlpAnalysis) {
    const canvaslEntities = this.nlp.extractCanvaslEntities(
      nlpAnalysis.tokens.map(t => t.text).join(' ')
    );
    
    return {
      keywords: canvaslEntities.keywords.map(k => ({
        pattern: k.text,
        type: k.type,
        confidence: k.confidence || 1.0
      })),
      apiCalls: canvaslEntities.apiCalls.map(a => ({
        pattern: a.fullText,
        api: a.api,
        method: a.method
      })),
      templateStructure: canvaslEntities.templateStructure
    };
  }

  /**
   * Extract semantic information from text
   * 
   * @param {string} text - Text to analyze
   * @param {object} nlpAnalysis - NLP analysis
   * @returns {object} Semantic information
   */
  extractSemanticInfo(text, nlpAnalysis) {
    // Find tokens related to text
    const relatedTokens = nlpAnalysis.tokens.filter(t => 
      t.text.toLowerCase().includes(text.toLowerCase()) ||
      text.toLowerCase().includes(t.text.toLowerCase())
    );
    
    return {
      tokens: relatedTokens.map(t => ({
        text: t.text,
        pos: t.pos,
        lemma: t.lemma
      })),
      entities: nlpAnalysis.entities.filter(e =>
        e.text.toLowerCase().includes(text.toLowerCase())
      )
    };
  }
}

