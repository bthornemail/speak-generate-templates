/**
 * Diagnostics Handler
 * 
 * Provides linting and validation diagnostics
 */

import { ASTService } from '../services/ast-service.js';
import { SemanticService } from '../services/semantic-service.js';

export class DiagnosticsHandler {
  constructor(astService, semanticService) {
    this.ast = astService;
    this.semantic = semanticService;
  }

  /**
   * Handle diagnostics request
   * 
   * @param {string} uri - Document URI
   * @param {string} content - Document content
   * @returns {Promise<Array>} Diagnostics
   */
  async handleDiagnostics(uri, content) {
    const diagnostics = [];
    
    try {
      // Build and validate AST
      const { ast, validation } = await this.ast.buildAndValidate(uri, content);
      
      // Add AST validation errors
      validation.errors.forEach((error, index) => {
        diagnostics.push({
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
          },
          severity: 1, // Error
          message: error,
          source: 'canvasl-ast'
        });
      });
      
      // Add AST validation warnings
      validation.warnings.forEach((warning, index) => {
        diagnostics.push({
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
          },
          severity: 2, // Warning
          message: warning,
          source: 'canvasl-ast'
        });
      });
      
      // Add semantic validation
      if (ast.frontmatter) {
        try {
          const frontmatter = this.extractFrontmatter(content);
          const semanticValidation = await this.semantic.validateSemantics({
            frontmatter
          });
          
          semanticValidation.errors.forEach(error => {
            diagnostics.push({
              range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 0 }
              },
              severity: 1, // Error
              message: `Semantic: ${error}`,
              source: 'canvasl-semantic'
            });
          });
          
          semanticValidation.warnings.forEach(warning => {
            diagnostics.push({
              range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 0 }
              },
              severity: 2, // Warning
              message: `Semantic: ${warning}`,
              source: 'canvasl-semantic'
            });
          });
        } catch (error) {
          // Ignore semantic validation errors
        }
      }
      
    } catch (error) {
      diagnostics.push({
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 }
        },
        severity: 1, // Error
        message: `AST build error: ${error.message}`,
        source: 'canvasl-ast'
      });
    }
    
    return diagnostics;
  }

  /**
   * Extract frontmatter from content
   * 
   * @param {string} content - Document content
   * @returns {object} Frontmatter object
   */
  extractFrontmatter(content) {
    const parts = content.split(/^---\s*$/m);
    if (parts.length < 3) {
      return null;
    }
    
    try {
      // Simple YAML parsing - in production would use js-yaml
      const yamlContent = parts[1].trim();
      // For now, return a basic structure
      // In production, would parse YAML properly
      return {};
    } catch (error) {
      return null;
    }
  }
}

