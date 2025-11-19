/**
 * Offscreen Canvas Worker
 * 
 * Handles canvas rendering in a Web Worker thread for better performance.
 * Receives nodes, edges, and viewport updates from main thread and renders
 * only visible content (viewport culling).
 */

import { cullNodes, cullEdges, calculateViewportBounds } from './viewport-culler.js';

let offscreenCanvas = null;
let ctx = null;
let animationFrameId = null;

// Rendering state
let nodes = [];
let edges = [];
let viewport = { x: 0, y: 0, width: 800, height: 600 };
let zoom = 1;
let viewOffset = { x: 0, y: 0 };
let nodePositions = new Map();
let nodeIcons = new Map();
let isDirty = true;

// Configuration
const NODE_RADIUS = 30;
const EDGE_COLOR = '#666';
const NODE_COLOR = '#4a90e2';
const SELECTED_COLOR = '#ff6b6b';
const HOVERED_COLOR = '#51cf66';

/**
 * Initialize offscreen canvas
 */
function initCanvas(canvas) {
  offscreenCanvas = canvas;
  ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Failed to get 2d context from offscreen canvas');
    return;
  }
  
  // Set up rendering
  startRenderLoop();
}

/**
 * Start render loop
 */
function startRenderLoop() {
  function render() {
    if (!ctx || !offscreenCanvas) return;
    
    // Only render if dirty or if we have content
    if (isDirty || nodes.length > 0) {
      renderFrame();
      isDirty = false;
    }
    
    animationFrameId = requestAnimationFrame(render);
  }
  
  render();
}

/**
 * Render a single frame
 */
function renderFrame() {
  if (!ctx || !offscreenCanvas) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  
  // Calculate viewport bounds
  const viewportBounds = calculateViewportBounds(
    viewOffset,
    zoom,
    offscreenCanvas.width,
    offscreenCanvas.height
  );
  
  // Cull nodes (only render visible ones)
  const visibleNodes = cullNodes(
    nodes,
    viewportBounds,
    (node) => nodePositions.get(node.id) || { x: 0, y: 0 },
    NODE_RADIUS
  );
  
  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
  
  // Cull edges
  const visibleEdges = cullEdges(edges, visibleNodeIds);
  
  // Save context state
  ctx.save();
  
  // Apply zoom and pan transform
  ctx.scale(zoom, zoom);
  ctx.translate(viewOffset.x / zoom, viewOffset.y / zoom);
  
  // Render edges first (behind nodes)
  renderEdges(visibleEdges);
  
  // Render nodes
  renderNodes(visibleNodes);
  
  // Restore context state
  ctx.restore();
  
  // Send render complete message
  self.postMessage({
    type: 'render-complete',
    visibleNodeCount: visibleNodes.length,
    totalNodeCount: nodes.length
  });
}

/**
 * Render edges
 * 
 * @param {Array} edges - Edges to render
 */
function renderEdges(edges) {
  ctx.strokeStyle = EDGE_COLOR;
  ctx.lineWidth = 2 / zoom; // Scale line width with zoom
  
  edges.forEach(edge => {
    const fromPos = nodePositions.get(edge.from);
    const toPos = nodePositions.get(edge.to);
    
    if (!fromPos || !toPos) return;
    
    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y);
    ctx.lineTo(toPos.x, toPos.y);
    ctx.stroke();
  });
}

/**
 * Render nodes
 * 
 * @param {Array} nodes - Nodes to render
 */
function renderNodes(nodes) {
  nodes.forEach(node => {
    const pos = nodePositions.get(node.id);
    if (!pos) return;
    
    const isSelected = node.selected || false;
    const isHovered = node.hovered || false;
    
    // Determine node color
    let nodeColor = NODE_COLOR;
    if (isSelected) {
      nodeColor = SELECTED_COLOR;
    } else if (isHovered) {
      nodeColor = HOVERED_COLOR;
    }
    
    // Draw node circle
    ctx.fillStyle = nodeColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw node border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2 / zoom;
    ctx.stroke();
    
    // Draw node icon if available
    const icon = nodeIcons.get(node.id);
    if (icon && icon.complete) {
      const iconSize = NODE_RADIUS * 1.2;
      ctx.drawImage(
        icon,
        pos.x - iconSize / 2,
        pos.y - iconSize / 2,
        iconSize,
        iconSize
      );
    }
    
    // Draw node label if available
    if (node.label) {
      ctx.fillStyle = '#333';
      ctx.font = `${12 / zoom}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.label, pos.x, pos.y + NODE_RADIUS + 5 / zoom);
    }
  });
}

/**
 * Handle messages from main thread
 */
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'init':
      // Initialize with offscreen canvas
      if (data.canvas) {
        initCanvas(data.canvas);
      }
      break;
    
    case 'update-viewport':
      // Update viewport and trigger re-render
      viewport = data.viewport || viewport;
      zoom = data.zoom !== undefined ? data.zoom : zoom;
      viewOffset = data.viewOffset || viewOffset;
      isDirty = true;
      break;
    
    case 'update-nodes':
      // Update nodes and positions
      nodes = data.nodes || [];
      nodePositions = new Map(data.nodePositions || []);
      isDirty = true;
      break;
    
    case 'update-edges':
      // Update edges
      edges = data.edges || [];
      isDirty = true;
      break;
    
    case 'update-node-icons':
      // Update node icons (ImageBitmap objects)
      nodeIcons = new Map(data.nodeIcons || []);
      isDirty = true;
      break;
    
    case 'update-node-state':
      // Update individual node state (selected, hovered, etc.)
      if (data.nodeId && data.state) {
        const node = nodes.find(n => n.id === data.nodeId);
        if (node) {
          Object.assign(node, data.state);
          isDirty = true;
        }
      }
      break;
    
    case 'clear':
      // Clear canvas
      nodes = [];
      edges = [];
      nodePositions.clear();
      nodeIcons.clear();
      isDirty = true;
      break;
    
    default:
      console.warn('Unknown message type:', type);
  }
};

// Handle errors
self.onerror = function(error) {
  console.error('Worker error:', error);
  self.postMessage({
    type: 'error',
    error: error.message
  });
};

