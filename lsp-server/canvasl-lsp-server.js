/**
 * CANVASL LSP Server
 * 
 * Language Server Protocol server for CANVASL templates
 */

import { createConnection, TextDocuments, ProposedFeatures } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { GrammarService } from './services/grammar-service.js';
import { ASTService } from './services/ast-service.js';
import { SemanticService } from './services/semantic-service.js';
import { CompletionHandler } from './handlers/completion-handler.js';
import { DiagnosticsHandler } from './handlers/diagnostics-handler.js';
import { HoverHandler } from './handlers/hover-handler.js';
import { SemanticTokensHandler } from './handlers/semantic-tokens-handler.js';

// Create connection
const connection = createConnection(ProposedFeatures.all);

// Create document manager
const documents = new TextDocuments(TextDocument);

// Initialize services
const grammarService = new GrammarService();
const astService = new ASTService();
const semanticService = new SemanticService();

// Initialize handlers
const completionHandler = new CompletionHandler(grammarService, astService, semanticService);
const diagnosticsHandler = new DiagnosticsHandler(astService, semanticService);
const hoverHandler = new HoverHandler(astService, grammarService, semanticService);
const semanticTokensHandler = new SemanticTokensHandler(astService, grammarService);

// Connection event handlers
connection.onInitialize((params) => {
  return {
    capabilities: {
      textDocumentSync: 1, // Full sync
      completionProvider: {
        resolveProvider: false,
        triggerCharacters: [':', '.', '[', '"']
      },
      hoverProvider: true,
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false
      },
      semanticTokensProvider: {
        legend: {
          tokenTypes: ['keyword', 'method', 'property', 'string', 'number'],
          tokenModifiers: []
        },
        full: true
      }
    }
  };
});

connection.onInitialized(() => {
  connection.console.log('CANVASL LSP Server initialized');
});

// Document change handler
documents.onDidChangeContent((change) => {
  validateDocument(change.document);
});

// Completion handler
connection.onCompletion(async (params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }
  
  const content = document.getText();
  return await completionHandler.handleCompletion(params, content);
});

// Hover handler
connection.onHover(async (params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }
  
  const content = document.getText();
  return await hoverHandler.handleHover(params, content);
});

// Diagnostics handler
async function validateDocument(document) {
  const content = document.getText();
  const diagnostics = await diagnosticsHandler.handleDiagnostics(document.uri, content);
  connection.sendDiagnostics({
    uri: document.uri,
    diagnostics
  });
}

// Semantic tokens handler
connection.onRequest('textDocument/semanticTokens/full', async (params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return { data: [] };
  }
  
  const content = document.getText();
  return await semanticTokensHandler.handleSemanticTokens(params, content);
});

// Document open handler
documents.onDidOpen((event) => {
  validateDocument(event.document);
});

// Document close handler
documents.onDidClose((event) => {
  // Clear caches
  grammarService.clearCache(event.document.uri);
  astService.clearCache(event.document.uri);
});

// Listen for documents
documents.listen(connection);

// Start server
connection.listen();

