/**
 * Noweb Expansion System
 * 
 * Expands Noweb references (<<block-name>>) in source blocks:
 * - Resolves named source blocks
 * - Inherits properties from referenced blocks
 * - Merges properties (local overrides referenced)
 * - Handles circular references
 * - Supports recursive expansion
 */

/**
 * Expanded Source Block
 * @typedef {Object} ExpandedSourceBlock
 * @property {string} name - Block name
 * @property {string} type - Source block type
 * @property {string} content - Expanded content (with Noweb references resolved)
 * @property {Object} headerArgs - Merged header arguments
 * @property {string[]} referencedBlocks - List of referenced block names
 * @property {boolean} hasCircularReference - Whether circular reference detected
 */

/**
 * Expand Noweb references in source block
 * 
 * @param {Object} sourceBlock - Source block to expand
 * @param {Map<string, Object>} namedBlocks - Map of name → source block
 * @param {Set<string>} [visited] - Visited block names (for circular detection)
 * @returns {ExpandedSourceBlock} Expanded source block
 */
export function expandNowebReferences(sourceBlock, namedBlocks, visited = new Set()) {
  if (!sourceBlock || !sourceBlock.content) {
    return {
      ...sourceBlock,
      content: sourceBlock?.content || '',
      referencedBlocks: [],
      hasCircularReference: false
    };
  }

  // Check for circular reference
  if (sourceBlock.name && visited.has(sourceBlock.name)) {
    return {
      ...sourceBlock,
      content: sourceBlock.content,
      referencedBlocks: [sourceBlock.name],
      hasCircularReference: true
    };
  }

  // Add current block to visited set
  const currentVisited = new Set(visited);
  if (sourceBlock.name) {
    currentVisited.add(sourceBlock.name);
  }

  // Find all Noweb references in content
  const nowebPattern = /<<([^>]+)>>/g;
  const references = [];
  let match;

  while ((match = nowebPattern.exec(sourceBlock.content)) !== null) {
    const refName = match[1].trim();
    if (!references.includes(refName)) {
      references.push(refName);
    }
  }

  // Expand each reference
  let expandedContent = sourceBlock.content;
  const allReferencedBlocks = [];
  let hasCircular = false;
  const mergedHeaderArgs = { ...sourceBlock.headerArgs };

  for (const refName of references) {
    const referencedBlock = namedBlocks.get(refName);
    
    if (!referencedBlock) {
      // Reference not found - leave as-is
      continue;
    }

    // Check for circular reference
    if (currentVisited.has(refName)) {
      hasCircular = true;
      allReferencedBlocks.push(refName);
      continue;
    }

    // Recursively expand referenced block
    const expandedRef = expandNowebReferences(
      referencedBlock,
      namedBlocks,
      currentVisited
    );

    // Replace reference with expanded content
    const refPattern = new RegExp(`<<${escapeRegex(refName)}>>`, 'g');
    expandedContent = expandedContent.replace(refPattern, expandedRef.content);

    // Merge header arguments (local overrides referenced)
    mergeHeaderArgs(mergedHeaderArgs, expandedRef.headerArgs);

    // Collect referenced blocks
    allReferencedBlocks.push(refName);
    if (expandedRef.referencedBlocks) {
      allReferencedBlocks.push(...expandedRef.referencedBlocks);
    }

    // Check for circular reference in expanded block
    if (expandedRef.hasCircularReference) {
      hasCircular = true;
    }
  }

  return {
    ...sourceBlock,
    content: expandedContent,
    headerArgs: mergedHeaderArgs,
    referencedBlocks: [...new Set(allReferencedBlocks)],
    hasCircularReference: hasCircular
  };
}

/**
 * Resolve block reference by name
 * 
 * @param {string} name - Block name
 * @param {Map<string, Object>} namedBlocks - Map of name → source block
 * @returns {Object|null} Referenced block or null
 */
export function resolveBlockReference(name, namedBlocks) {
  if (!name || !namedBlocks) {
    return null;
  }

  return namedBlocks.get(name) || null;
}

/**
 * Inherit properties from referenced block
 * 
 * @param {Object} sourceBlock - Source block
 * @param {Object} referencedBlock - Referenced block
 * @returns {Object} Source block with inherited properties
 */
export function inheritProperties(sourceBlock, referencedBlock) {
  if (!sourceBlock || !referencedBlock) {
    return sourceBlock;
  }

  const inherited = {
    ...sourceBlock,
    headerArgs: { ...referencedBlock.headerArgs, ...sourceBlock.headerArgs }
  };

  // Inherit CanvasL properties
  if (referencedBlock.canvasl) {
    inherited.canvasl = {
      ...referencedBlock.canvasl,
      ...sourceBlock.canvasl
    };
  } else if (sourceBlock.canvasl) {
    inherited.canvasl = sourceBlock.canvasl;
  }

  // Inherit tangle target if not set
  if (!inherited.tangle && referencedBlock.tangle) {
    inherited.tangle = referencedBlock.tangle;
  }

  // Inherit Noweb flag
  if (referencedBlock.noweb && !inherited.noweb) {
    inherited.noweb = true;
  }

  return inherited;
}

/**
 * Merge header arguments (local overrides referenced)
 * 
 * @param {Object} target - Target header args (modified in place)
 * @param {Object} source - Source header args to merge
 */
function mergeHeaderArgs(target, source) {
  if (!source) return;

  Object.keys(source).forEach(key => {
    // Don't override existing keys (local takes precedence)
    if (!(key in target)) {
      target[key] = source[key];
    } else if (key === 'canvasl' && typeof target[key] === 'object' && typeof source[key] === 'object') {
      // Merge nested canvasl properties
      target[key] = { ...source[key], ...target[key] };
    }
  });
}

/**
 * Detect circular references in source block
 * 
 * @param {Object} sourceBlock - Source block to check
 * @param {Map<string, Object>} namedBlocks - Map of name → source block
 * @returns {boolean} Whether circular reference detected
 */
export function detectCircularReferences(sourceBlock, namedBlocks) {
  if (!sourceBlock || !sourceBlock.content) {
    return false;
  }

  const visited = new Set();
  return hasCircularReference(sourceBlock, namedBlocks, visited);
}

/**
 * Check if source block has circular reference (recursive)
 * 
 * @param {Object} sourceBlock - Source block to check
 * @param {Map<string, Object>} namedBlocks - Map of name → source block
 * @param {Set<string>} visited - Visited block names
 * @returns {boolean} Whether circular reference detected
 */
function hasCircularReference(sourceBlock, namedBlocks, visited) {
  if (!sourceBlock || !sourceBlock.content) {
    return false;
  }

  // Check if current block is already visited
  if (sourceBlock.name && visited.has(sourceBlock.name)) {
    return true;
  }

  // Add current block to visited
  const currentVisited = new Set(visited);
  if (sourceBlock.name) {
    currentVisited.add(sourceBlock.name);
  }

  // Find Noweb references
  const nowebPattern = /<<([^>]+)>>/g;
  let match;

  while ((match = nowebPattern.exec(sourceBlock.content)) !== null) {
    const refName = match[1].trim();
    const referencedBlock = namedBlocks.get(refName);

    if (referencedBlock) {
      // Check if referenced block creates a cycle
      if (hasCircularReference(referencedBlock, namedBlocks, currentVisited)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Expand all Noweb references in AST
 * 
 * @param {Object} orgAST - Org Mode AST
 * @returns {Object} Org AST with expanded source blocks
 */
export function expandAllNowebReferences(orgAST) {
  if (!orgAST || !orgAST.sourceBlocks || !orgAST.namedBlocks) {
    return orgAST;
  }

  const expandedBlocks = orgAST.sourceBlocks.map(block => {
    if (block.noweb) {
      return expandNowebReferences(block, orgAST.namedBlocks);
    }
    return block;
  });

  return {
    ...orgAST,
    sourceBlocks: expandedBlocks
  };
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

