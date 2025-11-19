/**
 * Presence Manager
 * 
 * Tracks user presence on canvas:
 * - Cursor positions
 * - Active editors
 * - User avatars
 * - Selection state
 */

/**
 * Presence Manager Class
 */
export class PresenceManager {
  constructor(options = {}) {
    this.presences = new Map(); // peerId -> presence data
    this.localPresence = {
      peerId: options.localPeerId || 'local',
      cursor: { x: 0, y: 0 },
      selection: null,
      activeEditor: null,
      avatar: options.avatar || null,
      color: options.color || this.generateColor()
    };
    
    this.onPresenceUpdate = options.onPresenceUpdate || (() => {});
    this.updateInterval = null;
    this.updateFrequency = options.updateFrequency || 100; // ms
  }

  /**
   * Generate color for peer
   */
  generateColor() {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
      '#ffeaa7', '#dda15e', '#bc6c25', '#606c38'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Start presence tracking
   */
  start() {
    // Update local presence periodically
    this.updateInterval = setInterval(() => {
      this.broadcastPresence();
    }, this.updateFrequency);
  }

  /**
   * Stop presence tracking
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update local cursor position
   */
  updateCursor(x, y) {
    this.localPresence.cursor = { x, y };
    this.broadcastPresence();
  }

  /**
   * Update local selection
   */
  updateSelection(nodeId) {
    this.localPresence.selection = nodeId;
    this.broadcastPresence();
  }

  /**
   * Update active editor
   */
  updateActiveEditor(editorId) {
    this.localPresence.activeEditor = editorId;
    this.broadcastPresence();
  }

  /**
   * Update presence from remote peer
   */
  updateRemotePresence(peerId, presence) {
    this.presences.set(peerId, {
      ...presence,
      peerId,
      lastUpdate: Date.now()
    });
    
    this.onPresenceUpdate(peerId, presence);
  }

  /**
   * Remove presence for disconnected peer
   */
  removePresence(peerId) {
    this.presences.delete(peerId);
    this.onPresenceUpdate(peerId, null);
  }

  /**
   * Get all presences
   */
  getAllPresences() {
    return Array.from(this.presences.values());
  }

  /**
   * Get local presence
   */
  getLocalPresence() {
    return { ...this.localPresence };
  }

  /**
   * Broadcast presence (called by WebRTC)
   */
  broadcastPresence() {
    // This will be called by WebRTC collaboration manager
    return this.getLocalPresence();
  }

  /**
   * Clean up stale presences
   */
  cleanupStalePresences(timeout = 5000) {
    const now = Date.now();
    this.presences.forEach((presence, peerId) => {
      if (presence.lastUpdate && (now - presence.lastUpdate) > timeout) {
        this.removePresence(peerId);
      }
    });
  }
}

