/**
 * Semantic Service
 * 
 * Service for semantic analysis and template suggestions
 */

import { SemanticAnalyzer } from '../../src/canvasl/nlp/semantic-analyzer.js';

export class SemanticService {
  constructor() {
    this.analyzer = new SemanticAnalyzer();
    this.initialized = false;
  }

  /**
   * Initialize semantic service
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this.initialized) {
      await this.analyzer.initialize();
      this.initialized = true;
    }
  }

  /**
   * Expand keywords semantically
   * 
   * @param {Array} keywords - Keywords to expand
   * @returns {Promise<Array>} Expanded keywords
   */
  async expandKeywords(keywords) {
    await this.initialize();
    return await this.analyzer.expandKeywords(keywords);
  }

  /**
   * Suggest templates based on user intent
   * 
   * @param {string} userIntent - User intent text
   * @param {Array} existingTemplates - Existing templates
   * @returns {Promise<Array>} Suggested templates
   */
  async suggestTemplates(userIntent, existingTemplates) {
    await this.initialize();
    return await this.analyzer.suggestTemplates(userIntent, existingTemplates);
  }

  /**
   * Map user intent to CANVASL constructs
   * 
   * @param {string} userIntent - User intent text
   * @returns {Promise<object>} Mapped CANVASL constructs
   */
  async mapIntentToCanvasl(userIntent) {
    await this.initialize();
    return await this.analyzer.mapIntentToCanvasl(userIntent);
  }

  /**
   * Validate template semantics
   * 
   * @param {object} template - Template to validate
   * @returns {Promise<object>} Validation result
   */
  async validateSemantics(template) {
    await this.initialize();
    return await this.analyzer.validateTemplateSemantics(template);
  }
}

