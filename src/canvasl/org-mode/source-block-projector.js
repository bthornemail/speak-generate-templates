/**
 * Source Block Projection System
 * 
 * Projects source blocks to Canvas API:
 * - Handles different source block types (svg, javascript, canvasl, org, markdown, etc.)
 * - Executes source blocks (for executable types)
 * - Registers protocol handlers
 * - Updates Canvas topology
 * - Handles projection errors
 */

import { parseCanvaslSourceBlock } from './canvasl-source-block-parser.js';
import { expandNowebReferences } from './noweb-expander.js';
import { detectSelfEncoding, parseNestedOrgMode } from './self-encoding-handler.js';

/**
 * Projection Result
 * @typedef {Object} ProjectionResult
 * @property {boolean} success - Whether projection succeeded
 * @property {string} [error] - Error message if failed
 * @property {*} [data] - Projected data
 * @property {string} [protocol] - Protocol handler used
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * Project single source block to Canvas API
 * 
 * @param {Object} sourceBlock - Source block to project
 * @param {Object} orgAST - Org Mode AST (for context)
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
export async function projectSourceBlock(sourceBlock, orgAST, canvasAPI) {
  if (!sourceBlock || !sourceBlock.type) {
    return {
      success: false,
      error: 'Invalid source block: missing type'
    };
  }

  try {
    // Expand Noweb references first
    const expandedBlock = sourceBlock.noweb
      ? expandNowebReferences(sourceBlock, orgAST.namedBlocks || new Map())
      : sourceBlock;

    // Check for self-encoding
    const selfEncoding = detectSelfEncoding(expandedBlock);
    if (selfEncoding.isSelfEncoded) {
      return await projectSelfEncodedBlock(expandedBlock, orgAST, canvasAPI);
    }

    // Project based on source block type
    switch (expandedBlock.type.toLowerCase()) {
      case 'svg':
        return await projectSVGBlock(expandedBlock, canvasAPI);
      
      case 'javascript':
      case 'js':
        return await projectJavaScriptBlock(expandedBlock, canvasAPI);
      
      case 'canvasl':
        return await projectCanvaslBlock(expandedBlock, canvasAPI);
      
      case 'org':
        return await projectOrgBlock(expandedBlock, orgAST, canvasAPI);
      
      case 'markdown':
      case 'md':
        return await projectMarkdownBlock(expandedBlock, canvasAPI);
      
      case 'jsonl':
        return await projectJSONLBlock(expandedBlock, canvasAPI);
      
      case 'yaml':
        return await projectYAMLBlock(expandedBlock, canvasAPI);
      
      default:
        return await projectGenericBlock(expandedBlock, canvasAPI);
    }
  } catch (error) {
    return {
      success: false,
      error: `Projection error: ${error.message}`,
      metadata: { stack: error.stack }
    };
  }
}

/**
 * Project all source blocks to Canvas API
 * 
 * @param {Object} orgAST - Org Mode AST
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult[]>} Array of projection results
 */
export async function projectAllSourceBlocks(orgAST, canvasAPI) {
  if (!orgAST || !orgAST.sourceBlocks) {
    return [];
  }

  const results = await Promise.all(
    orgAST.sourceBlocks.map(block =>
      projectSourceBlock(block, orgAST, canvasAPI)
    )
  );

  return results;
}

/**
 * Project SVG source block
 * 
 * @param {Object} sourceBlock - SVG source block
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
async function projectSVGBlock(sourceBlock, canvasAPI) {
  const content = sourceBlock.content || '';
  const tangle = sourceBlock.tangle || 'canvas://component.svg';
  
  // Register protocol handler if needed
  const protocol = extractProtocol(tangle);
  if (protocol && canvasAPI) {
    await registerProtocolHandler(protocol, canvasAPI);
  }

  // Project SVG to Canvas
  if (canvasAPI && canvasAPI.addNode) {
    const nodeId = generateNodeId(sourceBlock);
    await canvasAPI.addNode({
      id: nodeId,
      type: 'svg',
      content: content,
      metadata: {
        tangle,
        projection: sourceBlock.canvasl?.projection || 'projective',
        dimension: sourceBlock.canvasl?.dimension || '2D'
      }
    });

    return {
      success: true,
      data: { nodeId, content },
      protocol,
      metadata: { type: 'svg' }
    };
  }

  return {
    success: true,
    data: { content },
    protocol,
    metadata: { type: 'svg' }
  };
}

/**
 * Project JavaScript source block
 * 
 * @param {Object} sourceBlock - JavaScript source block
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
async function projectJavaScriptBlock(sourceBlock, canvasAPI) {
  const content = sourceBlock.content || '';
  
  // Execute JavaScript (in safe context)
  let executionResult = null;
  try {
    // Create safe execution context
    const safeEval = createSafeEvalContext();
    executionResult = safeEval(content);
  } catch (error) {
    return {
      success: false,
      error: `JavaScript execution error: ${error.message}`
    };
  }

  // Project execution result to Canvas
  if (canvasAPI && canvasAPI.addNode) {
    const nodeId = generateNodeId(sourceBlock);
    await canvasAPI.addNode({
      id: nodeId,
      type: 'javascript',
      content: content,
      result: executionResult,
      metadata: {
        projection: sourceBlock.canvasl?.projection || 'projective'
      }
    });

    return {
      success: true,
      data: { nodeId, content, result: executionResult },
      metadata: { type: 'javascript' }
    };
  }

  return {
    success: true,
    data: { content, result: executionResult },
    metadata: { type: 'javascript' }
  };
}

/**
 * Project CanvasL source block
 * 
 * @param {Object} sourceBlock - CanvasL source block
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
async function projectCanvaslBlock(sourceBlock, canvasAPI) {
  const content = sourceBlock.content || '';
  
  // Parse CanvasL content
  const parseResult = parseCanvaslSourceBlock(content);
  
  if (!parseResult.valid) {
    return {
      success: false,
      error: `CanvasL parse errors: ${parseResult.errors.join(', ')}`
    };
  }

  // Handle RPC commands
  if (sourceBlock.canvasl?.rpc === 'true' || sourceBlock.canvasl?.rpc === true) {
    return await executeRPCCommand(parseResult, canvasAPI);
  }

  // Project CanvasL directives and content
  if (canvasAPI && canvasAPI.addNode) {
    const nodeId = generateNodeId(sourceBlock);
    await canvasAPI.addNode({
      id: nodeId,
      type: 'canvasl',
      content: content,
      directives: parseResult.directives,
      r5rsCalls: parseResult.r5rsCalls,
      metadata: {
        projection: sourceBlock.canvasl?.projection || 'projective',
        dimension: sourceBlock.canvasl?.dimension || parseResult.dimensionReferences[0] || '0D'
      }
    });

    return {
      success: true,
      data: { nodeId, content, parseResult },
      metadata: { type: 'canvasl' }
    };
  }

  return {
    success: true,
    data: { content, parseResult },
    metadata: { type: 'canvasl' }
  };
}

/**
 * Project Org Mode source block (self-encoded)
 * 
 * @param {Object} sourceBlock - Org Mode source block
 * @param {Object} orgAST - Parent Org AST
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
async function projectOrgBlock(sourceBlock, orgAST, canvasAPI) {
  // Parse nested Org Mode content
  const nestedAST = parseNestedOrgMode(sourceBlock.content, 0, {
    parentBlockName: sourceBlock.name,
    parentBlockType: sourceBlock.type
  });

  if (!nestedAST) {
    return {
      success: false,
      error: 'Failed to parse nested Org Mode content'
    };
  }

  // Project nested source blocks
  const nestedResults = await projectAllSourceBlocks(nestedAST, canvasAPI);

  return {
    success: true,
    data: { nestedAST, nestedResults },
    metadata: { type: 'org', nestingDepth: 0 }
  };
}

/**
 * Project Markdown source block
 * 
 * @param {Object} sourceBlock - Markdown source block
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
async function projectMarkdownBlock(sourceBlock, canvasAPI) {
  const content = sourceBlock.content || '';
  
  // Render Markdown to HTML (simplified)
  const html = renderMarkdownToHTML(content);

  if (canvasAPI && canvasAPI.addNode) {
    const nodeId = generateNodeId(sourceBlock);
    await canvasAPI.addNode({
      id: nodeId,
      type: 'markdown',
      content: content,
      html: html,
      metadata: {
        projection: sourceBlock.canvasl?.projection || 'projective'
      }
    });

    return {
      success: true,
      data: { nodeId, content, html },
      metadata: { type: 'markdown' }
    };
  }

  return {
    success: true,
    data: { content, html },
    metadata: { type: 'markdown' }
  };
}

/**
 * Project JSONL source block
 * 
 * @param {Object} sourceBlock - JSONL source block
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
async function projectJSONLBlock(sourceBlock, canvasAPI) {
  const content = sourceBlock.content || '';
  
  // Parse JSONL
  const lines = content.split('\n').filter(line => line.trim());
  const objects = [];
  
  for (const line of lines) {
    try {
      objects.push(JSON.parse(line));
    } catch (error) {
      // Skip invalid JSON lines
    }
  }

  if (canvasAPI && canvasAPI.addNode) {
    const nodeId = generateNodeId(sourceBlock);
    await canvasAPI.addNode({
      id: nodeId,
      type: 'jsonl',
      content: content,
      objects: objects,
      metadata: {
        projection: sourceBlock.canvasl?.projection || 'projective',
        objectCount: objects.length
      }
    });

    return {
      success: true,
      data: { nodeId, content, objects },
      metadata: { type: 'jsonl' }
    };
  }

  return {
    success: true,
    data: { content, objects },
    metadata: { type: 'jsonl' }
  };
}

/**
 * Project YAML source block
 * 
 * @param {Object} sourceBlock - YAML source block
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
async function projectYAMLBlock(sourceBlock, canvasAPI) {
  const content = sourceBlock.content || '';
  
  // Parse YAML (would need js-yaml import)
  let yamlData = null;
  try {
    // Dynamic import to avoid dependency if not needed
    const yaml = await import('js-yaml');
    yamlData = yaml.load(content);
  } catch (error) {
    return {
      success: false,
      error: `YAML parse error: ${error.message}`
    };
  }

  if (canvasAPI && canvasAPI.addNode) {
    const nodeId = generateNodeId(sourceBlock);
    await canvasAPI.addNode({
      id: nodeId,
      type: 'yaml',
      content: content,
      data: yamlData,
      metadata: {
        projection: sourceBlock.canvasl?.projection || 'projective'
      }
    });

    return {
      success: true,
      data: { nodeId, content, data: yamlData },
      metadata: { type: 'yaml' }
    };
  }

  return {
    success: true,
    data: { content, data: yamlData },
    metadata: { type: 'yaml' }
  };
}

/**
 * Project generic/unknown source block
 * 
 * @param {Object} sourceBlock - Generic source block
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
async function projectGenericBlock(sourceBlock, canvasAPI) {
  const content = sourceBlock.content || '';
  
  if (canvasAPI && canvasAPI.addNode) {
    const nodeId = generateNodeId(sourceBlock);
    await canvasAPI.addNode({
      id: nodeId,
      type: sourceBlock.type || 'text',
      content: content,
      metadata: {
        projection: sourceBlock.canvasl?.projection || 'projective'
      }
    });

    return {
      success: true,
      data: { nodeId, content },
      metadata: { type: sourceBlock.type || 'text' }
    };
  }

  return {
    success: true,
    data: { content },
    metadata: { type: sourceBlock.type || 'text' }
  };
}

/**
 * Project self-encoded source block
 * 
 * @param {Object} sourceBlock - Self-encoded source block
 * @param {Object} orgAST - Parent Org AST
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
async function projectSelfEncodedBlock(sourceBlock, orgAST, canvasAPI) {
  // Parse nested content
  const nestedAST = parseNestedOrgMode(sourceBlock.content, 0, {
    parentBlockName: sourceBlock.name,
    parentBlockType: sourceBlock.type
  });

  if (!nestedAST) {
    return {
      success: false,
      error: 'Failed to parse self-encoded content'
    };
  }

  // Project nested blocks recursively
  const nestedResults = await projectAllSourceBlocks(nestedAST, canvasAPI);

  return {
    success: true,
    data: { nestedAST, nestedResults },
    metadata: {
      type: sourceBlock.type,
      isSelfEncoded: true,
      nestingDepth: 0
    }
  };
}

/**
 * Execute RPC command from CanvasL source block
 * 
 * @param {Object} parseResult - CanvasL parse result
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<ProjectionResult>} Projection result
 */
async function executeRPCCommand(parseResult, canvasAPI) {
  // Find RPC call in parse result
  const rpcCall = parseResult.r5rsCalls.find(call => 
    call.function.startsWith('r5rs:')
  );

  if (!rpcCall) {
    return {
      success: false,
      error: 'No RPC call found in CanvasL source block'
    };
  }

  // Execute RPC command (would need R5RS engine)
  if (canvasAPI && canvasAPI.executeRPC) {
    try {
      const result = await canvasAPI.executeRPC(
        rpcCall.function,
        rpcCall.args || []
      );

      return {
        success: true,
        data: { rpcCall, result },
        metadata: { type: 'rpc' }
      };
    } catch (error) {
      return {
        success: false,
        error: `RPC execution error: ${error.message}`
      };
    }
  }

  return {
    success: false,
    error: 'Canvas API does not support RPC execution'
  };
}

/**
 * Register protocol handler
 * 
 * @param {string} protocol - Protocol name (e.g., "canvas", "file", "webrtc")
 * @param {Object} canvasAPI - Canvas API instance
 * @returns {Promise<void>}
 */
async function registerProtocolHandler(protocol, canvasAPI) {
  if (!protocol || !canvasAPI) {
    return;
  }

  // Register protocol handler if not already registered
  if (canvasAPI.registerProtocolHandler) {
    await canvasAPI.registerProtocolHandler(protocol, {
      handle: async (url) => {
        // Protocol handler implementation
        console.log(`Handling ${protocol}:// URL:`, url);
      }
    });
  }
}

/**
 * Extract protocol from tangle target
 * 
 * @param {string} tangle - Tangle target (e.g., "canvas://component.svg")
 * @returns {string|null} Protocol name or null
 */
function extractProtocol(tangle) {
  if (!tangle) return null;
  
  const match = tangle.match(/^(\w+):\/\//);
  return match ? match[1] : null;
}

/**
 * Generate node ID from source block
 * 
 * @param {Object} sourceBlock - Source block
 * @returns {string} Node ID
 */
function generateNodeId(sourceBlock) {
  if (sourceBlock.name) {
    return `node-${sourceBlock.name}`;
  }
  
  // Generate from content hash (simplified)
  const hash = simpleHash(sourceBlock.content || '');
  return `node-${hash}`;
}

/**
 * Simple hash function
 * 
 * @param {string} str - String to hash
 * @returns {string} Hash string
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create safe evaluation context for JavaScript
 * 
 * @returns {Function} Safe eval function
 */
function createSafeEvalContext() {
  // Very basic safe eval - in production, use a proper sandbox
  return (code) => {
    // Only allow basic expressions, no dangerous operations
    if (/eval|Function|import|require/.test(code)) {
      throw new Error('Unsafe code detected');
    }
    // In production, use a proper sandbox like vm2 or isolated-vm
    return eval(code); // eslint-disable-line no-eval
  };
}

/**
 * Render Markdown to HTML (simplified)
 * 
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
function renderMarkdownToHTML(markdown) {
  // Very basic Markdown rendering - in production, use a proper library
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

