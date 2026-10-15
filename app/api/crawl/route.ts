import { NextResponse } from 'next/server';
import { crawlCategory, crawlAllCategories } from '@/lib/scrapers/crawler-service';
import { ComponentCategory } from '@/lib/scrapers/types';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as ComponentCategory | null;

    if (category) {
      const result = await crawlCategory(category);
      return NextResponse.json({ success: true, result });
    } else {
      const results = await crawlAllCategories();
      return NextResponse.json({ success: true, results });
    }
  } catch (error: unknown) {
    console.error('Crawl API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Crawl failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const productCount = await prisma.product.count();
    const priceCount = await prisma.retailerPrice.count();
    const starTechCount = await prisma.retailerPrice.count({ where: { retailer: 'STAR_TECH' } });
    const techlandCount = await prisma.retailerPrice.count({ where: { retailer: 'TECHLAND' } });
    const ryansCount = await prisma.retailerPrice.count({ where: { retailer: 'RYANS' } });

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: productCount,
        totalListings: priceCount,
        retailers: {
          starTech: starTechCount,
          techland: techlandCount,
          ryans: ryansCount,
        },
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Stats query failed' },
      { status: 500 }
    );
  }
}
