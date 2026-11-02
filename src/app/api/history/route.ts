import { NextResponse } from 'next/server';
import { getRecentProblemsFromDatabase } from '@/lib/db/mongodb';

export async function GET() {
  try {
    const history = await getRecentProblemsFromDatabase(15);
    return NextResponse.json({
      success: true,
      history
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
