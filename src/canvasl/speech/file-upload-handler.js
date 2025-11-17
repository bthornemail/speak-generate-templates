/**
 * File Upload Handler for MD Parsing
 * 
 * Handles direct file uploads for markdown parsing
 */

import { parseMdFrontmatter, parseAndValidate } from './frontmatter-parser.js';

/**
 * File Upload Handler
 */
export class FileUploadHandler {
  /**
   * Handle file upload
   * 
   * @param {File} file - File to upload
   * @returns {Promise<Object>} Parsed content
   */
  async handleFileUpload(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file type
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      throw new Error('File must be a markdown file (.md or .markdown)');
    }

    // Read file content
    const text = await this.readFileAsText(file);

    // Parse and validate
    const parsed = await parseAndValidate(text);

    return {
      filename: file.name,
      size: file.size,
      parsed,
      raw: text
    };
  }

  /**
   * Read file as text
   * 
   * @param {File} file - File to read
   * @returns {Promise<string>} File content
   */
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Create file input element
   * 
   * @param {Function} onFileSelect - Callback when file is selected
   * @returns {HTMLInputElement} File input element
   */
  createFileInput(onFileSelect) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown';
    input.style.display = 'none';
    
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const result = await this.handleFileUpload(file);
          onFileSelect(result);
        } catch (error) {
          console.error('File upload error:', error);
          onFileSelect({ error: error.message });
        }
      }
    });

    return input;
  }

  /**
   * Trigger file selection dialog
   * 
   * @param {Function} onFileSelect - Callback when file is selected
   */
  triggerFileSelect(onFileSelect) {
    const input = this.createFileInput(onFileSelect);
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }
}

