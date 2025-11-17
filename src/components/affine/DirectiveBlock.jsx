/**
 * Directive Block Component
 * 
 * SVG component for directive blocks in affine view
 */

import React from 'react';

export default function DirectiveBlock({ block, isSelected, onClick, onUpdate, onDragStart }) {
  const handleValueChange = (e) => {
    const newValue = e.target.textContent;
    onUpdate({ value: newValue });
  };

  return (
    <g
      transform={`translate(${block.x}, ${block.y})`}
      onClick={onClick}
      onDragStart={onDragStart}
      draggable="true"
      style={{ cursor: 'move' }}
    >
      {/* Background hexagon */}
      <polygon
        points={`${block.width / 2},10 ${block.width - 10},25 ${block.width - 10},${block.height - 25} ${block.width / 2},${block.height - 10} 10,${block.height - 25} 10,25`}
        fill={isSelected ? '#7b1fa2' : '#9c27b0'}
        stroke="#fff"
        strokeWidth={isSelected ? 3 : 2}
        opacity="0.9"
      />
      
      {/* Title */}
      <text
        x={block.width / 2}
        y="25"
        fill="#fff"
        fontSize="12"
        fontWeight="bold"
        fontFamily="monospace"
        textAnchor="middle"
      >
        Directive: {block.data?.key || 'type'}
      </text>
      
      {/* Value area */}
      <foreignObject x="15" y="35" width={block.width - 30} height={block.height - 50}>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={handleValueChange}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '6px',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '11px',
            fontFamily: 'monospace',
            minHeight: '15px',
            outline: 'none',
            textAlign: 'center'
          }}
        >
          {block.data?.value || 'directive value...'}
        </div>
      </foreignObject>
      
      {/* Drag handle indicator */}
      {isSelected && (
        <circle cx={block.width / 2} cy="10" r="3" fill="#fff" />
      )}
    </g>
  );
}

