import { NextResponse } from 'next/server';
import { checkUrlLiveStock, LiveStockStatus } from '@/lib/scrapers/live-stock-checker';
import { BuildSlots } from '@/lib/pc-builder/compatibility-checker';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slots = (body.slots || {}) as BuildSlots;

    const verificationResults: Record<string, LiveStockStatus> = {};

    const activeEntries = Object.entries(slots).filter(([_, part]) => part && part.url);

    // Verify slots in parallel with a concurrency limit
    await Promise.all(
      activeEntries.map(async ([key, part]) => {
        if (!part || !part.url) return;
        const status = await checkUrlLiveStock(part.url, part.retailer);
        verificationResults[key] = status;
      })
    );

    const allInStock = Object.values(verificationResults).every((res) => res.inStock);

    return NextResponse.json({
      success: true,
      allInStock,
      results: verificationResults,
    });
  } catch (error: unknown) {
    console.error('Stock verification error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    );
  }
}
