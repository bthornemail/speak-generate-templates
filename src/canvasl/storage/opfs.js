/**
 * OPFS (Origin Private File System) Storage
 *
 * Fast, private storage for MetaLogNodes and blobs
 */

/**
 * OPFS Store for CANVASL nodes
 */
export class OPFSStore {
  constructor() {
    /** @type {FileSystemDirectoryHandle|null} */
    this.root = null;
  }

  /**
   * Initialize OPFS storage
   */
  async init() {
    if (!navigator.storage || !navigator.storage.getDirectory) {
      throw new Error('OPFS not supported in this browser');
    }

    this.root = await navigator.storage.getDirectory();

    // Create directory structure
    await this.root.getDirectoryHandle('ledger', { create: true });
    await this.root.getDirectoryHandle('blobs', { create: true });
    await this.root.getDirectoryHandle('metalog', { create: true });

    console.log('[OPFS] Initialized storage');
  }

  /**
   * Write a MetaLogNode to storage
   *
   * @param {string} path - File path (e.g., CID or BIP32 path)
   * @param {MetaLogNode} node - Node to write
   */
  async writeNode(path, node) {
    if (!this.root) {
      throw new Error('OPFS not initialized');
    }

    const ledger = await this.root.getDirectoryHandle('ledger');
    const fileName = this.sanitizePath(path);
    const file = await ledger.getFileHandle(fileName, { create: true });
    const writable = await file.createWritable();

    await writable.write(JSON.stringify(node, null, 2));
    await writable.close();

    console.log(`[OPFS] Wrote node: ${fileName}`);
  }

  /**
   * Read a MetaLogNode from storage
   *
   * @param {string} path - File path
   * @returns {Promise<MetaLogNode|null>} Node or null if not found
   */
  async readNode(path) {
    if (!this.root) {
      throw new Error('OPFS not initialized');
    }

    try {
      const ledger = await this.root.getDirectoryHandle('ledger');
      const fileName = this.sanitizePath(path);
      const file = await ledger.getFileHandle(fileName);
      const blob = await file.getFile();
      const text = await blob.text();

      return JSON.parse(text);
    } catch (error) {
      // File not found
      return null;
    }
  }

  /**
   * List all nodes in storage
   *
   * @returns {Promise<string[]>} List of file paths
   */
  async listNodes() {
    if (!this.root) {
      throw new Error('OPFS not initialized');
    }

    const ledger = await this.root.getDirectoryHandle('ledger');
    const paths = [];

    for await (const entry of ledger.values()) {
      if (entry.kind === 'file') {
        paths.push(entry.name);
      }
    }

    return paths;
  }

  /**
   * Write a blob (large binary data)
   *
   * @param {string} cid - Content ID
   * @param {Blob} blob - Data blob
   */
  async writeBlob(cid, blob) {
    if (!this.root) {
      throw new Error('OPFS not initialized');
    }

    const blobs = await this.root.getDirectoryHandle('blobs');
    const fileName = this.sanitizePath(cid);
    const file = await blobs.getFileHandle(fileName, { create: true });
    const writable = await file.createWritable();

    await writable.write(blob);
    await writable.close();

    console.log(`[OPFS] Wrote blob: ${fileName} (${blob.size} bytes)`);
  }

  /**
   * Read a blob
   *
   * @param {string} cid - Content ID
   * @returns {Promise<Blob|null>} Blob or null if not found
   */
  async readBlob(cid) {
    if (!this.root) {
      throw new Error('OPFS not initialized');
    }

    try {
      const blobs = await this.root.getDirectoryHandle('blobs');
      const fileName = this.sanitizePath(cid);
      const file = await blobs.getFileHandle(fileName);
      return await file.getFile();
    } catch (error) {
      return null;
    }
  }

  /**
   * Append to MetaLog (append-only log)
   *
   * @param {Object} entry - MetaLog entry
   */
  async appendMetaLog(entry) {
    if (!this.root) {
      throw new Error('OPFS not initialized');
    }

    const metalog = await this.root.getDirectoryHandle('metalog');
    const file = await metalog.getFileHandle('sync.jsonl', { create: true });

    // Read existing content
    const existingFile = await file.getFile();
    const existingText = await existingFile.text();

    // Append new entry
    const newLine = JSON.stringify(entry) + '\n';
    const writable = await file.createWritable();
    await writable.write(existingText + newLine);
    await writable.close();
  }

  /**
   * Read MetaLog entries
   *
   * @returns {Promise<Object[]>} Array of MetaLog entries
   */
  async readMetaLog() {
    if (!this.root) {
      throw new Error('OPFS not initialized');
    }

    try {
      const metalog = await this.root.getDirectoryHandle('metalog');
      const file = await metalog.getFileHandle('sync.jsonl');
      const blob = await file.getFile();
      const text = await blob.text();

      // Parse JSONL
      return text
        .trim()
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  /**
   * Sanitize file path (remove invalid characters)
   *
   * @param {string} path - Input path
   * @returns {string} Sanitized path
   */
  sanitizePath(path) {
    return path.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  /**
   * Get storage quota information
   *
   * @returns {Promise<{usage: number, quota: number}>} Storage info
   */
  async getStorageInfo() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { usage: 0, quota: 0 };
    }

    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0
    };
  }
}
