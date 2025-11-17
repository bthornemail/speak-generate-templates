/**
 * CanvasL Language Extension
 * 
 * CodeMirror 6 language extension for CANVASL with LSP support
 */

import { LanguageSupport } from '@codemirror/language';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { linter, lintKeymap } from '@codemirror/lint';
import { markdown } from '@codemirror/lang-markdown';
import { LSPClient } from './lsp-client.js';

// Create LSP client instance
let lspClient = null;

/**
 * Initialize LSP client
 * 
 * @param {string} serverUrl - LSP server URL
 */
export function initializeLSP(serverUrl = 'ws://localhost:3000/lsp') {
  if (!lspClient) {
    lspClient = new LSPClient(serverUrl);
    lspClient.initialize().catch(error => {
      console.error('LSP initialization error:', error);
    });
  }
  return lspClient;
}

/**
 * Get LSP-based autocomplete source
 * 
 * @returns {Function} Autocomplete source function
 */
function getLSPAutocomplete() {
  return async (context) => {
    if (!lspClient) {
      return null;
    }
    
    try {
      const position = context.state.doc.lineAt(context.pos);
      const line = position.number - 1;
      const character = context.pos - position.from;
      
      const suggestions = await lspClient.completion(
        context.state.doc.toString(),
        { line, character }
      );
      
      if (!suggestions || suggestions.length === 0) {
        return null;
      }
      
      return {
        from: context.pos,
        options: suggestions.map(s => ({
          label: s.label,
          type: s.kind === 14 ? 'keyword' : s.kind === 2 ? 'function' : 'text',
          detail: s.detail,
          info: s.documentation
        }))
      };
    } catch (error) {
      console.error('LSP autocomplete error:', error);
      return null;
    }
  };
}

/**
 * Get LSP-based linter
 * 
 * @returns {Function} Linter function
 */
function getLSPLinter() {
  return async (view) => {
    if (!lspClient) {
      return [];
    }
    
    try {
      const diagnostics = await lspClient.diagnostics(
        view.state.doc.toString()
      );
      
      return diagnostics.map(d => ({
        from: d.range.start.character,
        to: d.range.end.character,
        severity: d.severity === 1 ? 'error' : d.severity === 2 ? 'warning' : 'info',
        message: d.message,
        source: d.source
      }));
    } catch (error) {
      console.error('LSP linter error:', error);
      return [];
    }
  };
}

/**
 * Create CanvasL language support
 * 
 * @param {object} options - Options
 * @param {string} options.lspServerUrl - LSP server URL
 * @returns {LanguageSupport|Array} Language support or extensions array
 */
export function canvaslLanguage(options = {}) {
  const { lspServerUrl } = options;
  
  // Initialize LSP if URL provided
  if (lspServerUrl) {
    initializeLSP(lspServerUrl);
  }
  
  // Start with markdown language support
  const markdownSupport = markdown();
  
  // For now, return just markdown support to avoid extension conflicts
  // LSP features can be added later once the base setup works
  return markdownSupport;
  
  // TODO: Re-enable LSP extensions once extension conflict is resolved
  /*
  // Add LSP-based extensions
  const extensions = [
    // LSP autocomplete
    autocompletion({
      override: [getLSPAutocomplete()]
    }),
    
    // LSP linting
    linter(getLSPLinter()),
    
    // Keymaps
    completionKeymap,
    lintKeymap
  ];
  
  // Return LanguageSupport with combined extensions
  return new LanguageSupport(
    markdownSupport.language,
    [...markdownSupport.support, ...extensions]
  );
  */
}

/**
 * Get LSP client instance
 * 
 * @returns {LSPClient|null} LSP client
 */
export function getLSPClient() {
  return lspClient;
}

