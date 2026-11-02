import { NextRequest, NextResponse } from 'next/server';
import { LinearSystemProblem } from '@/lib/oop/LinearSystemProblem';
import { SolverFactory } from '@/lib/oop/SolverFactory';
import { SolutionType } from '@/lib/oop/types';
import { saveProblemToDatabase } from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matrixA, vectorB, method = 'GAUSS_JORDAN' } = body;

    if (!matrixA || !vectorB) {
      return NextResponse.json(
        { success: false, error: 'matrixA and vectorB are required' },
        { status: 400 }
      );
    }

    const problem = new LinearSystemProblem(matrixA, vectorB);
    const solver = SolverFactory.createSolver(problem, method as SolutionType);
    const result = solver.solve();

    let savedId: string | null = null;
    if (!result.isSingular) {
      try {
        savedId = await saveProblemToDatabase({
          dimension: problem.getDimension(),
          matrixA: problem.getMatrixA(),
          vectorB: problem.getVectorB(),
          method,
          answers: result.answers
        });
      } catch (dbErr) {
        console.error('Database write error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      result,
      savedId
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Calculation error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
