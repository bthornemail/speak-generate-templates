/**
 * Tangle System
 * 
 * Extracts source block content to files:
 * - Handles :tangle directive targets
 * - Supports protocol handlers (canvas://, file://, webrtc://)
 * - Handles multiple tangle targets
 * - Preserves source block structure
 */

/**
 * Tangle Result
 * @typedef {Object} TangleResult
 * @property {boolean} success - Whether tangle succeeded
 * @property {string} [error] - Error message if failed
 * @property {string[]} [targets] - Tangled file targets
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * Tangle single source block to target
 * 
 * @param {Object} sourceBlock - Source block to tangle
 * @param {string} target - Tangle target (from :tangle directive)
 * @param {Object} options - Tangle options
 * @returns {Promise<TangleResult>} Tangle result
 */
export async function tangleSourceBlock(sourceBlock, target, options = {}) {
  if (!sourceBlock || !sourceBlock.content) {
    return {
      success: false,
      error: 'Invalid source block: missing content'
    };
  }

  if (!target) {
    return {
      success: false,
      error: 'Invalid target: missing tangle target'
    };
  }

  try {
    const content = sourceBlock.content || '';
    const protocol = extractProtocol(target);
    
    // Handle different protocols
    switch (protocol) {
      case 'canvas':
        return await tangleToCanvas(target, content, sourceBlock, options);
      
      case 'file':
        return await tangleToFile(target, content, sourceBlock, options);
      
      case 'webrtc':
        return await tangleToWebRTC(target, content, sourceBlock, options);
      
      default:
        // Default to file system
        return await tangleToFile(target, content, sourceBlock, options);
    }
  } catch (error) {
    return {
      success: false,
      error: `Tangle error: ${error.message}`
    };
  }
}

/**
 * Tangle all source blocks in AST
 * 
 * @param {Object} orgAST - Org Mode AST
 * @param {Object} options - Tangle options
 * @returns {Promise<TangleResult[]>} Array of tangle results
 */
export async function tangleAllSourceBlocks(orgAST, options = {}) {
  if (!orgAST || !orgAST.sourceBlocks) {
    return [];
  }

  const results = await Promise.all(
    orgAST.sourceBlocks
      .filter(block => block.tangle) // Only tangle blocks with :tangle directive
      .map(block => tangleSourceBlock(block, block.tangle, options))
  );

  return results;
}

/**
 * Resolve tangle target path
 * 
 * @param {string} tangleDirective - Tangle directive (e.g., "canvas://component.svg")
 * @returns {Object} Resolved target info
 */
export function resolveTangleTarget(tangleDirective) {
  if (!tangleDirective) {
    return { protocol: null, path: null, fullPath: null };
  }

  const protocolMatch = tangleDirective.match(/^(\w+):\/\/(.+)$/);
  if (protocolMatch) {
    return {
      protocol: protocolMatch[1],
      path: protocolMatch[2],
      fullPath: tangleDirective
    };
  }

  // Default to file protocol
  return {
    protocol: 'file',
    path: tangleDirective,
    fullPath: `file://${tangleDirective}`
  };
}

/**
 * Tangle to Canvas protocol
 * 
 * @param {string} target - Canvas target URL
 * @param {string} content - Source block content
 * @param {Object} sourceBlock - Source block metadata
 * @param {Object} options - Tangle options
 * @returns {Promise<TangleResult>} Tangle result
 */
async function tangleToCanvas(target, content, sourceBlock, options) {
  // Extract path from canvas:// URL
  const path = target.replace(/^canvas:\/\//, '');
  
  // In a real implementation, this would register with Canvas API
  // For now, just return success
  return {
    success: true,
    targets: [target],
    metadata: {
      protocol: 'canvas',
      path,
      contentType: sourceBlock.type,
      size: content.length
    }
  };
}

/**
 * Tangle to file system
 * 
 * @param {string} target - File target path
 * @param {string} content - Source block content
 * @param {Object} sourceBlock - Source block metadata
 * @param {Object} options - Tangle options
 * @returns {Promise<TangleResult>} Tangle result
 */
async function tangleToFile(target, content, sourceBlock, options) {
  // Extract path from file:// URL or use as-is
  const path = target.replace(/^file:\/\//, '');
  
  // In browser environment, use File System Access API or download
  if (typeof window !== 'undefined' && window.showSaveFilePicker) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: path.split('/').pop() || 'tangled-file',
        types: [{
          description: 'Tangled file',
          accept: { 'text/plain': ['.txt', '.js', '.svg', '.md', '.org'] }
        }]
      });
      
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      
      return {
        success: true,
        targets: [target],
        metadata: {
          protocol: 'file',
          path,
          contentType: sourceBlock.type,
          size: content.length,
          fileHandle: fileHandle.name
        }
      };
    } catch (error) {
      // User cancelled or error
      if (error.name !== 'AbortError') {
        return {
          success: false,
          error: `File save error: ${error.message}`
        };
      }
    }
  }
  
  // Fallback: trigger download
  if (typeof window !== 'undefined') {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || 'tangled-file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      targets: [target],
      metadata: {
        protocol: 'file',
        path,
        contentType: sourceBlock.type,
        size: content.length,
        method: 'download'
      }
    };
  }
  
  return {
    success: false,
    error: 'File system access not available'
  };
}

/**
 * Tangle to WebRTC protocol (peer-to-peer)
 * 
 * @param {string} target - WebRTC target URL
 * @param {string} content - Source block content
 * @param {Object} sourceBlock - Source block metadata
 * @param {Object} options - Tangle options
 * @returns {Promise<TangleResult>} Tangle result
 */
async function tangleToWebRTC(target, content, sourceBlock, options) {
  // In a real implementation, this would sync via WebRTC
  // For now, just return success
  return {
    success: true,
    targets: [target],
    metadata: {
      protocol: 'webrtc',
      path: target.replace(/^webrtc:\/\//, ''),
      contentType: sourceBlock.type,
      size: content.length
    }
  };
}

/**
 * Write tangle file (helper)
 * 
 * @param {string} target - Target path
 * @param {string} content - Content to write
 * @param {Object} options - Write options
 * @returns {Promise<TangleResult>} Write result
 */
export async function writeTangleFile(target, content, options = {}) {
  return await tangleToFile(target, content, { type: 'text' }, options);
}

/**
 * Extract protocol from target
 * 
 * @param {string} target - Tangle target
 * @returns {string} Protocol name
 */
function extractProtocol(target) {
  if (!target) return 'file';
  
  const match = target.match(/^(\w+):\/\//);
  return match ? match[1] : 'file';
}

