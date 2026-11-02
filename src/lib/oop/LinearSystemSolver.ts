import { LinearSystemProblem } from './LinearSystemProblem';
import { SolutionType, SolutionResult, StepLog } from './types';
import { MatrixUtils } from './MatrixUtils';

/**
 * Abstract Base Class: LinearSystemSolver
 * Employs:
 * - Composition: Holds a LinearSystemProblem instance (#problem)
 * - Encapsulation: Protects internal step logs and solver state
 * - Abstraction & Polymorphism: Declares abstract solve() method
 */
export abstract class LinearSystemSolver {
  protected solverId: string;
  protected problem: LinearSystemProblem; // Composition (has-a)
  protected solutionType: SolutionType;
  protected steps: StepLog[] = [];
  protected answers: number[] = [];
  protected isSolved: boolean = false;

  constructor(problem: LinearSystemProblem, solutionType: SolutionType) {
    this.solverId = `solv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.problem = problem;
    this.solutionType = solutionType;
  }

  // Getters
  public getSolverId(): string {
    return this.solverId;
  }

  public getSolutionType(): SolutionType {
    return this.solutionType;
  }

  public getProblem(): LinearSystemProblem {
    return this.problem;
  }

  public getSteps(): StepLog[] {
    return this.steps;
  }

  public getAnswers(): number[] {
    return this.answers;
  }

  /**
   * Helper to append a logged step during row operations or determinant evaluations
   */
  protected logStep(
    title: string,
    description: string,
    currentMatrix: number[][],
    latexFormula?: string,
    type?: 'pivot' | 'scale' | 'eliminate' | 'backsub' | 'det'
  ): void {
    this.steps.push({
      stepNumber: this.steps.length + 1,
      title,
      description,
      matrix: MatrixUtils.cloneMatrix(currentMatrix),
      latexFormula,
      type
    });
  }

  /**
   * Convert a 2D augmented matrix into a LaTeX bmatrix string
   */
  public toLaTeXMatrix(matrix: number[][]): string {
    const rows = matrix.map(row => 
      row.map(val => MatrixUtils.cleanNumber(val, 2).toString()).join(' & ')
    );
    return `\\begin{bmatrix} ${rows.join(' \\\\ ')} \\end{bmatrix}`;
  }

  /**
   * Abstract Method: To be implemented by concrete solver classes (Polymorphism)
   */
  public abstract solve(): SolutionResult;
}
