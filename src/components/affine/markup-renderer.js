/**
 * Markup Renderer
 * 
 * Parses YAML frontmatter and directives
 * Renders as SVG elements
 * Supports CanvasL directives (@version, @schema)
 */

/**
 * Render markup as SVG elements
 * 
 * @param {object} parsed - Parsed frontmatter and body
 * @returns {Array} Array of SVG elements
 */
export function renderMarkup(parsed) {
  if (!parsed || !parsed.frontmatter) {
    return [];
  }

  const elements = [];

  // Render directives
  if (parsed.frontmatter.type) {
    elements.push({
      type: 'directive',
      key: 'type',
      value: parsed.frontmatter.type,
      x: 50,
      y: 50
    });
  }

  // Render macros
  if (parsed.frontmatter.macros && Array.isArray(parsed.frontmatter.macros)) {
    parsed.frontmatter.macros.forEach((macro, index) => {
      elements.push({
        type: 'macro',
        data: macro,
        x: 50,
        y: 150 + (index * 120)
      });
    });
  }

  // Render body as template
  if (parsed.body) {
    elements.push({
      type: 'template',
      content: parsed.body,
      x: 50,
      y: 150 + (parsed.frontmatter.macros?.length || 0) * 120
    });
  }

  return elements;
}

/**
 * Parse CanvasL directives from content
 * 
 * @param {string} content - Content string
 * @returns {Array} Array of directive objects
 */
export function parseDirectives(content) {
  const directives = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('@')) {
      const match = trimmed.match(/^@(\w+)(?:\s+(.+))?$/);
      if (match) {
        directives.push({
          type: match[1],
          value: match[2] || '',
          line: lines.indexOf(line)
        });
      }
    }
  }

  return directives;
}


