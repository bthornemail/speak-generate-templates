/**
 * Org Mode Integration - Main Entry Point
 * 
 * Exports all Org Mode parsing, projection, and export functionality
 */

export { parseOrgDocument, extractHeadings, extractSourceBlocks, extractPropertyDrawers, resolveNowebReferences } from './org-parser.js';
export { parseCanvaslSourceBlock, extractDirectives, extractR5RSCalls, extractDimensionReferences, extractProtocolHandlers, validateCanvaslSyntax } from './canvasl-source-block-parser.js';
export { expandNowebReferences, resolveBlockReference, inheritProperties, detectCircularReferences, expandAllNowebReferences } from './noweb-expander.js';
export { detectSelfEncoding, parseNestedOrgMode, handleMetaTemplate, preventRecursion, processSelfEncoding, extractNestedSourceBlocks } from './self-encoding-handler.js';
export { projectSourceBlock, projectAllSourceBlocks } from './source-block-projector.js';
export { tangleSourceBlock, tangleAllSourceBlocks, resolveTangleTarget, writeTangleFile } from './tangle-system.js';
export { exportToFormat, exportToHTML, exportToPDF, exportToSVG, exportToCanvasL } from './export-system.js';

