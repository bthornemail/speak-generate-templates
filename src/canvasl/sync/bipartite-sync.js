/**
 * Bipartite Sync Engine
 * 
 * Bidirectional sync between affine SVG and projective Canvas
 * - Event-driven updates (changes in one trigger updates in other)
 * - Conflict resolution (last-write-wins or user choice)
 * - Sync state management
 */

export class BipartiteSync {
  constructor() {
    this.affineListeners = [];
    this.projectiveListeners = [];
    this.syncState = new Map(); // nodeId -> { affineData, projectiveData, lastModified }
    this.isSyncing = false;
    this.conflictResolution = 'last-write-wins'; // 'last-write-wins' | 'user-choice'
  }

  /**
   * Register listener for affine changes
   * 
   * @param {function} callback - Callback function (affineData) => void
   * @returns {function} Unsubscribe function
   */
  onAffineChange(callback) {
    this.affineListeners.push(callback);
    return () => {
      const index = this.affineListeners.indexOf(callback);
      if (index > -1) {
        this.affineListeners.splice(index, 1);
      }
    };
  }

  /**
   * Register listener for projective changes
   * 
   * @param {function} callback - Callback function (nodeId, projectiveData) => void
   * @returns {function} Unsubscribe function
   */
  onProjectiveChange(callback) {
    this.projectiveListeners.push(callback);
    return () => {
      const index = this.projectiveListeners.indexOf(callback);
      if (index > -1) {
        this.projectiveListeners.splice(index, 1);
      }
    };
  }

  /**
   * Update affine data and sync to projective
   * 
   * @param {string} nodeId - Node ID
   * @param {object} affineData - Affine SVG data
   */
  updateAffine(nodeId, affineData) {
    if (this.isSyncing) return;

    this.isSyncing = true;
    
    const currentState = this.syncState.get(nodeId) || {};
    const newState = {
      ...currentState,
      affineData,
      lastModified: { source: 'affine', timestamp: Date.now() }
    };

    this.syncState.set(nodeId, newState);

    // Compute hash for projective
    const hash = this.computeHash(affineData);
    const projectiveData = {
      hash,
      position: currentState.projectiveData?.position || { x: 0, y: 0 }
    };

    // Update projective listeners
    this.projectiveListeners.forEach(listener => {
      try {
        listener(nodeId, projectiveData);
      } catch (error) {
        console.error('Error in projective listener:', error);
      }
    });

    this.isSyncing = false;
  }

  /**
   * Update projective data and sync to affine
   * 
   * @param {string} nodeId - Node ID
   * @param {object} projectiveData - Projective Canvas data
   */
  updateProjective(nodeId, projectiveData) {
    if (this.isSyncing) return;

    this.isSyncing = true;
    
    const currentState = this.syncState.get(nodeId) || {};
    const newState = {
      ...currentState,
      projectiveData,
      lastModified: { source: 'projective', timestamp: Date.now() }
    };

    this.syncState.set(nodeId, newState);

    // Convert projective hash to affine markup
    const affineData = this.hashToAffineMarkup(projectiveData.hash);

    // Update affine listeners
    this.affineListeners.forEach(listener => {
      try {
        listener(nodeId, affineData);
      } catch (error) {
        console.error('Error in affine listener:', error);
      }
    });

    this.isSyncing = false;
  }

  /**
   * Compute hash from affine data
   * 
   * @param {object} affineData - Affine SVG data
   * @returns {string} Hash string
   */
  computeHash(affineData) {
    // Simple hash function (can be replaced with crypto.subtle.digest)
    const str = JSON.stringify(affineData);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash-${Math.abs(hash).toString(16)}`;
  }

  /**
   * Convert hash to affine markup
   * 
   * @param {string} hash - Hash string
   * @returns {object} Affine markup data
   */
  hashToAffineMarkup(hash) {
    // This is a placeholder - in reality, you'd need a reverse mapping
    // For now, return a basic structure
    return {
      hash,
      content: `<!-- Hash: ${hash} -->`,
      blocks: []
    };
  }

  /**
   * Get sync state for a node
   * 
   * @param {string} nodeId - Node ID
   * @returns {object} Sync state
   */
  getSyncState(nodeId) {
    return this.syncState.get(nodeId) || null;
  }

  /**
   * Resolve conflict between affine and projective
   * 
   * @param {string} nodeId - Node ID
   * @param {object} affineData - Affine data
   * @param {object} projectiveData - Projective data
   * @returns {object} Resolved data
   */
  resolveConflict(nodeId, affineData, projectiveData) {
    if (this.conflictResolution === 'last-write-wins') {
      const state = this.syncState.get(nodeId);
      if (!state || !state.lastModified) {
        return { affine: affineData, projective: projectiveData };
      }

      if (state.lastModified.source === 'affine') {
        return { affine: affineData, projective: this.affineToProjective(affineData) };
      } else {
        return { affine: this.projectiveToAffine(projectiveData), projective: projectiveData };
      }
    }

    // User choice would require UI interaction
    return { affine: affineData, projective: projectiveData };
  }

  /**
   * Convert affine data to projective representation
   * 
   * @param {object} affineData - Affine SVG data
   * @returns {object} Projective Canvas data
   */
  affineToProjective(affineData) {
    return {
      hash: this.computeHash(affineData),
      position: affineData.position || { x: 0, y: 0 }
    };
  }

  /**
   * Convert projective data to affine representation
   * 
   * @param {object} projectiveData - Projective Canvas data
   * @returns {object} Affine SVG data
   */
  projectiveToAffine(projectiveData) {
    return {
      hash: projectiveData.hash,
      content: this.hashToAffineMarkup(projectiveData.hash).content,
      position: projectiveData.position
    };
  }

  /**
   * Clear sync state
   */
  clear() {
    this.syncState.clear();
    this.affineListeners = [];
    this.projectiveListeners = [];
  }
}

// Export singleton instance
export const bipartiteSync = new BipartiteSync();
export default bipartiteSync;


