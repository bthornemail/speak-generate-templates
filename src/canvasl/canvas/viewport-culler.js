/**
 * Viewport Culling Utilities
 * 
 * Utilities for determining which nodes are visible in the viewport
 * to optimize rendering performance
 */

/**
 * Check if a point is within viewport bounds
 * 
 * @param {Object} point - Point with x, y coordinates
 * @param {Object} viewport - Viewport with x, y, width, height
 * @param {number} padding - Padding around viewport (in pixels)
 * @returns {boolean} Whether point is visible
 */
export function isPointInViewport(point, viewport, padding = 50) {
  return (
    point.x >= viewport.x - padding &&
    point.x <= viewport.x + viewport.width + padding &&
    point.y >= viewport.y - padding &&
    point.y <= viewport.y + viewport.height + padding
  );
}

/**
 * Check if a rectangle intersects with viewport
 * 
 * @param {Object} rect - Rectangle with x, y, width, height
 * @param {Object} viewport - Viewport with x, y, width, height
 * @param {number} padding - Padding around viewport (in pixels)
 * @returns {boolean} Whether rectangle intersects viewport
 */
export function isRectInViewport(rect, viewport, padding = 50) {
  return !(
    rect.x + rect.width < viewport.x - padding ||
    rect.x > viewport.x + viewport.width + padding ||
    rect.y + rect.height < viewport.y - padding ||
    rect.y > viewport.y + viewport.height + padding
  );
}

/**
 * Calculate viewport bounds from pan/zoom
 * 
 * @param {Object} viewOffset - View offset {x, y}
 * @param {number} zoom - Zoom level
 * @param {number} canvasWidth - Canvas width (screen pixels)
 * @param {number} canvasHeight - Canvas height (screen pixels)
 * @returns {Object} Viewport bounds in virtual coordinates
 */
export function calculateViewportBounds(viewOffset, zoom, canvasWidth, canvasHeight) {
  // Convert screen coordinates to virtual coordinates
  const virtualWidth = canvasWidth / zoom;
  const virtualHeight = canvasHeight / zoom;
  
  return {
    x: -viewOffset.x / zoom,
    y: -viewOffset.y / zoom,
    width: virtualWidth,
    height: virtualHeight
  };
}

/**
 * Filter nodes to only those visible in viewport
 * 
 * @param {Array} nodes - Array of nodes with position information
 * @param {Object} viewport - Viewport bounds
 * @param {Function} getNodePosition - Function to get node position (node) => {x, y}
 * @param {number} nodeRadius - Approximate node radius for culling
 * @returns {Array} Filtered array of visible nodes
 */
export function cullNodes(nodes, viewport, getNodePosition, nodeRadius = 30) {
  return nodes.filter(node => {
    const pos = getNodePosition(node);
    if (!pos) return false;
    
    // Create bounding box for node
    const nodeRect = {
      x: pos.x - nodeRadius,
      y: pos.y - nodeRadius,
      width: nodeRadius * 2,
      height: nodeRadius * 2
    };
    
    return isRectInViewport(nodeRect, viewport, nodeRadius);
  });
}

/**
 * Calculate visible edges based on visible nodes
 * 
 * @param {Array} edges - Array of edges
 * @param {Set} visibleNodeIds - Set of visible node IDs
 * @returns {Array} Filtered array of visible edges
 */
export function cullEdges(edges, visibleNodeIds) {
  return edges.filter(edge => {
    // Include edge if both endpoints are visible
    // Or if at least one endpoint is visible (for edges going off-screen)
    return (
      (edge.from && visibleNodeIds.has(edge.from)) ||
      (edge.to && visibleNodeIds.has(edge.to))
    );
  });
}

/**
 * Get viewport bounds with infinite space support
 * 
 * @param {Object} viewOffset - View offset {x, y}
 * @param {number} zoom - Zoom level
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 * @returns {Object} Viewport in virtual coordinates
 */
export function getInfiniteViewport(viewOffset, zoom, screenWidth, screenHeight) {
  // Virtual coordinates are infinite, but viewport is finite
  const virtualWidth = screenWidth / zoom;
  const virtualHeight = screenHeight / zoom;
  
  const virtualX = -viewOffset.x / zoom;
  const virtualY = -viewOffset.y / zoom;
  
  return {
    x: virtualX,
    y: virtualY,
    width: virtualWidth,
    height: virtualHeight,
    // Infinite bounds (for reference)
    minX: -Infinity,
    maxX: Infinity,
    minY: -Infinity,
    maxY: Infinity
  };
}

