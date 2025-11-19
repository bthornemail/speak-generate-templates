/**
 * Drag-and-Drop Handler
 * 
 * Handles drag-and-drop operations on canvas:
 * - Drag source blocks from editor to canvas
 * - Drag nodes on canvas to reposition
 * - Drop protocol handlers onto nodes
 * - Connect nodes with edges
 */

/**
 * Drag-and-Drop Manager
 */
export class DragDropHandler {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.onNodeMove = options.onNodeMove || (() => {});
    this.onNodeCreate = options.onNodeCreate || (() => {});
    this.onEdgeCreate = options.onEdgeCreate || (() => {});
    this.onProtocolHandlerDrop = options.onProtocolHandlerDrop || (() => {});
    
    this.draggedElement = null;
    this.dragStartPos = null;
    this.dragTarget = null;
    this.isDragging = false;
    
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (!this.canvas) return;
    
    this.canvas.addEventListener('dragstart', this.handleDragStart.bind(this));
    this.canvas.addEventListener('dragend', this.handleDragEnd.bind(this));
    this.canvas.addEventListener('dragover', this.handleDragOver.bind(this));
    this.canvas.addEventListener('drop', this.handleDrop.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  /**
   * Handle drag start
   */
  handleDragStart(e) {
    const element = e.target;
    const dragData = element.dataset.dragType;
    
    if (dragData) {
      this.draggedElement = {
        type: dragData,
        data: JSON.parse(element.dataset.dragData || '{}'),
        element: element
      };
      
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(this.draggedElement));
    }
  }

  /**
   * Handle drag end
   */
  handleDragEnd(e) {
    this.draggedElement = null;
    this.dragStartPos = null;
    this.isDragging = false;
  }

  /**
   * Handle drag over
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Highlight drop target
    const target = this.getDropTarget(e);
    if (target) {
      this.dragTarget = target;
      this.highlightDropTarget(target);
    }
  }

  /**
   * Handle drop
   */
  handleDrop(e) {
    e.preventDefault();
    
    if (!this.draggedElement) return;
    
    const canvasRect = this.canvas.getBoundingClientRect();
    const dropPos = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top
    };
    
    const target = this.getDropTarget(e);
    
    switch (this.draggedElement.type) {
      case 'source-block':
        this.handleSourceBlockDrop(this.draggedElement, dropPos, target);
        break;
      
      case 'protocol-handler':
        this.handleProtocolHandlerDrop(this.draggedElement, target);
        break;
      
      case 'r5rs-function':
        this.handleR5RSFunctionDrop(this.draggedElement, dropPos, target);
        break;
      
      default:
        console.warn('Unknown drag type:', this.draggedElement.type);
    }
    
    this.clearDropTarget();
    this.draggedElement = null;
  }

  /**
   * Handle source block drop
   */
  handleSourceBlockDrop(element, position, target) {
    const { data } = element;
    
    // Create node from source block
    const nodeData = {
      id: `node-${Date.now()}`,
      type: 'source-block',
      position: position,
      content: data.content,
      sourceBlockType: data.type,
      sourceBlockName: data.name,
      tangle: data.tangle,
      canvasl: data.canvasl
    };
    
    this.onNodeCreate(nodeData);
  }

  /**
   * Handle protocol handler drop
   */
  handleProtocolHandlerDrop(element, target) {
    if (!target || target.type !== 'node') {
      console.warn('Protocol handler must be dropped on a node');
      return;
    }
    
    const { data } = element;
    
    this.onProtocolHandlerDrop({
      nodeId: target.id,
      protocol: data.protocol,
      handler: data.handler
    });
  }

  /**
   * Handle R5RS function drop
   */
  handleR5RSFunctionDrop(element, position, target) {
    const { data } = element;
    
    // Create RPC command node
    const nodeData = {
      id: `rpc-${Date.now()}`,
      type: 'rpc-command',
      position: position,
      function: data.function,
      args: data.args || []
    };
    
    this.onNodeCreate(nodeData);
    
    // If dropped on a node, create edge
    if (target && target.type === 'node') {
      this.onEdgeCreate({
        from: target.id,
        to: nodeData.id,
        type: 'rpc-call'
      });
    }
  }

  /**
   * Handle mouse down (for dragging nodes)
   */
  handleMouseDown(e) {
    if (e.button !== 0) return; // Only left mouse button
    
    const target = this.getNodeAtPosition(e);
    if (target) {
      this.isDragging = true;
      this.dragStartPos = {
        x: e.clientX,
        y: e.clientY
      };
      this.draggedElement = {
        type: 'node',
        id: target.id,
        startPosition: target.position
      };
    }
  }

  /**
   * Handle mouse move (for dragging nodes)
   */
  handleMouseMove(e) {
    if (!this.isDragging || !this.draggedElement) return;
    
    const delta = {
      x: e.clientX - this.dragStartPos.x,
      y: e.clientY - this.dragStartPos.y
    };
    
    const newPosition = {
      x: this.draggedElement.startPosition.x + delta.x,
      y: this.draggedElement.startPosition.y + delta.y
    };
    
    this.onNodeMove({
      nodeId: this.draggedElement.id,
      position: newPosition
    });
  }

  /**
   * Handle mouse up (end dragging)
   */
  handleMouseUp(e) {
    if (this.isDragging) {
      this.isDragging = false;
      this.draggedElement = null;
      this.dragStartPos = null;
    }
  }

  /**
   * Get drop target at position
   */
  getDropTarget(e) {
    // Check if dropping on a node
    const node = this.getNodeAtPosition(e);
    if (node) {
      return {
        type: 'node',
        id: node.id,
        node: node
      };
    }
    
    // Default: drop on canvas
    return {
      type: 'canvas'
    };
  }

  /**
   * Get node at position (simplified - would need actual node positions)
   */
  getNodeAtPosition(e) {
    // This would need access to node positions from canvas
    // For now, return null
    return null;
  }

  /**
   * Highlight drop target
   */
  highlightDropTarget(target) {
    // Visual feedback for drop target
    if (target.type === 'node') {
      // Highlight node
      console.log('Highlighting node:', target.id);
    }
  }

  /**
   * Clear drop target highlight
   */
  clearDropTarget() {
    this.dragTarget = null;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('dragstart', this.handleDragStart);
      this.canvas.removeEventListener('dragend', this.handleDragEnd);
      this.canvas.removeEventListener('dragover', this.handleDragOver);
      this.canvas.removeEventListener('drop', this.handleDrop);
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    }
  }
}

