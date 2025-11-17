/**
 * Template Block Component
 * 
 * SVG component for template blocks in affine view
 */

import React from 'react';

export default function TemplateBlock({ block, isSelected, onClick, onUpdate, onDragStart }) {
  const handleContentChange = (e) => {
    const newContent = e.target.textContent;
    onUpdate({ content: newContent });
  };

  return (
    <g
      transform={`translate(${block.x}, ${block.y})`}
      onClick={onClick}
      onDragStart={onDragStart}
      draggable="true"
      style={{ cursor: 'move' }}
    >
      {/* Background rectangle */}
      <rect
        x="0"
        y="0"
        width={block.width}
        height={block.height}
        fill={isSelected ? '#4caf50' : '#2196f3'}
        stroke="#fff"
        strokeWidth={isSelected ? 3 : 2}
        rx="4"
        opacity="0.9"
      />
      
      {/* Title */}
      <text
        x="10"
        y="20"
        fill="#fff"
        fontSize="14"
        fontWeight="bold"
        fontFamily="monospace"
      >
        Template
      </text>
      
      {/* Content area */}
      <foreignObject x="10" y="30" width={block.width - 20} height={block.height - 40}>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={handleContentChange}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '8px',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '12px',
            fontFamily: 'monospace',
            minHeight: '20px',
            outline: 'none'
          }}
        >
          {block.data?.content || 'Template content...'}
        </div>
      </foreignObject>
      
      {/* Drag handle indicator */}
      {isSelected && (
        <circle cx={block.width - 10} cy="10" r="4" fill="#fff" />
      )}
    </g>
  );
}

