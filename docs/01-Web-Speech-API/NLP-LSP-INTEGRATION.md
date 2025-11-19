# NLP and LSP Integration Documentation

## Overview

The CANVASL system now includes comprehensive NLP (Natural Language Processing) and LSP (Language Server Protocol) integration, enabling intelligent template generation, grammar-based autocomplete, semantic understanding, and AST-based validation.

## Architecture

### Components

1. **NLP Layer** (`src/canvasl/nlp/`)
   - `winknlp-engine.js` - Grammar extraction using wink-nlp
   - `wordnet-engine.js` - Semantic understanding using WordNet
   - `grammar-extractor.js` - Grammar pattern extraction
   - `semantic-analyzer.js` - Semantic analysis utilities

2. **AST Layer** (`src/canvasl/ast/`)
   - `ast-template.js` - AST node models
   - `ast-builder.js` - AST construction from NLP analysis
   - `ast-validator.js` - AST validation

3. **LSP Layer** (`src/canvasl/lsp/` and `lsp-server/`)
   - Browser-native LSP service (works without server)
   - LSP client with WebSocket support
   - LSP server with stdio interface
   - WebSocket bridge for browser connections

## Features

### 1. Grammar Extraction

Extracts grammar patterns from markdown content:

```javascript
import { GrammarExtractor } from './canvasl/nlp/grammar-extractor.js';

const extractor = new GrammarExtractor();
const grammar = extractor.extractGrammar(mdContent);

// Returns:
// - keywords: Array of keyword patterns
// - apiCalls: Array of API call patterns
// - templateStructure: Template structure patterns
// - grammarRules: Grammar rules for template generation
```

### 2. Semantic Analysis

Provides semantic understanding for template generation:

```javascript
import { SemanticAnalyzer } from './canvasl/nlp/semantic-analyzer.js';

const analyzer = new SemanticAnalyzer();
await analyzer.initialize();

// Expand keywords semantically
const expanded = await analyzer.expandKeywords(['location', 'notify']);

// Map user intent to CANVASL constructs
const mapping = await analyzer.mapIntentToCanvasl('I want to get location and send notification');
```

### 3. AST Building and Validation

Builds and validates AST representation:

```javascript
import { ASTBuilder } from './canvasl/ast/ast-builder.js';
import { ASTValidator } from './canvasl/ast/ast-validator.js';

const builder = new ASTBuilder();
const ast = await builder.buildAST(mdContent);

const validator = new ASTValidator();
const validation = validator.validate(ast);
```

### 4. LSP Features

#### Browser-Native (No Server Required)

The system works entirely in the browser without requiring a server:

```javascript
import { BrowserLSPService } from './canvasl/lsp/browser-lsp-service.js';

const service = new BrowserLSPService();

// Get completions
const completions = await service.getCompletions(content, line, character);

// Get diagnostics
const diagnostics = await service.getDiagnostics(content);

// Get hover info
const hover = await service.getHover(content, line, character);
```

#### With LSP Server (Optional)

For enhanced features, connect to an LSP server:

```javascript
import { LSPClient } from './canvasl/lsp/lsp-client.js';

const client = new LSPClient('ws://localhost:3000/lsp');
await client.initialize();

// Use same API as browser service
const completions = await client.completion(content, { line, character });
```

## CodeMirror 6 Integration

The CanvasL language extension integrates seamlessly with CodeMirror 6:

```javascript
import { canvaslLanguage } from './canvasl/lsp/canvasl-language.js';

// In CodeMirror component
<CodeMirror
  extensions={[
    canvaslLanguage({ lspServerUrl: 'ws://localhost:3000/lsp' }),
    markdown()
  ]}
/>
```

### Features Enabled

- **Autocomplete**: Grammar-based keyword and API suggestions
- **Linting**: AST-based validation and error reporting
- **Hover**: Semantic information on hover
- **Semantic Highlighting**: Highlights CANVASL constructs

## Usage Examples

### Template Generation with NLP

```javascript
import { TemplateGenerator } from './canvasl/speech/template-generator.js';

const generator = new TemplateGenerator();

// Generate template from voice command
const template = await generator.generateFromCommand(
  'generate template for location notify save'
);

// Template includes:
// - Grammar-extracted keywords
// - Semantically expanded keywords
// - Proper API mappings
```

### Frontmatter Parsing with AST Validation

```javascript
import { parseAndValidate } from './canvasl/speech/frontmatter-parser.js';

const result = await parseAndValidate(mdContent);

// Result includes:
// - Parsed frontmatter
// - AST representation
// - AST validation results
// - Semantic validation results
```

## Running the LSP Server

### Option 1: Browser-Native (Default)

No server required - works entirely in browser:

```bash
npm run dev
```

The editor will use browser-native LSP service automatically.

### Option 2: With LSP Server

For enhanced features, run the LSP server:

```bash
# Terminal 1: Start LSP server (stdio)
npm run lsp:server

# Terminal 2: Start WebSocket bridge (for browser connections)
npm run lsp:bridge

# Terminal 3: Start dev server
npm run dev
```

The editor will automatically connect to the LSP server via WebSocket.

## Configuration

### LSP Client Configuration

```javascript
// Disable browser fallback (require server)
const client = new LSPClient('ws://localhost:3000/lsp');
client.useBrowserFallback = false;

// Enable browser fallback (default)
client.useBrowserFallback = true;
```

### CanvasL Language Configuration

```javascript
// With server URL
canvaslLanguage({ lspServerUrl: 'ws://localhost:3000/lsp' })

// Browser-native only (no server)
canvaslLanguage({ lspServerUrl: null })
```

## API Reference

### GrammarExtractor

- `extractGrammar(mdContent)` - Extract grammar patterns
- `generateTemplateGrammar(mdContent)` - Generate grammar for templates

### SemanticAnalyzer

- `expandKeywords(keywords)` - Expand keywords semantically
- `suggestTemplates(userIntent, existingTemplates)` - Suggest templates
- `mapIntentToCanvasl(userIntent)` - Map intent to CANVASL constructs
- `validateTemplateSemantics(template)` - Validate template semantics

### ASTBuilder

- `buildAST(mdContent)` - Build AST from markdown
- `buildFrontmatterAST(frontmatter, nlpAnalysis)` - Build frontmatter AST
- `buildBodyAST(mdContent, nlpAnalysis)` - Build body AST

### ASTValidator

- `validate(ast)` - Validate AST structure
- `validateSemantics(ast, semanticAnalysis)` - Validate semantics

### BrowserLSPService

- `getCompletions(content, line, character)` - Get completions
- `getDiagnostics(content)` - Get diagnostics
- `getHover(content, line, character)` - Get hover info

### LSPClient

- `initialize()` - Initialize connection
- `completion(content, position)` - Get completions
- `diagnostics(content)` - Get diagnostics
- `hover(content, position)` - Get hover info
- `close()` - Close connection

## Dependencies

- `wink-nlp` - NLP processing
- `wink-eng-lite-web-model` - English language model
- `wordnet` - Semantic understanding
- `vscode-languageserver` - LSP server implementation
- `vscode-languageserver-textdocument` - LSP document handling
- `@codemirror/language` - CodeMirror language support
- `@codemirror/lint` - CodeMirror linting
- `@codemirror/autocomplete` - CodeMirror autocomplete
- `ws` - WebSocket support (for bridge)

## Benefits

1. **Intelligent Template Generation**: Uses grammar patterns and semantic analysis
2. **Better Autocomplete**: Context-aware suggestions based on grammar
3. **Enhanced Validation**: AST-based validation catches more errors
4. **Semantic Understanding**: Understands user intent and suggests templates
5. **Browser-Native**: Works without server for offline use
6. **LSP Compatible**: Can connect to standard LSP servers

## Future Enhancements

- Full Lezer grammar parser generation
- More sophisticated semantic analysis
- Template suggestion based on usage patterns
- Multi-language support
- Enhanced error messages with fixes

