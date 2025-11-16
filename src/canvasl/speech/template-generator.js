/**
 * CANVASL Template Generator
 * 
 * Generates YAML templates from voice commands
 * Supports template generation for macros, directives, and full CANVASL templates
 * Enhanced with NLP grammar patterns and semantic analysis
 */

import * as yaml from 'js-yaml';
import { GrammarExtractor } from '../nlp/grammar-extractor.js';
import { SemanticAnalyzer } from '../nlp/semantic-analyzer.js';

/**
 * CANVASL Template structure matching the specification
 */
export class CanvaslTemplate {
  constructor(data) {
    this.frontmatter = data.frontmatter || {};
    this.body = data.body || '';
  }

  /**
   * Convert template to YAML string with frontmatter
   */
  toYAML() {
    const frontmatterYAML = yaml.dump(this.frontmatter, {
      lineWidth: 120,
      noRefs: true,
      sortKeys: false
    });
    
    return `---\n${frontmatterYAML}---\n\n${this.body}`;
  }

  /**
   * Convert template to JSON
   */
  toJSON() {
    return JSON.stringify({
      frontmatter: this.frontmatter,
      body: this.body
    }, null, 2);
  }
}

/**
 * Template Generator for voice commands
 */
export class TemplateGenerator {
  constructor() {
    this.grammarExtractor = new GrammarExtractor();
    this.semanticAnalyzer = new SemanticAnalyzer();
    this.apiMappings = {
      'location': { api: 'geolocation', method: 'getCurrentPosition', params: { enableHighAccuracy: true } },
      'notify': { api: 'notifications', method: 'showNotification', params: { title: 'CANVASL Alert', body: 'Voice command executed' } },
      'save': { api: 'indexeddb', method: 'put', params: { store: 'voice-data', key: 'last-command' } },
      'copy': { api: 'clipboard', method: 'writeText', params: {} },
      'render': { api: 'webgl', method: 'drawArrays', params: { canvas: 'visualization' } },
      'camera': { api: 'mediadevices', method: 'getUserMedia', params: { video: true } },
      'microphone': { api: 'mediadevices', method: 'getUserMedia', params: { audio: true } }
    };
  }

  /**
   * Generate template from voice command
   * Enhanced with NLP and semantic analysis
   * 
   * @param {string} transcript - Voice transcript (e.g., "generate template for location macro")
   * @returns {Promise<CanvaslTemplate>} Generated template
   */
  async generateFromCommand(transcript) {
    const lower = transcript.toLowerCase().trim();
    
    // Parse command pattern: "generate template for [keywords...]"
    const match = lower.match(/generate\s+template\s+for\s+(.+)/i);
    if (!match) {
      throw new Error('Invalid command format. Say: "generate template for [keywords]"');
    }

    const keywordsStr = match[1];
    const keywords = await this.extractKeywords(keywordsStr);
    
    if (keywords.length === 0) {
      throw new Error('No keywords found. Specify keywords like: "location", "notify", "save"');
    }

    // Generate template with enhanced keyword extraction
    return await this.generateTemplate(keywords);
  }

  /**
   * Extract keywords from transcript
   * Enhanced with semantic analysis
   * 
   * @param {string} text - Text containing keywords
   * @returns {Promise<string[]>} Array of keywords
   */
  async extractKeywords(text) {
    // Use grammar extractor for better keyword extraction
    const grammar = this.grammarExtractor.extractGrammar(text);
    const extractedKeywords = grammar.keywords.map(k => k.pattern);
    
    // Also use semantic analyzer to expand keywords
    const semanticKeywords = await this.semanticAnalyzer.mapIntentToCanvasl(text);
    
    // Combine and deduplicate
    const allKeywords = [
      ...extractedKeywords,
      ...semanticKeywords.canvaslKeywords
    ];
    
    return [...new Set(allKeywords)]; // Remove duplicates
  }

  /**
   * Generate CANVASL template from keywords
   * Enhanced with grammar patterns
   * 
   * @param {string[]} keywords - Array of keywords
   * @returns {Promise<CanvaslTemplate>} Generated template
   */
  async generateTemplate(keywords) {
    const templateId = `template-${Date.now()}`;
    const edges = keywords.map(k => `e_${k}`);
    
    // Build macros from keywords
    const macros = keywords.map(keyword => {
      const mapping = this.apiMappings[keyword.toLowerCase()] || {
        api: 'web_api',
        method: 'execute',
        params: {}
      };
      
      return {
        keyword: keyword,
        api: mapping.api,
        method: mapping.method,
        params: mapping.params,
        type: ['web_api', mapping.api]
      };
    });

    // Build frontmatter
    const frontmatter = {
      type: 'canvasl-template',
      id: templateId,
      dimension: 2,
      adjacency: {
        edges: edges,
        orientation: edges.map(() => 1)
      },
      speech: {
        input: {
          lang: 'en-US',
          continuous: true,
          interimResults: true,
          keywords: keywords
        },
        output: {
          voice: 'Google US English',
          rate: 1.0,
          pitch: 1.0
        }
      },
      macros: macros,
      validates: {
        homology: true,
        byzantine: false,
        accessibility: true
      },
      features: {
        version: '1.0.0',
        category: 'voice-controlled-app',
        generated: new Date().toISOString()
      }
    };

    // Build body
    const body = `# Voice-Generated CANVASL Template

Generated from voice command with keywords: ${keywords.join(', ')}

## Macros

${macros.map(m => `- **${m.keyword}**: ${m.api}.${m.method}()`).join('\n')}

## Usage

Say any of these keywords to trigger macros: ${keywords.map(k => `"${k}"`).join(', ')}

## Template Details

- **Template ID**: ${templateId}
- **Dimension**: 2 (C₂ cell)
- **Edges**: ${edges.length}
- **Macros**: ${macros.length}
- **Generated**: ${new Date().toISOString()}
`;

    return new CanvaslTemplate({ frontmatter, body });
  }

  /**
   * Generate directive template
   * 
   * @param {string} directiveType - Type of directive (e.g., "sync", "validate", "export")
   * @param {object} params - Directive parameters
   * @returns {CanvaslTemplate} Generated directive template
   */
  generateDirective(directiveType, params = {}) {
    const directiveId = `directive-${directiveType}-${Date.now()}`;
    
    const frontmatter = {
      type: 'canvasl-directive',
      id: directiveId,
      directive: directiveType,
      params: params,
      timestamp: new Date().toISOString()
    };

    const body = `# CANVASL Directive: ${directiveType}

Directive: ${directiveType}
Parameters: ${JSON.stringify(params, null, 2)}
`;

    return new CanvaslTemplate({ frontmatter, body });
  }

  /**
   * Generate template from existing structure
   * 
   * @param {object} structure - Template structure object
   * @returns {CanvaslTemplate} Generated template
   */
  generateFromStructure(structure) {
    return new CanvaslTemplate({
      frontmatter: structure.frontmatter || {},
      body: structure.body || ''
    });
  }
}
