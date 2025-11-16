# CANVASL MCP Server Documentation

**Model Context Protocol Server for CANVASL Operations**

---

## Overview

The CANVASL MCP Server exposes CANVASL system operations as tools that can be called by AI agents through the Model Context Protocol. This enables programmatic interaction with the CANVASL system for template generation, chain complex operations, homology validation, and more.

## Installation

The MCP server is included in the project and uses existing dependencies:

```bash
npm install
```

## Configuration

The server is configured in `opencode.jsonc`:

```jsonc
{
  "mcp": {
    "canvasl-mcp-server": {
      "type": "local",
      "command": ["node", "mcp-server/canvasl-mcp-server.js"],
      "enabled": true,
      "environment": {}
    }
  }
}
```

## Running the Server

### Standalone

```bash
npm run mcp:server
```

Or directly:

```bash
node mcp-server/canvasl-mcp-server.js
```

The server communicates via stdio (standard input/output) following the MCP protocol.

## Available Tools

### Template Operations

#### `generate_template`
Generate a CANVASL YAML template from keywords.

**Input:**
```json
{
  "keywords": ["location", "notify", "save"],
  "templateId": "optional-template-id"
}
```

**Output:** Complete YAML template with frontmatter and body

**Example:**
```json
{
  "tool": "generate_template",
  "arguments": {
    "keywords": ["location", "notify"]
  }
}
```

#### `parse_markdown`
Parse Markdown content with YAML frontmatter and validate structure.

**Input:**
```json
{
  "content": "---\ntype: canvasl-template\n---\n# Template body"
}
```

**Output:** Parsed structure with validation results

#### `validate_template`
Validate a CANVASL template frontmatter structure.

**Input:**
```json
{
  "frontmatter": {
    "type": "canvasl-template",
    "speech": { "input": { "keywords": ["location"] } }
  }
}
```

**Output:** Validation result with errors and warnings

### Chain Complex Operations

#### `create_chain_complex`
Create a new empty chain complex.

**Output:** Empty chain complex structure with C₀ through C₄ arrays

#### `add_cell`
Add a cell to a chain complex.

**Input:**
```json
{
  "complex": { "C0": [], "C1": [], ... },
  "cell": {
    "id": "cell-1",
    "dim": 0,
    "boundary": [],
    "data": {}
  }
}
```

**Output:** Updated complex with cell counts

#### `compute_homology`
Compute Betti numbers and Euler characteristic.

**Input:**
```json
{
  "complex": { "C0": [...], "C1": [...], ... }
}
```

**Output:**
```json
{
  "betti": [β₀, β₁, β₂, β₃, β₄],
  "euler": χ,
  "cellCounts": { "C0": n, "C1": m, ... }
}
```

#### `validate_homology`
Validate that ∂² = 0 (boundary of boundary is zero).

**Input:**
```json
{
  "complex": { "C0": [...], "C1": [...], ... }
}
```

**Output:** Validation result

### DAG Operations

#### `create_dag`
Create a new empty DAG.

**Output:** Empty DAG structure

### Utility Operations

#### `compute_cid`
Compute content identifier using SHA-256.

**Input:**
```json
{
  "content": { "parent": "genesis", "uri": "canvasl://..." }
}
```

**Output:** CID string and hash

#### `read_template_file`
Read a template file from the project.

**Input:**
```json
{
  "filePath": "public/automatons/template.canvasl"
}
```

**Output:** File content

#### `write_template_file`
Write a template to a file.

**Input:**
```json
{
  "filePath": "templates/my-template.yaml",
  "template": "---\ntype: canvasl-template\n---\n# Content"
}
```

**Output:** Success confirmation

## Usage Examples

### Generate Template via MCP

```bash
# Using MCP client
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "generate_template",
    "arguments": {
      "keywords": ["location", "notify", "save", "render"]
    }
  }
}
```

### Parse and Validate Template

```bash
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "parse_markdown",
    "arguments": {
      "content": "---\ntype: canvasl-template\nid: test\nspeech:\n  input:\n    keywords: [location]\n---\n# Test Template"
    }
  }
}
```

### Work with Chain Complex

```bash
# 1. Create complex
{
  "method": "tools/call",
  "params": {
    "name": "create_chain_complex"
  }
}

# 2. Add cells
{
  "method": "tools/call",
  "params": {
    "name": "add_cell",
    "arguments": {
      "complex": { /* from step 1 */ },
      "cell": {
        "id": "keyword-location",
        "dim": 0,
        "boundary": [],
        "data": { "keyword": "location" }
      }
    }
  }
}

# 3. Compute homology
{
  "method": "tools/call",
  "params": {
    "name": "compute_homology",
    "arguments": {
      "complex": { /* updated complex */ }
    }
  }
}
```

## Integration with OpenCode Agents

Agents defined in `opencode.jsonc` can use the MCP server:

```jsonc
{
  "agent": {
    "canvasl-main": {
      "description": "Primary CANVASL system interface",
      "mode": "primary",
      "model": "opencode/big-pickle"
    }
  }
}
```

The agent can call tools like:
- `generate_template` - Create templates from keywords
- `parse_markdown` - Validate template structure
- `compute_homology` - Check topological properties
- `add_cell` - Build chain complexes

## File Structure

```
mcp-server/
├── canvasl-mcp-server.js  # Main MCP server implementation
└── README.md              # Server documentation
```

## Technical Details

### Protocol
- **Protocol**: Model Context Protocol (MCP)
- **Transport**: stdio (standard input/output)
- **Format**: JSON-RPC 2.0

### Dependencies
- `@modelcontextprotocol/sdk` - MCP SDK
- `js-yaml` - YAML parsing/generation
- Node.js built-in: `crypto`, `fs`, `path`

### Security
- File operations restricted to project root
- Path validation prevents directory traversal
- No external network access

### Limitations
- Browser APIs (OPFS, IndexedDB) not available in Node.js
- Some operations use simplified implementations
- Homology validation is simplified (full implementation would require boundary operator matrices)

## Error Handling

All tools return structured error responses:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: [error message]"
    }
  ],
  "isError": true
}
```

## Testing

Test the server manually:

```bash
# Start server
node mcp-server/canvasl-mcp-server.js

# Send MCP request (via MCP client or test script)
```

## Future Enhancements

- Full boundary operator implementation for accurate homology
- DAG merge operations
- Template execution engine
- Integration with browser-based CANVASL system via IPC
- Support for OPFS/IndexedDB operations (via browser bridge)

---

**Last Updated**: 2025-01-07  
**Version**: 1.0.0  
**Status**: ✅ Operational
