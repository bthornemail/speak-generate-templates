/**
 * Command History Manager
 * 
 * Manages command history with navigation support
 */

import { IndexedDBStore } from '../storage/idb.js';

/**
 * Command History Manager
 */
export class CommandHistoryManager {
  constructor() {
    this.db = new IndexedDBStore();
    this.history = [];
    this.currentIndex = -1;
    this.initialized = false;
  }

  /**
   * Initialize command history manager
   */
  async initialize() {
    if (this.initialized) return;

    await this.db.init();
    this.history = await this.db.getCommandHistory(100);
    this.currentIndex = this.history.length - 1;
    this.initialized = true;
  }

  /**
   * Add command to history
   * 
   * @param {string} command - Command text
   * @param {string} type - Command type (voice/text)
   */
  async addCommand(command, type = 'voice') {
    if (!this.initialized) {
      await this.initialize();
    }

    // Add to database
    await this.db.addCommandHistory(command, type);

    // Add to local history
    this.history.push({ command, type, timestamp: Date.now() });
    
    // Keep history size manageable
    if (this.history.length > 100) {
      this.history.shift();
    }

    // Reset navigation index
    this.currentIndex = this.history.length - 1;
  }

  /**
   * Get previous command (up arrow)
   * 
   * @returns {string|null} Previous command or null
   */
  getPrevious() {
    if (this.history.length === 0) return null;

    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex].command;
    }

    return this.history[0].command;
  }

  /**
   * Get next command (down arrow)
   * 
   * @returns {string|null} Next command or null
   */
  getNext() {
    if (this.history.length === 0) return null;

    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex].command;
    }

    // Return empty string when at end
    return '';
  }

  /**
   * Reset navigation index
   */
  resetNavigation() {
    this.currentIndex = this.history.length - 1;
  }

  /**
   * Get all history
   * 
   * @returns {Array} Command history
   */
  getAllHistory() {
    return [...this.history];
  }

  /**
   * Clear history
   */
  async clearHistory() {
    // Clear from database (would need delete method)
    this.history = [];
    this.currentIndex = -1;
    await this.db.getCommandHistory(0); // Refresh
  }
}

