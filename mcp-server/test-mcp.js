#!/usr/bin/env node
/**
 * MCP Server Test Script
 * 
 * Tests both CANVASL and OpenCode MCP servers
 */

import { spawn } from 'child_process';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Test MCP server by sending JSON-RPC requests
 */
async function testMCPServer(serverName, serverPath) {
  console.log(`\n🧪 Testing ${serverName}...\n`);

  return new Promise((resolve, reject) => {
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    let outputBuffer = '';

    server.stdout.on('data', (data) => {
      outputBuffer += data.toString();
      
      // Try to parse JSON responses
      const lines = outputBuffer.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            console.log('📥 Response:', JSON.stringify(response, null, 2));
          } catch (e) {
            // Not JSON, might be partial
          }
        }
      }
      outputBuffer = lines[lines.length - 1] || '';
    });

    server.on('error', (error) => {
      console.error(`❌ Error starting ${serverName}:`, error);
      reject(error);
    });

    // Send initialization request
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
        },
      },
    };

    console.log('📤 Sending initialize request...');
    server.stdin.write(JSON.stringify(initRequest) + '\n');

    // Wait a bit, then send list tools request
    setTimeout(() => {
      const listToolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      };

      console.log('📤 Sending tools/list request...');
      server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

      // Wait a bit more, then test a tool call
      setTimeout(() => {
        let testRequest;
        
        if (serverName === 'CANVASL MCP Server') {
          testRequest = {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
              name: 'generate_template',
              arguments: {
                keywords: ['location', 'notify'],
              },
            },
          };
        } else {
          testRequest = {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
              name: 'list_opencode_agents',
              arguments: {},
            },
          };
        }

        console.log('📤 Sending tool call request...');
        server.stdin.write(JSON.stringify(testRequest) + '\n');

        // Close after response
        setTimeout(() => {
          server.stdin.end();
          server.kill();
          resolve();
        }, 2000);
      }, 1000);
    }, 1000);
  });
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting MCP Server Tests\n');
  console.log('=' .repeat(50));

  try {
    // Test CANVASL MCP Server
    await testMCPServer('CANVASL MCP Server', 'mcp-server/canvasl-mcp-server.js');

    console.log('\n' + '='.repeat(50));

    // Test OpenCode MCP Server
    await testMCPServer('OpenCode MCP Server', 'mcp-server/opencode-mcp-server.js');

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
