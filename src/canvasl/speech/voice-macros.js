/**
 * Voice Macros Manager
 * 
 * Manages voice shortcuts and macros
 */

import { IndexedDBStore } from '../storage/idb.js';

/**
 * Voice Macros Manager
 */
export class VoiceMacrosManager {
  constructor() {
    this.db = new IndexedDBStore();
    this.macros = new Map();
    this.initialized = false;
  }

  /**
   * Initialize voice macros manager
   */
  async initialize() {
    if (this.initialized) return;

    await this.db.init();
    const macros = await this.db.listVoiceMacros();
    
    // Load macros into memory
    macros.forEach(macro => {
      this.macros.set(macro.trigger.toLowerCase(), macro);
    });

    this.initialized = true;
  }

  /**
   * Register a voice macro
   * 
   * @param {string} id - Macro ID
   * @param {string} trigger - Voice trigger phrase
   * @param {string} action - Action name
   * @param {Object} params - Action parameters
   * @returns {Promise<void>}
   */
  async registerMacro(id, trigger, action, params = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.db.saveVoiceMacro(id, trigger, action, params);
    
    // Update in-memory cache
    const macro = {
      id,
      trigger: trigger.toLowerCase(),
      action,
      params,
      timestamp: Date.now()
    };
    this.macros.set(macro.trigger, macro);
  }

  /**
   * Check if transcript matches a macro trigger
   * 
   * @param {string} transcript - Speech transcript
   * @returns {Object|null} Macro match or null
   */
  checkMacro(transcript) {
    const lower = transcript.toLowerCase().trim();
    
    // Check for exact match first
    if (this.macros.has(lower)) {
      return this.macros.get(lower);
    }

    // Check for partial match (trigger phrase in transcript)
    for (const [trigger, macro] of this.macros) {
      if (lower.includes(trigger)) {
        return macro;
      }
    }

    return null;
  }

  /**
   * Execute macro action
   * 
   * @param {Object} macro - Macro object
   * @param {Function} actionHandler - Action handler function
   * @returns {Promise<any>} Action result
   */
  async executeMacro(macro, actionHandler) {
    if (typeof actionHandler !== 'function') {
      throw new Error('Action handler must be a function');
    }

    return await actionHandler(macro.action, macro.params);
  }

  /**
   * List all macros
   * 
   * @returns {Promise<Array>} Array of macros
   */
  async listMacros() {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.db.listVoiceMacros();
  }

  /**
   * Delete macro
   * 
   * @param {string} id - Macro ID
   * @returns {Promise<void>}
   */
  async deleteMacro(id) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.db.deleteVoiceMacro(id);
    
    // Remove from cache
    for (const [trigger, macro] of this.macros) {
      if (macro.id === id) {
        this.macros.delete(trigger);
        break;
      }
    }
  }

  /**
   * Get macro by trigger
   * 
   * @param {string} trigger - Trigger phrase
   * @returns {Promise<Object|null>} Macro or null
   */
  async getMacro(trigger) {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.db.getVoiceMacro(trigger);
  }
}

