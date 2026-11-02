export class MatrixUtils {
  /**
   * Clone a 2D matrix deeply to prevent accidental mutations
   */
  public static cloneMatrix(matrix: number[][]): number[][] {
    return matrix.map(row => [...row]);
  }

  /**
   * Calculate determinant of an n x n square matrix using recursive cofactor expansion
   */
  public static calculateDeterminant(matrix: number[][]): number {
    const n = matrix.length;
    if (n === 0) return 0;
    if (n === 1) return matrix[0][0];
    if (n === 2) {
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    let det = 0;
    for (let j = 0; j < n; j++) {
      const subMatrix: number[][] = [];
      for (let i = 1; i < n; i++) {
        const subRow: number[] = [];
        for (let k = 0; k < n; k++) {
          if (k !== j) subRow.push(matrix[i][k]);
        }
        subMatrix.push(subRow);
      }
      det += Math.pow(-1, j) * matrix[0][j] * this.calculateDeterminant(subMatrix);
    }
    return det;
  }

  /**
   * Construct an augmented matrix [A | b] from square matrix A and column vector b
   */
  public static createAugmentedMatrix(A: number[][], b: number[]): number[][] {
    const n = A.length;
    const augmented: number[][] = [];
    for (let i = 0; i < n; i++) {
      augmented.push([...A[i], b[i]]);
    }
    return augmented;
  }

  /**
   * Formats a number to clean precision string, removing floating point artifacts like 0.0000000000000002
   */
  public static cleanNumber(val: number, precision: number = 4): number {
    if (Math.abs(val) < 1e-10) return 0;
    return parseFloat(val.toFixed(precision));
  }
}
