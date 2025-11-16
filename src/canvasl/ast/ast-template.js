/**
 * AST Template Model
 * 
 * Abstract Syntax Tree representation for CANVASL templates
 */

/**
 * Base AST Node class
 */
export class ASTNode {
  constructor(type, value = null, children = []) {
    this.type = type;
    this.value = value;
    this.children = children;
    this.metadata = {};
  }

  /**
   * Add child node
   * 
   * @param {ASTNode} child - Child node to add
   */
  addChild(child) {
    this.children.push(child);
  }

  /**
   * Set metadata
   * 
   * @param {string} key - Metadata key
   * @param {*} value - Metadata value
   */
  setMetadata(key, value) {
    this.metadata[key] = value;
  }

  /**
   * Get metadata
   * 
   * @param {string} key - Metadata key
   * @returns {*} Metadata value
   */
  getMetadata(key) {
    return this.metadata[key];
  }

  /**
   * Convert to JSON
   * 
   * @returns {object} JSON representation
   */
  toJSON() {
    return {
      type: this.type,
      value: this.value,
      children: this.children.map(c => c.toJSON()),
      metadata: this.metadata
    };
  }
}

/**
 * Template AST Node (root)
 */
export class TemplateNode extends ASTNode {
  constructor(frontmatter, body) {
    super('Template');
    this.frontmatter = frontmatter;
    this.body = body;
  }

  toJSON() {
    return {
      type: this.type,
      frontmatter: this.frontmatter ? this.frontmatter.toJSON() : null,
      body: this.body ? this.body.toJSON() : null,
      children: this.children.map(c => c.toJSON()),
      metadata: this.metadata
    };
  }
}

/**
 * Frontmatter AST Node
 */
export class FrontmatterNode extends ASTNode {
  constructor(keyValues = []) {
    super('Frontmatter');
    this.keyValues = keyValues;
  }

  addKeyValue(key, value) {
    this.keyValues.push({ key, value });
  }

  toJSON() {
    return {
      type: this.type,
      keyValues: this.keyValues,
      children: this.children.map(c => c.toJSON()),
      metadata: this.metadata
    };
  }
}

/**
 * Macro AST Node
 */
export class MacroNode extends ASTNode {
  constructor(keyword, api, method, params = {}) {
    super('Macro');
    this.keyword = keyword;
    this.api = api;
    this.method = method;
    this.params = params;
  }

  toJSON() {
    return {
      type: this.type,
      keyword: this.keyword,
      api: this.api,
      method: this.method,
      params: this.params,
      children: this.children.map(c => c.toJSON()),
      metadata: this.metadata
    };
  }
}

/**
 * Keyword AST Node
 */
export class KeywordNode extends ASTNode {
  constructor(keyword, context = null) {
    super('Keyword', keyword);
    this.keyword = keyword;
    this.context = context;
  }

  toJSON() {
    return {
      type: this.type,
      keyword: this.keyword,
      context: this.context,
      children: this.children.map(c => c.toJSON()),
      metadata: this.metadata
    };
  }
}

/**
 * API AST Node
 */
export class APINode extends ASTNode {
  constructor(api, method, params = {}) {
    super('API');
    this.api = api;
    this.method = method;
    this.params = params;
  }

  toJSON() {
    return {
      type: this.type,
      api: this.api,
      method: this.method,
      params: this.params,
      children: this.children.map(c => c.toJSON()),
      metadata: this.metadata
    };
  }
}

/**
 * Body AST Node
 */
export class BodyNode extends ASTNode {
  constructor(content, structure = {}) {
    super('Body', content);
    this.structure = structure;
  }

  toJSON() {
    return {
      type: this.type,
      content: this.value,
      structure: this.structure,
      children: this.children.map(c => c.toJSON()),
      metadata: this.metadata
    };
  }
}

/**
 * YAML Key-Value AST Node
 */
export class YAMLKeyValueNode extends ASTNode {
  constructor(key, value) {
    super('YAMLKeyValue');
    this.key = key;
    this.value = value;
  }

  toJSON() {
    return {
      type: this.type,
      key: this.key,
      value: this.value,
      children: this.children.map(c => c.toJSON()),
      metadata: this.metadata
    };
  }
}

