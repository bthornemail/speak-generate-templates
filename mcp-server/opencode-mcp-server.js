#!/usr/bin/env node
/**
 * OpenCode MCP Server
 * 
 * Model Context Protocol server exposing OpenCode agent operations
 * Allows AI agents to interact with OpenCode agents programmatically
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * OpenCode MCP Server
 */
class OpenCodeMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'opencode-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.opencodeConfig = null;
    this.loadOpenCodeConfig();

    this.setupHandlers();
  }

  async loadOpenCodeConfig() {
    try {
      const configPath = path.join(PROJECT_ROOT, 'opencode.jsonc');
      const configContent = await fs.readFile(configPath, 'utf-8');
      
      // Simple JSONC parser (remove comments)
      // Remove single-line comments (//) but preserve URLs
      let jsonContent = configContent
        .split('\n')
        .map(line => {
          // Find // that's not part of http:// or https://
          const urlMatch = line.match(/https?:\/\//);
          if (urlMatch) {
            // If URL found, only remove // after the URL
            const urlEnd = line.indexOf(urlMatch[0]) + urlMatch[0].length;
            const afterUrl = line.slice(urlEnd);
            const commentIndex = afterUrl.indexOf('//');
            if (commentIndex >= 0) {
              return line.slice(0, urlEnd + commentIndex).trimEnd();
            }
            return line;
          }
          // No URL, remove // comments normally
          const commentIndex = line.indexOf('//');
          return commentIndex >= 0 ? line.slice(0, commentIndex).trimEnd() : line;
        })
        .join('\n');
      
      // Remove multi-line comments (/* ... */)
      jsonContent = jsonContent.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove trailing commas before } or ]
      jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');
      
      // Remove control characters that break JSON parsing
      jsonContent = jsonContent.replace(/[\x00-\x1F\x7F]/g, '');
      
      this.opencodeConfig = JSON.parse(jsonContent);
    } catch (error) {
      // Log error but don't fail - use empty config
      if (process.stderr) {
        process.stderr.write(`Failed to load opencode.jsonc: ${error.message}\n`);
      }
      this.opencodeConfig = { agent: {}, mcp: {}, provider: {} };
    }
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_opencode_agents',
          description: 'List all available OpenCode agents and their configurations',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_agent_config',
          description: 'Get configuration for a specific OpenCode agent',
          inputSchema: {
            type: 'object',
            properties: {
              agentName: {
                type: 'string',
                description: 'Name of the agent (e.g., "canvasl-main", "voice-interface")',
              },
            },
            required: ['agentName'],
          },
        },
        {
          name: 'execute_opencode_agent',
          description: 'Execute an OpenCode agent operation (simulated - actual execution requires OpenCode runtime)',
          inputSchema: {
            type: 'object',
            properties: {
              agentName: {
                type: 'string',
                description: 'Name of the agent to execute',
              },
              operation: {
                type: 'string',
                description: 'Operation to perform',
              },
              parameters: {
                type: 'object',
                description: 'Parameters for the operation',
              },
            },
            required: ['agentName', 'operation'],
          },
        },
        {
          name: 'get_mcp_servers',
          description: 'List configured MCP servers and their status',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_providers',
          description: 'List available model providers and their models',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'read_opencode_config',
          description: 'Read the complete OpenCode configuration file',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'validate_opencode_config',
          description: 'Validate the OpenCode configuration structure',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_opencode_agents':
            return await this.listAgents();

          case 'get_agent_config':
            return await this.getAgentConfig(args.agentName);

          case 'execute_opencode_agent':
            return await this.executeAgent(args.agentName, args.operation, args.parameters);

          case 'get_mcp_servers':
            return await this.getMCPServers();

          case 'get_providers':
            return await this.getProviders();

          case 'read_opencode_config':
            return await this.readConfig();

          case 'validate_opencode_config':
            return await this.validateConfig();

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}\n${error.stack || ''}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // Tool implementations

  async listAgents() {
    await this.loadOpenCodeConfig();
    
    const agents = this.opencodeConfig?.agent || {};
    const agentList = Object.entries(agents).map(([name, config]) => ({
      name,
      description: config.description || 'No description',
      mode: config.mode || 'unknown',
      model: config.model || 'unknown',
      temperature: config.temperature !== undefined ? config.temperature : 'not set',
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              agents: agentList,
              total: agentList.length,
              configLoaded: !!this.opencodeConfig,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async getAgentConfig(agentName) {
    await this.loadOpenCodeConfig();
    
    const agents = this.opencodeConfig?.agent || {};
    const agent = agents[agentName];

    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              name: agentName,
              config: agent,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async executeAgent(agentName, operation, parameters = {}) {
    await this.loadOpenCodeConfig();
    
    const agents = this.opencodeConfig?.agent || {};
    const agent = agents[agentName];

    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    // Simulated execution - in a real implementation, this would call OpenCode runtime
    const result = {
      agent: agentName,
      operation,
      parameters,
      status: 'simulated',
      message: `Simulated execution of ${operation} on agent ${agentName}`,
      agentConfig: {
        mode: agent.mode,
        model: agent.model,
        temperature: agent.temperature,
      },
      note: 'Actual execution requires OpenCode runtime. This is a simulation.',
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async getMCPServers() {
    await this.loadOpenCodeConfig();
    
    const mcpServers = this.opencodeConfig?.mcp || {};
    const serverList = Object.entries(mcpServers).map(([name, config]) => ({
      name,
      type: config.type || 'unknown',
      enabled: config.enabled !== false,
      command: config.command || [],
      environment: config.environment || {},
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              servers: serverList,
              total: serverList.length,
              enabled: serverList.filter(s => s.enabled).length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async getProviders() {
    await this.loadOpenCodeConfig();
    
    const providers = this.opencodeConfig?.provider || {};
    const providerList = Object.entries(providers).map(([name, config]) => ({
      name,
      displayName: config.name || name,
      models: Object.entries(config.models || {}).map(([modelId, modelConfig]) => ({
        id: modelId,
        name: modelConfig.name || modelId,
      })),
      options: config.options || {},
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              providers: providerList,
              total: providerList.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async readConfig() {
    await this.loadOpenCodeConfig();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(this.opencodeConfig, null, 2),
        },
      ],
    };
  }

  async validateConfig() {
    await this.loadOpenCodeConfig();
    
    const errors = [];
    const warnings = [];

    // Validate structure
    if (!this.opencodeConfig) {
      errors.push('Configuration is null or undefined');
    } else {
      if (!this.opencodeConfig.agent || typeof this.opencodeConfig.agent !== 'object') {
        warnings.push('No agents configured');
      } else {
        Object.entries(this.opencodeConfig.agent).forEach(([name, config]) => {
          if (!config.description) {
            warnings.push(`Agent ${name}: missing description`);
          }
          if (!config.mode) {
            warnings.push(`Agent ${name}: missing mode`);
          }
          if (!config.model) {
            warnings.push(`Agent ${name}: missing model`);
          }
        });
      }

      if (!this.opencodeConfig.mcp || typeof this.opencodeConfig.mcp !== 'object') {
        warnings.push('No MCP servers configured');
      }

      if (!this.opencodeConfig.provider || typeof this.opencodeConfig.provider !== 'object') {
        warnings.push('No providers configured');
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              valid: errors.length === 0,
              errors,
              warnings,
              agentCount: Object.keys(this.opencodeConfig?.agent || {}).length,
              mcpServerCount: Object.keys(this.opencodeConfig?.mcp || {}).length,
              providerCount: Object.keys(this.opencodeConfig?.provider || {}).length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('OpenCode MCP server running on stdio');
  }
}

// Start server
const server = new OpenCodeMCPServer();
server.run().catch(console.error);
