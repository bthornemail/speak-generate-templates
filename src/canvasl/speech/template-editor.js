/**
 * Template Editor via Voice
 * 
 * Enables template editing using voice commands
 */

import { TemplateLibrary } from './template-library.js';

/**
 * Template Editor via Voice
 */
export class TemplateVoiceEditor {
  constructor() {
    this.library = new TemplateLibrary();
    this.currentTemplate = null;
    this.editMode = false;
    this.initialized = false;
  }

  /**
   * Initialize template editor
   */
  async initialize() {
    if (this.initialized) return;
    await this.library.initialize();
    this.initialized = true;
  }

  /**
   * Start editing a template
   * 
   * @param {string} templateId - Template ID to edit
   * @returns {Promise<Object>} Template object
   */
  async startEditing(templateId) {
    if (!this.initialized) {
      await this.initialize();
    }

    const template = await this.library.loadTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    this.currentTemplate = { ...template };
    this.editMode = true;

    return this.currentTemplate;
  }

  /**
   * Process voice command for template editing
   * 
   * @param {string} command - Voice command
   * @returns {Promise<Object>} Edit result
   */
  async processVoiceCommand(command) {
    if (!this.editMode || !this.currentTemplate) {
      throw new Error('Not in edit mode. Start editing a template first.');
    }

    const lower = command.toLowerCase();
    const result = {
      success: false,
      message: '',
      template: this.currentTemplate
    };

    // Edit frontmatter field
    if (lower.includes('set') || lower.includes('change')) {
      const match = command.match(/(?:set|change)\s+(\w+)\s+to\s+(.+)/i);
      if (match) {
        const field = match[1].toLowerCase();
        const value = match[2].trim();
        
        if (!this.currentTemplate.frontmatter) {
          this.currentTemplate.frontmatter = {};
        }

        // Try to parse value
        let parsedValue = value;
        if (value === 'true' || value === 'false') {
          parsedValue = value === 'true';
        } else if (!isNaN(value) && value !== '') {
          parsedValue = Number(value);
        } else if (value.startsWith('[') && value.endsWith(']')) {
          // Array value
          parsedValue = value.slice(1, -1).split(',').map(v => v.trim());
        }

        this.currentTemplate.frontmatter[field] = parsedValue;
        result.success = true;
        result.message = `Set ${field} to ${value}`;
      }
    }

    // Edit body content
    if (lower.includes('body') || lower.includes('content')) {
      const match = command.match(/(?:set|change|update)\s+(?:body|content)\s+to\s+(.+)/i);
      if (match) {
        this.currentTemplate.body = match[1];
        result.success = true;
        result.message = 'Updated body content';
      }
    }

    // Add to array field
    if (lower.includes('add') && lower.includes('to')) {
      const match = command.match(/add\s+(.+?)\s+to\s+(\w+)/i);
      if (match) {
        const value = match[1].trim();
        const field = match[2].toLowerCase();
        
        if (!this.currentTemplate.frontmatter) {
          this.currentTemplate.frontmatter = {};
        }

        if (!Array.isArray(this.currentTemplate.frontmatter[field])) {
          this.currentTemplate.frontmatter[field] = [];
        }

        this.currentTemplate.frontmatter[field].push(value);
        result.success = true;
        result.message = `Added ${value} to ${field}`;
      }
    }

    // Save template
    if (lower.includes('save') || lower.includes('store')) {
      await this.library.saveTemplate(this.currentTemplate.id, this.currentTemplate);
      result.success = true;
      result.message = 'Template saved';
    }

    // Cancel editing
    if (lower.includes('cancel') || lower.includes('discard')) {
      this.editMode = false;
      this.currentTemplate = null;
      result.success = true;
      result.message = 'Editing cancelled';
    }

    return result;
  }

  /**
   * Save current template
   * 
   * @returns {Promise<void>}
   */
  async saveTemplate() {
    if (!this.currentTemplate) {
      throw new Error('No template to save');
    }

    await this.library.saveTemplate(this.currentTemplate.id, this.currentTemplate);
    this.editMode = false;
  }

  /**
   * Cancel editing
   */
  cancelEditing() {
    this.editMode = false;
    this.currentTemplate = null;
  }

  /**
   * Get current template
   * 
   * @returns {Object|null} Current template
   */
  getCurrentTemplate() {
    return this.currentTemplate;
  }

  /**
   * Check if in edit mode
   * 
   * @returns {boolean} True if editing
   */
  isEditing() {
    return this.editMode;
  }
}

