/**
 * CanvasL Source Block Parser
 * 
 * Parses CanvasL source block content and extracts:
 * - CanvasL directives (@version, @schema, @dimension)
 * - R5RS function calls
 * - Dimension references
 * - Protocol handlers
 * - Validates CanvasL syntax
 */

/**
 * CanvasL Directive
 * @typedef {Object} CanvaslDirective
 * @property {string} name - Directive name (version, schema, dimension, etc.)
 * @property {string} value - Directive value
 * @property {number} line - Line number in source
 */

/**
 * R5RS Function Call
 * @typedef {Object} R5RSCall
 * @property {string} function - Function name (e.g., "r5rs:church-add")
 * @property {Array} args - Function arguments
 * @property {number} line - Line number in source
 */

/**
 * CanvasL Source Block Parse Result
 * @typedef {Object} CanvaslParseResult
 * @property {CanvaslDirective[]} directives - Extracted directives
 * @property {R5RSCall[]} r5rsCalls - Extracted R5RS function calls
 * @property {string[]} dimensionReferences - Dimension references (0D-7D)
 * @property {string[]} protocolHandlers - Protocol handler references
 * @property {Object} jsonlContent - Parsed JSONL content (if applicable)
 * @property {boolean} valid - Whether syntax is valid
 * @property {string[]} errors - Parse errors
 */

/**
 * Parse CanvasL source block content
 * 
 * @param {string} content - CanvasL source block content
 * @returns {CanvaslParseResult} Parse result
 */
export function parseCanvaslSourceBlock(content) {
  if (!content || typeof content !== 'string') {
    return {
      directives: [],
      r5rsCalls: [],
      dimensionReferences: [],
      protocolHandlers: [],
      jsonlContent: null,
      valid: false,
      errors: ['Invalid content: must be a non-empty string']
    };
  }

  const result = {
    directives: [],
    r5rsCalls: [],
    dimensionReferences: [],
    protocolHandlers: [],
    jsonlContent: null,
    valid: true,
    errors: []
  };

  try {
    // Extract directives
    result.directives = extractDirectives(content);
    
    // Extract R5RS function calls
    result.r5rsCalls = extractR5RSCalls(content);
    
    // Extract dimension references
    result.dimensionReferences = extractDimensionReferences(content);
    
    // Extract protocol handlers
    result.protocolHandlers = extractProtocolHandlers(content);
    
    // Try to parse as JSONL
    result.jsonlContent = tryParseJSONL(content);
    
    // Validate syntax
    const validation = validateCanvaslSyntax(content, result);
    result.valid = validation.valid;
    result.errors.push(...validation.errors);
    
  } catch (error) {
    result.valid = false;
    result.errors.push(`Parse error: ${error.message}`);
  }

  return result;
}

/**
 * Extract CanvasL directives (@directive)
 * 
 * @param {string} content - CanvasL content
 * @returns {CanvaslDirective[]} Extracted directives
 */
export function extractDirectives(content) {
  const directives = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const match = line.match(/^@(\w+)(?:\s+(.+))?$/);
    if (match) {
      directives.push({
        name: match[1],
        value: match[2] || '',
        line: index + 1
      });
    }
  });
  
  return directives;
}

/**
 * Extract R5RS function calls
 * 
 * @param {string} content - CanvasL content
 * @returns {R5RSCall[]} Extracted R5RS calls
 */
export function extractR5RSCalls(content) {
  const calls = [];
  
  // Pattern 1: JSON object with type "rpc-call" or "r5rs-call"
  const jsonPattern = /\{\s*"type"\s*:\s*"(?:rpc-call|r5rs-call)"\s*,\s*"function"\s*:\s*"([^"]+)"\s*(?:,\s*"args"\s*:\s*(\[[^\]]*\]))?\s*\}/g;
  let match;
  
  while ((match = jsonPattern.exec(content)) !== null) {
    try {
      const functionName = match[1];
      const argsString = match[2] || '[]';
      const args = JSON.parse(argsString);
      
      calls.push({
        function: functionName,
        args: args,
        line: getLineNumber(content, match.index)
      });
    } catch (error) {
      // Skip invalid JSON
    }
  }
  
  // Pattern 1b: Try parsing entire JSON object if it's a single RPC call
  try {
    const parsed = JSON.parse(content.trim());
    if (parsed.type === 'rpc-call' || parsed.type === 'r5rs-call') {
      if (parsed.function && parsed.function.startsWith('r5rs:')) {
        // Check if we already added this
        const alreadyAdded = calls.some(c => 
          c.function === parsed.function && 
          JSON.stringify(c.args) === JSON.stringify(parsed.args || [])
        );
        if (!alreadyAdded) {
          calls.push({
            function: parsed.function,
            args: parsed.args || [],
            line: 1
          });
        }
      }
    }
  } catch (error) {
    // Not valid JSON, continue with regex patterns
  }
  
  // Pattern 2: Scheme expression (r5rs:function-name ...)
  const schemePattern = /\(r5rs:([\w-]+)\s+([^)]*)\)/g;
  
  while ((match = schemePattern.exec(content)) !== null) {
    try {
      const functionName = `r5rs:${match[1]}`;
      const argsString = match[2].trim();
      const args = parseSchemeArgs(argsString);
      
      calls.push({
        function: functionName,
        args: args,
        line: getLineNumber(content, match.index)
      });
    } catch (error) {
      // Skip invalid expressions
    }
  }
  
  return calls;
}

/**
 * Parse Scheme-style arguments
 * 
 * @param {string} argsString - Arguments string
 * @returns {Array} Parsed arguments
 */
function parseSchemeArgs(argsString) {
  if (!argsString) return [];
  
  const args = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar = null;
  
  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      current += char;
    } else if (inString && char === stringChar) {
      inString = false;
      stringChar = null;
      current += char;
    } else if (!inString && char === '(') {
      depth++;
      current += char;
    } else if (!inString && char === ')') {
      depth--;
      current += char;
    } else if (!inString && depth === 0 && char === ' ') {
      if (current.trim()) {
        args.push(parseArgValue(current.trim()));
        current = '';
      }
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    args.push(parseArgValue(current.trim()));
  }
  
  return args;
}

/**
 * Parse argument value (number, string, boolean, etc.)
 * 
 * @param {string} value - Argument value string
 * @returns {*} Parsed value
 */
function parseArgValue(value) {
  // Try number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  }
  
  // Try boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Try string (remove quotes)
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // Return as-is
  return value;
}

/**
 * Extract dimension references (0D-7D)
 * 
 * @param {string} content - CanvasL content
 * @returns {string[]} Dimension references
 */
export function extractDimensionReferences(content) {
  const dimensions = [];
  const dimensionPattern = /(\dD)/g;
  let match;
  
  while ((match = dimensionPattern.exec(content)) !== null) {
    const dim = match[1];
    if (!dimensions.includes(dim)) {
      dimensions.push(dim);
    }
  }
  
  // Also check for {"dimension": "0D"} pattern
  const jsonDimensionPattern = /"dimension"\s*:\s*"(\dD)"/g;
  while ((match = jsonDimensionPattern.exec(content)) !== null) {
    const dim = match[1];
    if (!dimensions.includes(dim)) {
      dimensions.push(dim);
    }
  }
  
  return dimensions.sort();
}

/**
 * Extract protocol handler references
 * 
 * @param {string} content - CanvasL content
 * @returns {string[]} Protocol handler references
 */
export function extractProtocolHandlers(content) {
  const protocols = [];
  
  // Pattern: protocol://...
  const protocolPattern = /(\w+):\/\/[^\s"']+/g;
  let match;
  
  while ((match = protocolPattern.exec(content)) !== null) {
    const protocol = match[1];
    if (!protocols.includes(protocol)) {
      protocols.push(protocol);
    }
  }
  
  return protocols;
}

/**
 * Try to parse content as JSONL
 * 
 * @param {string} content - CanvasL content
 * @returns {Object|null} Parsed JSONL content or null
 */
function tryParseJSONL(content) {
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return null;
  
  try {
    // Try parsing each line as JSON
    const objects = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
        try {
          objects.push(JSON.parse(trimmed));
        } catch (error) {
          // Skip invalid JSON lines
        }
      }
    }
    
    return objects.length > 0 ? { objects, lineCount: objects.length } : null;
  } catch (error) {
    return null;
  }
}

/**
 * Validate CanvasL syntax
 * 
 * @param {string} content - CanvasL content
 * @param {CanvaslParseResult} parseResult - Parse result
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validateCanvaslSyntax(content, parseResult) {
  const errors = [];
  
  // Check for valid directive format
  parseResult.directives.forEach(dir => {
    if (!dir.name || dir.name.length === 0) {
      errors.push(`Invalid directive at line ${dir.line}: missing name`);
    }
  });
  
  // Check for valid R5RS function names
  parseResult.r5rsCalls.forEach(call => {
    if (!call.function.startsWith('r5rs:')) {
      errors.push(`Invalid R5RS call at line ${call.line}: function name must start with 'r5rs:'`);
    }
  });
  
  // Check for valid dimension references
  parseResult.dimensionReferences.forEach(dim => {
    const dimNum = parseInt(dim[0]);
    if (isNaN(dimNum) || dimNum < 0 || dimNum > 7) {
      errors.push(`Invalid dimension reference: ${dim} (must be 0D-7D)`);
    }
  });
  
  // Check for balanced braces/brackets if JSONL
  if (parseResult.jsonlContent) {
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces in JSONL content');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get line number from character index
 * 
 * @param {string} content - Content string
 * @param {number} index - Character index
 * @returns {number} Line number (1-based)
 */
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

