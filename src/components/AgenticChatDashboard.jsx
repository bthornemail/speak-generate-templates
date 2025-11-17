import React, { useState, useRef, useEffect } from 'react';
// import './AgenticChatDashboard.css'; // Using inline styles instead
import agentAPI from '../canvasl/agents/agent-api.js';

const AGENTS = [
  { id: '0D-Topology', name: '0D-Topology Agent', dimension: '0D', description: 'Quantum vacuum topology and identity processes' },
  { id: '1D-Temporal', name: '1D-Temporal Agent', dimension: '1D', description: 'Temporal evolution and Church successor operations' },
  { id: '2D-Structural', name: '2D-Structural Agent', dimension: '2D', description: 'Spatial structure and pattern encoding' },
  { id: '3D-Algebraic', name: '3D-Algebraic Agent', dimension: '3D', description: 'Church algebra operations' },
  { id: '4D-Network', name: '4D-Network Agent', dimension: '4D', description: 'Network operations and CI/CD' },
  { id: '5D-Consensus', name: '5D-Consensus Agent', dimension: '5D', description: 'Distributed consensus and blockchain' },
  { id: '6D-Intelligence', name: '6D-Intelligence Agent', dimension: '6D', description: 'Emergent AI and neural networks' },
  { id: '7D-Quantum', name: '7D-Quantum Agent', dimension: '7D', description: 'Quantum superposition and entanglement' },
  { id: 'Query-Interface', name: 'Query Interface Agent', dimension: 'Interface', description: 'SPARQL/REPL access' },
  { id: 'Self-Modification', name: 'Self-Modification Agent', dimension: 'Evolution', description: 'Canvas evolution and self-modification' }
];

function AgenticChatDashboard({ dag, complex, onAgentCommand }) {
  console.log('AgenticChatDashboard rendering', { dag, complex });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0].id);
  const [isMinimized, setIsMinimized] = useState(false); // Start expanded
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{
      id: Date.now(),
      type: 'system',
      agent: 'System',
      content: 'Welcome to the Agentic Chat Dashboard. Select an agent and start interacting with the computational topology canvas.',
      timestamp: new Date()
    }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      agent: 'User',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Execute agent command
      const result = await agentAPI.executeAgent(selectedAgent, userMessage.content, {
        dag,
        complex
      });

      const agent = AGENTS.find(a => a.id === selectedAgent);
      const agentMessage = {
        id: Date.now() + 1,
        type: result.success ? 'agent' : 'error',
        agent: agent.name,
        content: result.success 
          ? `${result.response.message}\n\nResult: ${JSON.stringify(result.response.result, null, 2)}`
          : `Error: ${result.error}`,
        timestamp: new Date(),
        dimension: agent.dimension
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);

      // Call the onAgentCommand callback if provided
      if (onAgentCommand) {
        onAgentCommand({
          agent: selectedAgent,
          command: userMessage.content,
          response: result,
          success: result.success
        });
      }
    } catch (error) {
      console.error('Agent command error:', error);
      const agent = AGENTS.find(a => a.id === selectedAgent);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        agent: agent.name,
        content: `Error executing command: ${error.message}`,
        timestamp: new Date(),
        dimension: agent.dimension
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedAgentInfo = AGENTS.find(a => a.id === selectedAgent);

  // Debug: Log render
  useEffect(() => {
    console.log('[AgenticChatDashboard] Component mounted/updated', {
      isMinimized,
      selectedAgent,
      messagesCount: messages.length,
      selectedAgentInfo,
      hasMessages: messages.length > 0
    });
  }, [isMinimized, selectedAgent, messages.length, selectedAgentInfo]);

  useEffect(() => {
    console.log('[AgenticChatDashboard] Render check:', {
      timestamp: new Date().toISOString(),
      isMinimized,
      selectedAgent,
      messagesLength: messages.length,
      selectedAgentInfo: selectedAgentInfo?.name || 'none'
    });
    
    // Check if element exists in DOM
    setTimeout(() => {
      const element = document.querySelector('.agentic-chat-dashboard');
      if (element) {
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        console.log('[AgenticChatDashboard] DOM Element Found:', {
          exists: true,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right
          },
          computedStyles: {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            zIndex: styles.zIndex,
            position: styles.position,
            backgroundColor: styles.backgroundColor,
            color: styles.color
          },
          isVisible: rect.width > 0 && rect.height > 0 && styles.display !== 'none' && styles.visibility !== 'hidden' && parseFloat(styles.opacity) > 0
        });
      } else {
        console.error('[AgenticChatDashboard] DOM Element NOT FOUND!');
      }
    }, 100);
  }, [isMinimized, selectedAgent]);

  // Log render (inside component)
  if (typeof window !== 'undefined') {
    console.log('[AgenticChatDashboard] Rendering component...', {
      isMinimized,
      selectedAgent,
      messagesCount: messages.length,
      timestamp: Date.now()
    });
  }

  return (
    <>
      {/* Debug Overlay */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 0, 0, 0.9)',
        color: 'white',
        padding: '15px',
        zIndex: 50,
        fontSize: '11px',
        fontFamily: 'monospace',
        borderRadius: '8px',
        maxWidth: '300px',
        border: '2px solid yellow'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔍 Chat Dashboard Debug</div>
        <div>Rendered: ✅</div>
        <div>Minimized: {isMinimized ? '✅ YES' : '❌ NO'}</div>
        <div>Selected Agent: {selectedAgent || 'none'}</div>
        <div>Messages: {messages.length}</div>
        <div>Agent Info: {selectedAgentInfo?.name || 'none'}</div>
        <div>Dashboard Height: {isMinimized ? 'minimized' : '600px'}</div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: '#ffcccc' }}>
          Check console for DOM details
        </div>
      </div>

      <div 
        className={`agentic-chat-dashboard ${isMinimized ? 'minimized' : ''}`}
        style={{ 
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '450px',
          height: isMinimized ? 'auto' : '600px',
          maxHeight: isMinimized ? 'auto' : '600px',
          minHeight: isMinimized ? 'auto' : '600px',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          visibility: 'visible',
          opacity: 1,
          background: 'rgba(20, 20, 20, 0.95)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '2px solid red', // Debug border
          color: '#fff',
          fontFamily: 'monospace',
          pointerEvents: 'auto',
          overflow: 'visible'
        }}
        data-debug="chat-dashboard-main"
      >
      {/* Header */}
      <div 
        className="chat-header" 
        onClick={() => {
          console.log('[AgenticChatDashboard] Header clicked, toggling minimized');
          setIsMinimized(!isMinimized);
        }}
        style={{
          padding: '15px 20px',
          background: 'rgba(30, 30, 30, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          borderRadius: '12px 12px 0 0',
          border: '1px solid yellow' // Debug border
        }}
        data-debug="chat-header"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🤖</span>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>Agentic Console</span>
            {selectedAgentInfo && (
              <span style={{ 
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: getDimensionColor(selectedAgentInfo.dimension)
              }}>
                {selectedAgentInfo.dimension}
              </span>
            )}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '5px 10px'
            }}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Always show content for debugging */}
      <>
        {/* Agent Selector */}
          <div 
            style={{ 
              padding: '15px 20px', 
              background: 'rgba(25, 25, 25, 0.6)', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              border: '1px solid green', // Debug border
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}
            data-debug="agent-selector"
          >
            <label style={{ display: 'block', color: '#e0e0e0', fontSize: '12px', marginBottom: '8px' }}>Select Agent:</label>
            <select 
              value={selectedAgent} 
              onChange={(e) => setSelectedAgent(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(40, 40, 40, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            >
              {AGENTS.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.dimension})
                </option>
              ))}
            </select>
            {selectedAgentInfo && (
              <div style={{ marginTop: '8px', color: '#b0b0b0', fontSize: '11px', fontStyle: 'italic' }}>
                {selectedAgentInfo.description}
              </div>
            )}
          </div>

          {/* Messages */}
          <div 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '15px 20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              minHeight: 0,
              border: '1px solid blue', // Debug border
              visibility: 'visible',
              opacity: 1
            }}
            data-debug="messages-container"
          >
            {messages.map(message => (
              <div 
                key={message.id} 
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: message.type === 'user' ? 'rgba(100, 108, 255, 0.2)' : message.type === 'error' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(40, 40, 40, 0.6)',
                  borderLeft: `3px solid ${message.type === 'user' ? '#646cff' : message.type === 'error' ? '#ff6b6b' : '#4ecdc4'}`,
                  marginLeft: message.type === 'user' ? '20px' : '0',
                  marginRight: message.type !== 'user' ? '20px' : '0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '12px' }}>{message.agent}</span>
                  {message.dimension && (
                    <span style={{ padding: '2px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 'bold', color: '#fff', backgroundColor: getDimensionColor(message.dimension) }}>
                      {message.dimension}
                    </span>
                  )}
                  <span style={{ color: '#888', fontSize: '10px', marginLeft: 'auto' }}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ color: '#e0e0e0', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{message.content}</div>
              </div>
            ))}
            {isTyping && (
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(40, 40, 40, 0.6)', borderLeft: '3px solid #4ecdc4', marginRight: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '12px' }}>{selectedAgentInfo?.name}</span>
                  <span style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '15px 20px', background: 'rgba(25, 25, 25, 0.6)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '10px', borderRadius: '0 0 12px 12px' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedAgentInfo?.name}...`}
              style={{ flex: 1, padding: '10px 12px', background: 'rgba(40, 40, 40, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff', fontSize: '13px', fontFamily: 'inherit', resize: 'none' }}
              rows={2}
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              style={{ padding: '10px 20px', background: (!input.trim() || isTyping) ? 'rgba(100, 108, 255, 0.3)' : '#646cff', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer', opacity: (!input.trim() || isTyping) ? 0.5 : 1 }}
            >
              Send
            </button>
          </div>
      </>
      </div>
    </>
  );
}

function getDimensionColor(dimension) {
  const colors = {
    '0D': '#ff6b6b',
    '1D': '#4ecdc4',
    '2D': '#45b7d1',
    '3D': '#96ceb4',
    '4D': '#ffeaa7',
    '5D': '#dda15e',
    '6D': '#bc6c25',
    '7D': '#6c5ce7',
    'Interface': '#a29bfe',
    'Evolution': '#fd79a8'
  };
  return colors[dimension] || '#95a5a6';
}

export default AgenticChatDashboard;
