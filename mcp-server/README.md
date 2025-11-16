# CANVASL MCP Servers

Model Context Protocol servers for CANVASL and OpenCode operations.

## Servers

### 1. CANVASL MCP Server (`canvasl-mcp-server.js`)

Exposes CANVASL system operations as MCP tools.

**Tools:**
- `generate_template` - Generate CANVASL YAML templates
- `parse_markdown` - Parse Markdown with frontmatter
- `validate_template` - Validate template structure
- `create_chain_complex` - Create chain complex
- `add_cell` - Add cells to complex
- `compute_homology` - Compute Betti numbers
- `validate_homology` - Validate ∂² = 0
- `create_dag` - Create DAG
- `compute_cid` - Compute content identifier
- `read_template_file` - Read template files
- `write_template_file` - Write template files

### 2. OpenCode MCP Server (`opencode-mcp-server.js`)

Exposes OpenCode agent configuration and operations as MCP tools.

**Tools:**
- `list_opencode_agents` - List all configured agents
- `get_agent_config` - Get agent configuration
- `execute_opencode_agent` - Execute agent operation (simulated)
- `get_mcp_servers` - List MCP servers
- `get_providers` - List model providers
- `read_opencode_config` - Read full configuration
- `validate_opencode_config` - Validate configuration

## Running Servers

### CANVASL Server
```bash
npm run mcp:server
# or
node mcp-server/canvasl-mcp-server.js
```

### OpenCode Server
```bash
npm run mcp:opencode
# or
node mcp-server/opencode-mcp-server.js
```

## Testing

Run the test suite:
```bash
npm run mcp:test
# or
node mcp-server/test-mcp-simple.js
```

## Configuration

Both servers are configured in `opencode.jsonc`:

```jsonc
{
  "mcp": {
    "canvasl-mcp-server": {
      "type": "local",
      "command": ["node", "mcp-server/canvasl-mcp-server.js"],
      "enabled": true
    },
    "opencode-mcp-server": {
      "type": "local",
      "command": ["node", "mcp-server/opencode-mcp-server.js"],
      "enabled": true
    }
  }
}
```

## Protocol

Both servers use:
- **Protocol**: Model Context Protocol (MCP)
- **Transport**: stdio (standard input/output)
- **Format**: JSON-RPC 2.0

## Usage Examples

### List OpenCode Agents

```json
{
  "method": "tools/call",
  "params": {
    "name": "list_opencode_agents",
    "arguments": {}
  }
}
```

### Generate Template

```json
{
  "method": "tools/call",
  "params": {
    "name": "generate_template",
    "arguments": {
      "keywords": ["location", "notify", "save"]
    }
  }
}
```

### Get Agent Config

```json
{
  "method": "tools/call",
  "params": {
    "name": "get_agent_config",
    "arguments": {
      "agentName": "canvasl-main"
    }
  }
}
```

## Documentation

- **CANVASL Server**: See `docs/MCP-SERVER.md`
- **OpenCode Server**: See this README
