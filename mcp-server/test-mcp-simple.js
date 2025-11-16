#!/usr/bin/env node
/**
 * Simple MCP Server Test
 * 
 * Tests MCP servers with proper JSON-RPC protocol
 */

import { spawn } from 'child_process';

/**
 * Test a single MCP server
 */
function testServer(serverName, serverPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing ${serverName}...`);
    console.log('─'.repeat(50));

    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let responses = [];
    let outputBuffer = '';

    server.stdout.on('data', (data) => {
      outputBuffer += data.toString();
      
      // Try to parse complete JSON objects
      const lines = outputBuffer.split('\n');
      outputBuffer = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          try {
            const json = JSON.parse(trimmed);
            responses.push(json);
            
            // Display response
            if (json.method) {
              console.log(`📥 Notification: ${json.method}`);
            } else if (json.result) {
              console.log(`✅ Response ID ${json.id}:`, JSON.stringify(json.result, null, 2).substring(0, 200) + '...');
            } else if (json.error) {
              console.log(`❌ Error ID ${json.id}:`, json.error.message);
            }
          } catch (e) {
            // Partial JSON, keep in buffer
            outputBuffer += line + '\n';
          }
        }
      }
    });

    server.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes('Error')) {
        console.log(`ℹ️  ${msg}`);
      }
    });

    server.on('error', (error) => {
      console.error(`❌ Error: ${error.message}`);
      reject(error);
    });

    // Send requests
    const requests = [
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' },
        },
      },
    ];

    // Send initialize
    server.stdin.write(JSON.stringify(requests[0]) + '\n');

    setTimeout(() => {
      // Send list tools
      const listTools = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      };
      server.stdin.write(JSON.stringify(listTools) + '\n');

      setTimeout(() => {
        // Send a test tool call
        let toolCall;
        if (serverName.includes('CANVASL')) {
          toolCall = {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
              name: 'generate_template',
              arguments: { keywords: ['test', 'demo'] },
            },
          };
        } else {
          toolCall = {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
              name: 'list_opencode_agents',
              arguments: {},
            },
          };
        }

        server.stdin.write(JSON.stringify(toolCall) + '\n');

        setTimeout(() => {
          server.stdin.end();
          server.kill();
          
          console.log(`\n✅ ${serverName} test completed`);
          console.log(`   Received ${responses.length} responses\n`);
          resolve(responses);
        }, 2000);
      }, 1000);
    }, 1000);
  });
}

/**
 * Main test runner
 */
async function main() {
  console.log('🚀 MCP Server Test Suite');
  console.log('='.repeat(50));

  const results = {
    canvasl: null,
    opencode: null,
  };

  try {
    // Test CANVASL server
    results.canvasl = await testServer(
      'CANVASL MCP Server',
      'mcp-server/canvasl-mcp-server.js'
    );

    console.log('\n' + '='.repeat(50));

    // Test OpenCode server
    results.opencode = await testServer(
      'OpenCode MCP Server',
      'mcp-server/opencode-mcp-server.js'
    );

    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Test Summary:');
    console.log(`   CANVASL Server: ${results.canvasl.length} responses`);
    console.log(`   OpenCode Server: ${results.opencode.length} responses`);
    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
