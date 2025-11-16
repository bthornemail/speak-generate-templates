/**
 * Projective Canvas Component
 *
 * Interactive visualization of nodes in projective/affine coordinate systems
 * - Main projective plane canvas (center)
 * - Selectable affine plane canvases (offscreen views)
 * - Drag nodes between planes
 * - Visual DAG representation
 */

import { useEffect, useRef, useState } from 'react';

export default function ProjectiveCanvas({ dag, complex, onNodeSelect, onNodeCreate }) {
  const projectiveCanvasRef = useRef(null);
  const affineCanvasRefs = useRef([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [affinePlanes, setAffinePlanes] = useState([
    { id: 'affine-0', name: 'Affine U₀', nodes: [], offset: { x: 0, y: 0 } },
    { id: 'affine-1', name: 'Affine U₁', nodes: [], offset: { x: 100, y: 100 } },
    { id: 'affine-2', name: 'Affine U₂', nodes: [], offset: { x: -100, y: 100 } }
  ]);

  // Convert DAG nodes to canvas positions
  const getNodePosition = (nodeId, canvasWidth, canvasHeight) => {
    if (!dag || !dag.nodes.has(nodeId)) {
      return { x: canvasWidth / 2, y: canvasHeight / 2 };
    }

    const node = dag.nodes.get(nodeId);
    const nodes = Array.from(dag.nodes.values());
    const index = nodes.findIndex(n => n.cid === nodeId);

    // Circular layout
    const angle = (index / nodes.length) * Math.PI * 2;
    const radius = Math.min(canvasWidth, canvasHeight) * 0.35;

    return {
      x: canvasWidth / 2 + Math.cos(angle) * radius,
      y: canvasHeight / 2 + Math.sin(angle) * radius
    };
  };

  // Draw projective plane canvas
  const drawProjectivePlane = () => {
    const canvas = projectiveCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    const gridSize = 40;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Projective Plane ℙ²', 10, 25);

    // Draw axes
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (!dag || dag.nodes.size === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '14px monospace';
      ctx.fillText('No nodes yet. Say "create node" to begin.', width / 2 - 180, height / 2);
      return;
    }

    // Draw edges (parent-child relationships)
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;

    dag.nodes.forEach((node, nodeId) => {
      if (node.parent && node.parent !== 'genesis' && dag.nodes.has(node.parent)) {
        const childPos = getNodePosition(nodeId, width, height);
        const parentPos = getNodePosition(node.parent, width, height);

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(parentPos.x, parentPos.y);
        ctx.lineTo(childPos.x, childPos.y);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(childPos.y - parentPos.y, childPos.x - parentPos.x);
        const headLen = 10;
        ctx.beginPath();
        ctx.moveTo(childPos.x, childPos.y);
        ctx.lineTo(
          childPos.x - headLen * Math.cos(angle - Math.PI / 6),
          childPos.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(childPos.x, childPos.y);
        ctx.lineTo(
          childPos.x - headLen * Math.cos(angle + Math.PI / 6),
          childPos.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });

    // Draw nodes
    dag.nodes.forEach((node, nodeId) => {
      const pos = getNodePosition(nodeId, width, height);
      const radius = 20;

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);

      // Color based on state
      if (selectedNode === nodeId) {
        ctx.fillStyle = '#4caf50';
      } else if (hoveredNode === nodeId) {
        ctx.fillStyle = '#64b5f6';
      } else if (node.parent === 'genesis') {
        ctx.fillStyle = '#ff9800'; // Root nodes
      } else {
        ctx.fillStyle = '#2196f3';
      }

      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = nodeId.slice(7, 12);
      ctx.fillText(label, pos.x, pos.y);

      // CID on hover
      if (hoveredNode === nodeId) {
        ctx.fillStyle = '#333';
        ctx.font = '10px monospace';
        ctx.fillText(nodeId.slice(0, 20) + '...', pos.x, pos.y + radius + 15);
      }
    });

    // Draw node count
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Nodes: ${dag.nodes.size}`, 10, height - 10);
  };

  // Draw affine plane canvas
  const drawAffinePlane = (canvasRef, plane) => {
    const canvas = canvasRef;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(plane.name, 5, 15);

    // Draw nodes in this affine plane
    const affineNodes = Array.from(dag?.nodes.values() || [])
      .filter((_, i) => i % 3 === parseInt(plane.id.split('-')[1]));

    affineNodes.forEach((node, i) => {
      const x = 30 + (i % 3) * 40;
      const y = 40 + Math.floor(i / 3) * 40;

      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#9c27b0';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.cid.slice(7, 9), x, y);
    });

    // Node count
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${affineNodes.length} nodes`, 5, height - 5);
  };

  // Handle mouse events on projective canvas
  const handleProjectiveMouseMove = (e) => {
    const canvas = projectiveCanvasRef.current;
    if (!canvas || !dag) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found = null;
    dag.nodes.forEach((node, nodeId) => {
      const pos = getNodePosition(nodeId, canvas.width, canvas.height);
      const distance = Math.sqrt(
        Math.pow(mouseX - pos.x, 2) + Math.pow(mouseY - pos.y, 2)
      );

      if (distance < 20) {
        found = nodeId;
      }
    });

    if (found !== hoveredNode) {
      setHoveredNode(found);
    }
  };

  const handleProjectiveClick = (e) => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
      onNodeSelect?.(hoveredNode);
    } else {
      // Click on empty space to create new node
      onNodeCreate?.();
    }
  };

  const handleProjectiveDoubleClick = (e) => {
    const canvas = projectiveCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Create node at this position
    onNodeCreate?.({ x: mouseX, y: mouseY });
  };

  // Redraw on changes
  useEffect(() => {
    drawProjectivePlane();
  }, [dag, complex, selectedNode, hoveredNode]);

  useEffect(() => {
    affineCanvasRefs.current.forEach((canvas, i) => {
      if (canvas) {
        drawAffinePlane(canvas, affinePlanes[i]);
      }
    });
  }, [dag, affinePlanes]);

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>🎨 Interactive Canvas</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1fr', gap: '10px' }}>
        {/* Left affine planes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {affinePlanes.slice(0, 2).map((plane, i) => (
            <div key={plane.id}>
              <canvas
                ref={el => affineCanvasRefs.current[i] = el}
                width={140}
                height={140}
                style={{
                  border: '2px solid #999',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: '#f5f5f5'
                }}
                onClick={() => {
                  // Select this affine plane
                  console.log(`Selected ${plane.name}`);
                }}
              />
            </div>
          ))}
        </div>

        {/* Center projective plane */}
        <div>
          <canvas
            ref={projectiveCanvasRef}
            width={600}
            height={400}
            style={{
              border: '3px solid #2196f3',
              borderRadius: '8px',
              cursor: hoveredNode ? 'pointer' : 'crosshair',
              background: '#ffffff'
            }}
            onMouseMove={handleProjectiveMouseMove}
            onClick={handleProjectiveClick}
            onDoubleClick={handleProjectiveDoubleClick}
          />

          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: '#e3f2fd',
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            <strong>Controls:</strong>
            <div style={{ marginTop: '5px' }}>
              • <strong>Click node</strong> to select<br/>
              • <strong>Double-click</strong> empty space to create node<br/>
              • <strong>Hover</strong> over node to see CID<br/>
              • Use voice commands or buttons above
            </div>
          </div>
        </div>

        {/* Right affine planes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {affinePlanes.slice(2, 3).map((plane, i) => (
            <div key={plane.id}>
              <canvas
                ref={el => affineCanvasRefs.current[i + 2] = el}
                width={140}
                height={140}
                style={{
                  border: '2px solid #999',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: '#f5f5f5'
                }}
                onClick={() => {
                  console.log(`Selected ${plane.name}`);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Selected node info */}
      {selectedNode && dag?.nodes.has(selectedNode) && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          background: '#e8f5e9',
          borderRadius: '5px',
          border: '2px solid #4caf50'
        }}>
          <strong>Selected Node:</strong>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', marginTop: '5px' }}>
            <div><strong>CID:</strong> {selectedNode}</div>
            <div><strong>Parent:</strong> {dag.nodes.get(selectedNode).parent}</div>
            <div><strong>URI:</strong> {dag.nodes.get(selectedNode).uri || 'N/A'}</div>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}
