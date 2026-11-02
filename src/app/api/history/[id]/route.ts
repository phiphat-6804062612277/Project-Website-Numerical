import { NextRequest, NextResponse } from 'next/server';
import { getProblemByIdFromDatabase } from '@/lib/db/mongodb';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const problem = await getProblemByIdFromDatabase(id);
    if (!problem) {
      return NextResponse.json(
        { success: false, error: 'Problem not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      problem
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
