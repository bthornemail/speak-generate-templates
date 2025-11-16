/**
 * Chain Complex Operations
 *
 * Implements the mathematical chain complex structure:
 * C₄ --∂₄--> C₃ --∂₃--> C₂ --∂₂--> C₁ --∂₁--> C₀
 */

/**
 * Create an empty chain complex
 *
 * @returns {ChainComplex}
 */
export function createChainComplex() {
  return {
    C0: [],
    C1: [],
    C2: [],
    C3: [],
    C4: [],
    boundary: new Map()
  };
}

/**
 * Add a cell to the chain complex
 *
 * @param {ChainComplex} complex - The chain complex
 * @param {Cell} cell - The cell to add
 */
export function addCell(complex, cell) {
  switch (cell.dim) {
    case 0:
      complex.C0.push(cell);
      break;
    case 1:
      complex.C1.push(cell);
      break;
    case 2:
      complex.C2.push(cell);
      break;
    case 3:
      complex.C3.push(cell);
      break;
    case 4:
      complex.C4.push(cell);
      break;
    default:
      throw new Error(`Invalid dimension: ${cell.dim}`);
  }

  // Store boundary if present
  if (cell.boundary && cell.boundary.length > 0) {
    complex.boundary.set(cell.id, cell.boundary);
  }
}

/**
 * Get cells of a specific dimension
 *
 * @param {ChainComplex} complex - The chain complex
 * @param {0|1|2|3|4} dimension - The dimension
 * @returns {Cell[]} Cells of the specified dimension
 */
export function getCells(complex, dimension) {
  switch (dimension) {
    case 0: return complex.C0;
    case 1: return complex.C1;
    case 2: return complex.C2;
    case 3: return complex.C3;
    case 4: return complex.C4;
    default: throw new Error(`Invalid dimension: ${dimension}`);
  }
}

/**
 * Compute boundary of a cell
 *
 * @param {ChainComplex} complex - The chain complex
 * @param {string} cellId - Cell ID
 * @returns {string[]} Boundary cell IDs
 */
export function boundary(complex, cellId) {
  return complex.boundary.get(cellId) || [];
}

/**
 * Boundary operator ∂₁: Edge → Vertices
 *
 * @param {Cell<1>} edge - Edge cell
 * @returns {Cell<0>[]} Two vertex cells
 */
export function boundary_1(edge) {
  if (edge.dim !== 1) {
    throw new Error('boundary_1 requires dimension 1 cell');
  }

  return edge.boundary.map(id => ({
    id,
    dim: 0,
    boundary: [],
    data: {}
  }));
}

/**
 * Boundary operator ∂₂: Face → Edges
 *
 * @param {Cell<2>} face - Face cell
 * @returns {Cell<1>[]} Edge cells forming the boundary
 */
export function boundary_2(face) {
  if (face.dim !== 2) {
    throw new Error('boundary_2 requires dimension 2 cell');
  }

  return face.boundary.map(id => ({
    id,
    dim: 1,
    boundary: [],
    data: {}
  }));
}

/**
 * Boundary operator ∂₃: Volume → Faces
 *
 * @param {Cell<3>} volume - Volume cell
 * @returns {Cell<2>[]} Face cells forming the boundary
 */
export function boundary_3(volume) {
  if (volume.dim !== 3) {
    throw new Error('boundary_3 requires dimension 3 cell');
  }

  return volume.boundary.map(id => ({
    id,
    dim: 2,
    boundary: [],
    data: {}
  }));
}

/**
 * Boundary operator ∂₄: Context → Volumes
 *
 * @param {Cell<4>} context - Evolution context cell
 * @returns {Cell<3>[]} Volume cells forming the boundary
 */
export function boundary_4(context) {
  if (context.dim !== 4) {
    throw new Error('boundary_4 requires dimension 4 cell');
  }

  return context.boundary.map(id => ({
    id,
    dim: 3,
    boundary: [],
    data: {}
  }));
}

/**
 * Compute Euler characteristic: χ = Σ(-1)ⁿ|Cₙ|
 *
 * @param {ChainComplex} complex - The chain complex
 * @returns {number} Euler characteristic
 */
export function eulerCharacteristic(complex) {
  return complex.C0.length
       - complex.C1.length
       + complex.C2.length
       - complex.C3.length
       + complex.C4.length;
}
