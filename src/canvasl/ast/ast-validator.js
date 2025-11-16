/**
 * AST Validator
 * 
 * Validates AST structure and semantic consistency
 */

export class ASTValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate AST structure
   * 
   * @param {object} ast - AST to validate
   * @returns {object} Validation result
   */
  validate(ast) {
    this.errors = [];
    this.warnings = [];
    
    if (!ast) {
      this.errors.push('AST is null or undefined');
      return this.getResult();
    }
    
    // Validate template structure
    if (ast.type === 'Template') {
      this.validateTemplate(ast);
    } else {
      this.errors.push(`Invalid AST root type: ${ast.type}`);
    }
    
    return this.getResult();
  }

  /**
   * Validate template AST
   * 
   * @param {object} templateAST - Template AST node
   */
  validateTemplate(templateAST) {
    // Validate frontmatter
    if (templateAST.frontmatter) {
      this.validateFrontmatter(templateAST.frontmatter);
    } else {
      this.warnings.push('Template has no frontmatter');
    }
    
    // Validate body
    if (templateAST.body) {
      this.validateBody(templateAST.body);
    }
    
    // Validate grammar patterns
    const grammar = templateAST.getMetadata('grammar');
    if (grammar) {
      this.validateGrammar(grammar);
    }
  }

  /**
   * Validate frontmatter AST
   * 
   * @param {object} frontmatterAST - Frontmatter AST node
   */
  validateFrontmatter(frontmatterAST) {
    if (frontmatterAST.type !== 'Frontmatter') {
      this.errors.push(`Invalid frontmatter type: ${frontmatterAST.type}`);
      return;
    }
    
    // Check for required fields
    const keyValues = frontmatterAST.keyValues || [];
    const keys = keyValues.map(kv => kv.key);
    
    if (!keys.includes('type')) {
      this.errors.push('Frontmatter missing required field: type');
    }
    
    // Validate macros
    const macroNodes = frontmatterAST.children.filter(c => c.type === 'Macro');
    macroNodes.forEach(macro => {
      this.validateMacro(macro);
    });
    
    // Validate keywords
    const keywordNodes = frontmatterAST.children.filter(c => c.type === 'Keyword');
    if (keywordNodes.length === 0) {
      this.warnings.push('No keywords found in frontmatter');
    }
    
    // Check keyword-macro consistency
    this.validateKeywordMacroConsistency(keywordNodes, macroNodes);
  }

  /**
   * Validate macro AST
   * 
   * @param {object} macroAST - Macro AST node
   */
  validateMacro(macroAST) {
    if (!macroAST.keyword) {
      this.errors.push('Macro missing keyword');
    }
    
    if (!macroAST.api) {
      this.errors.push(`Macro "${macroAST.keyword}" missing API`);
    }
    
    if (!macroAST.method) {
      this.errors.push(`Macro "${macroAST.keyword}" missing method`);
    }
    
    // Validate API node
    const apiNodes = macroAST.children.filter(c => c.type === 'API');
    if (apiNodes.length === 0) {
      this.warnings.push(`Macro "${macroAST.keyword}" has no API node`);
    } else {
      apiNodes.forEach(api => {
        if (api.api !== macroAST.api || api.method !== macroAST.method) {
          this.errors.push(`Macro "${macroAST.keyword}" API mismatch`);
        }
      });
    }
  }

  /**
   * Validate keyword-macro consistency
   * 
   * @param {Array} keywordNodes - Keyword AST nodes
   * @param {Array} macroNodes - Macro AST nodes
   */
  validateKeywordMacroConsistency(keywordNodes, macroNodes) {
    const keywords = keywordNodes.map(k => k.keyword);
    const macroKeywords = macroNodes.map(m => m.keyword);
    
    // Check for keywords without macros
    keywords.forEach(keyword => {
      if (!macroKeywords.includes(keyword)) {
        this.warnings.push(`Keyword "${keyword}" has no corresponding macro`);
      }
    });
    
    // Check for macros without keywords
    macroKeywords.forEach(keyword => {
      if (!keywords.includes(keyword)) {
        this.warnings.push(`Macro keyword "${keyword}" not in speech keywords`);
      }
    });
  }

  /**
   * Validate body AST
   * 
   * @param {object} bodyAST - Body AST node
   */
  validateBody(bodyAST) {
    if (bodyAST.type !== 'Body') {
      this.errors.push(`Invalid body type: ${bodyAST.type}`);
      return;
    }
    
    // Validate structure
    const structure = bodyAST.structure || {};
    
    if (structure.headers && structure.headers.length > 0) {
      // Check header hierarchy
      let previousLevel = 0;
      structure.headers.forEach(header => {
        if (header.level > previousLevel + 1) {
          this.warnings.push(`Header level jump from ${previousLevel} to ${header.level} at line ${header.line}`);
        }
        previousLevel = header.level;
      });
    }
  }

  /**
   * Validate grammar patterns
   * 
   * @param {object} grammar - Grammar patterns
   */
  validateGrammar(grammar) {
    if (!grammar.keywords || grammar.keywords.length === 0) {
      this.warnings.push('No keywords found in grammar patterns');
    }
    
    if (!grammar.apiCalls || grammar.apiCalls.length === 0) {
      this.warnings.push('No API calls found in grammar patterns');
    }
    
    // Validate keyword patterns
    if (grammar.keywords) {
      grammar.keywords.forEach(kw => {
        if (!kw.pattern || kw.pattern.length === 0) {
          this.errors.push('Invalid keyword pattern: empty pattern');
        }
      });
    }
    
    // Validate API call patterns
    if (grammar.apiCalls) {
      grammar.apiCalls.forEach(api => {
        if (!api.api || !api.method) {
          this.errors.push('Invalid API call pattern: missing API or method');
        }
      });
    }
  }

  /**
   * Validate semantic consistency
   * 
   * @param {object} ast - AST to validate
   * @param {object} semanticAnalysis - Semantic analysis result
   * @returns {object} Validation result
   */
  async validateSemantics(ast, semanticAnalysis) {
    this.errors = [];
    this.warnings = [];
    
    if (!semanticAnalysis) {
      this.warnings.push('No semantic analysis provided');
      return this.getResult();
    }
    
    // Validate keyword semantic consistency
    if (ast.frontmatter) {
      const keywordNodes = ast.frontmatter.children.filter(c => c.type === 'Keyword');
      const keywords = keywordNodes.map(k => k.keyword);
      
      if (semanticAnalysis.semanticGroups && semanticAnalysis.semanticGroups.length > 1) {
        this.warnings.push(`Keywords belong to ${semanticAnalysis.semanticGroups.length} different semantic groups`);
      }
    }
    
    return this.getResult();
  }

  /**
   * Get validation result
   * 
   * @returns {object} Validation result
   */
  getResult() {
    return {
      valid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings]
    };
  }

  /**
   * Clear validation state
   */
  clear() {
    this.errors = [];
    this.warnings = [];
  }
}

