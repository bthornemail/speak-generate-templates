/**
 * Viewport Manager
 * 
 * Manages viewport state for infinite canvas:
 * - View offset (pan)
 * - Zoom level
 * - Viewport bounds
 * - Smooth transitions
 */

import { clampZoom, zoomToPoint, panViewport, getViewportBounds } from './infinite-canvas-utils.js';

/**
 * Viewport Manager Class
 */
export class ViewportManager {
  constructor(initialState = {}) {
    this.viewOffset = initialState.viewOffset || { x: 0, y: 0 };
    this.zoom = initialState.zoom || 1;
    this.minZoom = initialState.minZoom || 0.1;
    this.maxZoom = initialState.maxZoom || 10;
    this.screenWidth = initialState.screenWidth || 800;
    this.screenHeight = initialState.screenHeight || 600;
    
    this.listeners = [];
    this.isAnimating = false;
    this.animationTarget = null;
  }

  /**
   * Update viewport
   * 
   * @param {Object} updates - Updates {viewOffset?, zoom?}
   */
  update(updates) {
    if (updates.viewOffset !== undefined) {
      this.viewOffset = updates.viewOffset;
    }
    
    if (updates.zoom !== undefined) {
      this.zoom = clampZoom(updates.zoom, this.minZoom, this.maxZoom);
    }
    
    if (updates.screenWidth !== undefined) {
      this.screenWidth = updates.screenWidth;
    }
    
    if (updates.screenHeight !== undefined) {
      this.screenHeight = updates.screenHeight;
    }
    
    this.notifyListeners();
  }

  /**
   * Pan viewport by screen offset
   * 
   * @param {Object} screenOffset - Screen offset {x, y}
   */
  pan(screenOffset) {
    this.viewOffset = panViewport(screenOffset, this.viewOffset);
    this.notifyListeners();
  }

  /**
   * Zoom to a point
   * 
   * @param {Object} point - Point to zoom to (screen coordinates)
   * @param {number} deltaZoom - Change in zoom
   */
  zoomToPoint(point, deltaZoom) {
    const result = zoomToPoint(point, deltaZoom, this.viewOffset, this.zoom);
    this.viewOffset = result.viewOffset;
    this.zoom = result.zoom;
    this.notifyListeners();
  }

  /**
   * Set zoom level
   * 
   * @param {number} zoom - Zoom level
   */
  setZoom(zoom) {
    this.zoom = clampZoom(zoom, this.minZoom, this.maxZoom);
    this.notifyListeners();
  }

  /**
   * Get viewport bounds in virtual coordinates
   * 
   * @returns {Object} Viewport bounds
   */
  getViewportBounds() {
    return getViewportBounds(
      this.viewOffset,
      this.zoom,
      this.screenWidth,
      this.screenHeight
    );
  }

  /**
   * Get current state
   * 
   * @returns {Object} Current viewport state
   */
  getState() {
    return {
      viewOffset: { ...this.viewOffset },
      zoom: this.zoom,
      viewportBounds: this.getViewportBounds()
    };
  }

  /**
   * Register listener for viewport changes
   * 
   * @param {Function} listener - Listener function
   * @returns {Function} Unsubscribe function
   */
  onUpdate(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Viewport listener error:', error);
      }
    });
  }

  /**
   * Reset viewport to default
   */
  reset() {
    this.viewOffset = { x: 0, y: 0 };
    this.zoom = 1;
    this.notifyListeners();
  }

  /**
   * Smooth zoom animation
   * 
   * @param {number} targetZoom - Target zoom level
   * @param {Object} point - Point to zoom to (screen coordinates)
   * @param {number} duration - Animation duration (ms)
   * @returns {Promise} Resolves when animation completes
   */
  async animateZoom(targetZoom, point, duration = 300) {
    const startZoom = this.zoom;
    const clampedTarget = clampZoom(targetZoom, this.minZoom, this.maxZoom);
    
    return new Promise((resolve) => {
      const startTime = performance.now();
      this.isAnimating = true;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const eased = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
        
        const currentZoom = startZoom + (clampedTarget - startZoom) * eased;
        const result = zoomToPoint(point, clampedTarget - currentZoom, this.viewOffset, currentZoom);
        
        this.viewOffset = result.viewOffset;
        this.zoom = result.zoom;
        this.notifyListeners();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isAnimating = false;
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  /**
   * Smooth pan animation
   * 
   * @param {Object} targetOffset - Target view offset
   * @param {number} duration - Animation duration (ms)
   * @returns {Promise} Resolves when animation completes
   */
  async animatePan(targetOffset, duration = 300) {
    const startOffset = { ...this.viewOffset };
    
    return new Promise((resolve) => {
      const startTime = performance.now();
      this.isAnimating = true;
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const eased = progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
        
        this.viewOffset = {
          x: startOffset.x + (targetOffset.x - startOffset.x) * eased,
          y: startOffset.y + (targetOffset.y - startOffset.y) * eased
        };
        this.notifyListeners();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isAnimating = false;
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
}

