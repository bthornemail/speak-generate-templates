/**
 * Affine Markdown Editor Component
 * 
 * CodeMirror-based markdown editor for affine views
 * Supports YAML frontmatter parsing and CANVASL template editing
 */

import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { parseMdFrontmatter, parseAndValidate } from '../canvasl/speech/frontmatter-parser.js';
import { canvaslLanguage } from '../canvasl/lsp/canvasl-language.js';
import { orgModeLanguage, orgModeAutocomplete } from '../canvasl/lsp/org-mode-language.js';
import { orgModeAutocompleteExtension } from '../canvasl/lsp/org-mode-autocomplete.js';
import { parseOrgDocument } from '../canvasl/org-mode/org-parser.js';
import './AffineMarkdownEditor.css';

export default function AffineMarkdownEditor({ 
  initialContent = '', 
  onSave, 
  onParse,
  planeName = 'Affine View',
  nodeId = null,
  fileType = 'markdown' // 'markdown' | 'org-mode'
}) {
  const [content, setContent] = useState(initialContent);
  const [parsedData, setParsedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [orgAST, setOrgAST] = useState(null);

  // Update content when initialContent changes
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Parse frontmatter when content changes
  useEffect(() => {
    let cancelled = false;
    
    if (content && content.includes('---')) {
      // Handle async parseAndValidate
      (async () => {
        try {
          const parsed = await parseAndValidate(content);
          
          // Check if component is still mounted
          if (cancelled) return;
          
          setParsedData(parsed);
          setValidationStatus({
            valid: parsed.validation?.valid ?? false,
            errors: parsed.validation?.errors ?? [],
            warnings: parsed.validation?.warnings ?? []
          });
          onParse?.(parsed);
        } catch (error) {
          // Check if component is still mounted
          if (cancelled) return;
          
          setValidationStatus({
            valid: false,
            errors: [error.message],
            warnings: []
          });
          setParsedData(null);
        }
      })();
    } else {
      setParsedData(null);
      setValidationStatus(null);
    }
    
    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [content, onParse, fileType]);

  const handleSave = () => {
    onSave?.(content);
  };

  const handleLoadTemplate = () => {
    // Load a sample CANVASL template
    const template = `---
type: canvasl-template
id: template-${Date.now()}
dimension: 2
adjacency:
  edges: [e_location, e_notify]
  orientation: [1, 1]
speech:
  input:
    lang: en-US
    continuous: true
    interimResults: true
    keywords: [location, notify]
  output:
    voice: Google US English
    rate: 1.0
    pitch: 1.0
macros:
  - keyword: location
    api: geolocation
    method: getCurrentPosition
    params:
      enableHighAccuracy: true
    type: [web_api, geolocation]
  - keyword: notify
    api: notifications
    method: showNotification
    params:
      title: CANVASL Alert
      body: Voice command executed
    type: [web_api, notifications]
validates:
  homology: true
  byzantine: false
  accessibility: true
---

# CANVASL Template

This is a voice-controlled CANVASL template.

## Usage

Say keywords to trigger macros: "location", "notify"
`;
    setContent(template);
  };

  return (
    <div className="affine-markdown-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="editor-title">
          <h3 style={{ color: '#fff', margin: 0 }}>📝 {planeName}</h3>
          {nodeId && (
            <span style={{ color: '#aaa', fontSize: '12px', marginLeft: '10px' }}>
              Node: {nodeId.slice(0, 12)}...
            </span>
          )}
        </div>
        <div className="editor-actions">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="editor-btn"
            style={{ background: showPreview ? '#4caf50' : 'rgba(255, 255, 255, 0.1)' }}
          >
            {showPreview ? '📄 Edit' : '👁️ Preview'}
          </button>
          <button onClick={handleLoadTemplate} className="editor-btn">
            📋 Load Template
          </button>
          <button onClick={handleSave} className="editor-btn" style={{ background: '#007bff' }}>
            💾 Save
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {validationStatus && (
        <div className={`validation-status ${validationStatus.valid ? 'valid' : 'invalid'}`}>
          {validationStatus.valid ? (
            <span>✅ Template Valid</span>
          ) : (
            <span>❌ Validation Errors: {validationStatus.errors.join(', ')}</span>
          )}
          {validationStatus.warnings.length > 0 && (
            <span style={{ marginLeft: '10px', color: '#ffd93d' }}>
              ⚠️ Warnings: {validationStatus.warnings.join(', ')}
            </span>
          )}
        </div>
      )}

      {/* Parsed Data Summary */}
      {parsedData && (
        <div className="parsed-summary">
          <strong style={{ color: '#fff' }}>Parsed:</strong>
          <span style={{ color: '#e0e0e0', marginLeft: '10px' }}>
            Type: {parsedData.type || 'N/A'} | Dimension: {parsedData.dimension ?? 'N/A'} | ID: {parsedData.id || 'N/A'}
          </span>
        </div>
      )}

      {/* Editor/Preview */}
      <div className="editor-container">
        {showPreview ? (
          <div className="markdown-preview">
            <div className="preview-content">
              {parsedData ? (
                <>
                  <div className="preview-section">
                    <h4 style={{ color: '#fff' }}>Frontmatter</h4>
                    <pre style={{ 
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '10px',
                      borderRadius: '4px',
                      color: '#e0e0e0',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(parsedData.frontmatter, null, 2)}
                    </pre>
                  </div>
                  {parsedData.body && (
                    <div className="preview-section">
                      <h4 style={{ color: '#fff' }}>Body</h4>
                      <div style={{ 
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '15px',
                        borderRadius: '4px',
                        color: '#e0e0e0',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace'
                      }}>
                        {parsedData.body}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: '#aaa', padding: '20px', textAlign: 'center' }}>
                  No frontmatter detected. Add YAML frontmatter between --- markers.
                </div>
              )}
            </div>
          </div>
        ) : (
          <CodeMirror
            value={content}
            height="500px"
            extensions={fileType === 'org-mode' 
              ? [
                  orgModeLanguage(),
                  orgModeAutocompleteExtension(orgAST),
                  orgModeAutocomplete()
                ]
              : [canvaslLanguage({ lspServerUrl: 'ws://localhost:3000/lsp' })]
            }
            theme={oneDark}
            onChange={(value) => setContent(value)}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              highlightSelectionMatches: true
            }}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="editor-footer">
        <div style={{ color: '#aaa', fontSize: '11px' }}>
          💡 Tip: Use YAML frontmatter (between --- markers) for CANVASL templates
        </div>
        <div style={{ color: '#aaa', fontSize: '11px' }}>
          Lines: {content.split('\n').length} | Characters: {content.length}
        </div>
      </div>
    </div>
  );
}
