import { LinearSystemProblem } from './LinearSystemProblem';
import { LinearSystemSolver } from './LinearSystemSolver';
import { GaussJordanSolver } from './GaussJordanSolver';
import { GaussEliminationSolver } from './GaussEliminationSolver';
import { CramerSolver } from './CramerSolver';
import { SolutionType } from './types';

/**
 * Factory Class: SolverFactory
 * Demonstrates Polymorphism and Design Pattern:
 * Creates and returns the appropriate subclass of LinearSystemSolver
 * based on the requested SolutionType.
 */
export class SolverFactory {
  public static createSolver(problem: LinearSystemProblem, type: SolutionType): LinearSystemSolver {
    switch (type) {
      case 'GAUSS_JORDAN':
        return new GaussJordanSolver(problem);
      case 'GAUSS':
        return new GaussEliminationSolver(problem);
      case 'CRAMER':
        return new CramerSolver(problem);
      default:
        throw new Error(`Unsupported solution type: ${type}`);
    }
  }
}
