import { LinearSystemSolver } from './LinearSystemSolver';
import { LinearSystemProblem } from './LinearSystemProblem';
import { SolutionResult } from './types';
import { MatrixUtils } from './MatrixUtils';

/**
 * Concrete Solver: CramerSolver
 * Inherits from LinearSystemSolver.
 * Implements Cramer's Rule via Determinant Ratios: x_i = det(A_i) / det(A).
 */
export class CramerSolver extends LinearSystemSolver {
  constructor(problem: LinearSystemProblem) {
    super(problem, 'CRAMER');
  }

  public solve(): SolutionResult {
    const startTime = performance.now();
    this.steps = [];
    const n = this.problem.getDimension();
    const A = this.problem.getMatrixA();
    const b = this.problem.getVectorB();
    const detA = this.problem.getDeterminant();

    const aug = MatrixUtils.createAugmentedMatrix(A, b);

    // Step 1: Base Determinant
    this.logStep(
      `คำนวณ Determinant หลัก: \\det(A) = ${MatrixUtils.cleanNumber(detA, 4)}`,
      `หาดีเทอร์มิแนนต์ของเมทริกซ์สัมประสิทธิ์ A สำหรับเป็นตัวหารของทุกตัวแปร`,
      A,
      `\\det(A) = ${MatrixUtils.cleanNumber(detA, 4)}`,
      'det'
    );

    if (Math.abs(detA) < 1e-12) {
      this.logStep(
        'ตรวจพบ det(A) = 0 ไม่สามารถใช้กฎของคราเมอร์ได้',
        'เนื่องจาก det(A) เป็น 0 ทำให้เกิดการหารด้วยศูนย์ ระบบสมการไม่มีคำตอบเอกลักษณ์',
        aug,
        `\\det(A) = 0 \\implies \\text{Cramer's Rule Fails}`,
        'det'
      );
      return {
        solverType: 'CRAMER',
        dimension: n,
        isSingular: true,
        determinant: detA,
        answers: [],
        steps: this.steps,
        executionTimeMs: performance.now() - startTime,
        message: 'ระบบสมการไม่มีคำตอบเอกลักษณ์ (det(A) = 0)'
      };
    }

    const answers: number[] = [];

    // Step 2..n+1: Replace each column with vector b
    for (let j = 0; j < n; j++) {
      const Aj: number[][] = [];
      for (let r = 0; r < n; r++) {
        const row = [...A[r]];
        row[j] = b[r]; // Replace column j with b
        Aj.push(row);
      }

      const detAj = MatrixUtils.calculateDeterminant(Aj);
      const xj = MatrixUtils.cleanNumber(detAj / detA, 4);
      answers.push(xj);

      this.logStep(
        `คำนวณตัวแปร x_{${j + 1}}: แทนที่คอลัมน์ที่ ${j + 1} ด้วยเวกเตอร์ b`,
        `สร้างเมทริกซ์ A_{${j + 1}} แล้วหา \\det(A_{${j + 1}}) = ${MatrixUtils.cleanNumber(detAj, 4)} จากนั้นคำนวณ x_{${j + 1}} = \\det(A_{${j + 1}}) / \\det(A)`,
        Aj,
        `x_{${j + 1}} = \\frac{\\det(A_{${j + 1}})}{\\det(A)} = \\frac{${MatrixUtils.cleanNumber(detAj, 4)}}{${MatrixUtils.cleanNumber(detA, 4)}} = ${xj}`,
        'det'
      );
    }

    this.answers = answers;
    this.isSolved = true;

    return {
      solverType: 'CRAMER',
      dimension: n,
      isSingular: false,
      determinant: detA,
      answers: this.answers,
      steps: this.steps,
      executionTimeMs: performance.now() - startTime
    };
  }
}
