/**
 * LSP Client
 * 
 * Browser-side LSP client for CodeMirror 6 integration
 * Falls back to browser-native implementation when server unavailable
 */

import { BrowserLSPService } from './browser-lsp-service.js';

export class LSPClient {
  constructor(serverUrl = 'ws://localhost:3000/lsp') {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.connected = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.initializePromise = null;
    this.browserService = new BrowserLSPService();
    this.useBrowserFallback = true; // Use browser fallback by default
  }

  /**
   * Initialize LSP connection
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initializePromise) {
      return this.initializePromise;
    }
    
    this.initializePromise = this.connect();
    return this.initializePromise;
  }

  /**
   * Connect to LSP server
   * 
   * @returns {Promise<void>}
   */
  async connect() {
    // If browser fallback is enabled, skip connection attempt
    if (this.useBrowserFallback) {
      console.log('Using browser-native LSP service (no server connection)');
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.serverUrl);
        
        this.ws.onopen = () => {
          this.connected = true;
          this.initializeLSP().then(resolve).catch(reject);
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };
        
        this.ws.onerror = (error) => {
          console.warn('LSP server connection failed, using browser fallback');
          this.useBrowserFallback = true;
          resolve(); // Resolve to use fallback
        };
        
        this.ws.onclose = () => {
          this.connected = false;
          this.useBrowserFallback = true;
        };
      } catch (error) {
        console.warn('LSP server connection error, using browser fallback:', error);
        this.useBrowserFallback = true;
        resolve(); // Resolve to use fallback
      }
    });
  }

  /**
   * Initialize LSP protocol
   * 
   * @returns {Promise<void>}
   */
  async initializeLSP() {
    const response = await this.request('initialize', {
      processId: null,
      rootUri: null,
      capabilities: {}
    });
    
    await this.request('initialized', {});
    
    return response;
  }

  /**
   * Send request to LSP server
   * 
   * @param {string} method - LSP method
   * @param {object} params - Request parameters
   * @returns {Promise<any>} Response
   */
  async request(method, params) {
    if (!this.connected) {
      await this.initialize();
    }
    
    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(request));
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 5000);
    });
  }

  /**
   * Handle message from LSP server
   * 
   * @param {object} message - LSP message
   */
  handleMessage(message) {
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve } = this.pendingRequests.get(message.id);
      this.pendingRequests.delete(message.id);
      
      if (message.error) {
        resolve({ error: message.error });
      } else {
        resolve(message.result);
      }
    }
  }

  /**
   * Get completion suggestions
   * 
   * @param {string} content - Document content
   * @param {object} position - Cursor position {line, character}
   * @returns {Promise<Array>} Completion items
   */
  async completion(content, position) {
    // Use browser fallback if server not connected
    if (this.useBrowserFallback || !this.connected) {
      return await this.browserService.getCompletions(
        content,
        position.line || 0,
        position.character || 0
      );
    }
    
    try {
      const result = await this.request('textDocument/completion', {
        textDocument: {
          uri: 'file:///document.canvasl'
        },
        position: {
          line: position.line || 0,
          character: position.character || 0
        }
      });
      
      return result.items || result || [];
    } catch (error) {
      console.error('LSP completion error, using browser fallback:', error);
      return await this.browserService.getCompletions(
        content,
        position.line || 0,
        position.character || 0
      );
    }
  }

  /**
   * Get diagnostics
   * 
   * @param {string} content - Document content
   * @returns {Promise<Array>} Diagnostics
   */
  async diagnostics(content) {
    // Use browser fallback if server not connected
    if (this.useBrowserFallback || !this.connected) {
      return await this.browserService.getDiagnostics(content);
    }
    
    try {
      // Diagnostics are pushed by server, but we can request them
      return [];
    } catch (error) {
      console.error('LSP diagnostics error, using browser fallback:', error);
      return await this.browserService.getDiagnostics(content);
    }
  }

  /**
   * Get hover information
   * 
   * @param {string} content - Document content
   * @param {object} position - Cursor position {line, character}
   * @returns {Promise<object|null>} Hover information
   */
  async hover(content, position) {
    // Use browser fallback if server not connected
    if (this.useBrowserFallback || !this.connected) {
      return await this.browserService.getHover(
        content,
        position.line || 0,
        position.character || 0
      );
    }
    
    try {
      const result = await this.request('textDocument/hover', {
        textDocument: {
          uri: 'file:///document.canvasl'
        },
        position: {
          line: position.line || 0,
          character: position.character || 0
        }
      });
      
      return result;
    } catch (error) {
      console.error('LSP hover error, using browser fallback:', error);
      return await this.browserService.getHover(
        content,
        position.line || 0,
        position.character || 0
      );
    }
  }

  /**
   * Close connection
   */
  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.pendingRequests.clear();
  }
}

