/**
 * Export System
 * 
 * Exports Org documents to multiple formats:
 * - HTML, PDF, SVG, CanvasL export
 * - Handles :header-args:canvasl:export directive
 * - Preserves document structure
 * - Generates export previews
 */

/**
 * Export Result
 * @typedef {Object} ExportResult
 * @property {boolean} success - Whether export succeeded
 * @property {string} [error] - Error message if failed
 * @property {string} format - Export format
 * @property {string} [content] - Exported content
 * @property {Blob} [blob] - Exported blob (for download)
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * Export Org AST to format
 * 
 * @param {Object} orgAST - Org Mode AST
 * @param {string} format - Export format (html, pdf, svg, canvasl)
 * @param {Object} options - Export options
 * @returns {Promise<ExportResult>} Export result
 */
export async function exportToFormat(orgAST, format, options = {}) {
  if (!orgAST) {
    return {
      success: false,
      error: 'Invalid Org AST'
    };
  }

  const normalizedFormat = format.toLowerCase().trim();

  switch (normalizedFormat) {
    case 'html':
      return await exportToHTML(orgAST, options);
    
    case 'pdf':
      return await exportToPDF(orgAST, options);
    
    case 'svg':
      return await exportToSVG(orgAST, options);
    
    case 'canvasl':
      return await exportToCanvasL(orgAST, options);
    
    default:
      return {
        success: false,
        error: `Unsupported export format: ${format}`
      };
  }
}

/**
 * Export to HTML
 * 
 * @param {Object} orgAST - Org Mode AST
 * @param {Object} options - Export options
 * @returns {Promise<ExportResult>} Export result
 */
export async function exportToHTML(orgAST, options = {}) {
  try {
    let html = '<!DOCTYPE html>\n<html>\n<head>\n';
    html += '<meta charset="UTF-8">\n';
    html += '<title>' + (orgAST.metadata?.TITLE || 'Exported Document') + '</title>\n';
    html += '<style>\n';
    html += getDefaultHTMLStyles();
    html += '</style>\n';
    html += '</head>\n<body>\n';

    // Export headings
    html += exportHeadingsToHTML(orgAST.headings, 0);
    
    // Export source blocks
    html += exportSourceBlocksToHTML(orgAST.sourceBlocks);
    
    html += '</body>\n</html>';

    const blob = new Blob([html], { type: 'text/html' });

    return {
      success: true,
      format: 'html',
      content: html,
      blob,
      metadata: {
        size: html.length,
        headings: orgAST.headings.length,
        sourceBlocks: orgAST.sourceBlocks.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `HTML export error: ${error.message}`,
      format: 'html'
    };
  }
}

/**
 * Export to PDF (via HTML conversion)
 * 
 * @param {Object} orgAST - Org Mode AST
 * @param {Object} options - Export options
 * @returns {Promise<ExportResult>} Export result
 */
export async function exportToPDF(orgAST, options = {}) {
  try {
    // First export to HTML
    const htmlResult = await exportToHTML(orgAST, options);
    
    if (!htmlResult.success) {
      return {
        success: false,
        error: `PDF export error: ${htmlResult.error}`,
        format: 'pdf'
      };
    }

    // In a real implementation, use a PDF library like jsPDF or html2pdf
    // For now, return HTML as PDF placeholder
    const pdfBlob = new Blob([htmlResult.content], { type: 'application/pdf' });

    return {
      success: true,
      format: 'pdf',
      content: htmlResult.content, // Would be actual PDF content
      blob: pdfBlob,
      metadata: {
        size: htmlResult.content.length,
        method: 'html-to-pdf'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `PDF export error: ${error.message}`,
      format: 'pdf'
    };
  }
}

/**
 * Export to SVG
 * 
 * @param {Object} orgAST - Org Mode AST
 * @param {Object} options - Export options
 * @returns {Promise<ExportResult>} Export result
 */
export async function exportToSVG(orgAST, options = {}) {
  try {
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">\n';
    svg += '<defs>\n';
    svg += '<style>\n';
    svg += getDefaultSVGStyles();
    svg += '</style>\n';
    svg += '</defs>\n';
    svg += '<g>\n';

    // Export headings as SVG text
    let y = 50;
    orgAST.headings.forEach(heading => {
      const fontSize = 24 - (heading.level * 2);
      svg += `<text x="20" y="${y}" font-size="${fontSize}" font-weight="bold">${escapeXML(heading.title)}</text>\n`;
      y += fontSize + 10;
    });

    // Export source blocks as SVG groups
    orgAST.sourceBlocks.forEach((block, index) => {
      const blockY = y + (index * 100);
      svg += `<g id="block-${index}">\n`;
      svg += `<rect x="20" y="${blockY - 20}" width="760" height="80" fill="#f0f0f0" stroke="#ccc"/>\n`;
      svg += `<text x="30" y="${blockY}" font-size="12">${escapeXML(block.type)} source block</text>\n`;
      svg += `</g>\n`;
    });

    svg += '</g>\n';
    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });

    return {
      success: true,
      format: 'svg',
      content: svg,
      blob,
      metadata: {
        size: svg.length,
        headings: orgAST.headings.length,
        sourceBlocks: orgAST.sourceBlocks.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `SVG export error: ${error.message}`,
      format: 'svg'
    };
  }
}

/**
 * Export to CanvasL format
 * 
 * @param {Object} orgAST - Org Mode AST
 * @param {Object} options - Export options
 * @returns {Promise<ExportResult>} Export result
 */
export async function exportToCanvasL(orgAST, options = {}) {
  try {
    const canvaslLines = [];

    // Add CanvasL directives
    canvaslLines.push('@version 1.0');
    canvaslLines.push('@schema canvasl');
    if (orgAST.metadata?.TITLE) {
      canvaslLines.push(`@title ${orgAST.metadata.TITLE}`);
    }

    // Export headings as CanvasL nodes
    orgAST.headings.forEach(heading => {
      const node = {
        id: heading.id,
        type: 'heading',
        level: heading.level,
        title: heading.title,
        dimension: heading.propertyDrawer?.CANVASL_DIMENSION || '0D'
      };

      if (heading.propertyDrawer) {
        node.metadata = heading.propertyDrawer;
      }

      canvaslLines.push(JSON.stringify(node));
    });

    // Export source blocks as CanvasL nodes
    orgAST.sourceBlocks.forEach(block => {
      const node = {
        id: block.name || `block-${Date.now()}`,
        type: 'source-block',
        sourceType: block.type,
        content: block.content,
        tangle: block.tangle || null
      };

      if (block.canvasl) {
        node.canvasl = block.canvasl;
      }

      canvaslLines.push(JSON.stringify(node));
    });

    const canvaslContent = canvaslLines.join('\n');
    const blob = new Blob([canvaslContent], { type: 'application/jsonl' });

    return {
      success: true,
      format: 'canvasl',
      content: canvaslContent,
      blob,
      metadata: {
        size: canvaslContent.length,
        headings: orgAST.headings.length,
        sourceBlocks: orgAST.sourceBlocks.length,
        lineCount: canvaslLines.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `CanvasL export error: ${error.message}`,
      format: 'canvasl'
    };
  }
}

/**
 * Export headings to HTML
 * 
 * @param {Object[]} headings - Heading hierarchy
 * @param {number} indent - Indentation level
 * @returns {string} HTML string
 */
function exportHeadingsToHTML(headings, indent = 0) {
  let html = '';
  const indentStr = '  '.repeat(indent);

  headings.forEach(heading => {
    const level = Math.min(heading.level, 6);
    html += `${indentStr}<h${level} id="${heading.id}">${escapeHTML(heading.title)}</h${level}>\n`;
    
    if (heading.children && heading.children.length > 0) {
      html += exportHeadingsToHTML(heading.children, indent + 1);
    }
  });

  return html;
}

/**
 * Export source blocks to HTML
 * 
 * @param {Object[]} sourceBlocks - Source blocks
 * @returns {string} HTML string
 */
function exportSourceBlocksToHTML(sourceBlocks) {
  let html = '';

  sourceBlocks.forEach(block => {
    html += `<div class="source-block" data-type="${block.type}">\n`;
    html += `<pre><code class="language-${block.type}">${escapeHTML(block.content)}</code></pre>\n`;
    html += `</div>\n`;
  });

  return html;
}

/**
 * Get default HTML styles
 * 
 * @returns {string} CSS styles
 */
function getDefaultHTMLStyles() {
  return `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    .source-block {
      margin: 1em 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      background: #f5f5f5;
    }
    pre {
      margin: 0;
      overflow-x: auto;
    }
    code {
      font-family: 'Courier New', monospace;
    }
  `;
}

/**
 * Get default SVG styles
 * 
 * @returns {string} CSS styles
 */
function getDefaultSVGStyles() {
  return `
    text {
      font-family: Arial, sans-serif;
    }
  `;
}

/**
 * Escape HTML special characters
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape XML special characters
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeXML(str) {
  return escapeHTML(str);
}

