/**
 * RPC Builder
 * 
 * Visual RPC command builder:
 * - Drag R5RS functions onto canvas
 * - Connect function calls with data flow
 * - Generate CanvasL RPC commands
 */

/**
 * RPC Builder Class
 */
export class RPCBuilder {
  constructor(options = {}) {
    this.nodes = new Map(); // nodeId -> RPC node
    this.edges = new Map(); // edgeId -> RPC edge
    this.onUpdate = options.onUpdate || (() => {});
  }

  /**
   * Add R5RS function node
   */
  addFunctionNode(functionName, position, args = []) {
    const nodeId = `rpc-${Date.now()}`;
    const node = {
      id: nodeId,
      type: 'r5rs-function',
      function: functionName,
      args: args,
      position: position,
      inputs: [],
      outputs: []
    };
    
    this.nodes.set(nodeId, node);
    this.notifyUpdate();
    
    return nodeId;
  }

  /**
   * Connect nodes (data flow)
   */
  connectNodes(fromNodeId, toNodeId, outputIndex = 0, inputIndex = 0) {
    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);
    
    if (!fromNode || !toNode) {
      throw new Error('Invalid node IDs');
    }
    
    const edgeId = `edge-${fromNodeId}-${toNodeId}`;
    const edge = {
      id: edgeId,
      from: fromNodeId,
      to: toNodeId,
      fromOutput: outputIndex,
      toInput: inputIndex,
      type: 'data-flow'
    };
    
    this.edges.set(edgeId, edge);
    
    // Update node connections
    fromNode.outputs.push(edgeId);
    toNode.inputs.push(edgeId);
    
    this.notifyUpdate();
    
    return edgeId;
  }

  /**
   * Generate CanvasL RPC command
   */
  generateCanvasLRPC(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node || node.type !== 'r5rs-function') {
      throw new Error('Invalid RPC node');
    }
    
    // Resolve input arguments from connected nodes
    const resolvedArgs = node.inputs.map((edgeId, index) => {
      const edge = this.edges.get(edgeId);
      if (!edge) return null;
      
      const fromNode = this.nodes.get(edge.from);
      if (!fromNode) return null;
      
      // Recursively resolve arguments
      return this.resolveNodeOutput(fromNode, edge.fromOutput);
    });
    
    return {
      type: 'rpc-call',
      function: node.function,
      args: resolvedArgs.filter(arg => arg !== null)
    };
  }

  /**
   * Resolve node output value
   */
  resolveNodeOutput(node, outputIndex) {
    if (node.type === 'r5rs-function') {
      // Execute function with resolved inputs
      const inputs = node.inputs.map(edgeId => {
        const edge = this.edges.get(edgeId);
        if (!edge) return null;
        
        const fromNode = this.nodes.get(edge.from);
        if (!fromNode) return null;
        
        return this.resolveNodeOutput(fromNode, edge.fromOutput);
      });
      
      // Return function call representation
      return {
        type: 'function-call',
        function: node.function,
        args: inputs.filter(arg => arg !== null)
      };
    }
    
    // For literal values
    return node.value;
  }

  /**
   * Generate complete CanvasL RPC program
   */
  generateCanvasLProgram() {
    // Find root nodes (nodes with no inputs)
    const rootNodes = Array.from(this.nodes.values())
      .filter(node => node.inputs.length === 0);
    
    // Generate RPC commands for each root node
    const commands = rootNodes.map(node => this.generateCanvasLRPC(node.id));
    
    return {
      type: 'canvasl-rpc-program',
      version: '1.0',
      commands: commands
    };
  }

  /**
   * Notify update
   */
  notifyUpdate() {
    this.onUpdate({
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    });
  }

  /**
   * Clear builder
   */
  clear() {
    this.nodes.clear();
    this.edges.clear();
    this.notifyUpdate();
  }
}

