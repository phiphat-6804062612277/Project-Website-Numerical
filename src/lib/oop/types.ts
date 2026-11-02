export type ProblemType = 'LINEAR_ALGEBRA_EQUATION' | 'ROOT_OF_EQUATION' | 'INTERPOLATION';

export type SolutionType = 'GAUSS_JORDAN' | 'GAUSS' | 'CRAMER';

export interface StepLog {
  stepNumber: number;
  title: string;
  description: string;
  matrix: number[][];
  latexFormula?: string;
  type?: 'pivot' | 'scale' | 'eliminate' | 'backsub' | 'det';
}

export interface SolutionResult {
  solverType: SolutionType;
  dimension: number;
  isSingular: boolean;
  determinant: number;
  answers: number[];
  steps: StepLog[];
  executionTimeMs?: number;
  message?: string;
}

export interface SavedProblemDocument {
  id?: string;
  _id?: string;
  title?: string;
  dimension: number;
  matrixA: number[][];
  vectorB: number[];
  method: SolutionType;
  answers: number[];
  createdAt: string | Date;
}
