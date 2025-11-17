/**
 * IndexedDB Storage - Metadata and indexes for fast queries
 */

/**
 * IndexedDB Store for CANVASL metadata
 */
export class IndexedDBStore {
  constructor(dbName = 'canvasl', version = 2) {
    this.dbName = dbName;
    this.version = version;
    /** @type {IDBDatabase|null} */
    this.db = null;
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDB] Initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion || 0;

        // Nodes store
        if (!db.objectStoreNames.contains('nodes')) {
          const nodes = db.createObjectStore('nodes', { keyPath: 'cid' });
          nodes.createIndex('by-parent', 'parent', { unique: false });
          nodes.createIndex('by-path', 'path', { unique: false });
          nodes.createIndex('by-timestamp', 'timestamp', { unique: false });
        }

        // DAG store
        if (!db.objectStoreNames.contains('dag')) {
          db.createObjectStore('dag', { keyPath: 'cid' });
        }

        // Chain complex store
        if (!db.objectStoreNames.contains('complex')) {
          db.createObjectStore('complex', { keyPath: 'id' });
        }

        // Command history store (version 2+)
        if (oldVersion < 2 && !db.objectStoreNames.contains('commandHistory')) {
          const history = db.createObjectStore('commandHistory', { keyPath: 'id', autoIncrement: true });
          history.createIndex('by-timestamp', 'timestamp', { unique: false });
          history.createIndex('by-command', 'command', { unique: false });
        }

        // Templates store (version 2+)
        if (oldVersion < 2 && !db.objectStoreNames.contains('templates')) {
          const templates = db.createObjectStore('templates', { keyPath: 'id' });
          templates.createIndex('by-name', 'name', { unique: false });
          templates.createIndex('by-timestamp', 'timestamp', { unique: false });
        }

        // Voice macros store (version 2+)
        if (oldVersion < 2 && !db.objectStoreNames.contains('voiceMacros')) {
          const macros = db.createObjectStore('voiceMacros', { keyPath: 'id' });
          macros.createIndex('by-trigger', 'trigger', { unique: true });
        }

        // Voice profiles store (version 2+)
        if (oldVersion < 2 && !db.objectStoreNames.contains('voiceProfiles')) {
          const profiles = db.createObjectStore('voiceProfiles', { keyPath: 'id' });
          profiles.createIndex('by-name', 'name', { unique: false });
        }

        console.log('[IndexedDB] Created/upgraded object stores');
      };
    });
  }

  /**
   * Index a MetaLogNode for fast lookups
   *
   * @param {MetaLogNode} node - Node to index
   * @param {number} timestamp - MetaLog timestamp
   */
  async indexNode(node, timestamp) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('nodes', 'readwrite');
      const store = tx.objectStore('nodes');

      const record = {
        cid: node.cid,
        parent: node.parent,
        path: node.path,
        uri: node.uri,
        timestamp
      };

      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get children of a node
   *
   * @param {string} parentCID - Parent CID
   * @returns {Promise<string[]>} Array of child CIDs
   */
  async getChildren(parentCID) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('nodes', 'readonly');
      const store = tx.objectStore('nodes');
      const index = store.index('by-parent');

      const request = index.getAll(parentCID);
      request.onsuccess = () => {
        const children = request.result.map(node => node.cid);
        resolve(children);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get nodes by BIP32 path
   *
   * @param {string} path - BIP32 path
   * @returns {Promise<Object[]>} Array of node metadata
   */
  async getNodesByPath(path) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('nodes', 'readonly');
      const store = tx.objectStore('nodes');
      const index = store.index('by-path');

      const request = index.getAll(path);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get recent nodes
   *
   * @param {number} limit - Maximum number of nodes
   * @returns {Promise<Object[]>} Array of node metadata
   */
  async getRecentNodes(limit = 10) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('nodes', 'readonly');
      const store = tx.objectStore('nodes');
      const index = store.index('by-timestamp');

      const nodes = [];
      const request = index.openCursor(null, 'prev'); // Descending order

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && nodes.length < limit) {
          nodes.push(cursor.value);
          cursor.continue();
        } else {
          resolve(nodes);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store DAG structure
   *
   * @param {string} cid - Node CID
   * @param {Object} dagInfo - DAG information
   * @param {string[]} dagInfo.children - Child CIDs
   * @param {number} dagInfo.depth - Depth in DAG
   */
  async storeDagInfo(cid, dagInfo) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('dag', 'readwrite');
      const store = tx.objectStore('dag');

      const request = store.put({ cid, ...dagInfo });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get DAG information
   *
   * @param {string} cid - Node CID
   * @returns {Promise<Object|null>} DAG info or null
   */
  async getDagInfo(cid) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('dag', 'readonly');
      const store = tx.objectStore('dag');

      const request = store.get(cid);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store chain complex
   *
   * @param {string} id - Complex ID
   * @param {ChainComplex} complex - Chain complex
   */
  async storeComplex(id, complex) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('complex', 'readwrite');
      const store = tx.objectStore('complex');

      // Convert Map to array for storage
      const serialized = {
        id,
        C0: complex.C0,
        C1: complex.C1,
        C2: complex.C2,
        C3: complex.C3,
        C4: complex.C4,
        boundary: Array.from(complex.boundary.entries())
      };

      const request = store.put(serialized);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load chain complex
   *
   * @param {string} id - Complex ID
   * @returns {Promise<ChainComplex|null>} Chain complex or null
   */
  async loadComplex(id) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('complex', 'readonly');
      const store = tx.objectStore('complex');

      const request = store.get(id);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Reconstruct Map from array
        const complex = {
          C0: result.C0,
          C1: result.C1,
          C2: result.C2,
          C3: result.C3,
          C4: result.C4,
          boundary: new Map(result.boundary)
        };

        resolve(complex);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add command to history
   * 
   * @param {string} command - Command text
   * @param {string} [type] - Command type (voice/text)
   * @returns {Promise<number>} Command ID
   */
  async addCommandHistory(command, type = 'voice') {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('commandHistory', 'readwrite');
      const store = tx.objectStore('commandHistory');

      const record = {
        command,
        type,
        timestamp: Date.now()
      };

      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get command history
   * 
   * @param {number} limit - Maximum number of commands
   * @returns {Promise<Array>} Command history
   */
  async getCommandHistory(limit = 50) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('commandHistory', 'readonly');
      const store = tx.objectStore('commandHistory');
      const index = store.index('by-timestamp');

      const commands = [];
      const request = index.openCursor(null, 'prev'); // Descending order

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && commands.length < limit) {
          commands.push(cursor.value);
          cursor.continue();
        } else {
          resolve(commands);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save template
   * 
   * @param {string} id - Template ID
   * @param {Object} template - Template object
   * @param {string} template.name - Template name
   * @param {Object} template.frontmatter - Template frontmatter
   * @param {string} template.body - Template body
   * @returns {Promise<void>}
   */
  async saveTemplate(id, template) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('templates', 'readwrite');
      const store = tx.objectStore('templates');

      const record = {
        id,
        name: template.name || id,
        frontmatter: template.frontmatter,
        body: template.body,
        timestamp: Date.now()
      };

      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load template
   * 
   * @param {string} id - Template ID
   * @returns {Promise<Object|null>} Template or null
   */
  async loadTemplate(id) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('templates', 'readonly');
      const store = tx.objectStore('templates');

      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * List all templates
   * 
   * @returns {Promise<Array>} Array of templates
   */
  async listTemplates() {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('templates', 'readonly');
      const store = tx.objectStore('templates');

      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete template
   * 
   * @param {string} id - Template ID
   * @returns {Promise<void>}
   */
  async deleteTemplate(id) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('templates', 'readwrite');
      const store = tx.objectStore('templates');

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save voice macro
   * 
   * @param {string} id - Macro ID
   * @param {string} trigger - Voice trigger phrase
   * @param {string} action - Action to execute
   * @param {Object} [params] - Action parameters
   * @returns {Promise<void>}
   */
  async saveVoiceMacro(id, trigger, action, params = {}) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('voiceMacros', 'readwrite');
      const store = tx.objectStore('voiceMacros');

      const record = {
        id,
        trigger: trigger.toLowerCase(),
        action,
        params,
        timestamp: Date.now()
      };

      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get voice macro by trigger
   * 
   * @param {string} trigger - Trigger phrase
   * @returns {Promise<Object|null>} Macro or null
   */
  async getVoiceMacro(trigger) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('voiceMacros', 'readonly');
      const store = tx.objectStore('voiceMacros');
      const index = store.index('by-trigger');

      const request = index.get(trigger.toLowerCase());
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * List all voice macros
   * 
   * @returns {Promise<Array>} Array of macros
   */
  async listVoiceMacros() {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('voiceMacros', 'readonly');
      const store = tx.objectStore('voiceMacros');

      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete voice macro
   * 
   * @param {string} id - Macro ID
   * @returns {Promise<void>}
   */
  async deleteVoiceMacro(id) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('voiceMacros', 'readwrite');
      const store = tx.objectStore('voiceMacros');

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save voice profile
   * 
   * @param {string} id - Profile ID
   * @param {Object} profile - Voice profile
   * @param {string} profile.name - Profile name
   * @param {string} [profile.lang] - Language
   * @param {number} [profile.rate] - Speech rate
   * @param {number} [profile.pitch] - Speech pitch
   * @param {number} [profile.volume] - Speech volume
   * @param {string} [profile.voice] - Voice name
   * @returns {Promise<void>}
   */
  async saveVoiceProfile(id, profile) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('voiceProfiles', 'readwrite');
      const store = tx.objectStore('voiceProfiles');

      const record = {
        id,
        name: profile.name || id,
        lang: profile.lang || 'en-US',
        rate: profile.rate ?? 1.0,
        pitch: profile.pitch ?? 1.0,
        volume: profile.volume ?? 1.0,
        voice: profile.voice || null,
        timestamp: Date.now()
      };

      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load voice profile
   * 
   * @param {string} id - Profile ID
   * @returns {Promise<Object|null>} Profile or null
   */
  async loadVoiceProfile(id) {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('voiceProfiles', 'readonly');
      const store = tx.objectStore('voiceProfiles');

      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * List all voice profiles
   * 
   * @returns {Promise<Array>} Array of profiles
   */
  async listVoiceProfiles() {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('voiceProfiles', 'readonly');
      const store = tx.objectStore('voiceProfiles');

      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('[IndexedDB] Closed');
    }
  }
}
