/**
 * WebSocket Bridge for LSP Server
 * 
 * Bridges WebSocket connections to stdio-based LSP server
 * Allows browser clients to connect via WebSocket
 */

import { spawn } from 'child_process';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.LSP_PORT || 3000;

// Create HTTP server
const server = createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Spawn LSP server process
  const lspProcess = spawn('node', [join(__dirname, 'canvasl-lsp-server.js')], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Forward WebSocket messages to LSP server stdin
  ws.on('message', (message) => {
    const data = message.toString();
    lspProcess.stdin.write(data + '\n');
  });
  
  // Forward LSP server stdout to WebSocket
  lspProcess.stdout.on('data', (data) => {
    ws.send(data.toString());
  });
  
  // Forward LSP server stderr to console
  lspProcess.stderr.on('data', (data) => {
    console.error('LSP Server Error:', data.toString());
  });
  
  // Handle WebSocket close
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    lspProcess.kill();
  });
  
  // Handle LSP process exit
  lspProcess.on('exit', (code) => {
    console.log(`LSP server process exited with code ${code}`);
    ws.close();
  });
  
  // Handle errors
  lspProcess.on('error', (error) => {
    console.error('LSP process error:', error);
    ws.close();
  });
});

server.listen(PORT, () => {
  console.log(`LSP WebSocket bridge listening on port ${PORT}`);
  console.log(`Connect via: ws://localhost:${PORT}/lsp`);
});

