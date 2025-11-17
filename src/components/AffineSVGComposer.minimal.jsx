/**
 * Minimal Affine SVG Composer for testing
 */

import { useState } from 'react';

export default function AffineSVGComposer({ 
  initialContent = '', 
  onSave, 
  onParse,
  planeName = 'Affine View',
  nodeId = null 
}) {
  const [content, setContent] = useState(initialContent);

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: '#fff', height: '100%' }}>
      <h3>{planeName}</h3>
      <p>Minimal version - testing</p>
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: '100%', height: '200px', background: '#333', color: '#fff' }}
      />
      <button onClick={() => onSave?.(content)}>Save</button>
    </div>
  );
}


