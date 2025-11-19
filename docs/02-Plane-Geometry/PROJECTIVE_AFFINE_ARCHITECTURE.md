# Projective Canvas + Affine SVG Architecture

## Overview

This document explains the architecture of the refactored canvas system, where the **projective plane** uses HTML5 Canvas for animated rendering and the **affine plane** uses SVG for drag-and-drop data composition.

## Architecture Rationale

### Projective Plane = Canvas

**Why Canvas?**
- **Performance**: Canvas provides better performance for animations and dynamic rendering
- **Hashing/Computation**: The projective plane represents computational hashing functions, which benefit from Canvas's programmatic rendering
- **Animations**: Canvas's `requestAnimationFrame` API enables smooth animations for node movements and edge particles
- **Future-Ready**: Canvas can be easily extended to WebGL for 3D rendering without architectural changes

**Key Features:**
- HTML5 Canvas rendering with `requestAnimationFrame` for 60fps animations
- SVG icon imports loaded as images and drawn with `drawImage()`
- Click detection using coordinate mapping
- Node position interpolation for smooth transitions
- Edge animation with flowing particles

### Affine Plane = SVG

**Why SVG?**
- **Data Expressions**: The affine plane represents data expressions and markup, which are naturally declarative
- **Drag-and-Drop**: SVG's DOM-based structure makes drag-and-drop interactions straightforward
- **Markup Editing**: `foreignObject` + `contentEditable` enables inline editing of markup content
- **Visual Structure**: SVG's declarative nature makes it easy to represent CANVASL template structure visually
- **1D/2D Views**: SVG's coordinate system easily supports both linear (1D) and spatial (2D) layouts

**Key Features:**
- SVG-based drag-and-drop interface
- Template block components (rectangles, groups, hexagons)
- Markup/directive editing with `foreignObject` + `contentEditable`
- Visual representation of CANVASL structure
- 1D/2D view toggle

## Bipartite Sync System

### Overview

The **bipartite sync system** enables bidirectional synchronization between the affine SVG composer and the projective Canvas renderer. Changes in one view automatically update the other.

### Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│  Affine SVG         │◄───────►│  Projective Canvas  │
│  Composer           │         │  Renderer           │
└─────────────────────┘         └─────────────────────┘
         │                               │
         │                               │
         ▼                               ▼
┌─────────────────────────────────────────────┐
│         Bipartite Sync Engine                │
│  - Event-driven updates                      │
│  - Conflict resolution                       │
│  - Sync state management                     │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│         Sync Adapter                         │
│  - Affine → Projective conversion            │
│  - Projective → Affine conversion             │
│  - Dimension mapping (1D/2D)                 │
│  - Coordinate system conversion               │
└─────────────────────────────────────────────┘
```

### Sync Flow

#### Affine → Projective Sync

1. User edits content in affine SVG composer
2. `BipartiteSync.updateAffine()` is called with node ID and affine data
3. Hash is computed from affine data structure
4. Projective listeners are notified with hash and position
5. Projective Canvas updates node representation

#### Projective → Affine Sync

1. User moves node or updates hash in projective Canvas
2. `BipartiteSync.updateProjective()` is called with node ID and projective data
3. Hash is converted back to affine markup structure
4. Affine listeners are notified with markup data
5. Affine SVG composer updates blocks and content

### Conflict Resolution

The sync system supports two conflict resolution strategies:

1. **Last-Write-Wins** (default): The most recent change takes precedence
2. **User-Choice**: Requires UI interaction to resolve conflicts

### Coordinate System Conversion

The sync adapter handles coordinate system conversion between affine and projective spaces:

- **Affine → Projective**: Applies projective transformation
- **Projective → Affine**: Reverses projective transformation

## Component Structure

### Projective Canvas Components

- **`ProjectiveCanvas.jsx`**: Main Canvas-based component
- **`animation-engine.js`**: Animation system with `requestAnimationFrame`
- **`icon-loader.js`**: SVG icon loading and caching

### Affine SVG Components

- **`AffineSVGComposer.jsx`**: Main SVG-based composer
- **`TemplateBlock.jsx`**: Template block component
- **`DirectiveBlock.jsx`**: Directive block component
- **`MacroBlock.jsx`**: Macro block component
- **`template-library-panel.jsx`**: Template library sidebar
- **`markup-renderer.js`**: Markup parsing and rendering

### Sync Components

- **`bipartite-sync.js`**: Bidirectional sync engine
- **`sync-adapter.js`**: Data conversion adapter

## Usage Examples

### Basic Usage

```javascript
// Projective Canvas
<ProjectiveCanvas
  dag={dag}
  complex={complex}
  onNodeSelect={handleNodeSelect}
  onNodeCreate={handleNodeCreate}
/>

// Affine SVG Composer
<AffineSVGComposer
  initialContent={content}
  onSave={handleSave}
  onParse={handleParse}
  planeName="Affine View"
  nodeId={nodeId}
/>
```

### Sync Integration

```javascript
import { bipartiteSync } from './sync/bipartite-sync.js';
import { syncAdapter } from './sync/sync-adapter.js';

// Register affine change listener
bipartiteSync.onAffineChange((nodeId, affineData) => {
  const projectiveData = syncAdapter.affineToProjective(affineData);
  // Update projective canvas
});

// Register projective change listener
bipartiteSync.onProjectiveChange((nodeId, projectiveData) => {
  const affineData = syncAdapter.projectiveToAffine(projectiveData);
  // Update affine composer
});
```

## Performance Considerations

### Canvas Rendering

- Uses `requestAnimationFrame` for smooth 60fps animations
- Only animates visible elements
- Caches SVG icons to avoid repeated loading
- Uses efficient drawing operations

### SVG Rendering

- Uses SVG DOM for declarative structure
- Leverages browser's native SVG rendering
- Minimizes re-renders with React state management
- Uses `foreignObject` for efficient content editing

## Future Extensions

### WebGL Integration

The Canvas-based projective plane can be extended to WebGL:

1. Replace 2D Canvas context with WebGL context
2. Use Three.js or similar library for 3D rendering
3. Maintain same component interface
4. Add GLB file support for 3D models

### A-Frame Integration

For VR/AR experiences:

1. Create A-Frame scene component
2. Map projective Canvas nodes to A-Frame entities
3. Use GLB files for 3D node representations
4. Maintain bipartite sync with affine SVG composer

## Breaking Changes

- **ProjectiveCanvasSVG.jsx** removed, replaced with **ProjectiveCanvas.jsx**
- Modal content changed from CodeMirror editor to SVG composer
- Node data structure may have changed (breaking compatibility as requested)
- Minimap implementation changed

## Migration Guide

### Updating Imports

```javascript
// Old
import ProjectiveCanvasSVG from './ProjectiveCanvasSVG.jsx';

// New
import ProjectiveCanvas from './ProjectiveCanvas.jsx';
```

### Updating Component Usage

```javascript
// Old
<ProjectiveCanvasSVG dag={dag} complex={complex} />

// New
<ProjectiveCanvas dag={dag} complex={complex} />
```

## Testing

### Canvas Rendering

- Test rendering performance with many nodes (100+)
- Test animation smoothness
- Test icon loading and fallbacks
- Test click detection accuracy

### SVG Rendering

- Test drag-and-drop interactions
- Test markup editing
- Test template block rendering
- Test 1D/2D view switching

### Sync System

- Test bidirectional sync accuracy
- Test conflict resolution
- Test coordinate conversion
- Test dimension mapping

## References

- [HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [SVG DOM API](https://developer.mozilla.org/en-US/docs/Web/API/SVG_Element)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [foreignObject](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)


