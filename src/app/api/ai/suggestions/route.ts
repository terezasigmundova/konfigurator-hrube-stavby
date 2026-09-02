import { NextResponse } from 'next/server';
import { getAiAdapter } from '@/lib/ai/adapter';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const adapter = getAiAdapter();
    const suggestions = await adapter.analyzeDrawingSheet(body);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'AI asistent je dočasně nedostupný.',
        suggestions: [],
      },
      { status: 200 }
    );
  }
}
