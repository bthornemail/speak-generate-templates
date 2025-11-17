/**
 * Projective Canvas Component (Canvas-based)
 *
 * Main projective plane canvas with Canvas rendering
 * - HTML5 Canvas for animations and dynamic rendering
 * - SVG icon imports for node avatars
 * - Click detection using coordinate mapping
 * - Minimap of affine view
 * - Click nodes to show affine view history modal
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { AnimationEngine } from './canvas/animation-engine.js';
import { iconLoader } from './icons/icon-loader.js';
import AffineSVGComposer from '../components/AffineSVGComposer.jsx';

export default function ProjectiveCanvas({ dag, complex, onNodeSelect, onNodeCreate }) {
  const canvasRef = useRef(null);
  const animationEngineRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showAffineModal, setShowAffineModal] = useState(false);
  const [affineHistoryIndex, setAffineHistoryIndex] = useState(0);
  const [affineHistory, setAffineHistory] = useState([]);
  const [showMinimap, setShowMinimap] = useState(true);
  const [nodeIcons, setNodeIcons] = useState(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Canvas dimensions
  const canvasWidth = 1200;
  const canvasHeight = 800;

  // Convert DAG nodes to positions
  const getNodePosition = useCallback((nodeId) => {
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
  }, [dag, canvasWidth, canvasHeight]);

  // Memoize node positions
  const nodePositions = useMemo(() => {
    if (!dag) return new Map();
    const positions = new Map();
    dag.nodes.forEach((node, nodeId) => {
      positions.set(nodeId, getNodePosition(nodeId));
    });
    return positions;
  }, [dag, getNodePosition]);

  // Load icons for all nodes
  useEffect(() => {
    if (!dag) return;

    const loadIcons = async () => {
      const iconMap = new Map();
      for (const [nodeId, node] of dag.nodes.entries()) {
        try {
          const icon = await iconLoader.loadNodeIcon(node);
          iconMap.set(nodeId, icon);
        } catch (error) {
          console.warn(`Failed to load icon for node ${nodeId}:`, error);
        }
      }
      setNodeIcons(iconMap);
    };

    loadIcons();
  }, [dag]);

  // Initialize animation engine and canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref not available');
      return;
    }

    console.log('Initializing canvas...', { canvas, canvasWidth, canvasHeight });

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2d context');
      return;
    }

    // Create engine but don't start it (we'll use our own render loop)
    const engine = new AnimationEngine(canvas, ctx);
    animationEngineRef.current = engine;
    console.log('Animation engine created');

    return () => {
      engine.stop();
    };
  }, [canvasWidth, canvasHeight]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Render called but no canvas ref');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Render called but no context');
      return;
    }

    // Use explicit pixel dimensions from state
    if (canvasSize.width === 0 || canvasSize.height === 0) {
      return; // Wait for size to be set
    }

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvasSize.width;
    const displayHeight = canvasSize.height;

    // Ensure canvas internal size matches (should already be set, but double-check)
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    // Clear canvas (use internal dimensions)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset and scale transform for this render
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Fill dark background (semi-transparent to show stars)
    ctx.fillStyle = 'rgba(10, 10, 15, 0.7)';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Calculate scale to fit content
    const scaleX = displayWidth / canvasWidth;
    const scaleY = displayHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY) * zoom;
    const offsetX = (displayWidth - canvasWidth * scale) / 2 + viewOffset.x;
    const offsetY = (displayHeight - canvasHeight * scale) / 2 + viewOffset.y;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Draw grid
    drawGrid(ctx, canvasWidth, canvasHeight);

    // Draw axes
    drawAxes(ctx, canvasWidth, canvasHeight);

    // Draw edges
    if (dag && dag.nodes.size > 0) {
      drawEdges(ctx, dag, nodePositions, hoveredNode, selectedNode);
    }

    // Draw nodes
    if (dag && dag.nodes.size > 0) {
      drawNodes(ctx, dag, nodePositions, nodeIcons, hoveredNode, selectedNode, animationEngineRef.current);
    }

    ctx.restore();

    // Draw title (in screen coordinates)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Projective Plane ℙ²', 20, 30);

    // Draw node count (in screen coordinates)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Nodes: ${dag?.nodes.size || 0}`, 20, displayHeight - 20);
  }, [dag, nodePositions, nodeIcons, hoveredNode, selectedNode, viewOffset, zoom, canvasWidth, canvasHeight, canvasSize]);

  // Update canvas size based on viewport
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setCanvasSize({ width, height });
    };

    // Initial size
    updateCanvasSize();

    // Handle window resize
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Initial render and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref not available for render loop');
      return;
    }

    if (canvasSize.width === 0 || canvasSize.height === 0) {
      return; // Wait for size to be set
    }

    console.log('Setting up canvas render loop...', canvasSize);

    // Set canvas size to match viewport (explicit pixels)
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvasSize.width;
      const displayHeight = canvasSize.height;

      console.log('Updating canvas size:', { displayWidth, displayHeight, dpr });

      // Set CSS size (explicit pixels)
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // Set internal size (scaled for retina displays)
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;

      // Scale context for retina displays (setting width/height resets context)
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        ctx.scale(dpr, dpr);
      }

      console.log('Canvas sized:', {
        width: canvas.width,
        height: canvas.height,
        cssWidth: canvas.style.width,
        cssHeight: canvas.style.height,
        dpr
      });
    };

    // Initial size
    updateCanvasSize();

    // Initial render immediately
    console.log('Starting initial render...');
    render();

    // Set up animation loop using requestAnimationFrame
    let animationId;
    let frameCount = 0;
    const animate = () => {
      render();
      frameCount++;
      if (frameCount % 60 === 0) {
        console.log('Rendering... frame:', frameCount);
      }
      animationId = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationId = requestAnimationFrame(animate);
    console.log('Animation loop started');

    // Handle window resize - update canvas size
    const handleResize = () => {
      console.log('Window resized, updating canvas size');
      updateCanvasSize();
      render();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      console.log('Cleaning up render loop');
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [render, canvasSize]);

  // Generate affine view history for a node
  const generateAffineHistory = useCallback((nodeId) => {
    if (!dag || !dag.nodes.has(nodeId)) {
      return [];
    }

    const node = dag.nodes.get(nodeId);
    const history = [];
    
    // Add current node
    history.push({
      nodeId,
      content: node.content || '',
      timestamp: Date.now(),
      version: 1
    });

    // Add parent nodes (history)
    let current = node;
    let version = 2;
    while (current.parent && current.parent !== 'genesis' && dag.nodes.has(current.parent)) {
      const parent = dag.nodes.get(current.parent);
      history.push({
        nodeId: current.parent,
        content: parent.content || '',
        timestamp: Date.now() - (version * 1000),
        version: version++
      });
      current = parent;
    }

    return history.reverse(); // Oldest first
  }, [dag]);

  // Handle node click
  const handleNodeClick = useCallback((nodeId) => {
    setSelectedNode(nodeId);
    onNodeSelect?.(nodeId);
    
    // Generate and show affine history
    const history = generateAffineHistory(nodeId);
    setAffineHistory(history);
    setAffineHistoryIndex(history.length - 1); // Start with most recent
    setShowAffineModal(true);
  }, [onNodeSelect, generateAffineHistory]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewOffset.x) / zoom;
    const y = (e.clientY - rect.top - viewOffset.y) / zoom;

    // Check if clicking on a node
    if (dag && dag.nodes.size > 0) {
      for (const [nodeId, pos] of nodePositions.entries()) {
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        if (distance <= 20) {
          handleNodeClick(nodeId);
          return;
        }
      }
    }
  }, [dag, nodePositions, viewOffset, zoom, handleNodeClick]);

  // Handle double click to create node
  const handleDoubleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewOffset.x) / zoom;
    const y = (e.clientY - rect.top - viewOffset.y) / zoom;

    onNodeCreate?.({ x, y });
  }, [onNodeCreate, viewOffset, zoom]);

  // Handle mouse move for hover detection
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewOffset.x) / zoom;
    const y = (e.clientY - rect.top - viewOffset.y) / zoom;

    // Check if hovering over a node
    let foundNode = null;
    if (dag && dag.nodes.size > 0) {
      for (const [nodeId, pos] of nodePositions.entries()) {
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        if (distance <= 20) {
          foundNode = nodeId;
          break;
        }
      }
    }

    setHoveredNode(foundNode);
    canvas.style.cursor = foundNode ? 'pointer' : 'crosshair';
  }, [dag, nodePositions, viewOffset, zoom]);

  // Navigation handlers
  const handlePreviousHistory = () => {
    if (affineHistoryIndex > 0) {
      setAffineHistoryIndex(affineHistoryIndex - 1);
    }
  };

  const handleNextHistory = () => {
    if (affineHistoryIndex < affineHistory.length - 1) {
      setAffineHistoryIndex(affineHistoryIndex + 1);
    }
  };

  const handleCloseModal = () => {
    setShowAffineModal(false);
    setAffineHistory([]);
    setAffineHistoryIndex(0);
  };

  // Get current history item
  const currentHistoryItem = affineHistory[affineHistoryIndex] || null;
  const minimapCanvasRef = useRef(null);

  // Render minimap when dependencies change
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (canvas && dag && currentHistoryItem) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawMinimap(ctx, canvas.width, canvas.height, dag, nodePositions, currentHistoryItem.nodeId);
      }
    }
  }, [dag, nodePositions, currentHistoryItem]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: `${canvasSize.width}px`, height: `${canvasSize.height}px`, background: 'transparent', overflow: 'hidden', margin: 0, padding: 0 }}>
      {/* Main Projective Canvas (Canvas) */}
      <div style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px`, position: 'fixed', top: 0, left: 0, overflow: 'hidden', zIndex: 0, margin: 0, padding: 0 }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            background: 'transparent',
            cursor: hoveredNode ? 'pointer' : 'crosshair',
            zIndex: 0,
            pointerEvents: 'auto',
            margin: 0,
            padding: 0
          }}
          onClick={handleCanvasClick}
          onDoubleClick={handleDoubleClick}
          onMouseMove={handleMouseMove}
        />

        {/* Minimap of Affine View (top-right) */}
        {showMinimap && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '200px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #2196f3',
              borderRadius: '8px',
              padding: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 10
            }}
            onClick={() => setShowAffineModal(true)}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'}
          >
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
              📋 Affine View Minimap
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px' }}>
              {selectedNode ? `Node: ${selectedNode.slice(0, 8)}...` : 'Click a node to view'}
            </div>
            {selectedNode && (
              <div style={{
                width: '100%',
                height: '80px',
                background: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                color: '#999',
                border: '1px dashed #ccc'
              }}>
                Affine View Preview
                <br />
                {affineHistory.length > 0 && (
                  <span style={{ fontSize: '8px', marginTop: '5px', display: 'block' }}>
                    {affineHistory.length} history items
                  </span>
                )}
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMinimap(false);
              }}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'transparent',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Toggle minimap button (if hidden) */}
        {!showMinimap && (
          <button
            onClick={() => setShowMinimap(true)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '8px 12px',
              background: 'rgba(33, 150, 243, 0.9)',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              zIndex: 10
            }}
          >
            📋 Show Minimap
          </button>
        )}
      </div>

      {/* Affine View History Modal */}
      {showAffineModal && currentHistoryItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              width: '90%',
              maxWidth: '1200px',
              height: '90%',
              background: '#1a1a1a',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '2px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ color: '#fff', margin: 0 }}>
                  📝 Affine View History - Node {currentHistoryItem.nodeId.slice(0, 12)}...
                </h3>
                <div style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
                  Version {currentHistoryItem.version} of {affineHistory.length}
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px 10px'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px',
              display: 'flex',
              gap: '20px'
            }}>
              {/* Affine Editor (main content) */}
              <div style={{ flex: 1 }}>
                <AffineSVGComposer
                  planeName={`Affine View - Version ${currentHistoryItem.version}`}
                  nodeId={currentHistoryItem.nodeId}
                  initialContent={currentHistoryItem.content}
                  onSave={(content) => {
                    console.log('Saving content:', content);
                  }}
                  onParse={(parsed) => {
                    console.log('Parsed template:', parsed);
                  }}
                />
              </div>

              {/* Projective View Minimap (right side) */}
              <div style={{
                width: '250px',
                background: '#2a2a2a',
                borderRadius: '8px',
                padding: '15px',
                border: '2px solid #444',
                height: 'fit-content',
                position: 'sticky',
                top: '20px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: '#fff'
                }}>
                  🎨 Projective View Minimap
                </div>
                <canvas
                  ref={minimapCanvasRef}
                  width="220"
                  height="200"
                  style={{
                    background: '#fff',
                    borderRadius: '4px',
                    border: '1px solid #555',
                    width: '100%',
                    height: 'auto'
                  }}
                />
                <div style={{
                  marginTop: '10px',
                  fontSize: '11px',
                  color: '#999',
                  textAlign: 'center'
                }}>
                  Click node to switch
                </div>
              </div>
            </div>

            {/* Navigation Buttons (opposite side of minimap) */}
            <div style={{
              padding: '15px 20px',
              borderTop: '2px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#222'
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handlePreviousHistory}
                  disabled={affineHistoryIndex === 0}
                  style={{
                    padding: '10px 20px',
                    background: affineHistoryIndex === 0 ? '#444' : '#2196f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: affineHistoryIndex === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNextHistory}
                  disabled={affineHistoryIndex === affineHistory.length - 1}
                  style={{
                    padding: '10px 20px',
                    background: affineHistoryIndex === affineHistory.length - 1 ? '#444' : '#2196f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: affineHistoryIndex === affineHistory.length - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Next →
                </button>
              </div>
              <div style={{ color: '#999', fontSize: '12px' }}>
                {affineHistoryIndex + 1} / {affineHistory.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Drawing helper functions
function drawGrid(ctx, width, height) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  
  const gridSize = 40;
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawAxes(ctx, width, height) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  
  // Vertical axis
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  
  // Horizontal axis
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

function drawEdges(ctx, dag, nodePositions, hoveredNode, selectedNode) {
  ctx.strokeStyle = '#2196f3';
  ctx.lineWidth = 2;
  
  for (const [nodeId, node] of dag.nodes.entries()) {
    if (node.parent && node.parent !== 'genesis' && dag.nodes.has(node.parent)) {
      const childPos = nodePositions.get(nodeId);
      const parentPos = nodePositions.get(node.parent);
      
      if (childPos && parentPos) {
        ctx.beginPath();
        ctx.moveTo(parentPos.x, parentPos.y);
        ctx.lineTo(childPos.x, childPos.y);
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(childPos.y - parentPos.y, childPos.x - parentPos.x);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(childPos.x, childPos.y);
        ctx.lineTo(
          childPos.x - arrowLength * Math.cos(angle - arrowAngle),
          childPos.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(childPos.x, childPos.y);
        ctx.lineTo(
          childPos.x - arrowLength * Math.cos(angle + arrowAngle),
          childPos.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
      }
    }
  }
}

function drawNodes(ctx, dag, nodePositions, nodeIcons, hoveredNode, selectedNode, animationEngine) {
  for (const [nodeId, node] of dag.nodes.entries()) {
    const pos = nodePositions.get(nodeId);
    if (!pos) continue;

    // Get animated position if available
    const animatedPos = animationEngine?.getAnimatedPosition(nodeId, pos) || pos;
    const radius = 20;
    const isSelected = selectedNode === nodeId;
    const isHovered = hoveredNode === nodeId;
    
    let fillColor = '#2196f3';
    if (isSelected) {
      fillColor = '#4caf50';
    } else if (isHovered) {
      fillColor = '#64b5f6';
    } else if (node.parent === 'genesis') {
      fillColor = '#ff9800';
    }

    // Draw node circle
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(animatedPos.x, animatedPos.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw icon if available
    const icon = nodeIcons.get(nodeId);
    if (icon) {
      ctx.drawImage(icon, animatedPos.x - 20, animatedPos.y - 20, 40, 40);
    }
    
    // Draw label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nodeId.slice(7, 12), animatedPos.x, animatedPos.y);

    // Draw CID on hover
    if (isHovered) {
      ctx.fillStyle = '#333';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${nodeId.slice(0, 20)}...`, animatedPos.x, animatedPos.y + radius + 15);
    }
  }
}

function drawTitle(ctx, width) {
  ctx.fillStyle = '#333';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Projective Plane ℙ²', 20, 30);
}

function drawNodeCount(ctx, width, height, count) {
  ctx.fillStyle = '#666';
  ctx.font = '12px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`Nodes: ${count}`, 20, height - 20);
}

function drawMinimap(ctx, width, height, dag, nodePositions, selectedNodeId) {
  // Clear
  ctx.clearRect(0, 0, width, height);
  
  // Draw grid
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;
  const gridSize = 40;
  const scaleX = width / 1200;
  const scaleY = height / 800;
  
  for (let x = 0; x <= 1200; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x * scaleX, 0);
    ctx.lineTo(x * scaleX, height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= 800; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y * scaleY);
    ctx.lineTo(width, y * scaleY);
    ctx.stroke();
  }
  
  // Draw edges
  ctx.strokeStyle = '#2196f3';
  ctx.lineWidth = 1;
  for (const [nodeId, node] of dag.nodes.entries()) {
    if (node.parent && node.parent !== 'genesis' && dag.nodes.has(node.parent)) {
      const childPos = nodePositions.get(nodeId);
      const parentPos = nodePositions.get(node.parent);
      
      if (childPos && parentPos) {
        ctx.beginPath();
        ctx.moveTo(parentPos.x * scaleX, parentPos.y * scaleY);
        ctx.lineTo(childPos.x * scaleX, childPos.y * scaleY);
        ctx.stroke();
      }
    }
  }
  
  // Draw nodes
  for (const [nodeId, node] of dag.nodes.entries()) {
    const pos = nodePositions.get(nodeId);
    if (!pos) continue;

    const radius = 8;
    const isSelected = selectedNodeId === nodeId;
    
    ctx.fillStyle = isSelected ? '#4caf50' : (node.parent === 'genesis' ? '#ff9800' : '#2196f3');
    ctx.beginPath();
    ctx.arc(pos.x * scaleX, pos.y * scaleY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.stroke();
  }
}
