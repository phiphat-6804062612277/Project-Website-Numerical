import { LinearSystemSolver } from './LinearSystemSolver';
import { LinearSystemProblem } from './LinearSystemProblem';
import { SolutionResult } from './types';
import { MatrixUtils } from './MatrixUtils';

export class GaussEliminationSolver extends LinearSystemSolver {
  constructor(problem: LinearSystemProblem) {
    super(problem, 'GAUSS');
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
      return {
        solverType: 'GAUSS',
        dimension: n,
        isSingular: true,
        determinant: det,
        answers: [],
        steps: this.steps,
        executionTimeMs: performance.now() - startTime,
        message: 'ระบบสมการไม่มีคำตอบชุดเดียว'
      };
    }

    // Forward Elimination
    for (let i = 0; i < n - 1; i++) {
      let maxRow = i;
      let maxVal = Math.abs(aug[i][i]);
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > maxVal) {
          maxVal = Math.abs(aug[k][i]);
          maxRow = k;
        }
      }

      if (maxRow !== i) {
        const temp = aug[i];
        aug[i] = aug[maxRow];
        aug[maxRow] = temp;
        this.logStep(
          `สลับแถวที่ ${i + 1} กับแถวที่ ${maxRow + 1}`,
          `สลับแถวเพื่อให้ค่าสัมประสิทธิ์หลักมีค่ามากที่สุด ช่วยลดความคลาดเคลื่อนในการคำนวณ`,
          aug,
          `R_{${i + 1}} \\leftrightarrow R_{${maxRow + 1}}`,
          'pivot'
        );
      }

      for (let k = i + 1; k < n; k++) {
        const factor = aug[k][i] / aug[i][i];
        if (Math.abs(factor) > 1e-12) {
          for (let j = i; j <= n; j++) {
            aug[k][j] -= factor * aug[i][j];
          }
          this.logStep(
            `กำจัดสมาชิกใต้แนวทแยงในแถวที่ ${k + 1}`,
            `นำแถวที่ ${k + 1} ลบด้วย ${MatrixUtils.cleanNumber(factor, 2)} เท่าของแถวที่ ${i + 1}`,
            aug,
            `R_{${k + 1}} \\leftarrow R_{${k + 1}} - (${MatrixUtils.cleanNumber(factor, 2)}) R_{${i + 1}}`,
            'eliminate'
          );
        }
      }
    }

    this.logStep(
      'ได้เมทริกซ์สามเหลี่ยมบน',
      'สมาชิกใต้แนวทแยงมุมหลักกลายเป็น 0 ทั้งหมด พร้อมเข้าสู่ขั้นตอนการแทนค่าย้อนกลับ',
      aug,
      `U = ${this.toLaTeXMatrix(aug)}`
    );

    // Backward Substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = aug[i][n];
      const terms: string[] = [];
      for (let j = i + 1; j < n; j++) {
        sum -= aug[i][j] * x[j];
        terms.push(`(${MatrixUtils.cleanNumber(aug[i][j], 2)})(${MatrixUtils.cleanNumber(x[j], 4)})`);
      }
      x[i] = MatrixUtils.cleanNumber(sum / aug[i][i], 4);

      const formulaText = terms.length > 0 
        ? `x_{${i + 1}} = \\frac{${MatrixUtils.cleanNumber(aug[i][n], 2)} - [${terms.join(' + ')}]}{${MatrixUtils.cleanNumber(aug[i][i], 2)}} = ${x[i]}`
        : `x_{${i + 1}} = \\frac{${MatrixUtils.cleanNumber(aug[i][n], 2)}}{${MatrixUtils.cleanNumber(aug[i][i], 2)}} = ${x[i]}`;

      this.logStep(
        `แทนค่าย้อนกลับเพื่อหาค่า x_${i + 1}`,
        `คำนวณหาค่าตัวแปรจากสมการในแถวที่ ${i + 1}`,
        aug,
        formulaText,
        'backsub'
      );
    }

    this.answers = x;
    this.isSolved = true;

    return {
      solverType: 'GAUSS',
      dimension: n,
      isSingular: false,
      determinant: det,
      answers: this.answers,
      steps: this.steps,
      executionTimeMs: performance.now() - startTime
    };
  }
}
