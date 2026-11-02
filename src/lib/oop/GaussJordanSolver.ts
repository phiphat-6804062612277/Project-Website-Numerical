import { LinearSystemSolver } from './LinearSystemSolver';
import { LinearSystemProblem } from './LinearSystemProblem';
import { SolutionResult } from './types';
import { MatrixUtils } from './MatrixUtils';

/**
 * Concrete Solver: GaussJordanSolver
 * Inherits from LinearSystemSolver.
 * Implements Reduced Row Echelon Form (RREF) with Partial Pivoting.
 */
export class GaussJordanSolver extends LinearSystemSolver {
  constructor(problem: LinearSystemProblem) {
    super(problem, 'GAUSS_JORDAN');
  }

  public solve(): SolutionResult {
    const startTime = performance.now();
    this.steps = [];
    const n = this.problem.getDimension();
    const A = this.problem.getMatrixA();
    const b = this.problem.getVectorB();
    const det = this.problem.getDeterminant();

    // 1. Initial Augmented Matrix [A | b]
    const aug = MatrixUtils.createAugmentedMatrix(A, b);
    this.logStep(
      'เมทริกซ์แต่งเติมเริ่มต้น [A | b]',
      'นำเมทริกซ์สัมประสิทธิ์ A และเวกเตอร์คำตอบ b มาประกอบเป็นเมทริกซ์แต่งเติม',
      aug,
      `[A | b] = ${this.toLaTeXMatrix(aug)}`
    );

    // Check for singularity
    if (this.problem.isSingular()) {
      this.logStep(
        'ตรวจพบ det(A) = 0 (Singular Matrix)',
        'เนื่องจาก Determinant ของเมทริกซ์หลักมีค่าเท่ากับ 0 ระบบสมการนี้จึงไม่มีคำตอบเอกลักษณ์ (Unique Solution)',
        aug,
        `\\det(A) = 0 \\implies \\text{ไม่มีคำตอบ หรือมีคำตอบไม่จำกัดจำนวน}`
      );
      return {
        solverType: 'GAUSS_JORDAN',
        dimension: n,
        isSingular: true,
        determinant: det,
        answers: [],
        steps: this.steps,
        executionTimeMs: performance.now() - startTime,
        message: 'ระบบสมการไม่มีคำตอบเอกลักษณ์ (det(A) = 0)'
      };
    }

    let lead = 0;

    for (let r = 0; r < n; r++) {
      if (lead >= n) break;

      // 1. Partial Pivoting: หาแถวที่มีค่าสัมบูรณ์มากที่สุดในคอลัมน์ lead
      let maxRow = r;
      let maxVal = Math.abs(aug[r][lead]);
      for (let k = r + 1; k < n; k++) {
        if (Math.abs(aug[k][lead]) > maxVal) {
          maxVal = Math.abs(aug[k][lead]);
          maxRow = k;
        }
      }

      // สลับแถวถ้าจำเป็น
      if (maxRow !== r) {
        const temp = aug[r];
        aug[r] = aug[maxRow];
        aug[maxRow] = temp;
        this.logStep(
          `สลับแถว R_${r + 1} \\leftrightarrow R_${maxRow + 1} (Partial Pivoting)`,
          `สลับแถวเพื่อให้ค่าสัมประสิทธิ์หลัก (Pivot) มีค่าสัมบูรณ์สูงสุด (${maxVal.toFixed(2)}) ลดความคลาดเคลื่อนจากการหาร (Round-off error)`,
          aug,
          `R_{${r + 1}} \\leftrightarrow R_{${maxRow + 1}}`,
          'pivot'
        );
      }

      // 2. ปรับค่า Pivot ให้เป็น 1
      const pivot = aug[r][lead];
      if (Math.abs(pivot) > 1e-12) {
        for (let j = 0; j <= n; j++) {
          aug[r][j] /= pivot;
        }
        this.logStep(
          `ปรับ Pivot เป็น 1: R_${r + 1} \\leftarrow R_${r + 1} / (${MatrixUtils.cleanNumber(pivot, 2)})`,
          `หารสมาชิกทุกตัวในแถวที่ ${r + 1} ด้วยค่า Pivot เพื่อให้สมาชิกทแยงมุมหลักเป็น 1`,
          aug,
          `R_{${r + 1}} \\leftarrow \\frac{R_{${r + 1}}}{${MatrixUtils.cleanNumber(pivot, 2)}}`,
          'scale'
        );
      }

      // 3. กำจัดแถวอื่นทุกแถว (ทั้งบนและล่าง) ให้เป็น 0 (RREF)
      for (let i = 0; i < n; i++) {
        if (i !== r) {
          const factor = aug[i][lead];
          if (Math.abs(factor) > 1e-12) {
            for (let j = 0; j <= n; j++) {
              aug[i][j] -= factor * aug[r][j];
            }
            this.logStep(
              `กำจัดแถว R_${i + 1}: R_${i + 1} \\leftarrow R_${i + 1} - (${MatrixUtils.cleanNumber(factor, 2)}) R_${r + 1}`,
              `ทำให้สมาชิกในคอลัมน์ที่ ${lead + 1} ของแถวที่ ${i + 1} กลายเป็น 0`,
              aug,
              `R_{${i + 1}} \\leftarrow R_{${i + 1}} - (${MatrixUtils.cleanNumber(factor, 2)}) R_{${r + 1}}`,
              'eliminate'
            );
          }
        }
      }
      lead++;
    }

    // คำตอบจะอยู่ในคอลัมน์สุดท้ายของ Augmented Matrix ทันที
    this.answers = aug.map(row => MatrixUtils.cleanNumber(row[n], 4));
    this.isSolved = true;

    this.logStep(
      'ได้เมทริกซ์ลดรูปขั้นบันไดแบบแถว (Reduced Row Echelon Form: RREF)',
      'ด้านซ้ายกลายเป็นเมทริกซ์เอกลักษณ์ [I] คำตอบของระบบสมการปรากฏที่คอลัมน์ขวาสุด',
      aug,
      `[I | x] = ${this.toLaTeXMatrix(aug)}`
    );

    return {
      solverType: 'GAUSS_JORDAN',
      dimension: n,
      isSingular: false,
      determinant: det,
      answers: this.answers,
      steps: this.steps,
      executionTimeMs: performance.now() - startTime
    };
  }
}
