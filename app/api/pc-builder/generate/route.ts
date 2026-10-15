import { NextResponse } from 'next/server';
import { generateOptimizedBuild } from '@/lib/pc-builder/builder-optimizer';
import { BuildPurpose } from '@/lib/pc-builder/budget-allocator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const totalBudget = Number(body.budget) || 60000;
    const purpose = (body.purpose || 'GAMING') as BuildPurpose;
    const includeMonitor = Boolean(body.includeMonitor);
    const includePeripherals = Boolean(body.includePeripherals);

    const result = await generateOptimizedBuild({
      totalBudget,
      purpose,
      includeMonitor,
      includePeripherals,
    });

    return NextResponse.json({ success: true, build: result });
  } catch (error: unknown) {
    console.error('Error generating build:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate build' },
      { status: 500 }
    );
  }
}
