/**
 * Affine SVG Composer Component
 * 
 * SVG-based drag-and-drop composer for affine views
 * - SVG-based drag-and-drop interface
 * - Template block components (rectangles, groups)
 * - Markup/directive editing with foreignObject + contentEditable
 * - Visual representation of CANVASL structure
 * - 1D/2D view toggle
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import TemplateBlock from './affine/TemplateBlock.jsx';
import DirectiveBlock from './affine/DirectiveBlock.jsx';
import MacroBlock from './affine/MacroBlock.jsx';
import './AffineSVGComposer.css';

// Dynamic import function for parseAndValidate
async function loadParser() {
  const parser = await import('../canvasl/speech/frontmatter-parser.js');
  return parser.parseAndValidate;
}

export default function AffineSVGComposer({ 
  initialContent = '', 
  onSave, 
  onParse,
  planeName = 'Affine View',
  nodeId = null 
}) {
  const svgRef = useRef(null);
  const [content, setContent] = useState(initialContent);
  const [parsedData, setParsedData] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [viewMode, setViewMode] = useState('2D'); // '1D' or '2D'
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showMinimap, setShowMinimap] = useState(true);
  const [showLibrary, setShowLibrary] = useState(true);

  // Generate blocks from parsed content
  const generateBlocksFromContent = useCallback((parsed) => {
    const blocks = [];
    
    if (!parsed || !parsed.frontmatter) return blocks;

    let yOffset = 50;
    const blockSpacing = 120;

    // Add directive blocks
    if (parsed.frontmatter.type) {
      blocks.push({
        id: 'directive-type',
        type: 'directive',
        x: 50,
        y: yOffset,
        width: 300,
        height: 80,
        data: { key: 'type', value: parsed.frontmatter.type }
      });
      yOffset += blockSpacing;
    }

    // Add template blocks
    if (parsed.frontmatter.macros && Array.isArray(parsed.frontmatter.macros)) {
      parsed.frontmatter.macros.forEach((macro, index) => {
        blocks.push({
          id: `macro-${index}`,
          type: 'macro',
          x: 50,
          y: yOffset,
          width: 300,
          height: 100,
          data: macro
        });
        yOffset += blockSpacing;
      });
    }

    // Add template block for body
    if (parsed.body) {
      blocks.push({
        id: 'template-body',
        type: 'template',
        x: 50,
        y: yOffset,
        width: 600,
        height: 200,
        data: { content: parsed.body }
      });
    }

    return blocks;
  }, []);

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
      (async () => {
        try {
          const parser = await loadParser();
          const parsed = await parser(content);
          
          if (cancelled) return;
          
          setParsedData(parsed);
          onParse?.(parsed);
          
          // Generate blocks from parsed data
          const newBlocks = generateBlocksFromContent(parsed);
          setBlocks(newBlocks);
        } catch (error) {
          if (cancelled) return;
          console.error('Parse error:', error);
        }
      })();
    } else {
      setParsedData(null);
      setBlocks([]);
    }
    
    return () => {
      cancelled = true;
    };
  }, [content, onParse, generateBlocksFromContent]);

  // Handle drag start
  const handleDragStart = useCallback((e, blockId) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedBlock(blockId);
    
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      const svg = svgRef.current;
      if (svg) {
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
        setDragOffset({
          x: svgPt.x - block.x,
          y: svgPt.y - block.y
        });
      }
    }
  }, [blocks]);

  // Handle drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    
    if (!draggedBlock) return;

    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());

    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === draggedBlock
          ? { ...block, x: svgPt.x - dragOffset.x, y: svgPt.y - dragOffset.y }
          : block
      )
    );

    setDraggedBlock(null);
    setDragOffset({ x: 0, y: 0 });
  }, [draggedBlock, dragOffset]);

  // Handle block click
  const handleBlockClick = useCallback((blockId) => {
    setSelectedBlock(blockId === selectedBlock ? null : blockId);
  }, [selectedBlock]);

  // Handle block update
  const handleBlockUpdate = useCallback((blockId, newData) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId ? { ...block, data: { ...block.data, ...newData } } : block
      )
    );
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    onSave?.(content);
  }, [content, onSave]);

  // Render block component
  const renderBlock = (block) => {
    const commonProps = {
      key: block.id,
      block: block,
      isSelected: selectedBlock === block.id,
      onClick: () => handleBlockClick(block.id),
      onUpdate: (data) => handleBlockUpdate(block.id, data),
      onDragStart: (e) => handleDragStart(e, block.id)
    };

    switch (block.type) {
      case 'directive':
        return <DirectiveBlock {...commonProps} />;
      case 'macro':
        return <MacroBlock {...commonProps} />;
      case 'template':
        return <TemplateBlock {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="affine-svg-composer">
      {/* Header */}
      <div className="composer-header">
        <div className="composer-title">
          <h3 style={{ color: '#fff', margin: 0 }}>📝 {planeName}</h3>
          {nodeId && (
            <span style={{ color: '#aaa', fontSize: '12px', marginLeft: '10px' }}>
              Node: {nodeId.slice(0, 12)}...
            </span>
          )}
        </div>
        <div className="composer-actions">
          <button
            onClick={() => setViewMode(viewMode === '1D' ? '2D' : '1D')}
            className="composer-btn"
            style={{ background: viewMode === '2D' ? '#4caf50' : 'rgba(255, 255, 255, 0.1)' }}
          >
            {viewMode === '2D' ? '📐 2D' : '📏 1D'}
          </button>
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="composer-btn"
            style={{ background: showLibrary ? '#4caf50' : 'rgba(255, 255, 255, 0.1)' }}
          >
            {showLibrary ? '📚 Hide Library' : '📚 Show Library'}
          </button>
          <button onClick={handleSave} className="composer-btn" style={{ background: '#007bff' }}>
            💾 Save
          </button>
        </div>
      </div>

      {/* Main SVG Composer */}
      <div className="composer-container" style={{ display: 'flex' }}>
        {/* Template Library Panel - Temporarily disabled */}
        {false && showLibrary && (
          <div style={{ width: '300px', background: '#2a2a2a', color: '#fff', padding: '20px' }}>
            Template Library (coming soon)
          </div>
        )}
        
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 1200 800"
          className="affine-svg"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Grid */}
          <defs>
            <pattern id="affine-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#affine-grid)" />

          {/* Render blocks */}
          {blocks.map(block => renderBlock(block))}

          {/* Empty state */}
          {blocks.length === 0 && (
            <text
              x="600"
              y="400"
              fill="#999"
              fontSize="16"
              fontFamily="monospace"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              No blocks yet. Parse content with frontmatter to generate blocks.
            </text>
          )}
        </svg>

        {/* Projective View Minimap (right side) */}
        {showMinimap && (
          <div
            className="projective-minimap"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '250px',
              height: '200px',
              background: '#2a2a2a',
              borderRadius: '8px',
              padding: '15px',
              border: '2px solid #444',
              zIndex: 10
            }}
          >
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#fff'
            }}>
              🎨 Projective View Minimap
            </div>
            <div style={{
              width: '100%',
              height: '150px',
              background: '#fff',
              borderRadius: '4px',
              border: '1px solid #555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '12px'
            }}>
              Projective View Preview
            </div>
            <button
              onClick={() => setShowMinimap(false)}
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
      </div>

      {/* Footer Info */}
      <div className="composer-footer">
        <div style={{ color: '#aaa', fontSize: '11px' }}>
          💡 Tip: Drag blocks to rearrange. Click to select and edit.
        </div>
        <div style={{ color: '#aaa', fontSize: '11px' }}>
          Blocks: {blocks.length} | View: {viewMode}
        </div>
      </div>
    </div>
  );
}

