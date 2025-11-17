# Speech Features Implementation Guide

## Overview

All unchecked speech features from `SPEECH_FEATURES.md` (lines 425-431) have been implemented, along with TensorFlow model import/export functionality.

## Implemented Features

### 1. Command History Navigation ✅

**File**: `src/canvasl/speech/command-history.js`

**Features**:
- Stores command history in IndexedDB
- Navigate with up/down arrows
- Get previous/next commands
- Clear history

**Usage**:
```javascript
import { CommandHistoryManager } from './speech/command-history.js';

const history = new CommandHistoryManager();
await history.initialize();

// Add command
await history.addCommand('create node', 'voice');

// Navigate
const prev = history.getPrevious(); // Up arrow
const next = history.getNext(); // Down arrow
```

### 2. Speech-to-Text Export ✅

**File**: `src/canvasl/speech/export-handler.js`

**Features**:
- Export command history (TXT, JSON, CSV)
- Export transcripts (TXT, JSON)
- Download files automatically

**Usage**:
```javascript
import { SpeechExportHandler } from './speech/export-handler.js';

const exporter = new SpeechExportHandler();
await exporter.initialize();

// Export command history
await exporter.exportAndDownloadHistory('txt');
await exporter.exportAndDownloadHistory('json');
await exporter.exportAndDownloadHistory('csv');

// Export transcripts
await exporter.exportAndDownloadTranscripts(transcripts, 'txt');
```

### 3. Template Library (Save/Load) ✅

**File**: `src/canvasl/speech/template-library.js`

**Features**:
- Save templates to IndexedDB
- Load templates from IndexedDB
- List all templates
- Delete templates
- Export templates as markdown files

**Usage**:
```javascript
import { TemplateLibrary } from './speech/template-library.js';

const library = new TemplateLibrary();
await library.initialize();

// Save template
await library.saveTemplate('my-template', {
  name: 'My Template',
  frontmatter: { id: 'my-template', type: 'canvasl-template' },
  body: 'Template body content'
});

// Load template
const template = await library.loadTemplate('my-template');

// List templates
const templates = await library.listTemplates();

// Export template
library.downloadTemplate(template, 'my-template.md');
```

### 4. Template Editing via Voice ✅

**File**: `src/canvasl/speech/template-editor.js`

**Features**:
- Start editing a template
- Process voice commands for editing
- Set frontmatter fields
- Update body content
- Add to array fields
- Save or cancel editing

**Usage**:
```javascript
import { TemplateVoiceEditor } from './speech/template-editor.js';

const editor = new TemplateVoiceEditor();
await editor.initialize();

// Start editing
await editor.startEditing('my-template');

// Process voice commands
await editor.processVoiceCommand('set name to My New Template');
await editor.processVoiceCommand('set body to New body content');
await editor.processVoiceCommand('add keyword to keywords');
await editor.processVoiceCommand('save');
```

### 5. Voice Macros/Shortcuts ✅

**File**: `src/canvasl/speech/voice-macros.js`

**Features**:
- Register voice macros
- Check transcript for macro matches
- Execute macro actions
- List and delete macros

**Usage**:
```javascript
import { VoiceMacrosManager } from './speech/voice-macros.js';

const macros = new VoiceMacrosManager();
await macros.initialize();

// Register macro
await macros.registerMacro('macro1', 'hello canvas', 'createNode', {});

// Check transcript
const macro = macros.checkMacro('hello canvas');
if (macro) {
  await macros.executeMacro(macro, actionHandler);
}

// List macros
const allMacros = await macros.listMacros();
```

### 6. Direct File Upload for MD Parsing ✅

**File**: `src/canvasl/speech/file-upload-handler.js`

**Features**:
- Handle markdown file uploads
- Parse and validate uploaded files
- Return parsed content

**Usage**:
```javascript
import { FileUploadHandler } from './speech/file-upload-handler.js';

const uploader = new FileUploadHandler();

// Handle file upload
const result = await uploader.handleFileUpload(file);
// result: { filename, size, parsed, raw }

// Trigger file select dialog
uploader.triggerFileSelect((result) => {
  if (result.error) {
    console.error(result.error);
  } else {
    console.log('Parsed:', result.parsed);
  }
});
```

### 7. Voice Profile Customization ✅

**File**: `src/canvasl/speech/voice-profile.js`

**Features**:
- Create and save voice profiles
- Load voice profiles
- Apply profiles to synthesis handler
- Customize rate, pitch, volume, voice

**Usage**:
```javascript
import { VoiceProfileManager } from './speech/voice-profile.js';
import { SpeechSynthesisHandler } from './speech/synthesis.js';

const profileManager = new VoiceProfileManager();
await profileManager.initialize();

const synthesis = new SpeechSynthesisHandler({});
profileManager.setSynthesisHandler(synthesis);

// Save profile
await profileManager.saveProfile('my-profile', {
  name: 'My Profile',
  lang: 'en-US',
  rate: 1.2,
  pitch: 1.1,
  volume: 0.9,
  voice: 'Google US English'
});

// Load profile
await profileManager.loadProfile('my-profile');
```

### 8. TensorFlow Model Import/Export ✅

**Files**: 
- `src/canvasl/ml/model-import-export.js`
- Integrated into `src/canvasl/ml/wasm-ml-engine.js`

**Features**:
- Export models (JSON, weights, full)
- Import models from files or URLs
- Save/load models from IndexedDB
- Download models as files

**Usage**:
```javascript
import { WASMMLEngine } from './ml/wasm-ml-engine.js';

const mlEngine = new WASMMLEngine();
await mlEngine.initialize();

// Export model
await mlEngine.exportAndDownload('json', 'my-model.json');
await mlEngine.exportAndDownload('full', 'my-model-full.json');

// Import model from file
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  await mlEngine.importModel(file);
};

// Load from IndexedDB
await mlEngine.loadModelFromIndexedDB('automaton-embedding-model');
```

## IndexedDB Schema

The IndexedDB database has been upgraded to version 2 with new object stores:

- **commandHistory**: Stores command history with timestamps
- **templates**: Stores saved templates
- **voiceMacros**: Stores voice macros with triggers
- **voiceProfiles**: Stores voice profile settings

## Integration with SpeechInterface

To integrate these features into `SpeechInterface.jsx`, import and initialize the managers:

```javascript
import { CommandHistoryManager } from './speech/command-history.js';
import { SpeechExportHandler } from './speech/export-handler.js';
import { TemplateLibrary } from './speech/template-library.js';
import { TemplateVoiceEditor } from './speech/template-editor.js';
import { VoiceMacrosManager } from './speech/voice-macros.js';
import { VoiceProfileManager } from './speech/voice-profile.js';
import { FileUploadHandler } from './speech/file-upload-handler.js';

// Initialize managers
const historyManager = new CommandHistoryManager();
const exportHandler = new SpeechExportHandler();
const templateLibrary = new TemplateLibrary();
const templateEditor = new TemplateVoiceEditor();
const macrosManager = new VoiceMacrosManager();
const profileManager = new VoiceProfileManager();
const fileUploader = new FileUploadHandler();

await Promise.all([
  historyManager.initialize(),
  exportHandler.initialize(),
  templateLibrary.initialize(),
  templateEditor.initialize(),
  macrosManager.initialize(),
  profileManager.initialize()
]);
```

## Next Steps

1. **UI Integration**: Add UI components for each feature in `SpeechInterface.jsx`
2. **Keyboard Navigation**: Implement up/down arrow key handlers for command history
3. **Voice Commands**: Add voice commands for template library operations
4. **File Upload UI**: Add file upload button/area for MD parsing
5. **Profile Selector**: Add UI for selecting voice profiles
6. **Macro Management UI**: Add UI for creating/editing/deleting macros

## Testing

All features are ready for integration and testing. Each manager class can be used independently and provides error handling and initialization checks.

