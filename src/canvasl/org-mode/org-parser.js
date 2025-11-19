/**
 * Org Mode Parser Module
 * 
 * Parses Org Mode documents to AST and extracts:
 * - Headings with hierarchy
 * - Source blocks with headers
 * - Property drawers
 * - Noweb references
 * - Nested structures (self-encoding)
 */

import { parse } from 'orga';

/**
 * Org Mode AST Node Types
 * @typedef {Object} OrgASTNode
 * @property {string} type - Node type (heading, src-block, drawer, etc.)
 * @property {*} children - Child nodes
 * @property {Object} [properties] - Node properties
 */

/**
 * Org Mode Heading
 * @typedef {Object} OrgHeading
 * @property {string} id - Heading ID (slugified)
 * @property {number} level - Heading level (1-6)
 * @property {string} title - Heading title
 * @property {OrgHeading[]} children - Child headings
 * @property {OrgSourceBlock[]} sourceBlocks - Source blocks under this heading
 * @property {OrgPropertyDrawer} [propertyDrawer] - Property drawer
 * @property {string} [parentId] - Parent heading ID
 */

/**
 * Org Mode Source Block
 * @typedef {Object} OrgSourceBlock
 * @property {string} name - Block name (from #+NAME:)
 * @property {string} type - Source block type (svg, javascript, canvasl, org, etc.)
 * @property {string} content - Source block content
 * @property {Object} headerArgs - Header arguments
 * @property {string} [tangle] - Tangle target (from :tangle directive)
 * @property {boolean} [noweb] - Noweb expansion enabled
 * @property {string} [headingId] - Parent heading ID
 * @property {Object} [canvasl] - CanvasL-specific properties
 * @property {string} [canvasl.projection] - Projection type (projective/affine)
 * @property {string} [canvasl.dimension] - Chain complex dimension
 * @property {string} [canvasl.protocol] - Protocol handler
 * @property {boolean} [canvasl.rpc] - RPC command flag
 */

/**
 * Org Mode Property Drawer
 * @typedef {Object} OrgPropertyDrawer
 * @property {string} [CANVASL_CID] - Content identifier
 * @property {string} [CANVASL_PARENT] - Parent CID
 * @property {string} [CANVASL_SIGNATURE] - Digital signature
 * @property {string} [CANVASL_JSONL_REF] - JSONL reference
 * @property {string} [CANVASL_DIMENSION] - Chain complex dimension
 * @property {string} [CANVASL_TOPOLOGY] - Topology structure
 * @property {string} [CANVASL_PROTOCOL] - Protocol handler type
 * @property {string} [CANVASL_BIP32_PATH] - BIP32 path
 * @property {Object} [custom] - Custom properties
 */

/**
 * Org Mode AST Structure
 * @typedef {Object} OrgAST
 * @property {OrgHeading[]} headings - All headings in document
 * @property {OrgSourceBlock[]} sourceBlocks - All source blocks
 * @property {Map<string, OrgSourceBlock>} namedBlocks - Named source blocks (for Noweb)
 * @property {OrgPropertyDrawer[]} propertyDrawers - All property drawers
 * @property {Object} metadata - Document metadata
 */

/**
 * Parse Org Mode document to AST
 * 
 * @param {string} content - Org Mode document content
 * @returns {OrgAST} Parsed AST structure
 */
export function parseOrgDocument(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid Org Mode content: must be a non-empty string');
  }

  // Parse with orga
  const rawAST = parse(content);
  
  // Extract structured components
  const headings = extractHeadingsInternal(rawAST);
  const sourceBlocks = extractSourceBlocksInternal(rawAST);
  const propertyDrawers = extractPropertyDrawersInternal(rawAST);
  const namedBlocks = buildNamedBlocksMap(sourceBlocks);
  
  // Build heading hierarchy
  const headingHierarchy = buildHeadingHierarchy(headings);
  
  // Associate source blocks and property drawers with headings
  associateWithHeadings(headingHierarchy, sourceBlocks, propertyDrawers);

  return {
    headings: headingHierarchy,
    sourceBlocks,
    namedBlocks,
    propertyDrawers,
    metadata: extractMetadata(rawAST)
  };
}

/**
 * Extract headings from AST (internal)
 * 
 * @param {OrgASTNode} ast - Raw AST from orga
 * @returns {OrgHeading[]} Extracted headings
 */
function extractHeadingsInternal(ast) {
  const headings = [];
  
  function traverse(node, parentId = null) {
    if (!node || typeof node !== 'object') return;
    
    // orga uses 'headline' type within 'section' nodes
    if (node.type === 'headline') {
      const level = node.level || (node.children?.find(c => c.type === 'stars')?.level) || 1;
      const title = extractHeadingTitle(node);
      const id = slugifyHeading(title);
      
      const heading = {
        id,
        level,
        title,
        children: [],
        sourceBlocks: [],
        parentId,
        raw: node
      };
      
      headings.push(heading);
      
      // Process children (sections contain nested headlines)
      if (node.children) {
        node.children.forEach(child => {
          if (child.type === 'section') {
            // Process nested sections
            traverse(child, id);
          }
        });
      }
    } else if (node.type === 'section') {
      // Process section's headline and nested sections
      if (node.children) {
        node.children.forEach(child => {
          if (child.type === 'headline') {
            traverse(child, parentId);
          } else if (child.type === 'section') {
            traverse(child, parentId);
          }
        });
      }
    } else if (node.children) {
      // Continue traversing
      node.children.forEach(child => traverse(child, parentId));
    }
  }
  
  if (ast.children) {
    ast.children.forEach(child => traverse(child));
  }
  
  return headings;
}

/**
 * Extract heading title from AST node
 * 
 * @param {OrgASTNode} node - Heading node
 * @returns {string} Heading title
 */
function extractHeadingTitle(node) {
  if (!node.children) return '';
  
  const titleParts = [];
  
  function extractText(child) {
    // Skip 'stars' type (the asterisks)
    if (child.type === 'stars') return;
    
    if (child.type === 'text' || child.type === 'text.plain') {
      titleParts.push(child.value || '');
    } else if (child.children) {
      child.children.forEach(extractText);
    }
  }
  
  node.children.forEach(extractText);
  return titleParts.join('').trim();
}

/**
 * Slugify heading title to ID
 * 
 * @param {string} title - Heading title
 * @returns {string} Slugified ID
 */
function slugifyHeading(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Extract source blocks from AST (internal)
 * 
 * @param {OrgASTNode} ast - Raw AST from orga
 * @returns {OrgSourceBlock[]} Extracted source blocks
 */
function extractSourceBlocksInternal(ast) {
  const sourceBlocks = [];
  
  function traverse(node) {
    if (!node || typeof node !== 'object') return;
    
    // orga uses 'block' type with name 'SRC' for source blocks
    if (node.type === 'block' && node.name === 'SRC') {
      const sourceBlock = parseSourceBlock(node);
      if (sourceBlock) {
        sourceBlocks.push(sourceBlock);
      }
    }
    
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  if (ast.children) {
    ast.children.forEach(traverse);
  }
  
  return sourceBlocks;
}

/**
 * Parse source block node
 * 
 * @param {OrgASTNode} node - Source block node
 * @returns {OrgSourceBlock|null} Parsed source block
 */
function parseSourceBlock(node) {
  const params = node.params || [];
  const type = params[0] || 'text';
  const content = node.value || node.content || '';
  
  // Extract header arguments from attributes or params
  const headerArgs = parseHeaderArgs(node);
  
  // Extract name (for Noweb references) - check for #+NAME: directive in siblings
  const name = extractBlockName(node);
  
  // Extract tangle target from header args or attributes
  const tangle = headerArgs.tangle || node.attributes?.tangle || null;
  
  // Extract Noweb flag
  const noweb = headerArgs.noweb === 'yes' || headerArgs.noweb === true || node.attributes?.noweb === 'yes';
  
  // Extract CanvasL properties
  const canvasl = extractCanvaslProperties(headerArgs);
  
  return {
    name,
    type,
    content,
    headerArgs,
    tangle,
    noweb,
    canvasl,
    raw: node
  };
}

/**
 * Extract block name from node
 * 
 * @param {OrgASTNode} node - Source block node
 * @returns {string|null} Block name
 */
function extractBlockName(node) {
  // Check for #+NAME: directive in siblings or parent
  if (node.meta && node.meta.name) {
    return node.meta.name;
  }
  
  // Check for name property
  if (node.name) {
    return node.name;
  }
  
  return null;
}

/**
 * Parse header arguments from source block
 * 
 * @param {OrgASTNode} node - Source block node
 * @returns {Object} Header arguments
 */
function parseHeaderArgs(node) {
  const headerArgs = {};
  
  // Parse from params
  if (node.params && node.params.length > 1) {
    const argsString = node.params.slice(1).join(' ');
    parseHeaderArgsString(argsString, headerArgs);
  }
  
  // Parse from meta
  if (node.meta) {
    Object.assign(headerArgs, node.meta);
  }
  
  // Parse from header-args
  if (node['header-args']) {
    Object.assign(headerArgs, node['header-args']);
  }
  
  return headerArgs;
}

/**
 * Parse header arguments string
 * 
 * @param {string} argsString - Header arguments string
 * @param {Object} headerArgs - Object to populate
 */
function parseHeaderArgsString(argsString, headerArgs) {
  if (!argsString) return;
  
  // Parse :key value pairs
  const regex = /:(\w+)(?:\s+([^:]+))?/g;
  let match;
  
  while ((match = regex.exec(argsString)) !== null) {
    const key = match[1];
    const value = match[2] ? match[2].trim().replace(/^["']|["']$/g, '') : true;
    headerArgs[key] = value;
  }
  
  // Parse header-args:canvasl:* format
  const canvaslRegex = /:header-args:canvasl:(\w+)\s+([^\s:]+)/g;
  while ((match = canvaslRegex.exec(argsString)) !== null) {
    const key = match[1];
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    if (!headerArgs.canvasl) {
      headerArgs.canvasl = {};
    }
    headerArgs.canvasl[key] = value;
  }
}

/**
 * Extract CanvasL properties from header args
 * 
 * @param {Object} headerArgs - Header arguments
 * @returns {Object} CanvasL properties
 */
function extractCanvaslProperties(headerArgs) {
  const canvasl = {};
  
  if (headerArgs.canvasl) {
    Object.assign(canvasl, headerArgs.canvasl);
  }
  
  // Extract from header-args:canvasl:* format
  Object.keys(headerArgs).forEach(key => {
    if (key.startsWith('header-args:canvasl:')) {
      const propName = key.replace('header-args:canvasl:', '');
      canvasl[propName] = headerArgs[key];
    }
  });
  
  return Object.keys(canvasl).length > 0 ? canvasl : undefined;
}

/**
 * Extract property drawers from AST (internal)
 * 
 * @param {OrgASTNode} ast - Raw AST from orga
 * @returns {OrgPropertyDrawer[]} Extracted property drawers
 */
function extractPropertyDrawersInternal(ast) {
  const propertyDrawers = [];
  
  function traverse(node, headingId = null) {
    if (!node || typeof node !== 'object') return;
    
    if (node.type === 'drawer' && node.name === 'PROPERTIES') {
      const drawer = parsePropertyDrawer(node, headingId);
      if (drawer) {
        propertyDrawers.push(drawer);
      }
    }
    
    if (node.type === 'heading') {
      const title = extractHeadingTitle(node);
      const id = slugifyHeading(title);
      
      if (node.children) {
        node.children.forEach(child => traverse(child, id));
      }
    } else if (node.children) {
      node.children.forEach(child => traverse(child, headingId));
    }
  }
  
  if (ast.children) {
    ast.children.forEach(child => traverse(child));
  }
  
  return propertyDrawers;
}

/**
 * Parse property drawer node
 * 
 * @param {OrgASTNode} node - Property drawer node
 * @param {string|null} headingId - Associated heading ID
 * @returns {OrgPropertyDrawer|null} Parsed property drawer
 */
function parsePropertyDrawer(node, headingId) {
  const drawer = {
    headingId,
    custom: {}
  };
  
  // Parse properties from node content
  const content = node.value || node.content || '';
  const lines = content.split('\n');
  
  lines.forEach(line => {
    const match = line.match(/^:(\w+):\s*(.+)$/);
    if (match) {
      const key = match[1];
      const value = match[2].trim();
      
      if (key.startsWith('CANVASL_')) {
        drawer[key] = value;
      } else {
        drawer.custom[key] = value;
      }
    }
  });
  
  return Object.keys(drawer).length > 2 ? drawer : null; // More than just headingId and custom
}

/**
 * Build map of named source blocks for Noweb references
 * 
 * @param {OrgSourceBlock[]} sourceBlocks - All source blocks
 * @returns {Map<string, OrgSourceBlock>} Map of name → source block
 */
function buildNamedBlocksMap(sourceBlocks) {
  const map = new Map();
  
  sourceBlocks.forEach(block => {
    if (block.name) {
      map.set(block.name, block);
    }
  });
  
  return map;
}

/**
 * Build heading hierarchy from flat list
 * 
 * @param {OrgHeading[]} headings - Flat list of headings
 * @returns {OrgHeading[]} Root headings with children
 */
function buildHeadingHierarchy(headings) {
  const rootHeadings = [];
  const headingMap = new Map();
  
  // Create map of heading ID → heading
  headings.forEach(heading => {
    headingMap.set(heading.id, heading);
  });
  
  // Build hierarchy
  headings.forEach(heading => {
    if (heading.parentId) {
      const parent = headingMap.get(heading.parentId);
      if (parent) {
        parent.children.push(heading);
      } else {
        // Orphan heading, add to root
        rootHeadings.push(heading);
      }
    } else {
      // Root heading
      rootHeadings.push(heading);
    }
  });
  
  return rootHeadings;
}

/**
 * Associate source blocks and property drawers with headings
 * 
 * @param {OrgHeading[]} headings - Heading hierarchy
 * @param {OrgSourceBlock[]} sourceBlocks - All source blocks
 * @param {OrgPropertyDrawer[]} propertyDrawers - All property drawers
 */
function associateWithHeadings(headings, sourceBlocks, propertyDrawers) {
  const headingMap = new Map();
  
  function buildMap(headingList) {
    headingList.forEach(heading => {
      headingMap.set(heading.id, heading);
      if (heading.children.length > 0) {
        buildMap(heading.children);
      }
    });
  }
  
  buildMap(headings);
  
  // Associate property drawers
  propertyDrawers.forEach(drawer => {
    if (drawer.headingId) {
      const heading = headingMap.get(drawer.headingId);
      if (heading) {
        heading.propertyDrawer = drawer;
      }
    }
  });
  
  // Note: Source block association would require position tracking
  // For now, source blocks are kept at document level
}

/**
 * Extract document metadata
 * 
 * @param {OrgASTNode} ast - Raw AST
 * @returns {Object} Document metadata
 */
function extractMetadata(ast) {
  const metadata = {};
  
  // Extract #+TITLE:, #+AUTHOR:, etc.
  if (ast.children) {
    ast.children.forEach(child => {
      if (child.type === 'keyword') {
        const key = child.key?.toUpperCase();
        const value = child.value;
        if (key && value) {
          metadata[key] = value;
        }
      }
    });
  }
  
  return metadata;
}

/**
 * Extract headings from AST (public API)
 * 
 * @param {OrgAST} orgAST - Parsed Org AST
 * @returns {OrgHeading[]} All headings
 */
export function extractHeadings(orgAST) {
  const allHeadings = [];
  
  function collect(headingList) {
    headingList.forEach(heading => {
      allHeadings.push(heading);
      if (heading.children.length > 0) {
        collect(heading.children);
      }
    });
  }
  
  collect(orgAST.headings);
  return allHeadings;
}

/**
 * Extract source blocks from AST (public API)
 * 
 * @param {OrgAST} orgAST - Parsed Org AST
 * @returns {OrgSourceBlock[]} All source blocks
 */
export function extractSourceBlocks(orgAST) {
  return orgAST.sourceBlocks;
}

/**
 * Extract property drawers from AST (public API)
 * 
 * @param {OrgAST} orgAST - Parsed Org AST
 * @returns {OrgPropertyDrawer[]} All property drawers
 */
export function extractPropertyDrawers(orgAST) {
  return orgAST.propertyDrawers;
}

/**
 * Resolve Noweb references in AST
 * 
 * @param {OrgAST} orgAST - Parsed Org AST
 * @returns {OrgAST} AST with Noweb references resolved
 */
export function resolveNowebReferences(orgAST) {
  // This will be implemented by the Noweb expander
  // For now, just return the AST as-is
  return orgAST;
}

