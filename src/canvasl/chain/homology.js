/**
 * Homology Validation - Ensures ∂² = 0
 *
 * The fundamental property of a chain complex is that the composition
 * of two consecutive boundary operators is zero: ∂ₙ₋₁ ∘ ∂ₙ = 0
 */

import { getCells, boundary } from './complex.js';

/**
 * Homology Validator
 */
export class HomologyValidator {
  /**
   * @param {ChainComplex} complex - The chain complex to validate
   */
  constructor(complex) {
    this.complex = complex;
  }

  /**
   * Validate composition: ∂ₙ₋₁ ∘ ∂ₙ = 0
   *
   * @param {1|2|3|4} n - Dimension to check
   * @returns {boolean} True if ∂² = 0 at dimension n
   */
  validateComposition(n) {
    const cells = getCells(this.complex, n);

    for (const cell of cells) {
      // Compute ∂ₙ(cell)
      const boundary_n = boundary(this.complex, cell.id);

      // For each boundary cell, compute ∂ₙ₋₁
      for (const bId of boundary_n) {
        const boundary_n_minus_1 = boundary(this.complex, bId);

        // These should form a closed cycle (sum to zero)
        if (!this.isCycle(boundary_n_minus_1)) {
          console.error(`∂² ≠ 0 at cell ${cell.id}`);
          console.error(`Boundary: ${JSON.stringify(boundary_n)}`);
          console.error(`Boundary of boundary: ${JSON.stringify(boundary_n_minus_1)}`);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if boundary forms a closed cycle
   *
   * For edges: each vertex should appear exactly twice (or even number of times)
   *
   * @param {string[]} boundaryIds - Boundary cell IDs
   * @returns {boolean} True if forms a cycle
   */
  isCycle(boundaryIds) {
    // Count occurrences
    const counts = new Map();
    for (const id of boundaryIds) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }

    // Each vertex should appear an even number of times
    for (const count of counts.values()) {
      if (count % 2 !== 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Compute kernel of ∂ₙ: cells where ∂ₙ(cell) = 0
   *
   * @param {number} n - Dimension
   * @returns {string[]} Cell IDs in kernel
   */
  computeKernel(n) {
    const cells = getCells(this.complex, n);
    return cells
      .filter(c => boundary(this.complex, c.id).length === 0)
      .map(c => c.id);
  }

  /**
   * Compute image of ∂ₙ: all cells in boundaries
   *
   * @param {number} n - Dimension
   * @returns {string[]} Cell IDs in image
   */
  computeImage(n) {
    const cells = getCells(this.complex, n);
    const image = new Set();

    for (const cell of cells) {
      const b = boundary(this.complex, cell.id);
      for (const id of b) {
        image.add(id);
      }
    }

    return Array.from(image);
  }

  /**
   * Compute Betti number: βₙ = dim(Hₙ) = dim(ker ∂ₙ) - dim(im ∂ₙ₊₁)
   *
   * @param {number} n - Dimension
   * @returns {number} n-th Betti number
   */
  computeBetti(n) {
    const kernel = this.computeKernel(n);
    const image = n < 4 ? this.computeImage(n + 1) : [];

    // Simplified: Betti number ≈ |kernel| - |image|
    // Proper implementation would use linear algebra over Z/2Z
    return Math.max(0, kernel.length - image.length);
  }

  /**
   * Compute all Betti numbers
   *
   * @returns {number[]} [β₀, β₁, β₂, β₃, β₄]
   */
  computeAllBetti() {
    return [0, 1, 2, 3, 4].map(n => this.computeBetti(n));
  }

  /**
   * Validate entire chain complex
   *
   * @returns {boolean} True if all ∂² = 0 checks pass
   */
  validate() {
    for (let n = 1; n <= 4; n++) {
      if (!this.validateComposition(n)) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Compute Betti numbers for a chain complex
 *
 * @param {ChainComplex} complex - The chain complex
 * @returns {number[]} [β₀, β₁, β₂, β₃, β₄]
 */
export function computeAllBetti(complex) {
  const validator = new HomologyValidator(complex);
  return validator.computeAllBetti();
}
