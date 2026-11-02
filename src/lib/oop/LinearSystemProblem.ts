import { Problem } from './Problem';
import { MatrixUtils } from './MatrixUtils';

/**
 * Concrete Class: LinearSystemProblem
 * Inherits from Problem (Inheritance).
 * Encapsulates the coefficient matrix A and constants vector b for the linear system Ax = b.
 */
export class LinearSystemProblem extends Problem {
  private matrixA: number[][];
  private vectorB: number[];
  private dimension: number;

  constructor(matrixA: number[][], vectorB: number[], userId: string = 'guest') {
    // Call superclass constructor (Constructor inheritance)
    super(JSON.stringify({ A: matrixA, b: vectorB }), 'LINEAR_ALGEBRA_EQUATION', userId);
    this.matrixA = MatrixUtils.cloneMatrix(matrixA);
    this.vectorB = [...vectorB];
    this.dimension = matrixA.length;
    this.formatInput();
  }

  /**
   * Validates that matrix A is square (n x n) and vector b has length n
   */
  public formatInput(): boolean {
    if (!Array.isArray(this.matrixA) || !Array.isArray(this.vectorB)) {
      throw new Error('Matrix A and Vector b must be arrays');
    }
    const n = this.matrixA.length;
    if (n < 2 || n > 10) {
      throw new Error('Matrix dimension must be between 2 and 10');
    }
    for (let i = 0; i < n; i++) {
      if (!Array.isArray(this.matrixA[i]) || this.matrixA[i].length !== n) {
        throw new Error(`Row ${i + 1} of Matrix A must have length ${n} (must be square matrix)`);
      }
    }
    if (this.vectorB.length !== n) {
      throw new Error(`Vector b must have length ${n} to match Matrix A`);
    }
    this.dimension = n;
    return true;
  }

  // Encapsulation: Accessors
  public getMatrixA(): number[][] {
    return MatrixUtils.cloneMatrix(this.matrixA);
  }

  public getVectorB(): number[] {
    return [...this.vectorB];
  }

  public getDimension(): number {
    return this.dimension;
  }

  public getDeterminant(): number {
    return MatrixUtils.calculateDeterminant(this.matrixA);
  }

  public isSingular(): boolean {
    return Math.abs(this.getDeterminant()) < 1e-9;
  }
}
