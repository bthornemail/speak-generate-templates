/**
 * Template Library Manager
 * 
 * Manages template save/load operations
 */

import { IndexedDBStore } from '../storage/idb.js';

/**
 * Template Library Manager
 */
export class TemplateLibrary {
  constructor() {
    this.db = new IndexedDBStore();
    this.initialized = false;
  }

  /**
   * Initialize template library
   */
  async initialize() {
    if (this.initialized) return;
    await this.db.init();
    this.initialized = true;
  }

  /**
   * Save template
   * 
   * @param {string} id - Template ID
   * @param {Object} template - Template object
   * @param {string} template.name - Template name
   * @param {Object} template.frontmatter - Frontmatter
   * @param {string} template.body - Body content
   * @returns {Promise<void>}
   */
  async saveTemplate(id, template) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.db.saveTemplate(id, template);
  }

  /**
   * Load template
   * 
   * @param {string} id - Template ID
   * @returns {Promise<Object|null>} Template or null
   */
  async loadTemplate(id) {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.db.loadTemplate(id);
  }

  /**
   * List all templates
   * 
   * @returns {Promise<Array>} Array of templates
   */
  async listTemplates() {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.db.listTemplates();
  }

  /**
   * Delete template
   * 
   * @param {string} id - Template ID
   * @returns {Promise<void>}
   */
  async deleteTemplate(id) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.db.deleteTemplate(id);
  }

  /**
   * Export template to file
   * 
   * @param {Object} template - Template object
   * @returns {Blob} Markdown file blob
   */
  exportTemplateToFile(template) {
    const yaml = this.frontmatterToYAML(template.frontmatter);
    const content = `---\n${yaml}\n---\n\n${template.body || ''}`;
    return new Blob([content], { type: 'text/markdown' });
  }

  /**
   * Convert frontmatter to YAML string
   * 
   * @param {Object} frontmatter - Frontmatter object
   * @returns {string} YAML string
   */
  frontmatterToYAML(frontmatter) {
    // Simple YAML conversion (for production, use js-yaml)
    const lines = [];
    for (const [key, value] of Object.entries(frontmatter)) {
      if (Array.isArray(value)) {
        lines.push(`${key}:`);
        value.forEach(item => {
          if (typeof item === 'object') {
            lines.push(`  - ${JSON.stringify(item)}`);
          } else {
            lines.push(`  - ${item}`);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        lines.push(`${key}:`);
        for (const [subKey, subValue] of Object.entries(value)) {
          lines.push(`  ${subKey}: ${subValue}`);
        }
      } else {
        lines.push(`${key}: ${value}`);
      }
    }
    return lines.join('\n');
  }

  /**
   * Download template as file
   * 
   * @param {Object} template - Template object
   * @param {string} filename - Optional filename
   */
  downloadTemplate(template, filename = null) {
    const blob = this.exportTemplateToFile(template);
    const name = filename || `${template.id || 'template'}-${Date.now()}.md`;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

