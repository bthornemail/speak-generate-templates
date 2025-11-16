/**
 * IndexedDB Storage - Metadata and indexes for fast queries
 */

/**
 * IndexedDB Store for CANVASL metadata
 */
export class IndexedDBStore {
  constructor(dbName = 'canvasl', version = 1) {
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

        console.log('[IndexedDB] Created object stores');
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
