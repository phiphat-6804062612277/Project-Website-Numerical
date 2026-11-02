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

    // 1. Create Problem Instance (OOP Class)
    const problem = new LinearSystemProblem(matrixA, vectorB);

    // 2. Use Factory to create polymorphic Solver
    const solver = SolverFactory.createSolver(problem, method as SolutionType);

    // 3. Solve polymorphically
    const result = solver.solve();

    // 4. Save to Database (MongoDB)
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
  } catch (error: any) {
    console.error('API /solve error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Calculation error' },
      { status: 400 }
    );
  }
}
