import { LinearSystemSolver } from './LinearSystemSolver';
import { LinearSystemProblem } from './LinearSystemProblem';
import { SolutionResult } from './types';
import { MatrixUtils } from './MatrixUtils';

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

    const aug = MatrixUtils.createAugmentedMatrix(A, b);
    this.logStep(
      'ตั้งเมทริกซ์แต่งเติมเริ่มต้น',
      'นำเมทริกซ์สัมประสิทธิ์และเวกเตอร์ผลลัพธ์มาเขียนในรูปแบบเมทริกซ์แต่งเติม',
      aug,
      `[A \\mid b] = ${this.toLaTeXMatrix(aug)}`
    );

    if (this.problem.isSingular()) {
      this.logStep(
        'ดีเทอร์มิแนนต์เท่ากับ 0',
        'เนื่องจากดีเทอร์มิแนนต์ของเมทริกซ์หลักมีค่าเท่ากับ 0 ระบบสมการนี้จึงไม่มีคำตอบชุดเดียว',
        aug,
        `\\det(A) = 0`
      );
      return {
        solverType: 'GAUSS_JORDAN',
        dimension: n,
        isSingular: true,
        determinant: det,
        answers: [],
        steps: this.steps,
        executionTimeMs: performance.now() - startTime,
        message: 'ระบบสมการไม่มีคำตอบชุดเดียว'
      };
    }

    let lead = 0;

    for (let r = 0; r < n; r++) {
      if (lead >= n) break;

      let maxRow = r;
      let maxVal = Math.abs(aug[r][lead]);
      for (let k = r + 1; k < n; k++) {
        if (Math.abs(aug[k][lead]) > maxVal) {
          maxVal = Math.abs(aug[k][lead]);
          maxRow = k;
        }
      }

      if (maxRow !== r) {
        const temp = aug[r];
        aug[r] = aug[maxRow];
        aug[maxRow] = temp;
        this.logStep(
          `สลับแถวที่ ${r + 1} กับแถวที่ ${maxRow + 1}`,
          `สลับแถวเพื่อให้ค่าสัมประสิทธิ์หลักมีค่ามากที่สุด ช่วยลดความคลาดเคลื่อนในการคำนวณ`,
          aug,
          `R_{${r + 1}} \\leftrightarrow R_{${maxRow + 1}}`,
          'pivot'
        );
      }

      const pivot = aug[r][lead];
      if (Math.abs(pivot) > 1e-12) {
        for (let j = 0; j <= n; j++) {
          aug[r][j] /= pivot;
        }
        this.logStep(
          `ปรับสัมประสิทธิ์หลักของแถวที่ ${r + 1} ให้เป็น 1`,
          `หารสมาชิกทุกตัวในแถวที่ ${r + 1} ด้วย ${MatrixUtils.cleanNumber(pivot, 2)}`,
          aug,
          `R_{${r + 1}} \\leftarrow \\frac{R_{${r + 1}}}{${MatrixUtils.cleanNumber(pivot, 2)}}`,
          'scale'
        );
      }

      for (let i = 0; i < n; i++) {
        if (i !== r) {
          const factor = aug[i][lead];
          if (Math.abs(factor) > 1e-12) {
            for (let j = 0; j <= n; j++) {
              aug[i][j] -= factor * aug[r][j];
            }
            this.logStep(
              `กำจัดสมาชิกในแถวที่ ${i + 1}`,
              `นำแถวที่ ${i + 1} ลบด้วย ${MatrixUtils.cleanNumber(factor, 2)} เท่าของแถวที่ ${r + 1}`,
              aug,
              `R_{${i + 1}} \\leftarrow R_{${i + 1}} - (${MatrixUtils.cleanNumber(factor, 2)}) R_{${r + 1}}`,
              'eliminate'
            );
          }
        }
      }
      lead++;
    }

    this.answers = aug.map(row => MatrixUtils.cleanNumber(row[n], 4));
    this.isSolved = true;

    this.logStep(
      'สิ้นสุดการแปลงเมทริกซ์ลดรูปขั้นบันไดแถว',
      'ด้านซ้ายเป็นเมทริกซ์เอกลักษณ์ และได้คำตอบของระบบสมการในคอลัมน์ขวาสุด',
      aug,
      `[I \\mid x] = ${this.toLaTeXMatrix(aug)}`
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
