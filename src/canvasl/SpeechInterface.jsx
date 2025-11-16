/**
 * Speech and Text Interface Component
 *
 * Combined voice and text interface for CANVASL
 */

import { useState, useEffect, useRef } from 'react';
import { SpeechRecognitionHandler } from './speech/recognition.js';
import { SpeechSynthesisHandler } from './speech/synthesis.js';

export default function SpeechInterface({ onCommand, complex, dag }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [log, setLog] = useState([]);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [synthesisSupported, setSynthesisSupported] = useState(false);

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

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
          keywords: ['create', 'node', 'cell', 'validate', 'homology', 'delete', 'show', 'export', 'help']
        },
        handleKeyword,
        handleTranscript
      );
    }

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

    if (lower.includes('create') && lower.includes('node')) {
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
      const help = 'You can say: create node, create cell, validate homology, show stats, or type commands.';
      speak(help);
    } else if (lower.includes('export')) {
      onCommand?.('export');
      speak('Exporting data');
    } else {
      addLog(`❓ Unknown command: "${text}"`);
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
    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <h3>🎤 Voice & Text Interface</h3>

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
          <div style={{ color: '#f44336', fontSize: '12px' }}>
            ⚠️ Speech recognition not supported in this browser
          </div>
        )}
        {!synthesisSupported && (
          <div style={{ color: '#f44336', fontSize: '12px' }}>
            ⚠️ Speech synthesis not supported in this browser
          </div>
        )}
      </div>

      {/* Current Transcript */}
      {(transcript || interimTranscript) && (
        <div style={{
          background: 'white',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '15px',
          border: '2px solid #4caf50'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
            Transcript:
          </div>
          <div style={{ fontSize: '16px' }}>
            {transcript}
            {interimTranscript && (
              <span style={{ color: '#999', fontStyle: 'italic' }}>
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
            placeholder="Type a command (e.g., 'create node', 'validate homology')"
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
          <button type="submit" style={buttonStyle}>
            ⏎ Send
          </button>
        </div>
      </form>

      {/* Command Reference */}
      <div style={{
        background: '#e3f2fd',
        padding: '12px',
        borderRadius: '5px',
        fontSize: '12px',
        marginBottom: '15px'
      }}>
        <strong>Available Commands:</strong>
        <div style={{ marginTop: '5px', lineHeight: '1.6' }}>
          • "create node" - Create a new MetaLogNode<br/>
          • "create cell" - Add a cell to chain complex<br/>
          • "validate homology" - Check ∂² = 0<br/>
          • "show stats" - Read system statistics<br/>
          • "help" - List available commands
        </div>
      </div>

      {/* Activity Log */}
      <div style={{
        background: 'white',
        padding: '15px',
        borderRadius: '5px',
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #ddd'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
          Activity Log:
        </div>
        {log.length === 0 ? (
          <div style={{ color: '#999', fontSize: '13px' }}>
            No activity yet. Try speaking or typing a command!
          </div>
        ) : (
          log.map((entry, i) => (
            <div key={i} style={{
              padding: '6px 0',
              borderBottom: i < log.length - 1 ? '1px solid #f0f0f0' : 'none',
              fontSize: '13px'
            }}>
              <span style={{ color: '#999', marginRight: '8px' }}>
                {entry.time.toLocaleTimeString()}
              </span>
              {entry.text}
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
