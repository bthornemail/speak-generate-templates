/**
 * CANVASL A₁₁ React Component
 *
 * Main UI for the peer-to-peer, topologically sound operating system
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OPFSStore } from './storage/opfs.js';
import { IndexedDBStore } from './storage/idb.js';
import { createChainComplex, addCell, eulerCharacteristic } from './chain/complex.js';
import { HomologyValidator, computeAllBetti } from './chain/homology.js';
import { computeCID } from './crypto/cid.js';
import { registerWebAuthn } from './crypto/webauthn.js';
import { createDAG, addNode as addDagNode } from './dag/operations.js';
import SpeechInterface from './SpeechInterface.jsx';
import ProjectiveCanvas from './ProjectiveCanvas.jsx';
import AgenticChatDashboard from '../components/AgenticChatDashboard.jsx';

export default function CANVASL() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Initializing...');
  const [opfs, setOpfs] = useState(null);
  const [idb, setIdb] = useState(null);
  const [complex, setComplex] = useState(null);
  const [dag, setDag] = useState(null);
  const [betti, setBetti] = useState([0, 0, 0, 0, 0]);
  const [euler, setEuler] = useState(0);
  const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0 });
  const [nodes, setNodes] = useState([]);
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showAffineEditor, setShowAffineEditor] = useState(false);

  // Initialize CANVASL system
  useEffect(() => {
    async function init() {
      try {
        setStatus('Checking WebAuthn support...');
        const hasWebAuthn = !!navigator.credentials;
        setWebAuthnSupported(hasWebAuthn);

        setStatus('Initializing OPFS storage...');
        const opfsStore = new OPFSStore();
        await opfsStore.init();
        setOpfs(opfsStore);

        setStatus('Initializing IndexedDB...');
        const idbStore = new IndexedDBStore();
        await idbStore.init();
        setIdb(idbStore);

        setStatus('Creating chain complex...');
        const chainComplex = createChainComplex();
        setComplex(chainComplex);

        setStatus('Creating DAG...');
        const dagStore = createDAG();
        setDag(dagStore);

        setStatus('Getting storage info...');
        const info = await opfsStore.getStorageInfo();
        setStorageInfo(info);

        setStatus('Loading existing nodes...');
        const recentNodes = await idbStore.getRecentNodes(5);
        setNodes(recentNodes);

        setStatus('Ready ✓');
      } catch (error) {
        console.error('Initialization error:', error);
        setStatus(`Error: ${error.message}`);
      }
    }

    init();
  }, []);

  // Add a test cell to chain complex
  const addTestCell = () => {
    if (!complex) return;

    const newCell = {
      id: `cell-${Date.now()}`,
      dim: Math.floor(Math.random() * 5), // Random dimension 0-4
      boundary: [],
      data: { created: new Date().toISOString() }
    };

    addCell(complex, newCell);
    setComplex({ ...complex }); // Trigger re-render

    // Compute homology
    const validator = new HomologyValidator(complex);
    const newBetti = computeAllBetti(complex);
    const newEuler = eulerCharacteristic(complex);

    setBetti(newBetti);
    setEuler(newEuler);

    // Force canvas update
    setForceUpdate(prev => prev + 1);

    setStatus(`✅ Added C${newCell.dim} cell: ${newCell.id}`);
  };

  // Create a MetaLogNode
  const createNode = async () => {
    if (!opfs || !idb || !dag) return;

    try {
      setStatus('Creating MetaLogNode...');

      const node = {
        parent: 'genesis',
        cid: '',
        auth: '',
        path: `m/44'/60'/0'/0/${Date.now()}`,
        sig: '',
        uri: `canvasl://local/${Date.now()}`,
        topo: { type: 'Topology', objects: {}, arcs: [] },
        geo: { type: 'FeatureCollection', features: [] },
        meta: {
          size: 0,
          mimeType: 'application/json'
        }
      };

      // Compute CID
      node.cid = await computeCID({
        parent: node.parent,
        uri: node.uri,
        topo: node.topo,
        geo: node.geo
      });

      // Store in OPFS
      await opfs.writeNode(node.cid, node);

      // Index in IndexedDB
      await idb.indexNode(node, Date.now());

      // Add to DAG
      addDagNode(dag, node);
      setDag({ ...dag }); // Trigger re-render

      // Update nodes list
      const recentNodes = await idb.getRecentNodes(5);
      setNodes(recentNodes);

      // Force canvas update
      setForceUpdate(prev => prev + 1);

      setStatus(`✅ Created node: ${node.cid.slice(0, 20)}...`);
    } catch (error) {
      console.error('Error creating node:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  // Register WebAuthn credential
  const handleWebAuthn = async () => {
    if (!webAuthnSupported) {
      setStatus('WebAuthn not supported');
      return;
    }

    try {
      setStatus('Requesting biometric authentication...');
      const credential = await registerWebAuthn();
      setStatus(`WebAuthn registered: ${credential.id.slice(0, 20)}...`);
    } catch (error) {
      console.error('WebAuthn error:', error);
      setStatus(`WebAuthn error: ${error.message}`);
    }
  };

  // Validate homology
  const validateHomology = () => {
    if (!complex) return;

    setStatus('Validating homology (∂² = 0)...');
    const validator = new HomologyValidator(complex);
    const isValid = validator.validate();

    if (isValid) {
      setStatus('Homology valid: ∂² = 0 ✓');
    } else {
      setStatus('Homology INVALID: ∂² ≠ 0 ✗');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle voice/text commands
  const handleCommand = (command) => {
    console.log('🎯 Executing command:', command);
    switch (command) {
      case 'createNode':
        console.log('➡️  Creating node...');
        createNode();
        break;
      case 'createCell':
        console.log('➡️  Adding cell...');
        addTestCell();
        break;
      case 'validate':
        console.log('➡️  Validating homology...');
        validateHomology();
        break;
      case 'export':
        setStatus('Export functionality coming soon...');
        break;
      default:
        console.log('❓ Unknown command:', command);
        setStatus(`Unknown command: ${command}`);
    }
  };

  // Handle node selection from canvas
  const handleNodeSelect = (nodeId) => {
    setSelectedNodeId(nodeId);
    setStatus(`Selected node: ${nodeId.slice(0, 20)}...`);
    // Navigate to canvas route with node ID
    navigate(`/canvas/${nodeId}`);
  };

  // Load node from URL if nodeId param exists
  useEffect(() => {
    if (nodeId && dag && dag.nodes.has(nodeId)) {
      setSelectedNodeId(nodeId);
      setStatus(`Loaded node from URL: ${nodeId.slice(0, 20)}...`);
    }
  }, [nodeId, dag]);

  // Handle node creation from canvas
  const handleNodeCreateFromCanvas = (position) => {
    console.log('🎨 Creating node from canvas at position:', position);
    createNode();
  };

  // Get viewport size for consistent sizing
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      position: 'fixed',
      top: 0,
      left: 0,
      width: viewportSize.width > 0 ? `${viewportSize.width}px` : '100vw',
      height: viewportSize.height > 0 ? `${viewportSize.height}px` : '100vh',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      background: 'transparent'
    }}>
      {/* Projective Canvas - Full Screen */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: viewportSize.width > 0 ? `${viewportSize.width}px` : '100vw',
        height: viewportSize.height > 0 ? `${viewportSize.height}px` : '100vh',
        zIndex: 0,
        margin: 0,
        padding: 0
      }}>
        <ProjectiveCanvas
          dag={dag}
          complex={complex}
          onNodeSelect={handleNodeSelect}
          onNodeCreate={handleNodeCreateFromCanvas}
          key={forceUpdate}
        />
      </div>

      {/* Overlay Panel (top-left) */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100,
        background: 'rgba(20, 20, 20, 0.95)',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '400px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
      <h1 style={{ color: '#fff', textShadow: '0 0 10px rgba(100, 108, 255, 0.5)', marginBottom: '10px' }}>CANVASL A₁₁</h1>
      <p style={{ color: '#e0e0e0', fontSize: '16px', marginBottom: '20px' }}>
        Peer-to-Peer, Topologically Sound, Self-Sovereign Operating System
      </p>

      <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <strong style={{ color: '#fff' }}>Status:</strong> <span style={{ color: '#e0e0e0' }}>{status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>Chain Complex</h3>
          {complex && (
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '5px', color: '#e0e0e0' }}>
              <div>C₀ (vertices): {complex.C0.length}</div>
              <div>C₁ (edges): {complex.C1.length}</div>
              <div>C₂ (faces): {complex.C2.length}</div>
              <div>C₃ (volumes): {complex.C3.length}</div>
              <div>C₄ (contexts): {complex.C4.length}</div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <strong style={{ color: '#fff' }}>Euler χ:</strong> {euler}
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Betti:</strong> [{betti.join(', ')}]
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>DAG & Storage</h3>
          {dag && (
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '5px', color: '#e0e0e0' }}>
              <div>Nodes: {dag.nodes.size}</div>
              <div>Roots: {dag.roots.size}</div>
              <div>Heads: {dag.heads.size}</div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <strong style={{ color: '#fff' }}>Storage:</strong>
              </div>
              <div>Used: {formatBytes(storageInfo.usage)}</div>
              <div>Quota: {formatBytes(storageInfo.quota)}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={addTestCell} style={buttonStyle}>
            Add Test Cell
          </button>
          <button onClick={createNode} style={buttonStyle}>
            Create MetaLogNode
          </button>
          <button onClick={validateHomology} style={buttonStyle}>
            Validate ∂² = 0
          </button>
          <button onClick={handleWebAuthn} style={buttonStyle} disabled={!webAuthnSupported}>
            {webAuthnSupported ? 'Register WebAuthn' : 'WebAuthn N/A'}
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Recent Nodes ({nodes.length})</h3>
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '5px', color: '#e0e0e0' }}>
          {nodes.length === 0 ? (
            <div style={{ color: '#aaa' }}>No nodes yet. Click "Create MetaLogNode" above.</div>
          ) : (
            nodes.map((node, i) => (
              <div key={i} style={{
                padding: '8px',
                borderBottom: i < nodes.length - 1 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
              }}>
                <div style={{ fontSize: '12px', color: '#ccc' }}>
                  {new Date(node.timestamp).toLocaleString()}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', marginTop: '4px', color: '#e0e0e0' }}>
                  CID: {node.cid.slice(0, 40)}...
                </div>
                <div style={{ fontSize: '11px', color: '#ccc' }}>
                  Path: {node.path}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>

      {/* Speech Interface (bottom overlay) */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: '90%',
        maxWidth: '800px'
      }}>
        <SpeechInterface onCommand={handleCommand} complex={complex} dag={dag} />
      </div>

      {/* Agentic Chat Dashboard (bottom-right) */}
      <div style={{ zIndex: 100 }}>
        <AgenticChatDashboard 
          dag={dag} 
          complex={complex}
          onAgentCommand={(command) => {
            console.log('[CANVASL] Agent command:', command);
            // Handle agent commands here
          }}
        />
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
  fontFamily: 'inherit'
};
