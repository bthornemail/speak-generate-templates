/**
 * CANVASL A₁₁ React Component
 *
 * Main UI for the peer-to-peer, topologically sound operating system
 */

import { useState, useEffect } from 'react';
import { OPFSStore } from './storage/opfs.js';
import { IndexedDBStore } from './storage/idb.js';
import { createChainComplex, addCell, eulerCharacteristic } from './chain/complex.js';
import { HomologyValidator, computeAllBetti } from './chain/homology.js';
import { computeCID } from './crypto/cid.js';
import { registerWebAuthn } from './crypto/webauthn.js';
import { createDAG, addNode as addDagNode } from './dag/operations.js';
import SpeechInterface from './SpeechInterface.jsx';
import ProjectiveCanvas from './ProjectiveCanvas.jsx';

export default function CANVASL() {
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
  };

  // Handle node creation from canvas
  const handleNodeCreateFromCanvas = (position) => {
    console.log('🎨 Creating node from canvas at position:', position);
    createNode();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '900px', margin: '0 auto' }}>
      <h1>CANVASL A₁₁</h1>
      <p style={{ color: '#666' }}>
        Peer-to-Peer, Topologically Sound, Self-Sovereign Operating System
      </p>

      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <strong>Status:</strong> {status}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h3>Chain Complex</h3>
          {complex && (
            <div style={{ background: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <div>C₀ (vertices): {complex.C0.length}</div>
              <div>C₁ (edges): {complex.C1.length}</div>
              <div>C₂ (faces): {complex.C2.length}</div>
              <div>C₃ (volumes): {complex.C3.length}</div>
              <div>C₄ (contexts): {complex.C4.length}</div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                <strong>Euler χ:</strong> {euler}
              </div>
              <div>
                <strong>Betti:</strong> [{betti.join(', ')}]
              </div>
            </div>
          )}
        </div>

        <div>
          <h3>DAG & Storage</h3>
          {dag && (
            <div style={{ background: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <div>Nodes: {dag.nodes.size}</div>
              <div>Roots: {dag.roots.size}</div>
              <div>Heads: {dag.heads.size}</div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                <strong>Storage:</strong>
              </div>
              <div>Used: {formatBytes(storageInfo.usage)}</div>
              <div>Quota: {formatBytes(storageInfo.quota)}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Actions</h3>
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
        <h3>Recent Nodes ({nodes.length})</h3>
        <div style={{ background: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
          {nodes.length === 0 ? (
            <div style={{ color: '#999' }}>No nodes yet. Click "Create MetaLogNode" above.</div>
          ) : (
            nodes.map((node, i) => (
              <div key={i} style={{
                padding: '8px',
                borderBottom: i < nodes.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(node.timestamp).toLocaleString()}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', marginTop: '4px' }}>
                  CID: {node.cid.slice(0, 40)}...
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  Path: {node.path}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ProjectiveCanvas
        dag={dag}
        complex={complex}
        onNodeSelect={handleNodeSelect}
        onNodeCreate={handleNodeCreateFromCanvas}
        key={forceUpdate}
      />

      <SpeechInterface onCommand={handleCommand} complex={complex} dag={dag} />

      <div style={{ marginTop: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
        <h4>About CANVASL A₁₁</h4>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
          This is a live implementation of the CANVASL A₁₁ specification - a peer-to-peer operating system
          where every file is a signed, content-addressed node in a global hypergraph. The system uses:
        </p>
        <ul style={{ fontSize: '13px', color: '#666' }}>
          <li><strong>Chain Complexes:</strong> Algebraic topology for data structure validation</li>
          <li><strong>Homology:</strong> Ensures ∂² = 0 (boundary of boundary is zero)</li>
          <li><strong>Content Addressing:</strong> SHA-256 based CIDs for immutability</li>
          <li><strong>OPFS:</strong> Origin Private File System for fast local storage</li>
          <li><strong>WebAuthn:</strong> Biometric authentication (when available)</li>
          <li><strong>DAG:</strong> Directed Acyclic Graph for causality without timestamps</li>
        </ul>
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
