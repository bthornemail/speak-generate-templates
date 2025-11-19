/**
 * Operational Transform (OT) for Conflict Resolution
 * 
 * Handles concurrent edits and resolves conflicts:
 * - Last-write-wins (simple)
 * - Operational transformation (advanced)
 * - CRDT support (future)
 */

/**
 * Operational Transform Manager
 */
export class OperationalTransform {
  constructor(options = {}) {
    this.strategy = options.strategy || 'last-write-wins'; // 'last-write-wins' | 'ot' | 'crdt'
    this.operations = []; // Operation log
    this.vectorClock = new Map(); // peerId -> sequence number
  }

  /**
   * Transform operation against concurrent operations
   * 
   * @param {Object} operation - Operation to transform
   * @param {Array} concurrentOps - Concurrent operations
   * @returns {Object} Transformed operation
   */
  transform(operation, concurrentOps) {
    if (this.strategy === 'last-write-wins') {
      return this.lastWriteWins(operation, concurrentOps);
    } else if (this.strategy === 'ot') {
      return this.operationalTransform(operation, concurrentOps);
    }
    
    return operation;
  }

  /**
   * Last-write-wins conflict resolution
   * 
   * @param {Object} operation - Operation
   * @param {Array} concurrentOps - Concurrent operations
   * @returns {Object} Resolved operation
   */
  lastWriteWins(operation, concurrentOps) {
    // Find latest concurrent operation on same node
    const concurrentOnSameNode = concurrentOps
      .filter(op => op.nodeId === operation.nodeId)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (concurrentOnSameNode.length > 0) {
      const latest = concurrentOnSameNode[0];
      // If our operation is newer, use it; otherwise, merge with latest
      if (operation.timestamp > latest.timestamp) {
        return operation;
      } else {
        // Merge with latest (keep our changes where they don't conflict)
        return {
          ...latest,
          ...operation,
          timestamp: Math.max(operation.timestamp, latest.timestamp)
        };
      }
    }

    return operation;
  }

  /**
   * Operational transformation (basic implementation)
   * 
   * @param {Object} operation - Operation to transform
   * @param {Array} concurrentOps - Concurrent operations
   * @returns {Object} Transformed operation
   */
  operationalTransform(operation, concurrentOps) {
    // Basic OT: adjust operation based on concurrent operations
    let transformed = { ...operation };

    concurrentOps.forEach(concurrentOp => {
      if (concurrentOp.nodeId === operation.nodeId) {
        // Transform based on operation type
        switch (concurrentOp.type) {
          case 'move':
            // If node was moved, adjust our operation
            if (operation.type === 'move') {
              // Use later timestamp
              if (concurrentOp.timestamp > operation.timestamp) {
                transformed = concurrentOp;
              }
            }
            break;
          
          case 'update':
            // Merge updates
            transformed = {
              ...transformed,
              ...concurrentOp,
              data: {
                ...transformed.data,
                ...concurrentOp.data
              }
            };
            break;
          
          case 'delete':
            // If deleted, our operation is invalid
            if (concurrentOp.timestamp > operation.timestamp) {
              transformed = null; // Operation invalidated
            }
            break;
        }
      }
    });

    return transformed;
  }

  /**
   * Apply operation to state
   * 
   * @param {Object} state - Current state
   * @param {Object} operation - Operation to apply
   * @returns {Object} New state
   */
  applyOperation(state, operation) {
    if (!operation) return state;

    const newState = { ...state };

    switch (operation.type) {
      case 'create':
        newState.nodes = new Map(state.nodes);
        newState.nodes.set(operation.nodeId, operation.data);
        break;
      
      case 'update':
        if (newState.nodes.has(operation.nodeId)) {
          newState.nodes = new Map(state.nodes);
          const existing = newState.nodes.get(operation.nodeId);
          newState.nodes.set(operation.nodeId, {
            ...existing,
            ...operation.data
          });
        }
        break;
      
      case 'delete':
        newState.nodes = new Map(state.nodes);
        newState.nodes.delete(operation.nodeId);
        break;
      
      case 'move':
        if (newState.nodes.has(operation.nodeId)) {
          newState.nodes = new Map(state.nodes);
          const node = newState.nodes.get(operation.nodeId);
          newState.nodes.set(operation.nodeId, {
            ...node,
            position: operation.position
          });
        }
        break;
    }

    return newState;
  }

  /**
   * Create operation from change
   * 
   * @param {string} type - Operation type
   * @param {string} nodeId - Node ID
   * @param {Object} data - Operation data
   * @param {string} peerId - Peer ID
   * @returns {Object} Operation
   */
  createOperation(type, nodeId, data, peerId) {
    const sequence = (this.vectorClock.get(peerId) || 0) + 1;
    this.vectorClock.set(peerId, sequence);

    return {
      type,
      nodeId,
      data,
      peerId,
      timestamp: Date.now(),
      sequence,
      vectorClock: new Map(this.vectorClock)
    };
  }
}

