# Projective/Affine View Implementation

## Overview

The canvas system has been refactored to use SVG-based rendering with a full-screen projective view and modal-based affine views.

## Architecture

### Main Layout

```
┌─────────────────────────────────────────────────┐
│  Overlay Panel (top-left)                      │
│  - Status, Stats, Actions, Recent Nodes        │
└─────────────────────────────────────────────────┘
                                                  
┌─────────────────────────────────────────────────┐
│                                                 │
│     Projective View (Full Screen SVG)          │
│     - Clickable SVG nodes                       │
│     - Minimap of affine view (top-right)       │
│                                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Speech Interface (bottom overlay)             │
└─────────────────────────────────────────────────┘
```

### Modal Layout (when node clicked)

```
┌─────────────────────────────────────────────────┐
│  Modal Header                                  │
│  - Node ID, Version info                        │
└─────────────────────────────────────────────────┘
┌──────────────────────┬─────────────────────────┐
│                      │                         │
│  Affine Editor       │  Projective Minimap     │
│  (Main Content)      │  (Right Side)           │
│                      │                         │
└──────────────────────┴─────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Navigation Buttons (Previous/Next)             │
│  - History navigation                           │
└─────────────────────────────────────────────────┘
```

## Features

### 1. Projective View (Main Canvas)

- **Full-screen SVG canvas** - Takes up entire viewport
- **Clickable SVG nodes** - Each node is an SVG circle element
- **Hover effects** - Nodes highlight on hover
- **Double-click to create** - Double-click empty space to create new node
- **Visual DAG** - Edges show parent-child relationships with arrows
- **Grid background** - Visual grid for spatial reference

### 2. Affine View Minimap (in Projective View)

- **Top-right corner** - Clickable minimap showing affine view preview
- **Toggle button** - Show/hide minimap
- **Click to open modal** - Click minimap to open full affine editor modal

### 3. Affine View History Modal

- **Full-screen modal** - Opens when clicking a node
- **History navigation** - Shows version history of node and its parents
- **Previous/Next buttons** - Navigate through history versions
- **Projective minimap** - Shows projective view with current node highlighted
- **Click node in minimap** - Switch to different node's history

### 4. Overlay Panels

- **Top-left panel** - Status, stats, actions, recent nodes
- **Bottom center** - Speech interface overlay
- **Semi-transparent** - Overlays don't block the projective view

## Component Structure

### ProjectiveCanvasSVG.jsx

Main component that renders:
- SVG canvas with nodes and edges
- Minimap of affine view
- Modal for affine view history
- Navigation controls

### Key Functions

- `getNodePosition(nodeId)` - Calculates SVG position for node
- `generateAffineHistory(nodeId)` - Generates version history from DAG
- `handleNodeClick(nodeId)` - Opens modal with node history
- `handlePreviousHistory()` / `handleNextHistory()` - Navigate history

## Usage

1. **View Projective Canvas**: Full-screen SVG view with all nodes
2. **Click Node**: Opens modal showing that node's affine view history
3. **Navigate History**: Use Previous/Next buttons to browse versions
4. **Switch Nodes**: Click node in projective minimap (inside modal) to switch
5. **Create Node**: Double-click empty space in projective view

## SVG vs Canvas

**Why SVG?**
- Native click events on individual nodes
- Better accessibility
- Scalable without quality loss
- Easier to add interactivity
- Better for minimaps

**Previous Canvas Implementation**
- Used HTML5 Canvas (raster)
- Required manual hit detection
- Less interactive
- Harder to implement minimaps

## Future Enhancements

- [ ] Drag nodes to reposition
- [ ] Zoom/pan controls
- [ ] Search/filter nodes
- [ ] Export SVG
- [ ] Keyboard shortcuts for navigation
- [ ] Animation transitions

