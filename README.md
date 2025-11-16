# CANVASL A₁₁ Demonstration

> **A peer-to-peer, topologically sound, self-sovereign operating system**

**📖 [Complete Demonstration Documentation](./docs/CANVASL-DEMONSTRATION.md)** - Comprehensive guide covering Who, What, When, Where, Why, and How

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173/
```

## Features

- 🎤 **Voice-Controlled Interface** - Generate CANVASL templates via voice commands
- 📝 **Markdown Editor** - CodeMirror-based editor with YAML frontmatter support
- 🎨 **Interactive Canvas** - Visualize DAG structure with projective/affine views
- ⭐ **Animated Background** - Beautiful stars animation
- 🔬 **Topological Validation** - Chain complex homology checking (∂² = 0)
- 💾 **Content-Addressed Storage** - OPFS + IndexedDB for persistent node storage

## Voice Commands

- **"generate template for [keywords]"** - Generate YAML template
- **"parse md"** - Parse Markdown frontmatter
- **"create node"** - Create new MetaLogNode
- **"validate homology"** - Check topological consistency
- **"show stats"** - Read system statistics

## Documentation

- **[CANVASL-DEMONSTRATION.md](./docs/CANVASL-DEMONSTRATION.md)** - Complete demonstration guide
- **[SPEECH_FEATURES.md](./SPEECH_FEATURES.md)** - Voice interface documentation
- **[docs/01-CanvasL-A11.md](./docs/01-CanvasL-A11.md)** - CANVASL specification

## Technology Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **Web Speech API** - Voice recognition and synthesis
- **CodeMirror 6** - Markdown editor
- **OPFS** - Origin Private File System
- **IndexedDB** - Indexed database storage

## Project Structure

```
src/
├── components/          # UI components (Stars, Editor)
├── canvasl/            # CANVASL core system
│   ├── speech/         # Voice interface
│   ├── chain/          # Chain complex operations
│   ├── dag/            # DAG management
│   └── storage/        # Storage adapters
└── App.jsx             # Main application
```

## Browser Requirements

- Chrome/Edge 25+ (recommended)
- Safari 14.1+ (partial support)
- Firefox (limited support)

Requires microphone access for voice features.

## License

Private project - See repository for details.

---

**Status**: ✅ Fully Operational  
**Version**: 1.0.0  
**Last Updated**: 2025-01-07
