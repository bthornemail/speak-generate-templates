/**
 * Meta-Log Database Adapter
 * 
 * Adapter for MetaLogDbBrowser integration
 * Provides interface to meta-log-db package
 */

// Import MetaLogDbBrowser from meta-log-db package
// Note: This assumes the package is linked via npm link or available
let MetaLogDbBrowser = null;
let BrowserConfig = null;

// Lazy import - will be loaded in initialize()
async function loadMetaLogDb() {
  if (MetaLogDbBrowser) return; // Already loaded
  
  try {
    // Try to import from meta-log-db package
    // Use dynamic import with error handling for optional dependency
    let metaLogModule = null;
    try {
      // Check if module exists before importing
      metaLogModule = await import('meta-log-db/browser');
    } catch (importError) {
      // Module not available - this is OK, we'll use fallback
      console.warn('[Meta-Log] meta-log-db package not available, using fallback mode');
      return;
    }
    
    if (metaLogModule && metaLogModule.MetaLogDbBrowser) {
      MetaLogDbBrowser = metaLogModule.MetaLogDbBrowser;
      BrowserConfig = metaLogModule.BrowserConfig;
    }
  } catch (error) {
    console.warn('[Meta-Log] Could not import meta-log-db, using fallback:', error.message);
  }
}

/**
 * Meta-Log Database Adapter
 * 
 * Wraps MetaLogDbBrowser for use in CANVASL system
 */
export class MetaLogAdapter {
  constructor(config = {}) {
    this.config = {
      indexedDBName: 'canvasl-meta-log',
      enableProlog: true,
      enableDatalog: true,
      enableRdf: true,
      enableShacl: true,
      ...config
    };

    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize Meta-Log database
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    // Try to load meta-log-db package
    await loadMetaLogDb();

    if (MetaLogDbBrowser) {
      try {
        this.db = new MetaLogDbBrowser(this.config);
        await this.db.initialize();
        this.initialized = true;
        console.log('[Meta-Log] Database initialized');
      } catch (error) {
        console.warn('[Meta-Log] Failed to initialize MetaLogDbBrowser:', error);
        this.useFallback = true;
      }
    } else {
      this.useFallback = true;
    }

    if (this.useFallback) {
      // Fallback: Create minimal interface
      this.prolog = { facts: [], rules: [] };
      this.datalog = { facts: [], rules: [] };
      this.initialized = true;
      console.log('[Meta-Log] Using fallback implementation');
    }
  }

  /**
   * Execute ProLog query
   * 
   * @param {string} query - ProLog query string
   * @returns {Promise<Object>} Query results
   */
  async prologQuery(query) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.db && this.db.prologQuery) {
      return await this.db.prologQuery(query);
    }

    // Fallback: Return empty results
    return { bindings: [] };
  }

  /**
   * Execute DataLog query
   * 
   * @param {string} query - DataLog query string
   * @param {Object} program - Optional DataLog program
   * @returns {Promise<Object>} Query results
   */
  async datalogQuery(query, program = null) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.db && this.db.datalogQuery) {
      return await this.db.datalogQuery(query, program);
    }

    // Fallback: Return empty results
    return { facts: [] };
  }

  /**
   * Add ProLog rule
   * 
   * @param {string} rule - ProLog rule string
   * @returns {Promise<void>}
   */
  async addPrologRule(rule) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.db && this.db.addPrologRule) {
      this.db.addPrologRule(rule);
      return;
    }

    // Fallback: Store rule
    if (this.prolog) {
      this.prolog.rules.push(rule);
    }
  }

  /**
   * Add DataLog facts
   * 
   * @param {Array} facts - Array of fact objects
   * @returns {Promise<void>}
   */
  async addDataLogFacts(facts) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.db && this.db.datalog && this.db.datalog.addFacts) {
      this.db.datalog.addFacts(facts);
      return;
    }

    // Fallback: Store facts
    if (this.datalog) {
      this.datalog.facts.push(...facts);
    }
  }

  /**
   * Get ProLog engine (for direct access)
   * 
   * @returns {Object|null} ProLog engine
   */
  get prolog() {
    if (this.db && this.db.prolog) {
      return this.db.prolog;
    }
    return this.prolog || null;
  }

  /**
   * Get DataLog engine (for direct access)
   * 
   * @returns {Object|null} DataLog engine
   */
  get datalog() {
    if (this.db && this.db.datalog) {
      return this.db.datalog;
    }
    return this.datalog || null;
  }
}

