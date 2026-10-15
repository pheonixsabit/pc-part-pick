import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const socket = searchParams.get('socket');
    const ramType = searchParams.get('ramType');
    const formFactor = searchParams.get('formFactor');

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { category };

    if (socket) {
      where.socket = socket;
    }
    if (ramType) {
      where.ramType = ramType;
    }
    if (formFactor) {
      where.formFactor = formFactor;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        prices: {
          where: { inStock: true, price: { gt: 0 } },
          orderBy: { price: 'asc' },
        },
      },
    });

    const parts = products
      .filter((p) => p.prices.length > 0)
      .map((p) => {
        const best = p.prices[0];
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category,
          socket: p.socket,
          ramType: p.ramType,
          formFactor: p.formFactor,
          tdpWatts: p.tdpWatts,
          recommendedPsu: p.recommendedPsu,
          hasIgpu: p.hasIgpu,
          imageUrl: p.imageUrl || best.imageUrl,
          price: best.price,
          retailer: best.retailer,
          url: best.url,
          prices: p.prices,
        };
      })
      .sort((a, b) => a.price - b.price);

    return NextResponse.json({ success: true, parts });
  } catch (error: unknown) {
    console.error('Error fetching parts:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch parts' },
      { status: 500 }
    );
  }
}
