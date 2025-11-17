/**
 * SVG Icon Loader
 * 
 * Loads SVG icons from /public/icons/ or data URIs
 * Caches loaded icons for performance
 * Supports avatar icons and node type icons
 */

class IconLoader {
  constructor() {
    this.iconCache = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Load SVG icon as Image object
   * 
   * @param {string} svgPath - Path to SVG file or data URI
   * @returns {Promise<HTMLImageElement>} Loaded image
   */
  async loadSVGIcon(svgPath) {
    // Check cache first
    if (this.iconCache.has(svgPath)) {
      return this.iconCache.get(svgPath);
    }

    // Check if already loading
    if (this.loadingPromises.has(svgPath)) {
      return this.loadingPromises.get(svgPath);
    }

    // Start loading
    const loadPromise = this._loadImage(svgPath);
    this.loadingPromises.set(svgPath, loadPromise);

    try {
      const img = await loadPromise;
      this.iconCache.set(svgPath, img);
      this.loadingPromises.delete(svgPath);
      return img;
    } catch (error) {
      this.loadingPromises.delete(svgPath);
      throw error;
    }
  }

  /**
   * Internal method to load image
   * 
   * @param {string} svgPath - Path to SVG
   * @returns {Promise<HTMLImageElement>}
   */
  _loadImage(svgPath) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback to default shape
        console.warn(`Failed to load icon: ${svgPath}, using default`);
        resolve(this._createDefaultIcon());
      };
      img.src = svgPath;
    });
  }

  /**
   * Create default icon shape (circle)
   * 
   * @returns {HTMLImageElement} Default icon
   */
  _createDefaultIcon() {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    // Draw circle
    ctx.fillStyle = '#2196f3';
    ctx.beginPath();
    ctx.arc(20, 20, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Convert to image
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  /**
   * Get icon path for node type
   * 
   * @param {string} nodeType - Type of node (template, directive, macro, etc.)
   * @param {string} category - Category (avatars or types)
   * @returns {string} Icon path
   */
  getIconPath(nodeType, category = 'types') {
    // Check if it's a full path
    if (nodeType.startsWith('/') || nodeType.startsWith('data:')) {
      return nodeType;
    }

    // Default paths
    const iconMap = {
      avatars: {
        'node-default': '/icons/avatars/node-default.svg',
        'node-root': '/icons/avatars/node-root.svg',
        'node-leaf': '/icons/avatars/node-leaf.svg'
      },
      types: {
        'template': '/icons/types/template.svg',
        'directive': '/icons/types/directive.svg',
        'macro': '/icons/types/macro.svg'
      }
    };

    return iconMap[category]?.[nodeType] || iconMap.avatars['node-default'];
  }

  /**
   * Load icon for node
   * 
   * @param {object} node - Node object
   * @returns {Promise<HTMLImageElement>} Loaded icon
   */
  async loadNodeIcon(node) {
    // Determine icon type from node
    const nodeType = node.type || 'node-default';
    const category = node.parent === 'genesis' ? 'avatars' : 'types';
    const iconPath = this.getIconPath(nodeType, category);
    
    return this.loadSVGIcon(iconPath);
  }

  /**
   * Clear icon cache
   */
  clearCache() {
    this.iconCache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Preload icons
   * 
   * @param {string[]} iconPaths - Array of icon paths to preload
   */
  async preloadIcons(iconPaths) {
    return Promise.all(iconPaths.map(path => this.loadSVGIcon(path)));
  }
}

// Export singleton instance
export const iconLoader = new IconLoader();
export default iconLoader;


