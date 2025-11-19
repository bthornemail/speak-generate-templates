/**
 * Self-Encoding Handler
 * 
 * Handles nested Org Mode source blocks (self-encoding):
 * - Detects nested Org Mode source blocks
 * - Parses nested Org Mode content recursively
 * - Handles property inheritance through nesting
 * - Supports meta-templates (templates generating templates)
 * - Prevents infinite recursion
 */

import { parseOrgDocument } from './org-parser.js';

/**
 * Self-Encoding Detection Result
 * @typedef {Object} SelfEncodingResult
 * @property {boolean} isSelfEncoded - Whether source block contains nested Org Mode
 * @property {Object|null} nestedAST - Parsed nested Org Mode AST (if self-encoded)
 * @property {number} nestingDepth - Nesting depth
 * @property {boolean} isMetaTemplate - Whether this is a meta-template
 */

/**
 * Maximum nesting depth to prevent infinite recursion
 */
const MAX_NESTING_DEPTH = 10;

/**
 * Detect nested Org Mode source blocks
 * 
 * @param {Object} sourceBlock - Source block to check
 * @returns {SelfEncodingResult} Detection result
 */
export function detectSelfEncoding(sourceBlock) {
  if (!sourceBlock || !sourceBlock.content) {
    return {
      isSelfEncoded: false,
      nestedAST: null,
      nestingDepth: 0,
      isMetaTemplate: false
    };
  }

  // Check if content contains Org Mode structure
  const hasHeadings = /^\*+\s/.test(sourceBlock.content.trim());
  const hasSourceBlocks = /#\+BEGIN_SRC/.test(sourceBlock.content);
  const hasPropertyDrawers = /:PROPERTIES:/.test(sourceBlock.content);
  
  const isSelfEncoded = hasHeadings || hasSourceBlocks || hasPropertyDrawers;
  
  // Check if it's a meta-template (template generating template)
  const isMetaTemplate = isSelfEncoded && 
    (sourceBlock.type === 'org' || sourceBlock.type === 'canvasl') &&
    /template|generate|create/.test(sourceBlock.content.toLowerCase());

  return {
    isSelfEncoded,
    nestedAST: null, // Will be parsed if needed
    nestingDepth: 0,
    isMetaTemplate
  };
}

/**
 * Parse nested Org Mode content recursively
 * 
 * @param {string} content - Nested Org Mode content
 * @param {number} depth - Current nesting depth
 * @param {Object} parentProperties - Properties from parent context
 * @returns {Object|null} Parsed nested AST or null
 */
export function parseNestedOrgMode(content, depth = 0, parentProperties = {}) {
  if (depth > MAX_NESTING_DEPTH) {
    console.warn(`Maximum nesting depth (${MAX_NESTING_DEPTH}) exceeded`);
    return null;
  }

  if (!content || typeof content !== 'string') {
    return null;
  }

  try {
    // Parse nested Org Mode document
    const nestedAST = parseOrgDocument(content);
    
    // Inherit properties from parent
    if (parentProperties) {
      nestedAST.metadata = {
        ...nestedAST.metadata,
        ...parentProperties,
        nestingDepth: depth
      };
    }

    // Recursively check for nested self-encoding in source blocks
    nestedAST.sourceBlocks.forEach(block => {
      const selfEncoding = detectSelfEncoding(block);
      if (selfEncoding.isSelfEncoded && depth < MAX_NESTING_DEPTH) {
        block.nestedAST = parseNestedOrgMode(
          block.content,
          depth + 1,
          {
            ...parentProperties,
            parentBlockName: block.name,
            parentBlockType: block.type
          }
        );
        block.nestingDepth = depth + 1;
        block.isSelfEncoded = true;
      }
    });

    return nestedAST;
  } catch (error) {
    console.error(`Error parsing nested Org Mode at depth ${depth}:`, error);
    return null;
  }
}

/**
 * Handle meta-template (template generating template)
 * 
 * @param {Object} templateBlock - Template source block
 * @returns {Object|null} Generated template AST or null
 */
export function handleMetaTemplate(templateBlock) {
  if (!templateBlock || !templateBlock.content) {
    return null;
  }

  const selfEncoding = detectSelfEncoding(templateBlock);
  
  if (!selfEncoding.isMetaTemplate) {
    return null;
  }

  // Parse nested Org Mode content
  const nestedAST = parseNestedOrgMode(
    templateBlock.content,
    0,
    {
      isMetaTemplate: true,
      parentTemplate: templateBlock.name
    }
  );

  if (!nestedAST) {
    return null;
  }

  // Extract generated template structure
  const generatedTemplate = {
    name: templateBlock.name ? `${templateBlock.name}-generated` : 'generated-template',
    type: 'org',
    content: templateBlock.content,
    nestedAST,
    isMetaTemplate: true,
    sourceTemplate: templateBlock.name
  };

  return generatedTemplate;
}

/**
 * Prevent infinite recursion by checking depth
 * 
 * @param {Object} sourceBlock - Source block to check
 * @param {number} depth - Current depth
 * @returns {boolean} Whether recursion should be prevented
 */
export function preventRecursion(sourceBlock, depth) {
  if (depth > MAX_NESTING_DEPTH) {
    return true;
  }

  // Check for circular self-reference
  if (sourceBlock.name && sourceBlock.content) {
    const selfRefPattern = new RegExp(`<<${escapeRegex(sourceBlock.name)}>>`);
    if (selfRefPattern.test(sourceBlock.content)) {
      return true;
    }
  }

  return false;
}

/**
 * Process all self-encoded source blocks in AST
 * 
 * @param {Object} orgAST - Org Mode AST
 * @returns {Object} AST with processed self-encoding
 */
export function processSelfEncoding(orgAST) {
  if (!orgAST || !orgAST.sourceBlocks) {
    return orgAST;
  }

  const processedBlocks = orgAST.sourceBlocks.map(block => {
    const selfEncoding = detectSelfEncoding(block);
    
    if (selfEncoding.isSelfEncoded) {
      // Parse nested content
      const nestedAST = parseNestedOrgMode(block.content, 0, {
        parentBlockName: block.name,
        parentBlockType: block.type
      });

      return {
        ...block,
        isSelfEncoded: true,
        nestingDepth: 0,
        nestedAST,
        isMetaTemplate: selfEncoding.isMetaTemplate
      };
    }

    return block;
  });

  // Process meta-templates
  const metaTemplates = processedBlocks
    .filter(block => block.isMetaTemplate)
    .map(block => handleMetaTemplate(block))
    .filter(template => template !== null);

  return {
    ...orgAST,
    sourceBlocks: processedBlocks,
    metaTemplates
  };
}

/**
 * Extract nested source blocks from self-encoded block
 * 
 * @param {Object} sourceBlock - Self-encoded source block
 * @returns {Object[]} Extracted nested source blocks
 */
export function extractNestedSourceBlocks(sourceBlock) {
  if (!sourceBlock || !sourceBlock.isSelfEncoded || !sourceBlock.nestedAST) {
    return [];
  }

  const nestedBlocks = [];
  
  function collectBlocks(ast) {
    if (!ast || !ast.sourceBlocks) {
      return;
    }

    ast.sourceBlocks.forEach(block => {
      nestedBlocks.push({
        ...block,
        parentBlockName: sourceBlock.name,
        parentBlockType: sourceBlock.type
      });

      // Recursively collect nested blocks
      if (block.isSelfEncoded && block.nestedAST) {
        collectBlocks(block.nestedAST);
      }
    });
  }

  collectBlocks(sourceBlock.nestedAST);
  return nestedBlocks;
}

/**
 * Escape special regex characters
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

