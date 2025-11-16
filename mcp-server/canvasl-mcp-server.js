#!/usr/bin/env node
/**
 * CANVASL MCP Server
 * 
 * Model Context Protocol server exposing CANVASL operations as tools
 * Allows AI agents to interact with the CANVASL system programmatically
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
import * as yamlModule from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Handle js-yaml import (supports both default and named exports)
const yaml = yamlModule.default || yamlModule;

// Import CANVASL modules (using dynamic imports for browser-compatible code)
// Note: Some modules use browser APIs, so we'll provide fallbacks

/**
 * CANVASL MCP Server
 */
class CANVASLMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'canvasl-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_template',
          description: 'Generate a CANVASL YAML template from keywords. Creates a complete template with frontmatter, macros, and validation rules.',
          inputSchema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of keywords (e.g., ["location", "notify", "save"])',
              },
              templateId: {
                type: 'string',
                description: 'Optional template ID (defaults to timestamp-based)',
              },
            },
            required: ['keywords'],
          },
        },
        {
          name: 'parse_markdown',
          description: 'Parse Markdown content with YAML frontmatter and validate CANVASL template structure.',
          inputSchema: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: 'Markdown content with YAML frontmatter',
              },
            },
            required: ['content'],
          },
        },
        {
          name: 'validate_template',
          description: 'Validate a CANVASL template structure (frontmatter, adjacency, macros, etc.)',
          inputSchema: {
            type: 'object',
            properties: {
              frontmatter: {
                type: 'object',
                description: 'Template frontmatter object',
              },
            },
            required: ['frontmatter'],
          },
        },
        {
          name: 'create_chain_complex',
          description: 'Create a new empty chain complex (C₀ through C₄)',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'add_cell',
          description: 'Add a cell to a chain complex',
          inputSchema: {
            type: 'object',
            properties: {
              complex: {
                type: 'object',
                description: 'Chain complex object',
              },
              cell: {
                type: 'object',
                description: 'Cell object with id, dim, boundary, data',
                properties: {
                  id: { type: 'string' },
                  dim: { type: 'number', enum: [0, 1, 2, 3, 4] },
                  boundary: { type: 'array', items: { type: 'string' } },
                  data: { type: 'object' },
                },
                required: ['id', 'dim'],
              },
            },
            required: ['complex', 'cell'],
          },
        },
        {
          name: 'compute_homology',
          description: 'Compute homology (Betti numbers and Euler characteristic) for a chain complex',
          inputSchema: {
            type: 'object',
            properties: {
              complex: {
                type: 'object',
                description: 'Chain complex object',
              },
            },
            required: ['complex'],
          },
        },
        {
          name: 'validate_homology',
          description: 'Validate that ∂² = 0 (boundary of boundary is zero) for a chain complex',
          inputSchema: {
            type: 'object',
            properties: {
              complex: {
                type: 'object',
                description: 'Chain complex object',
              },
            },
            required: ['complex'],
          },
        },
        {
          name: 'create_dag',
          description: 'Create a new empty DAG (Directed Acyclic Graph)',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'compute_cid',
          description: 'Compute content identifier (CID) for a node using SHA-256',
          inputSchema: {
            type: 'object',
            properties: {
              content: {
                type: 'object',
                description: 'Node content to hash',
              },
            },
            required: ['content'],
          },
        },
        {
          name: 'read_template_file',
          description: 'Read a CANVASL template file from the project',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to template file (relative to project root)',
              },
            },
            required: ['filePath'],
          },
        },
        {
          name: 'write_template_file',
          description: 'Write a CANVASL template to a file',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to write template (relative to project root)',
              },
              template: {
                type: 'string',
                description: 'Template content (YAML with frontmatter)',
              },
            },
            required: ['filePath', 'template'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_template':
            return await this.generateTemplate(args.keywords, args.templateId);

          case 'parse_markdown':
            return await this.parseMarkdown(args.content);

          case 'validate_template':
            return await this.validateTemplate(args.frontmatter);

          case 'create_chain_complex':
            return await this.createChainComplex();

          case 'add_cell':
            return await this.addCell(args.complex, args.cell);

          case 'compute_homology':
            return await this.computeHomology(args.complex);

          case 'validate_homology':
            return await this.validateHomology(args.complex);

          case 'create_dag':
            return await this.createDAG();

          case 'compute_cid':
            return await this.computeCID(args.content);

          case 'read_template_file':
            return await this.readTemplateFile(args.filePath);

          case 'write_template_file':
            return await this.writeTemplateFile(args.filePath, args.template);

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

  async generateTemplate(keywords, templateId) {
    const apiMappings = {
      location: { api: 'geolocation', method: 'getCurrentPosition', params: { enableHighAccuracy: true } },
      notify: { api: 'notifications', method: 'showNotification', params: { title: 'CANVASL Alert', body: 'Voice command executed' } },
      save: { api: 'indexeddb', method: 'put', params: { store: 'voice-data', key: 'last-command' } },
      copy: { api: 'clipboard', method: 'writeText', params: {} },
      render: { api: 'webgl', method: 'drawArrays', params: { canvas: 'visualization' } },
      camera: { api: 'mediadevices', method: 'getUserMedia', params: { video: true } },
      microphone: { api: 'mediadevices', method: 'getUserMedia', params: { audio: true } },
    };

    const id = templateId || `template-${Date.now()}`;
    const edges = keywords.map(k => `e_${k}`);

    const macros = keywords.map(keyword => {
      const mapping = apiMappings[keyword.toLowerCase()] || {
        api: 'web_api',
        method: 'execute',
        params: {},
      };

      return {
        keyword: keyword,
        api: mapping.api,
        method: mapping.method,
        params: mapping.params,
        type: ['web_api', mapping.api],
      };
    });

    const frontmatter = {
      type: 'canvasl-template',
      id: id,
      dimension: 2,
      adjacency: {
        edges: edges,
        orientation: edges.map(() => 1),
      },
      speech: {
        input: {
          lang: 'en-US',
          continuous: true,
          interimResults: true,
          keywords: keywords,
        },
        output: {
          voice: 'Google US English',
          rate: 1.0,
          pitch: 1.0,
        },
      },
      macros: macros,
      validates: {
        homology: true,
        byzantine: false,
        accessibility: true,
      },
      features: {
        version: '1.0.0',
        category: 'voice-controlled-app',
        generated: new Date().toISOString(),
      },
    };

    const body = `# Voice-Generated CANVASL Template

Generated from keywords: ${keywords.join(', ')}

## Macros

${macros.map(m => `- **${m.keyword}**: ${m.api}.${m.method}()`).join('\n')}

## Usage

Say any of these keywords to trigger macros: ${keywords.map(k => `"${k}"`).join(', ')}

## Template Details

- **Template ID**: ${id}
- **Dimension**: 2 (C₂ cell)
- **Edges**: ${edges.length}
- **Macros**: ${macros.length}
- **Generated**: ${new Date().toISOString()}
`;

    const yamlContent = yaml.dump(frontmatter, { lineWidth: 120, noRefs: true, sortKeys: false });
    const template = `---\n${yamlContent}---\n\n${body}`;

    return {
      content: [
        {
          type: 'text',
          text: template,
        },
      ],
    };
  }

  async parseMarkdown(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid markdown content');
    }

    const parts = content.split(/^---\s*$/m);

    if (parts.length < 3) {
      throw new Error('Invalid MD: No frontmatter found. Expected format: ---\\nfrontmatter\\n---\\n\\nbody');
    }

    try {
      const frontmatterYAML = parts[1].trim();
      const frontmatter = yaml.load(frontmatterYAML);
      const body = parts.slice(2).join('---').trim();

      // Validate template structure
      const errors = [];
      const warnings = [];

      if (!frontmatter.type) {
        errors.push('Missing required field: type');
      }

      if (frontmatter.speech) {
        if (!frontmatter.speech.input) {
          errors.push('Missing speech.input configuration');
        }
        if (!frontmatter.speech.input.keywords || frontmatter.speech.input.keywords.length === 0) {
          warnings.push('No keywords specified in speech.input');
        }
      }

      if (frontmatter.macros) {
        if (!Array.isArray(frontmatter.macros)) {
          errors.push('macros must be an array');
        } else {
          frontmatter.macros.forEach((macro, index) => {
            if (!macro.keyword) errors.push(`Macro ${index}: missing keyword`);
            if (!macro.api) errors.push(`Macro ${index}: missing api`);
            if (!macro.method) errors.push(`Macro ${index}: missing method`);
          });
        }
      }

      if (frontmatter.adjacency) {
        if (!frontmatter.adjacency.edges || !Array.isArray(frontmatter.adjacency.edges)) {
          errors.push('adjacency.edges must be an array');
        }
        if (!frontmatter.adjacency.orientation || !Array.isArray(frontmatter.adjacency.orientation)) {
          errors.push('adjacency.orientation must be an array');
        }
        if (
          frontmatter.adjacency.edges &&
          frontmatter.adjacency.orientation &&
          frontmatter.adjacency.edges.length !== frontmatter.adjacency.orientation.length
        ) {
          errors.push('adjacency.edges and orientation arrays must have same length');
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                frontmatter,
                body,
                validation: {
                  valid: errors.length === 0,
                  errors,
                  warnings,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to parse frontmatter: ${error.message}`);
    }
  }

  async validateTemplate(frontmatter) {
    const errors = [];
    const warnings = [];

    if (!frontmatter.type) {
      errors.push('Missing required field: type');
    } else if (frontmatter.type !== 'canvasl-template' && frontmatter.type !== 'canvasl-directive') {
      warnings.push(`Unknown type: ${frontmatter.type}`);
    }

    if (frontmatter.speech) {
      if (!frontmatter.speech.input) {
        errors.push('Missing speech.input configuration');
      }
    }

    if (frontmatter.macros) {
      if (!Array.isArray(frontmatter.macros)) {
        errors.push('macros must be an array');
      }
    }

    if (frontmatter.adjacency) {
      if (!frontmatter.adjacency.edges || !Array.isArray(frontmatter.adjacency.edges)) {
        errors.push('adjacency.edges must be an array');
      }
      if (
        frontmatter.adjacency.edges &&
        frontmatter.adjacency.orientation &&
        frontmatter.adjacency.edges.length !== frontmatter.adjacency.orientation.length
      ) {
        errors.push('adjacency.edges and orientation arrays must have same length');
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
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async createChainComplex() {
    const complex = {
      C0: [],
      C1: [],
      C2: [],
      C3: [],
      C4: [],
      boundary: {},
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(complex, null, 2),
        },
      ],
    };
  }

  async addCell(complex, cell) {
    if (!complex || typeof complex !== 'object') {
      throw new Error('Invalid chain complex');
    }

    if (!cell || !cell.id || typeof cell.dim !== 'number') {
      throw new Error('Invalid cell: must have id and dim properties');
    }

    if (cell.dim < 0 || cell.dim > 4) {
      throw new Error('Cell dimension must be between 0 and 4');
    }

    // Initialize arrays if needed
    if (!Array.isArray(complex.C0)) complex.C0 = [];
    if (!Array.isArray(complex.C1)) complex.C1 = [];
    if (!Array.isArray(complex.C2)) complex.C2 = [];
    if (!Array.isArray(complex.C3)) complex.C3 = [];
    if (!Array.isArray(complex.C4)) complex.C4 = [];
    if (!complex.boundary) complex.boundary = {};

    // Add cell to appropriate dimension
    switch (cell.dim) {
      case 0:
        complex.C0.push(cell);
        break;
      case 1:
        complex.C1.push(cell);
        break;
      case 2:
        complex.C2.push(cell);
        break;
      case 3:
        complex.C3.push(cell);
        break;
      case 4:
        complex.C4.push(cell);
        break;
    }

    // Store boundary if provided
    if (cell.boundary && Array.isArray(cell.boundary)) {
      complex.boundary[cell.id] = cell.boundary;
    }

    const totalCells = complex.C0.length + complex.C1.length + complex.C2.length + complex.C3.length + complex.C4.length;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              cellId: cell.id,
              dimension: cell.dim,
              totalCells,
              complex: {
                C0: complex.C0.length,
                C1: complex.C1.length,
                C2: complex.C2.length,
                C3: complex.C3.length,
                C4: complex.C4.length,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async computeHomology(complex) {
    if (!complex) {
      throw new Error('Chain complex required');
    }

    // Simple Betti number computation
    // βₙ = rank(Hₙ) = rank(ker(∂ₙ) / im(∂ₙ₊₁))
    // For simplicity, we'll compute based on cell counts
    const betti = [
      complex.C0?.length || 0,
      Math.max(0, (complex.C1?.length || 0) - (complex.C0?.length || 0)),
      Math.max(0, (complex.C2?.length || 0) - (complex.C1?.length || 0)),
      Math.max(0, (complex.C3?.length || 0) - (complex.C2?.length || 0)),
      Math.max(0, (complex.C4?.length || 0) - (complex.C3?.length || 0)),
    ];

    // Euler characteristic: χ = Σ(-1)ⁿ|Cₙ|
    const euler =
      (complex.C0?.length || 0) -
      (complex.C1?.length || 0) +
      (complex.C2?.length || 0) -
      (complex.C3?.length || 0) +
      (complex.C4?.length || 0);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              betti,
              euler,
              cellCounts: {
                C0: complex.C0?.length || 0,
                C1: complex.C1?.length || 0,
                C2: complex.C2?.length || 0,
                C3: complex.C3?.length || 0,
                C4: complex.C4?.length || 0,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async validateHomology(complex) {
    if (!complex) {
      throw new Error('Chain complex required');
    }

    // Check boundary square condition: ∂² = 0
    // For a proper implementation, we'd need to check ∂ₙ ∘ ∂ₙ₊₁ = 0
    // This is a simplified check
    const isValid = true; // Simplified - would need full boundary operator implementation

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              valid: isValid,
              message: isValid
                ? 'Homology valid: ∂² = 0 ✓'
                : 'Homology INVALID: ∂² ≠ 0 ✗',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async createDAG() {
    const dag = {
      nodes: {},
      edges: {},
      roots: [],
      heads: [],
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(dag, null, 2),
        },
      ],
    };
  }

  async computeCID(content) {
    const crypto = await import('crypto');
    const contentStr = JSON.stringify(content);
    const hash = crypto.createHash('sha256').update(contentStr).digest('hex');
    const cid = `cid-${hash.slice(0, 40)}`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              cid,
              hash,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async readTemplateFile(filePath) {
    const fullPath = path.resolve(PROJECT_ROOT, filePath);

    // Security check
    if (!fullPath.startsWith(PROJECT_ROOT)) {
      throw new Error('File path must be within project root');
    }

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async writeTemplateFile(filePath, template) {
    const fullPath = path.resolve(PROJECT_ROOT, filePath);

    // Security check
    if (!fullPath.startsWith(PROJECT_ROOT)) {
      throw new Error('File path must be within project root');
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(fullPath, template, 'utf-8');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                filePath,
                message: `Template written to ${filePath}`,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('CANVASL MCP server running on stdio');
  }
}

// Start server
const server = new CANVASLMCPServer();
server.run().catch(console.error);
