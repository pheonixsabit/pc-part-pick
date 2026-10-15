import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeStarTechSearch } from '@/lib/scrapers/startech';
import { saveScrapedItems } from '@/lib/scrapers/crawler-service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim();
    const retailer = searchParams.get('retailer')?.trim();
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const inStockOnly = searchParams.get('inStock') === 'true';
    const sort = searchParams.get('sort') || 'price_asc';

    const where: Record<string, unknown> = {};

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { slug: { contains: query.toLowerCase() } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    // Fetch master products matching query and category
    let products = await prisma.product.findMany({
      where,
      include: {
        prices: {
          where: {
            price: {
              gte: minPrice || 0,
              lte: maxPrice || 9999999,
            },
            ...(retailer && retailer !== 'ALL' ? { retailer } : {}),
            ...(inStockOnly ? { inStock: true } : {}),
          },
          orderBy: { price: 'asc' },
        },
      },
    });

    // If query was provided and local results are sparse (< 2 items),
    // trigger a quick live Star Tech search to augment results
    if (query && products.length === 0) {
      try {
        const liveItems = await scrapeStarTechSearch(query);
        if (liveItems.length > 0) {
          await saveScrapedItems(liveItems);
          // Refetch with newly saved items
          products = await prisma.product.findMany({
            where,
            include: {
              prices: {
                where: {
                  price: {
                    gte: minPrice || 0,
                    lte: maxPrice || 9999999,
                  },
                  ...(retailer && retailer !== 'ALL' ? { retailer } : {}),
                  ...(inStockOnly ? { inStock: true } : {}),
                },
                orderBy: { price: 'asc' },
              },
            },
          });
        }
      } catch (liveErr) {
        console.warn('Live search fallback error:', liveErr);
      }
    }

    // Flatten to comparative listings or product groups
    const results = products
      .filter((p) => p.prices.length > 0)
      .map((p) => {
        const lowestPrice = Math.min(...p.prices.map((pr) => pr.price));
        const highestPrice = Math.max(...p.prices.map((pr) => pr.price));
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category,
          socket: p.socket,
          ramType: p.ramType,
          formFactor: p.formFactor,
          imageUrl: p.imageUrl || p.prices[0]?.imageUrl,
          lowestPrice,
          highestPrice,
          hasMultiRetailer: p.prices.length > 1,
          retailerPrices: p.prices.map((pr) => ({
            id: pr.id,
            retailer: pr.retailer,
            retailerName: pr.retailerName,
            price: pr.price,
            regularPrice: pr.regularPrice,
            url: pr.url,
            imageUrl: pr.imageUrl,
            inStock: pr.inStock,
            lastChecked: pr.lastChecked,
          })),
        };
      });

    // Sorting
    if (sort === 'price_asc') {
      results.sort((a, b) => a.lowestPrice - b.lowestPrice);
    } else if (sort === 'price_desc') {
      results.sort((a, b) => b.lowestPrice - a.lowestPrice);
    } else if (sort === 'name_asc') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      results,
    });
  } catch (error: unknown) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
