/**
 * Template Library Panel
 * 
 * Sidebar with draggable template blocks
 * - Template categories (directives, macros, structures)
 * - Search/filter templates
 * - Import/export templates
 */

import { useState } from 'react';
import TemplateBlock from './TemplateBlock.jsx';
import DirectiveBlock from './DirectiveBlock.jsx';
import MacroBlock from './MacroBlock.jsx';

export default function TemplateLibraryPanel({ onDragStart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'directives', name: 'Directives' },
    { id: 'macros', name: 'Macros' },
    { id: 'structures', name: 'Structures' }
  ];

  // Template library data
  const templates = [
    {
      id: 'template-directive-type',
      type: 'directive',
      category: 'directives',
      name: 'Type Directive',
      data: { key: 'type', value: 'canvasl-template' }
    },
    {
      id: 'template-directive-version',
      type: 'directive',
      category: 'directives',
      name: 'Version Directive',
      data: { key: 'version', value: '1.0.0' }
    },
    {
      id: 'template-macro-geolocation',
      type: 'macro',
      category: 'macros',
      name: 'Geolocation Macro',
      data: {
        keyword: 'location',
        api: 'geolocation',
        method: 'getCurrentPosition',
        params: { enableHighAccuracy: true }
      }
    },
    {
      id: 'template-macro-notification',
      type: 'macro',
      category: 'macros',
      name: 'Notification Macro',
      data: {
        keyword: 'notify',
        api: 'notifications',
        method: 'showNotification',
        params: { title: 'CANVASL Alert', body: 'Voice command executed' }
      }
    },
    {
      id: 'template-structure-basic',
      type: 'template',
      category: 'structures',
      name: 'Basic Template',
      data: { content: '# Template\n\nTemplate content here...' }
    }
  ];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render template preview
  const renderTemplatePreview = (template) => {
    const block = {
      ...template,
      x: 0,
      y: 0,
      width: 200,
      height: template.type === 'directive' ? 80 : template.type === 'macro' ? 100 : 150
    };

    const commonProps = {
      block,
      isSelected: false,
      onClick: () => {},
      onUpdate: () => {},
      onDragStart: (e) => {
        e.dataTransfer.setData('template', JSON.stringify(template));
        onDragStart?.(e, template);
      }
    };

    switch (template.type) {
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
    <div style={{
      width: '300px',
      height: '100%',
      background: '#2a2a2a',
      borderRight: '2px solid #444',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        borderBottom: '2px solid #444',
        background: '#333'
      }}>
        <h3 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '16px' }}>
          📚 Template Library
        </h3>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#1a1a1a',
            border: '1px solid #555',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}
        />
      </div>

      {/* Categories */}
      <div style={{
        padding: '10px',
        borderBottom: '2px solid #444',
        display: 'flex',
        gap: '5px',
        flexWrap: 'wrap'
      }}>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            style={{
              padding: '5px 10px',
              background: selectedCategory === category.id ? '#2196f3' : 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Template List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '10px'
      }}>
        {filteredTemplates.length === 0 ? (
          <div style={{
            color: '#999',
            fontSize: '12px',
            textAlign: 'center',
            padding: '20px'
          }}>
            No templates found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                style={{
                  background: '#333',
                  borderRadius: '4px',
                  padding: '10px',
                  border: '1px solid #555',
                  cursor: 'grab'
                }}
                draggable="true"
                onDragStart={(e) => {
                  e.dataTransfer.setData('template', JSON.stringify(template));
                  onDragStart?.(e, template);
                }}
              >
                <div style={{
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  fontFamily: 'monospace'
                }}>
                  {template.name}
                </div>
                <div style={{
                  width: '100%',
                  height: '80px',
                  overflow: 'hidden',
                  background: '#1a1a1a',
                  borderRadius: '2px',
                  position: 'relative'
                }}>
                  <svg width="200" height="80" viewBox="0 0 200 80" style={{ width: '100%', height: '100%' }}>
                    {renderTemplatePreview(template)}
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


