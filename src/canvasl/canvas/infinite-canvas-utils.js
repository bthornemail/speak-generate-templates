/**
 * Infinite Canvas Utilities
 * 
 * Utilities for working with infinite virtual coordinate space
 * and mapping between screen and virtual coordinates
 */

/**
 * Convert screen coordinates to virtual coordinates
 * 
 * @param {Object} screenPoint - Screen point {x, y}
 * @param {Object} viewOffset - View offset {x, y}
 * @param {number} zoom - Zoom level
 * @returns {Object} Virtual coordinates {x, y}
 */
export function screenToVirtual(screenPoint, viewOffset, zoom) {
  return {
    x: (screenPoint.x - viewOffset.x) / zoom,
    y: (screenPoint.y - viewOffset.y) / zoom
  };
}

/**
 * Convert virtual coordinates to screen coordinates
 * 
 * @param {Object} virtualPoint - Virtual point {x, y}
 * @param {Object} viewOffset - View offset {x, y}
 * @param {number} zoom - Zoom level
 * @returns {Object} Screen coordinates {x, y}
 */
export function virtualToScreen(virtualPoint, viewOffset, zoom) {
  return {
    x: virtualPoint.x * zoom + viewOffset.x,
    y: virtualPoint.y * zoom + viewOffset.y
  };
}

/**
 * Clamp zoom level to valid range
 * 
 * @param {number} zoom - Zoom level
 * @param {number} minZoom - Minimum zoom (default: 0.1)
 * @param {number} maxZoom - Maximum zoom (default: 10)
 * @returns {number} Clamped zoom level
 */
export function clampZoom(zoom, minZoom = 0.1, maxZoom = 10) {
  return Math.max(minZoom, Math.min(maxZoom, zoom));
}

/**
 * Zoom to a specific point (zoom in/out centered on point)
 * 
 * @param {Object} point - Point to zoom to (screen coordinates)
 * @param {number} deltaZoom - Change in zoom (positive = zoom in, negative = zoom out)
 * @param {Object} currentViewOffset - Current view offset
 * @param {number} currentZoom - Current zoom level
 * @returns {Object} New view offset and zoom {viewOffset, zoom}
 */
export function zoomToPoint(point, deltaZoom, currentViewOffset, currentZoom) {
  const newZoom = clampZoom(currentZoom + deltaZoom);
  const zoomRatio = newZoom / currentZoom;
  
  // Calculate new offset to keep point at same screen position
  const newViewOffset = {
    x: point.x - (point.x - currentViewOffset.x) * zoomRatio,
    y: point.y - (point.y - currentViewOffset.y) * zoomRatio
  };
  
  return {
    viewOffset: newViewOffset,
    zoom: newZoom
  };
}

/**
 * Pan viewport by screen offset
 * 
 * @param {Object} screenOffset - Screen offset {x, y}
 * @param {Object} currentViewOffset - Current view offset
 * @returns {Object} New view offset
 */
export function panViewport(screenOffset, currentViewOffset) {
  return {
    x: currentViewOffset.x + screenOffset.x,
    y: currentViewOffset.y + screenOffset.y
  };
}

/**
 * Get viewport bounds in virtual coordinates
 * 
 * @param {Object} viewOffset - View offset {x, y}
 * @param {number} zoom - Zoom level
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 * @returns {Object} Viewport bounds {x, y, width, height}
 */
export function getViewportBounds(viewOffset, zoom, screenWidth, screenHeight) {
  const virtualWidth = screenWidth / zoom;
  const virtualHeight = screenHeight / zoom;
  
  return {
    x: -viewOffset.x / zoom,
    y: -viewOffset.y / zoom,
    width: virtualWidth,
    height: virtualHeight
  };
}

/**
 * Check if a point is within viewport
 * 
 * @param {Object} virtualPoint - Point in virtual coordinates
 * @param {Object} viewport - Viewport bounds
 * @returns {boolean} Whether point is visible
 */
export function isPointInViewport(virtualPoint, viewport) {
  return (
    virtualPoint.x >= viewport.x &&
    virtualPoint.x <= viewport.x + viewport.width &&
    virtualPoint.y >= viewport.y &&
    virtualPoint.y <= viewport.y + viewport.height
  );
}

/**
 * Smooth interpolation for zoom transitions
 * 
 * @param {number} from - Starting zoom
 * @param {number} to - Target zoom
 * @param {number} progress - Progress (0-1)
 * @returns {number} Interpolated zoom
 */
export function interpolateZoom(from, to, progress) {
  // Use exponential interpolation for smooth zoom
  const ratio = to / from;
  return from * Math.pow(ratio, progress);
}

/**
 * Calculate optimal zoom to fit all nodes
 * 
 * @param {Array} nodes - Array of nodes with positions
 * @param {Function} getPosition - Function to get node position
 * @param {number} screenWidth - Screen width
 * @param {number} screenHeight - Screen height
 * @param {number} padding - Padding around nodes (in pixels)
 * @returns {Object} Optimal view offset and zoom
 */
export function fitToNodes(nodes, getPosition, screenWidth, screenHeight, padding = 50) {
  if (nodes.length === 0) {
    return {
      viewOffset: { x: 0, y: 0 },
      zoom: 1
    };
  }
  
  // Calculate bounding box of all nodes
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  
  nodes.forEach(node => {
    const pos = getPosition(node);
    if (pos) {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    }
  });
  
  const nodeWidth = maxX - minX;
  const nodeHeight = maxY - minY;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  // Calculate zoom to fit
  const zoomX = (screenWidth - padding * 2) / nodeWidth;
  const zoomY = (screenHeight - padding * 2) / nodeHeight;
  const zoom = Math.min(zoomX, zoomY, 10); // Cap at 10x
  
  // Calculate offset to center nodes
  const viewOffset = {
    x: screenWidth / 2 - centerX * zoom,
    y: screenHeight / 2 - centerY * zoom
  };
  
  return {
    viewOffset,
    zoom: Math.max(0.1, zoom) // Ensure minimum zoom
  };
}

