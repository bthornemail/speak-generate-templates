/**
 * Speech and Text Interface Component
 *
 * Combined voice and text interface for CANVASL
 */

import { useState, useEffect, useRef } from 'react';
import { SpeechRecognitionHandler } from './speech/recognition.js';
import { SpeechSynthesisHandler } from './speech/synthesis.js';
import { TemplateGenerator } from './speech/template-generator.js';
import { parseMdFrontmatter, parseAndValidate } from './speech/frontmatter-parser.js';

export default function SpeechInterface({ onCommand, complex, dag }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [log, setLog] = useState([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [synthesisSupported, setSynthesisSupported] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState(null);
  const [parsedContent, setParsedContent] = useState(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showParsed, setShowParsed] = useState(false);

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const templateGeneratorRef = useRef(null);

  // Initialize speech handlers
  useEffect(() => {
    // Check support
    const hasRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasSynthesis = 'speechSynthesis' in window;

    setSpeechSupported(hasRecognition);
    setSynthesisSupported(hasSynthesis);

    if (hasRecognition) {
      recognitionRef.current = new SpeechRecognitionHandler(
        {
          lang: 'en-US',
          continuous: true,
          interimResults: true,
          keywords: ['create', 'node', 'cell', 'validate', 'homology', 'delete', 'show', 'export', 'help', 'generate', 'template', 'parse', 'markdown']
        },
        handleKeyword,
        handleTranscript
      );
    }

    // Initialize template generator
    templateGeneratorRef.current = new TemplateGenerator();

    if (hasSynthesis) {
      synthesisRef.current = new SpeechSynthesisHandler({
        lang: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleKeyword = (keyword, fullTranscript, confidence) => {
    addLog(`🎯 Keyword: "${keyword}" (${Math.round(confidence * 100)}%)`);

    // Execute command based on keyword
    executeCommand(fullTranscript);

    // Speak confirmation
    if (synthesisRef.current) {
      synthesisRef.current.speak(`Executing ${keyword}`);
    }
  };

  const handleTranscript = (text, confidence, isFinal) => {
    if (isFinal) {
      setTranscript(text);
      setInterimTranscript('');
      addLog(`💬 You: "${text}"`);
    } else {
      setInterimTranscript(text);
    }
  };

  const executeCommand = (text) => {
    const lower = text.toLowerCase();

    // Template generation command
    if (lower.includes('generate') && lower.includes('template')) {
      (async () => {
      try {
          const template = await templateGeneratorRef.current.generateFromCommand(text);
        setGeneratedTemplate(template);
        setShowTemplate(true);
        const yaml = template.toYAML();
        addLog(`✅ Template generated: ${template.frontmatter.id}`);
        addLog(`📄 YAML:\n${yaml.substring(0, 200)}...`);
        speak('Template generated successfully');
      } catch (error) {
        addLog(`❌ Error: ${error.message}`);
        speak(`Error: ${error.message}`);
      }
      })();
    }
    // MD parsing command
    else if (lower.includes('parse') && (lower.includes('md') || lower.includes('markdown'))) {
      handleParseMd();
    }
    // Existing commands
    else if (lower.includes('create') && lower.includes('node')) {
      onCommand?.('createNode');
      speak('Creating new node');
    } else if (lower.includes('create') && lower.includes('cell')) {
      onCommand?.('createCell');
      speak('Adding new cell');
    } else if (lower.includes('validate') || lower.includes('homology')) {
      onCommand?.('validate');
      speak('Validating homology');
    } else if (lower.includes('show') && lower.includes('stats')) {
      const stats = getStats();
      speak(stats);
    } else if (lower.includes('help')) {
      const help = 'You can say: generate template for [keywords], parse md, create node, create cell, validate homology, show stats.';
      speak(help);
    } else if (lower.includes('export')) {
      onCommand?.('export');
      speak('Exporting data');
    } else {
      addLog(`❓ Unknown command: "${text}"`);
    }
  };

  const handleParseMd = async () => {
    const mdContent = prompt('Paste Markdown content with frontmatter:');
    if (!mdContent) {
      addLog('❌ No content provided');
      return;
    }

    try {
      const parsed = await parseAndValidate(mdContent);
      setParsedContent(parsed);
      setShowParsed(true);
      addLog(`✅ Parsed template: ${parsed.id}`);
      addLog(`📋 Type: ${parsed.type}, Dimension: ${parsed.dimension}`);
      if (parsed.validation.warnings.length > 0) {
        addLog(`⚠️ Warnings: ${parsed.validation.warnings.join(', ')}`);
      }
      if (parsed.ast) {
        addLog(`🌳 AST built successfully`);
      }
      speak('Markdown parsed successfully');
    } catch (error) {
      addLog(`❌ Parse error: ${error.message}`);
      speak(`Parse error: ${error.message}`);
    }
  };

  const getStats = () => {
    if (!complex || !dag) return 'No data available';

    const totalCells = complex.C0.length + complex.C1.length + complex.C2.length +
                       complex.C3.length + complex.C4.length;

    return `System has ${totalCells} cells and ${dag.nodes.size} nodes in the DAG`;
  };

  const speak = (text) => {
    addLog(`🔊 System: "${text}"`);
    if (synthesisRef.current) {
      synthesisRef.current.speak(text);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      addLog('🛑 Stopped listening');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        addLog('🎤 Started listening...');
      } catch (error) {
        addLog(`❌ Error: ${error.message}`);
      }
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    addLog(`⌨️  You typed: "${textInput}"`);
    executeCommand(textInput);
    setTextInput('');
  };

  const addLog = (message) => {
    setLog(prev => [...prev.slice(-19), { text: message, time: new Date() }]);
  };

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '8px', marginTop: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
      <h3 style={{ color: '#fff', marginBottom: '15px' }}>🎤 Voice & Text Interface</h3>

      {/* Speech Controls */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={toggleListening}
            disabled={!speechSupported}
            style={{
              ...buttonStyle,
              background: isListening ? '#f44336' : '#4caf50',
            }}
          >
            {isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
          </button>

          <button
            onClick={() => speak('Speech synthesis is working')}
            disabled={!synthesisSupported}
            style={buttonStyle}
          >
            🔊 Test Speech
          </button>
        </div>

        {!speechSupported && (
          <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '5px' }}>
            ⚠️ Speech recognition not supported in this browser
          </div>
        )}
        {!synthesisSupported && (
          <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '5px' }}>
            ⚠️ Speech synthesis not supported in this browser
          </div>
        )}
      </div>

      {/* Current Transcript */}
      {(transcript || interimTranscript) && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '15px',
          border: '2px solid rgba(76, 175, 80, 0.6)'
        }}>
          <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '5px' }}>
            Transcript:
          </div>
          <div style={{ fontSize: '16px', color: '#fff' }}>
            {transcript}
            {interimTranscript && (
              <span style={{ color: '#aaa', fontStyle: 'italic' }}>
                {' '}{interimTranscript}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Text Input */}
      <form onSubmit={handleTextSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type a command..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '5px',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              outline: 'none'
            }}
            className="dark-input"
            onFocus={(e) => e.target.style.borderColor = 'rgba(100, 108, 255, 0.6)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
          />
          <button type="submit" style={buttonStyle}>
            ⏎ Send
          </button>
        </div>
      </form>

      {/* Command Reference */}
      <div style={{
        background: 'rgba(100, 108, 255, 0.2)',
        padding: '12px',
        borderRadius: '5px',
        fontSize: '12px',
        marginBottom: '15px',
        border: '1px solid rgba(100, 108, 255, 0.3)'
      }}>
        <strong style={{ color: '#fff' }}>Available Commands:</strong>
        <div style={{ marginTop: '5px', lineHeight: '1.6', color: '#e0e0e0' }}>
          • "generate template for [keywords]" - Generate YAML template<br/>
          • "parse md" - Parse Markdown frontmatter<br/>
          • "create node" - Create a new MetaLogNode<br/>
          • "create cell" - Add a cell to chain complex<br/>
          • "validate homology" - Check ∂² = 0<br/>
          • "show stats" - Read system statistics<br/>
          • "help" - List available commands
        </div>
      </div>

      {/* Generated Template Display */}
      {generatedTemplate && showTemplate && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.2)',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '15px',
          border: '1px solid rgba(255, 193, 7, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <strong style={{ color: '#fff' }}>📄 Generated Template:</strong>
            <button
              onClick={() => setShowTemplate(false)}
              style={{ ...buttonStyle, padding: '5px 10px', fontSize: '12px', background: '#6c757d' }}
            >
              ✕ Close
            </button>
          </div>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '10px',
            borderRadius: '4px',
            overflowX: 'auto',
            fontSize: '11px',
            maxHeight: '400px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#e0e0e0',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {generatedTemplate.toYAML()}
          </pre>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedTemplate.toYAML());
                addLog('📋 Template copied to clipboard');
                speak('Template copied');
              }}
              style={{ ...buttonStyle, padding: '8px 15px', fontSize: '12px' }}
            >
              📋 Copy YAML
            </button>
            <button
              onClick={() => {
                const blob = new Blob([generatedTemplate.toYAML()], { type: 'text/yaml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `template-${generatedTemplate.frontmatter.id}.yaml`;
                a.click();
                URL.revokeObjectURL(url);
                addLog('💾 Template downloaded');
                speak('Template downloaded');
              }}
              style={{ ...buttonStyle, padding: '8px 15px', fontSize: '12px', background: '#28a745' }}
            >
              💾 Download
            </button>
          </div>
        </div>
      )}

      {/* Parsed Content Display */}
      {parsedContent && showParsed && (
        <div style={{
          background: 'rgba(23, 162, 184, 0.2)',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '15px',
          border: '1px solid rgba(23, 162, 184, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <strong style={{ color: '#fff' }}>📋 Parsed Template:</strong>
            <button
              onClick={() => setShowParsed(false)}
              style={{ ...buttonStyle, padding: '5px 10px', fontSize: '12px', background: '#6c757d' }}
            >
              ✕ Close
            </button>
          </div>
          <div style={{ marginBottom: '10px', color: '#e0e0e0' }}>
            <strong style={{ color: '#fff' }}>ID:</strong> {parsedContent.id}<br/>
            <strong style={{ color: '#fff' }}>Type:</strong> {parsedContent.type}<br/>
            <strong style={{ color: '#fff' }}>Dimension:</strong> {parsedContent.dimension}<br/>
            <strong style={{ color: '#fff' }}>Valid:</strong> {parsedContent.validation.valid ? '✅ Yes' : '❌ No'}<br/>
            {parsedContent.validation.errors.length > 0 && (
              <div style={{ color: '#ff6b6b', marginTop: '5px' }}>
                <strong>Errors:</strong> {parsedContent.validation.errors.join(', ')}
              </div>
            )}
            {parsedContent.validation.warnings.length > 0 && (
              <div style={{ color: '#ffd93d', marginTop: '5px' }}>
                <strong>Warnings:</strong> {parsedContent.validation.warnings.join(', ')}
              </div>
            )}
          </div>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}>View Frontmatter</summary>
            <pre style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '10px',
              borderRadius: '4px',
              overflowX: 'auto',
              fontSize: '11px',
              maxHeight: '300px',
              overflowY: 'auto',
              marginTop: '5px',
              color: '#e0e0e0',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {JSON.stringify(parsedContent.frontmatter, null, 2)}
            </pre>
          </details>
          {parsedContent.body && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}>View Body</summary>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '10px',
                borderRadius: '4px',
                overflowX: 'auto',
                fontSize: '11px',
                maxHeight: '300px',
                overflowY: 'auto',
                marginTop: '5px',
                whiteSpace: 'pre-wrap',
                color: '#e0e0e0',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {parsedContent.body}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Activity Log */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '15px',
        borderRadius: '5px',
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>
          Activity Log:
        </div>
        {log.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: '13px' }}>
            No activity yet. Try speaking or typing a command!
          </div>
        ) : (
          log.map((entry, i) => (
            <div key={i} style={{
              padding: '6px 0',
              borderBottom: i < log.length - 1 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
              fontSize: '13px',
              color: '#e0e0e0'
            }}>
              <span style={{ color: '#aaa', marginRight: '8px' }}>
                {entry.time.toLocaleTimeString()}
              </span>
              <span style={{ whiteSpace: 'pre-wrap' }}>{entry.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  background: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap'
};
