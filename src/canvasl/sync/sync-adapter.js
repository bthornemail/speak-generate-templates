/**
 * Sync Adapter
 * 
 * Converts between affine SVG structure and projective hash representation
 * - Convert affine SVG structure to projective hash representation
 * - Convert projective node data to affine markup
 * - Handle dimension mapping (1D/2D views)
 * - Coordinate system conversion
 */

import { bipartiteSync } from './bipartite-sync.js';

export class SyncAdapter {
  constructor() {
    this.syncEngine = bipartiteSync;
  }

  /**
   * Convert affine SVG structure to projective hash representation
   * 
   * @param {object} affineStructure - Affine SVG structure
   * @returns {object} Projective hash representation
   */
  affineToProjective(affineStructure) {
    const hash = this.computeHashFromStructure(affineStructure);
    
    return {
      hash,
      position: this.extractPosition(affineStructure),
      dimension: this.extractDimension(affineStructure),
      metadata: {
        blockCount: affineStructure.blocks?.length || 0,
        lastModified: Date.now()
      }
    };
  }

  /**
   * Convert projective node data to affine markup
   * 
   * @param {object} projectiveData - Projective Canvas data
   * @returns {object} Affine markup structure
   */
  projectiveToAffine(projectiveData) {
    return {
      hash: projectiveData.hash,
      content: this.hashToMarkup(projectiveData.hash),
      blocks: this.generateBlocksFromHash(projectiveData.hash),
      position: projectiveData.position,
      dimension: projectiveData.dimension || '2D'
    };
  }

  /**
   * Handle dimension mapping (1D/2D views)
   * 
   * @param {object} data - Data structure
   * @param {string} targetDimension - Target dimension ('1D' or '2D')
   * @returns {object} Mapped data structure
   */
  mapDimension(data, targetDimension) {
    if (data.dimension === targetDimension) {
      return data;
    }

    if (targetDimension === '1D') {
      // Convert 2D to 1D (linear layout)
      return {
        ...data,
        dimension: '1D',
        blocks: this.layout1D(data.blocks || [])
      };
    } else {
      // Convert 1D to 2D (spatial layout)
      return {
        ...data,
        dimension: '2D',
        blocks: this.layout2D(data.blocks || [])
      };
    }
  }

  /**
   * Coordinate system conversion
   * 
   * @param {object} coords - Coordinates {x, y}
   * @param {string} fromSystem - Source system ('affine' | 'projective')
   * @param {string} toSystem - Target system ('affine' | 'projective')
   * @returns {object} Converted coordinates
   */
  convertCoordinates(coords, fromSystem, toSystem) {
    if (fromSystem === toSystem) {
      return coords;
    }

    if (fromSystem === 'affine' && toSystem === 'projective') {
      // Affine to projective: apply projective transformation
      return {
        x: coords.x / (1 + coords.y / 1000),
        y: coords.y / (1 + coords.y / 1000)
      };
    } else {
      // Projective to affine: reverse transformation
      return {
        x: coords.x * (1 + coords.y / 1000),
        y: coords.y * (1 + coords.y / 1000)
      };
    }
  }

  /**
   * Compute hash from structure
   * 
   * @param {object} structure - Data structure
   * @returns {string} Hash string
   */
  computeHashFromStructure(structure) {
    const str = JSON.stringify(structure);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hash-${Math.abs(hash).toString(16)}`;
  }

  /**
   * Extract position from structure
   * 
   * @param {object} structure - Data structure
   * @returns {object} Position {x, y}
   */
  extractPosition(structure) {
    if (structure.position) {
      return structure.position;
    }
    
    // Try to extract from blocks
    if (structure.blocks && structure.blocks.length > 0) {
      const firstBlock = structure.blocks[0];
      return { x: firstBlock.x || 0, y: firstBlock.y || 0 };
    }

    return { x: 0, y: 0 };
  }

  /**
   * Extract dimension from structure
   * 
   * @param {object} structure - Data structure
   * @returns {string} Dimension ('1D' | '2D')
   */
  extractDimension(structure) {
    return structure.dimension || '2D';
  }

  /**
   * Convert hash to markup
   * 
   * @param {string} hash - Hash string
   * @returns {string} Markup content
   */
  hashToMarkup(hash) {
    return `<!-- Hash: ${hash} -->\n<!-- Content reconstructed from hash -->`;
  }

  /**
   * Generate blocks from hash
   * 
   * @param {string} hash - Hash string
   * @returns {Array} Array of blocks
   */
  generateBlocksFromHash(hash) {
    // Placeholder - in reality, you'd need a reverse mapping
    return [
      {
        id: 'block-from-hash',
        type: 'template',
        x: 50,
        y: 50,
        width: 300,
        height: 100,
        data: { hash }
      }
    ];
  }

  /**
   * Layout blocks in 1D (linear)
   * 
   * @param {Array} blocks - Array of blocks
   * @returns {Array} Layouted blocks
   */
  layout1D(blocks) {
    let yOffset = 50;
    const spacing = 120;

    return blocks.map(block => ({
      ...block,
      x: 50,
      y: yOffset,
      yOffset: (yOffset += spacing)
    }));
  }

  /**
   * Layout blocks in 2D (spatial)
   * 
   * @param {Array} blocks - Array of blocks
   * @returns {Array} Layouted blocks
   */
  layout2D(blocks) {
    // Simple grid layout
    const cols = Math.ceil(Math.sqrt(blocks.length));
    const spacing = 150;

    return blocks.map((block, index) => ({
      ...block,
      x: 50 + (index % cols) * spacing,
      y: 50 + Math.floor(index / cols) * spacing
    }));
  }
}

// Export singleton instance
export const syncAdapter = new SyncAdapter();
export default syncAdapter;


