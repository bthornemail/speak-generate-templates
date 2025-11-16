/**
 * DAG (Directed Acyclic Graph) Operations
 *
 * Implements parent-based causality and merge algorithms
 */

import { computeCID } from '../crypto/cid.js';

/**
 * Create an empty DAG
 *
 * @returns {DAG}
 */
export function createDAG() {
  return {
    nodes: new Map(),
    edges: new Map(),
    roots: new Set(),
    heads: new Set()
  };
}

/**
 * Add a node to the DAG
 *
 * @param {DAG} dag - The DAG
 * @param {MetaLogNode} node - Node to add
 */
export function addNode(dag, node) {
  // Add to nodes
  dag.nodes.set(node.cid, node);

  // Handle parent relationships
  if (node.parent === 'genesis') {
    dag.roots.add(node.cid);
  } else {
    // Add edge: parent → child
    const children = dag.edges.get(node.parent) || [];
    children.push(node.cid);
    dag.edges.set(node.parent, children);

    // Remove parent from heads if it was there
    dag.heads.delete(node.parent);
  }

  // This node is a new head (for now)
  dag.heads.add(node.cid);
}

/**
 * Get ancestors of a node (parents, grandparents, etc.)
 *
 * @param {DAG} dag - The DAG
 * @param {string} cid - Node CID
 * @returns {string[]} Array of ancestor CIDs (closest first)
 */
export function getAncestors(dag, cid) {
  const ancestors = [];
  let current = cid;

  while (current) {
    const node = dag.nodes.get(current);
    if (!node || node.parent === 'genesis') {
      break;
    }

    ancestors.push(node.parent);
    current = node.parent;
  }

  return ancestors;
}

/**
 * Find lowest common ancestor of two nodes
 *
 * @param {DAG} dag - The DAG
 * @param {string} cid1 - First node CID
 * @param {string} cid2 - Second node CID
 * @returns {string|null} LCA CID or null if no common ancestor
 */
export function findLCA(dag, cid1, cid2) {
  const ancestors1 = getAncestors(dag, cid1);
  const ancestors2 = new Set(getAncestors(dag, cid2));

  // Find first common ancestor
  for (const ancestor of ancestors1) {
    if (ancestors2.has(ancestor)) {
      return ancestor;
    }
  }

  return null; // No common ancestor
}

/**
 * Get children of a node
 *
 * @param {DAG} dag - The DAG
 * @param {string} cid - Parent CID
 * @returns {string[]} Array of child CIDs
 */
export function getChildren(dag, cid) {
  return dag.edges.get(cid) || [];
}

/**
 * Check if DAG contains a cycle (should never happen)
 *
 * @param {DAG} dag - The DAG
 * @returns {boolean} True if cycle detected
 */
export function hasCycle(dag) {
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(cid) {
    if (recursionStack.has(cid)) {
      return true; // Cycle detected
    }
    if (visited.has(cid)) {
      return false; // Already visited, no cycle here
    }

    visited.add(cid);
    recursionStack.add(cid);

    const children = getChildren(dag, cid);
    for (const child of children) {
      if (dfs(child)) {
        return true;
      }
    }

    recursionStack.delete(cid);
    return false;
  }

  // Check from each root
  for (const root of dag.roots) {
    if (dfs(root)) {
      return true;
    }
  }

  return false;
}

/**
 * Merge two nodes (three-way merge with LCA)
 *
 * @param {DAG} dag - The DAG
 * @param {string} localCID - Local head CID
 * @param {string} remoteCID - Remote head CID
 * @returns {Promise<MetaLogNode>} Merged node
 */
export async function mergeNodes(dag, localCID, remoteCID) {
  const local = dag.nodes.get(localCID);
  const remote = dag.nodes.get(remoteCID);

  if (!local || !remote) {
    throw new Error('Node not found in DAG');
  }

  // Find common ancestor
  const lca = findLCA(dag, localCID, remoteCID);
  const ancestor = lca ? dag.nodes.get(lca) : null;

  if (!ancestor) {
    // No common ancestor - use last-write-wins by CID
    return local.cid > remote.cid ? local : remote;
  }

  // Three-way merge
  const merged = await merge3Way(local, remote, ancestor);

  // New node has two parents (merge commit)
  merged.parent = `${localCID},${remoteCID}`;
  merged.cid = await computeCID({
    parent: merged.parent,
    uri: merged.uri,
    topo: merged.topo,
    geo: merged.geo
  });

  return merged;
}

/**
 * Three-way merge algorithm
 *
 * @param {MetaLogNode} local - Local version
 * @param {MetaLogNode} remote - Remote version
 * @param {MetaLogNode} ancestor - Common ancestor
 * @returns {Promise<MetaLogNode>} Merged node
 */
async function merge3Way(local, remote, ancestor) {
  const merged = { ...ancestor };

  // Merge topo (TopoJSON)
  if (JSON.stringify(local.topo) !== JSON.stringify(ancestor.topo)) {
    merged.topo = local.topo;
  }
  if (JSON.stringify(remote.topo) !== JSON.stringify(ancestor.topo)) {
    if (JSON.stringify(merged.topo) !== JSON.stringify(remote.topo)) {
      // Conflict: use CID order (deterministic)
      merged.topo = local.cid > remote.cid ? local.topo : remote.topo;
    }
  }

  // Merge geo (GeoJSON) - similar logic
  if (JSON.stringify(local.geo) !== JSON.stringify(ancestor.geo)) {
    merged.geo = local.geo;
  }
  if (JSON.stringify(remote.geo) !== JSON.stringify(ancestor.geo)) {
    if (JSON.stringify(merged.geo) !== JSON.stringify(remote.geo)) {
      merged.geo = local.cid > remote.cid ? local.geo : remote.geo;
    }
  }

  // Merge URI
  if (local.uri !== ancestor.uri) {
    merged.uri = local.uri;
  }
  if (remote.uri !== ancestor.uri && merged.uri !== remote.uri) {
    merged.uri = local.cid > remote.cid ? local.uri : remote.uri;
  }

  // Keep identity fields from local
  merged.auth = local.auth;
  merged.path = local.path;
  merged.sig = local.sig;

  return merged;
}

/**
 * Topological sort of DAG nodes
 *
 * @param {DAG} dag - The DAG
 * @returns {string[]} Sorted CIDs (roots first, leaves last)
 */
export function topologicalSort(dag) {
  const sorted = [];
  const visited = new Set();

  function visit(cid) {
    if (visited.has(cid)) {
      return;
    }

    visited.add(cid);

    const children = getChildren(dag, cid);
    for (const child of children) {
      visit(child);
    }

    sorted.unshift(cid); // Add to front (reverse post-order)
  }

  // Visit from each root
  for (const root of dag.roots) {
    visit(root);
  }

  return sorted;
}

/**
 * Get depth of a node in the DAG
 *
 * @param {DAG} dag - The DAG
 * @param {string} cid - Node CID
 * @returns {number} Depth (0 for roots)
 */
export function getDepth(dag, cid) {
  const ancestors = getAncestors(dag, cid);
  return ancestors.length;
}
