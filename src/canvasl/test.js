/**
 * CANVASL A₁₁ Test Suite
 *
 * Quick verification of core components
 */

import { computeCID, verifyCID } from './crypto/cid.js';
import { createChainComplex, addCell, eulerCharacteristic } from './chain/complex.js';
import { HomologyValidator, computeAllBetti } from './chain/homology.js';
import { createDAG, addNode, findLCA, hasCycle } from './dag/operations.js';

/**
 * Run all tests
 */
export async function runTests() {
  console.log('🧪 CANVASL A₁₁ Test Suite\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: CID Computation
  await test('CID computation and verification', async () => {
    const content = { test: 'data', value: 42 };
    const cid = await computeCID(content);

    assert(cid.startsWith('bafybei'), 'CID should have correct prefix');
    assert(cid.length > 20, 'CID should have reasonable length');

    const valid = await verifyCID(cid, content);
    assert(valid, 'CID verification should pass');

    const invalidContent = { test: 'different' };
    const invalid = await verifyCID(cid, invalidContent);
    assert(!invalid, 'CID verification should fail for different content');
  }, results);

  // Test 2: Chain Complex Creation
  await test('Chain complex creation and cell addition', async () => {
    const complex = createChainComplex();

    assert(complex.C0.length === 0, 'C0 should start empty');
    assert(complex.C1.length === 0, 'C1 should start empty');

    // Add a vertex
    addCell(complex, {
      id: 'v1',
      dim: 0,
      boundary: [],
      data: { label: 'vertex' }
    });

    assert(complex.C0.length === 1, 'C0 should have one vertex');
    assert(complex.C0[0].id === 'v1', 'Vertex should have correct ID');
  }, results);

  // Test 3: Euler Characteristic
  await test('Euler characteristic computation', async () => {
    const complex = createChainComplex();

    // Add cells
    addCell(complex, { id: 'v1', dim: 0, boundary: [], data: {} });
    addCell(complex, { id: 'v2', dim: 0, boundary: [], data: {} });
    addCell(complex, { id: 'e1', dim: 1, boundary: ['v1', 'v2'], data: {} });

    const euler = eulerCharacteristic(complex);
    // χ = |C0| - |C1| + |C2| - |C3| + |C4| = 2 - 1 + 0 - 0 + 0 = 1
    assert(euler === 1, `Euler characteristic should be 1, got ${euler}`);
  }, results);

  // Test 4: Homology Validation (Simple Case)
  await test('Homology validation for simple complex', async () => {
    const complex = createChainComplex();

    // Add a simple edge (should be valid)
    addCell(complex, { id: 'v1', dim: 0, boundary: [], data: {} });
    addCell(complex, { id: 'v2', dim: 0, boundary: [], data: {} });
    addCell(complex, { id: 'e1', dim: 1, boundary: ['v1', 'v2'], data: {} });

    const validator = new HomologyValidator(complex);
    const valid = validator.validate();

    assert(valid, 'Simple complex should be homologically valid');
  }, results);

  // Test 5: Betti Numbers
  await test('Betti number computation', async () => {
    const complex = createChainComplex();

    // Single vertex (one connected component)
    addCell(complex, { id: 'v1', dim: 0, boundary: [], data: {} });

    const betti = computeAllBetti(complex);

    assert(Array.isArray(betti), 'Betti should be an array');
    assert(betti.length === 5, 'Should have 5 Betti numbers');
    assert(betti[0] >= 0, 'β₀ should be non-negative');
  }, results);

  // Test 6: DAG Creation
  await test('DAG creation and node addition', async () => {
    const dag = createDAG();

    assert(dag.nodes.size === 0, 'DAG should start empty');
    assert(dag.roots.size === 0, 'Should have no roots');
    assert(dag.heads.size === 0, 'Should have no heads');

    const node = {
      parent: 'genesis',
      cid: await computeCID({ id: 'node1' }),
      auth: '',
      path: 'm/44\'/60\'/0\'/0/0',
      sig: '',
      uri: 'canvasl://test/node1',
      topo: { type: 'Topology', objects: {}, arcs: [] },
      geo: { type: 'FeatureCollection', features: [] }
    };

    addNode(dag, node);

    assert(dag.nodes.size === 1, 'DAG should have one node');
    assert(dag.roots.size === 1, 'Should have one root');
    assert(dag.heads.size === 1, 'Should have one head');
  }, results);

  // Test 7: DAG Parent-Child Relationships
  await test('DAG parent-child relationships', async () => {
    const dag = createDAG();

    const parent = {
      parent: 'genesis',
      cid: await computeCID({ id: 'parent' }),
      auth: '',
      path: 'm/44\'/60\'/0\'/0/0',
      sig: '',
      uri: 'canvasl://test/parent',
      topo: { type: 'Topology', objects: {}, arcs: [] },
      geo: { type: 'FeatureCollection', features: [] }
    };

    const child = {
      parent: parent.cid,
      cid: await computeCID({ id: 'child' }),
      auth: '',
      path: 'm/44\'/60\'/0\'/0/1',
      sig: '',
      uri: 'canvasl://test/child',
      topo: { type: 'Topology', objects: {}, arcs: [] },
      geo: { type: 'FeatureCollection', features: [] }
    };

    addNode(dag, parent);
    addNode(dag, child);

    assert(dag.nodes.size === 2, 'DAG should have two nodes');
    assert(dag.roots.size === 1, 'Should still have one root');
    assert(dag.heads.size === 1, 'Should have one head (child)');
    assert(!dag.heads.has(parent.cid), 'Parent should not be a head');
    assert(dag.heads.has(child.cid), 'Child should be a head');
  }, results);

  // Test 8: Cycle Detection
  await test('DAG cycle detection', async () => {
    const dag = createDAG();

    const node1 = {
      parent: 'genesis',
      cid: 'cid1',
      auth: '',
      path: 'm/44\'/60\'/0\'/0/0',
      sig: '',
      uri: 'canvasl://test/1',
      topo: { type: 'Topology', objects: {}, arcs: [] },
      geo: { type: 'FeatureCollection', features: [] }
    };

    const node2 = {
      parent: 'cid1',
      cid: 'cid2',
      auth: '',
      path: 'm/44\'/60\'/0\'/0/1',
      sig: '',
      uri: 'canvasl://test/2',
      topo: { type: 'Topology', objects: {}, arcs: [] },
      geo: { type: 'FeatureCollection', features: [] }
    };

    addNode(dag, node1);
    addNode(dag, node2);

    const cycle = hasCycle(dag);
    assert(!cycle, 'DAG should not have cycles');
  }, results);

  // Test 9: LCA Finding
  await test('Lowest Common Ancestor finding', async () => {
    const dag = createDAG();

    const root = {
      parent: 'genesis',
      cid: 'root',
      auth: '',
      path: 'm/44\'/60\'/0\'/0/0',
      sig: '',
      uri: 'canvasl://test/root',
      topo: { type: 'Topology', objects: {}, arcs: [] },
      geo: { type: 'FeatureCollection', features: [] }
    };

    const branch1 = {
      parent: 'root',
      cid: 'branch1',
      auth: '',
      path: 'm/44\'/60\'/0\'/0/1',
      sig: '',
      uri: 'canvasl://test/branch1',
      topo: { type: 'Topology', objects: {}, arcs: [] },
      geo: { type: 'FeatureCollection', features: [] }
    };

    const branch2 = {
      parent: 'root',
      cid: 'branch2',
      auth: '',
      path: 'm/44\'/60\'/0\'/0/2',
      sig: '',
      uri: 'canvasl://test/branch2',
      topo: { type: 'Topology', objects: {}, arcs: [] },
      geo: { type: 'FeatureCollection', features: [] }
    };

    addNode(dag, root);
    addNode(dag, branch1);
    addNode(dag, branch2);

    const lca = findLCA(dag, 'branch1', 'branch2');
    assert(lca === 'root', `LCA should be 'root', got ${lca}`);
  }, results);

  // Print results
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.tests.length}`);

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }

  return results;
}

/**
 * Test helper
 */
async function test(name, fn, results) {
  try {
    console.log(`Running: ${name}...`);
    await fn();
    console.log(`  ✅ ${name}`);
    results.passed++;
    results.tests.push({ name, passed: true });
  } catch (error) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${error.message}`);
    results.failed++;
    results.tests.push({ name, passed: false, error: error.message });
  }
}

/**
 * Assertion helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  });
}
