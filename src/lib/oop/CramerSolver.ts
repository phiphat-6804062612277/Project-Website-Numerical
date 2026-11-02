import { LinearSystemSolver } from './LinearSystemSolver';
import { LinearSystemProblem } from './LinearSystemProblem';
import { SolutionResult } from './types';
import { MatrixUtils } from './MatrixUtils';

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

    this.logStep(
      'คำนวณดีเทอร์มิแนนต์หลัก',
      `หาค่าดีเทอร์มิแนนต์ของเมทริกซ์สัมประสิทธิ์เพื่อใช้เป็นตัวหารของทุกตัวแปร`,
      A,
      `\\det(A) = ${MatrixUtils.cleanNumber(detA, 4)}`,
      'det'
    );

    if (Math.abs(detA) < 1e-12) {
      this.logStep(
        'ดีเทอร์มิแนนต์เท่ากับ 0',
        'ไม่สามารถใช้กฎของคราเมอร์ได้เนื่องจากตัวหารมีค่าเป็น 0',
        aug,
        `\\det(A) = 0`,
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
        message: 'ระบบสมการไม่มีคำตอบชุดเดียว'
      };
    }

    const answers: number[] = [];

    for (let j = 0; j < n; j++) {
      const Aj: number[][] = [];
      for (let r = 0; r < n; r++) {
        const row = [...A[r]];
        row[j] = b[r];
        Aj.push(row);
      }

      const detAj = MatrixUtils.calculateDeterminant(Aj);
      const xj = MatrixUtils.cleanNumber(detAj / detA, 4);
      answers.push(xj);

      this.logStep(
        `คำนวณตัวแปร x_${j + 1}`,
        `แทนที่คอลัมน์ที่ ${j + 1} ด้วยเวกเตอร์ผลลัพธ์แล้วหาอัตราส่วนของดีเทอร์มิแนนต์`,
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
