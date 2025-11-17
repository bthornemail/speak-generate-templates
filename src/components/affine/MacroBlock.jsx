/**
 * Macro Block Component
 * 
 * SVG component for macro blocks in affine view
 */

import React from 'react';

export default function MacroBlock({ block, isSelected, onClick, onUpdate, onDragStart }) {
  const handleKeywordChange = (e) => {
    const newKeyword = e.target.textContent;
    onUpdate({ keyword: newKeyword });
  };

  const handleApiChange = (e) => {
    const newApi = e.target.textContent;
    onUpdate({ api: newApi });
  };

  return (
    <g
      transform={`translate(${block.x}, ${block.y})`}
      onClick={onClick}
      onDragStart={onDragStart}
      draggable="true"
      style={{ cursor: 'move' }}
    >
      {/* Background rectangle with clock icon */}
      <rect
        x="0"
        y="0"
        width={block.width}
        height={block.height}
        fill={isSelected ? '#d32f2f' : '#f44336'}
        stroke="#fff"
        strokeWidth={isSelected ? 3 : 2}
        rx="4"
        opacity="0.9"
      />
      
      {/* Clock circle */}
      <circle
        cx={block.width - 20}
        cy="20"
        r="12"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <line
        x1={block.width - 20}
        y1="20"
        x2={block.width - 20}
        y2="12"
        stroke="#fff"
        strokeWidth="2"
      />
      <line
        x1={block.width - 20}
        y1="20"
        x2={block.width - 12}
        y2="20"
        stroke="#fff"
        strokeWidth="2"
      />
      
      {/* Title */}
      <text
        x="10"
        y="25"
        fill="#fff"
        fontSize="12"
        fontWeight="bold"
        fontFamily="monospace"
      >
        Macro
      </text>
      
      {/* Keyword */}
      <text
        x="10"
        y="45"
        fill="#fff"
        fontSize="10"
        fontFamily="monospace"
        opacity="0.8"
      >
        Keyword:
      </text>
      <foreignObject x="10" y="50" width={block.width - 20} height="25">
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={handleKeywordChange}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '4px',
            borderRadius: '2px',
            color: '#fff',
            fontSize: '11px',
            fontFamily: 'monospace',
            minHeight: '15px',
            outline: 'none'
          }}
        >
          {block.data?.keyword || 'keyword...'}
        </div>
      </foreignObject>
      
      {/* API */}
      <text
        x="10"
        y="85"
        fill="#fff"
        fontSize="10"
        fontFamily="monospace"
        opacity="0.8"
      >
        API:
      </text>
      <foreignObject x="10" y="90" width={block.width - 20} height="25">
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={handleApiChange}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '4px',
            borderRadius: '2px',
            color: '#fff',
            fontSize: '11px',
            fontFamily: 'monospace',
            minHeight: '15px',
            outline: 'none'
          }}
        >
          {block.data?.api || 'api...'}
        </div>
      </foreignObject>
      
      {/* Drag handle indicator */}
      {isSelected && (
        <circle cx={block.width - 10} cy="10" r="4" fill="#fff" />
      )}
    </g>
  );
}

