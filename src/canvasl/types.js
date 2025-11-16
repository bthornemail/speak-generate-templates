/**
 * CANVASL A₁₁ Core Type Definitions
 *
 * Foundational data structures for the peer-to-peer,
 * topologically sound, self-sovereign operating system.
 */

/**
 * @typedef {string} CID - Content Identifier (SHA-256 hash, base58)
 */

/**
 * @typedef {string} Signature - ECDSA signature
 */

/**
 * @typedef {string} BIP32Path - Hierarchical deterministic path (e.g., "m/44'/60'/0'/0/42")
 */

/**
 * MetaLogNode - The core primitive hyperedge (8-tuple)
 *
 * @typedef {Object} MetaLogNode
 * @property {CID} parent - Parent CID (or "genesis")
 * @property {CID} cid - This node's content hash
 * @property {string} auth - WebAuthn credential ID
 * @property {BIP32Path} path - Hierarchical deterministic path
 * @property {Signature} sig - Sign(privateKey, cid)
 * @property {string} uri - canvasl://{address}/{path}
 * @property {TopoJSON} topo - Topological structure
 * @property {GeoJSON} geo - Geometric patch
 * @property {Object} [meta] - Optional metadata (not signed)
 * @property {number} [meta.size] - Size in bytes
 * @property {string} [meta.mimeType] - MIME type
 */

/**
 * TopoJSON Structure
 *
 * @typedef {Object} TopoJSON
 * @property {"Topology"} type
 * @property {Object<string, Object>} objects - Named object collections
 * @property {number[][][]} arcs - Shared arc coordinates
 * @property {Object} [transform] - Optional transform
 * @property {[number, number]} [transform.scale] - Scale factors
 * @property {[number, number]} [transform.translate] - Translation
 */

/**
 * GeoJSON Feature Collection
 *
 * @typedef {Object} GeoJSON
 * @property {"FeatureCollection"} type
 * @property {GeoJSONFeature[]} features
 */

/**
 * @typedef {Object} GeoJSONFeature
 * @property {"Feature"} type
 * @property {Object} geometry - GeoJSON geometry
 * @property {Object} properties - Feature properties
 */

/**
 * Chain Complex Cell
 *
 * @template {0|1|2|3|4} N - Dimension
 * @typedef {Object} Cell
 * @property {string} id - Unique cell identifier
 * @property {N} dim - Dimension (0, 1, 2, 3, or 4)
 * @property {string[]} boundary - IDs of (n-1)-cells forming the boundary
 * @property {*} data - Cell-specific data
 */

/**
 * Chain Complex with graded pieces C₀ through C₄
 *
 * @typedef {Object} ChainComplex
 * @property {Cell<0>[]} C0 - 0-cells (keywords/vertices)
 * @property {Cell<1>[]} C1 - 1-cells (edges/connections)
 * @property {Cell<2>[]} C2 - 2-cells (documents/faces)
 * @property {Cell<3>[]} C3 - 3-cells (interface triples/volumes)
 * @property {Cell<4>[]} C4 - 4-cells (evolution contexts)
 * @property {Map<string, string[]>} boundary - Boundary map: cell ID → boundary cell IDs
 */

/**
 * Directed Acyclic Graph
 *
 * @typedef {Object} DAG
 * @property {Map<CID, MetaLogNode>} nodes - All nodes indexed by CID
 * @property {Map<CID, CID[]>} edges - Child → Parents mapping
 * @property {Set<CID>} roots - Genesis nodes (no parents)
 * @property {Set<CID>} heads - Latest nodes (no children)
 */

/**
 * RTCPeerConnection configuration
 *
 * @typedef {Object} ICEConfig
 * @property {RTCIceServer[]} iceServers
 * @property {"all"|"relay"} iceTransportPolicy
 * @property {"max-bundle"} bundlePolicy
 * @property {"require"} rtcpMuxPolicy
 */

/**
 * Automaton interface
 *
 * @typedef {Object} Automaton
 * @property {0|1|2|3|4|5|6|7|8|9|10|11} id - Automaton ID
 * @property {string} name - Automaton name
 * @property {string} role - Role description
 * @property {*} state - Automaton state
 * @property {(swarm: A11Swarm) => Promise<void>} tick - Called each tick
 * @property {(from: number, message: *) => Promise<void>} receive - Handle messages
 * @property {(to: number, message: *) => Promise<void>} send - Send messages
 */

/**
 * Conflict resolution strategies
 *
 * @typedef {"lww"|"homology"|"vote"|"manual"} ConflictStrategy
 */

/**
 * CANVASL Template (from docs/02)
 *
 * @typedef {Object} CANVASLTemplate
 * @property {string} id - Template ID
 * @property {"canvasl-template"} type
 * @property {2} dimension - Always 2 (C₂ cell)
 * @property {Object} frontmatter - YAML frontmatter
 * @property {Object} frontmatter.adjacency - Boundary structure
 * @property {string[]} frontmatter.adjacency.edges - Edge IDs
 * @property {number[]} frontmatter.adjacency.orientation - Signs (±1)
 * @property {Object} [frontmatter.speech] - Voice I/O configuration
 * @property {Object[]} [frontmatter.macros] - W3C API macros
 * @property {Object} [frontmatter.validates] - Validation rules
 * @property {string} body - Markdown body
 */

export {
  // Re-export for IDE support
};
