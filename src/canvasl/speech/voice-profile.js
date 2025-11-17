/**
 * Voice Profile Manager
 * 
 * Manages voice profile customization
 */

import { IndexedDBStore } from '../storage/idb.js';
import { SpeechSynthesisHandler } from './synthesis.js';

/**
 * Voice Profile Manager
 */
export class VoiceProfileManager {
  constructor() {
    this.db = new IndexedDBStore();
    this.currentProfile = null;
    this.synthesisHandler = null;
    this.initialized = false;
  }

  /**
   * Initialize voice profile manager
   */
  async initialize() {
    if (this.initialized) return;

    await this.db.init();
    
    // Load default profile
    const defaultProfile = await this.db.loadVoiceProfile('default');
    if (defaultProfile) {
      await this.loadProfile('default');
    }

    this.initialized = true;
  }

  /**
   * Create or update voice profile
   * 
   * @param {string} id - Profile ID
   * @param {Object} profile - Profile settings
   * @param {string} profile.name - Profile name
   * @param {string} [profile.lang] - Language code
   * @param {number} [profile.rate] - Speech rate (0.1-10)
   * @param {number} [profile.pitch] - Speech pitch (0-2)
   * @param {number} [profile.volume] - Speech volume (0-1)
   * @param {string} [profile.voice] - Voice name
   * @returns {Promise<void>}
   */
  async saveProfile(id, profile) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.db.saveVoiceProfile(id, profile);
  }

  /**
   * Load voice profile
   * 
   * @param {string} id - Profile ID
   * @returns {Promise<void>}
   */
  async loadProfile(id) {
    if (!this.initialized) {
      await this.initialize();
    }

    const profile = await this.db.loadVoiceProfile(id);
    if (!profile) {
      throw new Error(`Profile not found: ${id}`);
    }

    this.currentProfile = profile;

    // Apply profile to synthesis handler if available
    if (this.synthesisHandler) {
      this.applyProfileToHandler();
    }
  }

  /**
   * Apply current profile to synthesis handler
   */
  applyProfileToHandler() {
    if (!this.synthesisHandler || !this.currentProfile) return;

    this.synthesisHandler.setLang(this.currentProfile.lang || 'en-US');
    this.synthesisHandler.setRate(this.currentProfile.rate ?? 1.0);
    this.synthesisHandler.setPitch(this.currentProfile.pitch ?? 1.0);
    this.synthesisHandler.setVolume(this.currentProfile.volume ?? 1.0);
    
    if (this.currentProfile.voice) {
      this.synthesisHandler.setVoice(this.currentProfile.voice);
    }
  }

  /**
   * Set synthesis handler
   * 
   * @param {SpeechSynthesisHandler} handler - Synthesis handler
   */
  setSynthesisHandler(handler) {
    this.synthesisHandler = handler;
    if (this.currentProfile) {
      this.applyProfileToHandler();
    }
  }

  /**
   * Get current profile
   * 
   * @returns {Object|null} Current profile
   */
  getCurrentProfile() {
    return this.currentProfile;
  }

  /**
   * List all profiles
   * 
   * @returns {Promise<Array>} Array of profiles
   */
  async listProfiles() {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.db.listVoiceProfiles();
  }

  /**
   * Delete profile
   * 
   * @param {string} id - Profile ID
   * @returns {Promise<void>}
   */
  async deleteProfile(id) {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.db.deleteVoiceProfile(id);
    
    if (this.currentProfile && this.currentProfile.id === id) {
      this.currentProfile = null;
    }
  }
}

