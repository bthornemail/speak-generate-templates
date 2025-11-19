/**
 * CodeMirror 6 Org Mode Language Support
 * 
 * Provides syntax highlighting, auto-completion, and editing features
 * for Org Mode in CodeMirror 6
 */

import { StreamLanguage } from '@codemirror/language';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { parseMixed } from '@lezer/common';

/**
 * Org Mode syntax highlighting tags
 */
const orgModeTags = {
  heading: t.heading,
  'heading-1': t.heading1,
  'heading-2': t.heading2,
  'heading-3': t.heading3,
  'heading-4': t.heading4,
  'heading-5': t.heading5,
  'heading-6': t.heading6,
  'source-block': t.monospace,
  'property-drawer': t.comment,
  'directive': t.keyword,
  'link': t.link,
  'bold': t.strong,
  'italic': t.emphasis,
  'code': t.monospace,
  'verbatim': t.monospace
};

/**
 * Org Mode parser (simplified - uses regex-based highlighting)
 * 
 * For full parsing, integrate with orga parser
 */
const orgModeParser = {
  name: 'org-mode',
  parse: (input) => {
    const lines = input.split('\n');
    const tokens = [];
    
    lines.forEach((line, lineNum) => {
      // Headings
      const headingMatch = line.match(/^(\*+)\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        tokens.push({
          from: lineNum,
          to: lineNum + 1,
          type: `heading-${Math.min(level, 6)}`
        });
      }
      
      // Source blocks
      if (line.match(/^#\+BEGIN_SRC/)) {
        tokens.push({
          from: lineNum,
          to: lineNum + 1,
          type: 'source-block-start'
        });
      }
      if (line.match(/^#\+END_SRC/)) {
        tokens.push({
          from: lineNum,
          to: lineNum + 1,
          type: 'source-block-end'
        });
      }
      
      // Property drawers
      if (line.match(/^:PROPERTIES:/)) {
        tokens.push({
          from: lineNum,
          to: lineNum + 1,
          type: 'property-drawer-start'
        });
      }
      if (line.match(/^:END:/)) {
        tokens.push({
          from: lineNum,
          to: lineNum + 1,
          type: 'property-drawer-end'
        });
      }
      
      // Directives
      if (line.match(/^#\+[A-Z_]+:/)) {
        tokens.push({
          from: lineNum,
          to: lineNum + 1,
          type: 'directive'
        });
      }
      
      // Links
      const linkMatch = line.match(/\[\[([^\]]+)\]\]/);
      if (linkMatch) {
        tokens.push({
          from: lineNum,
          to: lineNum + 1,
          type: 'link'
        });
      }
      
      // Bold
      if (line.match(/\*[^*]+\*/)) {
        tokens.push({
          from: lineNum,
          to: lineNum + 1,
          type: 'bold'
        });
      }
      
      // Italic
      if (line.match(/\/[^\/]+\//)) {
        tokens.push({
          from: lineNum,
          to: lineNum + 1,
          type: 'italic'
        });
      }
      
      // Code
      if (line.match(/~[^~]+~/)) {
        tokens.push({
          from: lineNum,
          to: lineNum + 1,
          type: 'code'
        });
      }
    });
    
    return {
      topNode: {
        type: { name: 'Document' },
        children: tokens.map(token => ({
          type: { name: token.type },
          from: token.from,
          to: token.to
        }))
      }
    };
  }
};

/**
 * Create Org Mode language support
 */
export function orgModeLanguage() {
  // For now, use a simple text-based language with highlighting
  // In production, integrate with orga parser for full AST support
  return new LanguageSupport(
    StreamLanguage.define({
      name: 'org-mode',
      token: (stream) => {
        // Headings
        if (stream.match(/^\*+\s/)) {
          const stars = stream.current.match(/^\*+/)[0];
          return `heading-${Math.min(stars.length, 6)}`;
        }
        
        // Source blocks
        if (stream.match(/^#\+BEGIN_SRC/)) return 'source-block-start';
        if (stream.match(/^#\+END_SRC/)) return 'source-block-end';
        
        // Property drawers
        if (stream.match(/^:PROPERTIES:/)) return 'property-drawer-start';
        if (stream.match(/^:END:/)) return 'property-drawer-end';
        
        // Directives
        if (stream.match(/^#\+[A-Z_]+:/)) return 'directive';
        
        // Links
        if (stream.match(/\[\[/)) {
          stream.skipTo(']]');
          return 'link';
        }
        
        // Bold
        if (stream.match(/\*[^*\s]/)) {
          stream.skipTo('*');
          return 'bold';
        }
        
        // Italic
        if (stream.match(/\/[^\/\s]/)) {
          stream.skipTo('/');
          return 'italic';
        }
        
        // Code
        if (stream.match(/~[^~\s]/)) {
          stream.skipTo('~');
          return 'code';
        }
        
        stream.next();
        return null;
      }
    })
  );
}

/**
 * Org Mode auto-completion
 */
export function orgModeAutocomplete() {
  return {
    provide: (context) => {
      const word = context.matchBefore(/\w*/);
      if (!word) return null;
      
      const completions = [
        { label: 'BEGIN_SRC', type: 'directive' },
        { label: 'END_SRC', type: 'directive' },
        { label: 'NAME:', type: 'directive' },
        { label: 'TANGLE:', type: 'directive' },
        { label: 'PROPERTIES:', type: 'property' },
        { label: 'END:', type: 'property' },
        { label: 'CANVASL_CID:', type: 'property' },
        { label: 'CANVASL_DIMENSION:', type: 'property' }
      ];
      
      return {
        from: word.from,
        options: completions.map(comp => ({
          label: comp.label,
          type: comp.type,
          info: `Org Mode ${comp.type}`
        }))
      };
    }
  };
}

/**
 * Org Mode bracket matching
 */
export function orgModeBracketMatching() {
  return {
    provide: (context) => {
      // Match source block brackets
      const pos = context.pos;
      const text = context.state.doc.toString();
      
      // Check for BEGIN_SRC / END_SRC pairs
      const beginMatch = text.lastIndexOf('#+BEGIN_SRC', pos);
      const endMatch = text.indexOf('#+END_SRC', pos);
      
      if (beginMatch !== -1 && endMatch !== -1) {
        return {
          from: beginMatch,
          to: endMatch + '#+END_SRC'.length
        };
      }
      
      return null;
    }
  };
}

