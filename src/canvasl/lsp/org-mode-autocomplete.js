/**
 * Org Mode Auto-completion
 * 
 * Provides intelligent auto-completion for Org Mode:
 * - Source block types
 * - Directives
 * - Property drawer keys
 * - Noweb references
 * - CanvasL directives
 */

import { parseOrgDocument } from '../org-mode/org-parser.js';

/**
 * Org Mode auto-completion provider
 */
export class OrgModeAutocomplete {
  constructor(orgAST = null) {
    this.orgAST = orgAST;
    this.sourceBlockTypes = [
      'canvasl', 'javascript', 'typescript', 'python', 'html', 'css',
      'svg', 'json', 'yaml', 'markdown', 'org', 'text'
    ];
    this.directives = [
      'BEGIN_SRC', 'END_SRC', 'NAME', 'TANGLE', 'EXPORT', 'PROPERTIES',
      'END', 'TITLE', 'AUTHOR', 'DATE', 'OPTIONS'
    ];
    this.propertyKeys = [
      'CANVASL_CID', 'CANVASL_DIMENSION', 'CANVASL_PROJECTION',
      'CANVASL_RPC', 'CANVASL_TANGLE', 'CANVASL_EXPORT'
    ];
  }

  /**
   * Update Org AST for context-aware completion
   */
  updateAST(orgAST) {
    this.orgAST = orgAST;
  }

  /**
   * Get completions at cursor position
   */
  getCompletions(context, pos) {
    const line = context.state.doc.lineAt(pos);
    const textBefore = line.text.slice(0, pos - line.from);
    
    // Check what we're completing
    if (textBefore.match(/^#\+BEGIN_SRC\s*$/)) {
      // Completing source block type
      return this.getSourceBlockTypeCompletions();
    }
    
    if (textBefore.match(/^#\+/)) {
      // Completing directive
      return this.getDirectiveCompletions(textBefore);
    }
    
    if (textBefore.match(/^:PROPERTIES:/) || textBefore.match(/^:[A-Z_]*$/)) {
      // Completing property key
      return this.getPropertyKeyCompletions();
    }
    
    if (textBefore.match(/<<[^>]*$/)) {
      // Completing Noweb reference
      return this.getNowebCompletions();
    }
    
    if (textBefore.match(/@[a-z]*$/)) {
      // Completing CanvasL directive
      return this.getCanvasLDirectiveCompletions();
    }
    
    return [];
  }

  /**
   * Get source block type completions
   */
  getSourceBlockTypeCompletions() {
    return this.sourceBlockTypes.map(type => ({
      label: type,
      type: 'source-block-type',
      info: `Source block type: ${type}`,
      apply: (view, completion, from, to) => {
        view.dispatch({
          changes: { from, to, insert: `${completion.label}\n` }
        });
      }
    }));
  }

  /**
   * Get directive completions
   */
  getDirectiveCompletions(textBefore) {
    const partial = textBefore.replace(/^#\+/, '').toUpperCase();
    return this.directives
      .filter(dir => dir.startsWith(partial))
      .map(dir => ({
        label: dir,
        type: 'directive',
        info: `Org Mode directive: ${dir}`,
        apply: (view, completion, from, to) => {
          view.dispatch({
            changes: { from, to, insert: `${completion.label}: ` }
          });
        }
      }));
  }

  /**
   * Get property key completions
   */
  getPropertyKeyCompletions() {
    return this.propertyKeys.map(key => ({
      label: key,
      type: 'property-key',
      info: `Property drawer key: ${key}`,
      apply: (view, completion, from, to) => {
        view.dispatch({
          changes: { from, to, insert: `:${completion.label}: ` }
        });
      }
    }));
  }

  /**
   * Get Noweb reference completions
   */
  getNowebCompletions() {
    if (!this.orgAST) return [];
    
    // Get all named source blocks
    const namedBlocks = Array.from(this.orgAST.namedBlocks.keys());
    
    return namedBlocks.map(name => ({
      label: name,
      type: 'noweb-reference',
      info: `Noweb reference to: ${name}`,
      apply: (view, completion, from, to) => {
        view.dispatch({
          changes: { from, to, insert: `${completion.label}>>` }
        });
      }
    }));
  }

  /**
   * Get CanvasL directive completions
   */
  getCanvasLDirectiveCompletions() {
    return [
      { label: '@version', info: 'CanvasL version directive' },
      { label: '@schema', info: 'CanvasL schema directive' },
      { label: '@rpc', info: 'CanvasL RPC directive' }
    ].map(comp => ({
      ...comp,
      type: 'canvasl-directive',
      apply: (view, completion, from, to) => {
        view.dispatch({
          changes: { from, to, insert: `${completion.label} ` }
        });
      }
    }));
  }
}

/**
 * Create CodeMirror 6 autocomplete extension
 */
export function orgModeAutocompleteExtension(orgAST = null) {
  const autocomplete = new OrgModeAutocomplete(orgAST);
  
  return {
    provide: (context) => {
      const pos = context.pos;
      const completions = autocomplete.getCompletions(context, pos);
      
      if (completions.length === 0) return null;
      
      const word = context.matchBefore(/\w*/);
      return {
        from: word ? word.from : pos,
        options: completions
      };
    }
  };
}

