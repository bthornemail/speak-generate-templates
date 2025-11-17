/**
 * CANVASL Frontmatter Parser
 * 
 * Parses Markdown frontmatter (YAML) and extracts CANVASL template structure
 * Enhanced with AST validation
 */

import * as yaml from 'js-yaml';
import { ASTBuilder } from '../ast/ast-builder.js';
import { ASTValidator } from '../ast/ast-validator.js';

/**
 * Parse Markdown frontmatter from content
 * 
 * @param {string} mdContent - Markdown content with YAML frontmatter
 * @returns {object} Parsed result with frontmatter and body
 */
export function parseMdFrontmatter(mdContent) {
  if (!mdContent || typeof mdContent !== 'string') {
    throw new Error('Invalid markdown content');
  }

  // Split by frontmatter delimiters
  const parts = mdContent.split(/^---\s*$/m);
  
  if (parts.length < 3) {
    throw new Error('Invalid MD: No frontmatter found. Expected format: ---\\nfrontmatter\\n---\\n\\nbody');
  }

  try {
    // Parse frontmatter (between first and second ---)
    const frontmatterYAML = parts[1].trim();
    const frontmatter = yaml.load(frontmatterYAML);
    
    // Extract body (everything after second ---)
    const body = parts.slice(2).join('---').trim();

    return {
      frontmatter: frontmatter || {},
      body: body,
      valid: true
    };
  } catch (error) {
    throw new Error(`Failed to parse frontmatter: ${error.message}`);
  }
}

/**
 * Extract frontmatter only (without body)
 * 
 * @param {string} mdContent - Markdown content
 * @returns {object} Parsed frontmatter
 */
export function extractFrontmatter(mdContent) {
  const parsed = parseMdFrontmatter(mdContent);
  return parsed.frontmatter;
}

/**
 * Extract body only (without frontmatter)
 * 
 * @param {string} mdContent - Markdown content
 * @returns {string} Body content
 */
export function extractBody(mdContent) {
  const parsed = parseMdFrontmatter(mdContent);
  return parsed.body;
}

/**
 * Validate CANVASL template structure
 * 
 * @param {object} frontmatter - Template frontmatter
 * @returns {object} Validation result
 */
export function validateTemplate(frontmatter) {
  const errors = [];
  const warnings = [];

  // Check required fields
  if (!frontmatter.type) {
    errors.push('Missing required field: type');
  } else if (frontmatter.type !== 'canvasl-template' && frontmatter.type !== 'canvasl-directive') {
    warnings.push(`Unknown type: ${frontmatter.type}`);
  }

  // Validate speech configuration
  if (frontmatter.speech) {
    if (!frontmatter.speech.input) {
      errors.push('Missing speech.input configuration');
    } else {
      if (!frontmatter.speech.input.lang) {
        warnings.push('Missing speech.input.lang (defaults to en-US)');
      }
      if (!frontmatter.speech.input.keywords || frontmatter.speech.input.keywords.length === 0) {
        warnings.push('No keywords specified in speech.input');
      }
    }

    if (!frontmatter.speech.output) {
      warnings.push('Missing speech.output configuration');
    }
  }

  // Validate macros
  if (frontmatter.macros) {
    if (!Array.isArray(frontmatter.macros)) {
      errors.push('macros must be an array');
    } else {
      frontmatter.macros.forEach((macro, index) => {
        if (!macro.keyword) {
          errors.push(`Macro ${index}: missing keyword`);
        }
        if (!macro.api) {
          errors.push(`Macro ${index}: missing api`);
        }
        if (!macro.method) {
          errors.push(`Macro ${index}: missing method`);
        }
      });
    }
  }

  // Validate adjacency
  if (frontmatter.adjacency) {
    if (!frontmatter.adjacency.edges || !Array.isArray(frontmatter.adjacency.edges)) {
      errors.push('adjacency.edges must be an array');
    }
    if (!frontmatter.adjacency.orientation || !Array.isArray(frontmatter.adjacency.orientation)) {
      errors.push('adjacency.orientation must be an array');
    }
    if (frontmatter.adjacency.edges && frontmatter.adjacency.orientation) {
      if (frontmatter.adjacency.edges.length !== frontmatter.adjacency.orientation.length) {
        errors.push('adjacency.edges and orientation arrays must have same length');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}

/**
 * Convert parsed template to CANVASL structure
 * 
 * @param {object} parsed - Parsed frontmatter and body
 * @returns {object} CANVASL template structure
 */
export function toCanvaslStructure(parsed) {
  // Ensure frontmatter exists
  const frontmatter = parsed.frontmatter || {};
  
  const validation = validateTemplate(frontmatter);
  
  // Don't throw on validation failure - return structure with validation errors
  // This allows the UI to display validation errors instead of crashing

  return {
    id: frontmatter.id || `template-${Date.now()}`,
    type: frontmatter.type || 'canvasl-template',
    dimension: frontmatter.dimension ?? 2,
    frontmatter: frontmatter,
    body: parsed.body || '',
    validation: validation
  };
}

/**
 * Parse and validate MD content
 * Enhanced with AST validation
 * 
 * @param {string} mdContent - Markdown content
 * @returns {Promise<object>} Complete parsed and validated structure
 */
export async function parseAndValidate(mdContent) {
  try {
    const parsed = parseMdFrontmatter(mdContent);
    const structure = toCanvaslStructure(parsed);
    
    // Ensure validation object exists
    if (!structure.validation) {
      structure.validation = {
        valid: false,
        errors: ['Validation object missing'],
        warnings: []
      };
    }
    
    // Add AST validation
    try {
      const astBuilder = new ASTBuilder();
      const ast = await astBuilder.buildAST(mdContent);
      const astValidator = new ASTValidator();
      const astValidation = astValidator.validate(ast);
      
      // Merge AST validation results
      if (astValidation) {
        structure.validation.errors.push(...(astValidation.errors || []));
        structure.validation.warnings.push(...(astValidation.warnings || []));
        structure.validation.valid = structure.validation.valid && (astValidation.valid !== false);
      }
      structure.ast = ast;
    } catch (error) {
      structure.validation.warnings.push(`AST validation error: ${error.message}`);
    }
    
    return structure;
  } catch (error) {
    // Return structure with error instead of throwing
    return {
      id: `error-${Date.now()}`,
      type: 'error',
      dimension: 0,
      frontmatter: {},
      body: mdContent || '',
      validation: {
        valid: false,
        errors: [error.message || 'Unknown parsing error'],
        warnings: []
      }
    };
  }
}
