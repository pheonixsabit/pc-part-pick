import { prisma } from '../prisma';
import { ComponentCategory, ScrapedItem } from './types';
import { scrapeStarTechCategory } from './startech';
import { scrapeTechlandCategory } from './techland';
import { scrapeRyansCategory } from './ryans';
import { normalizeProductName } from './canonical-matcher';

export async function saveScrapedItems(items: ScrapedItem[]): Promise<number> {
  let savedCount = 0;

  for (const item of items) {
    if (!item.name || !item.price || item.price <= 0) continue;

    try {
      const { cleanName, canonicalSlug } = normalizeProductName(item.name);

      // Find or create master Product
      const product = await prisma.product.upsert({
        where: { slug: canonicalSlug },
        update: {
          // Update spec details if missing
          socket: item.socket || undefined,
          ramType: item.ramType || undefined,
          formFactor: item.formFactor || undefined,
          tdpWatts: item.tdpWatts || undefined,
          recommendedPsu: item.recommendedPsu || undefined,
          hasIgpu: item.hasIgpu !== undefined ? item.hasIgpu : undefined,
          imageUrl: item.imageUrl || undefined,
        },
        create: {
          name: cleanName,
          slug: canonicalSlug,
          category: item.category,
          socket: item.socket,
          ramType: item.ramType,
          formFactor: item.formFactor,
          tdpWatts: item.tdpWatts,
          recommendedPsu: item.recommendedPsu,
          hasIgpu: item.hasIgpu || false,
          imageUrl: item.imageUrl,
          specsJson: item.rawSpecs ? JSON.stringify(item.rawSpecs) : null,
        },
      });

      // Upsert RetailerPrice
      await prisma.retailerPrice.upsert({
        where: {
          productId_retailer: {
            productId: product.id,
            retailer: item.retailer,
          },
        },
        update: {
          retailerName: item.name,
          price: item.price,
          regularPrice: item.regularPrice || null,
          url: item.url,
          imageUrl: item.imageUrl || null,
          inStock: item.inStock,
          lastChecked: new Date(),
        },
        create: {
          productId: product.id,
          retailer: item.retailer,
          retailerName: item.name,
          price: item.price,
          regularPrice: item.regularPrice || null,
          url: item.url,
          imageUrl: item.imageUrl || null,
          inStock: item.inStock,
          lastChecked: new Date(),
        },
      });

      savedCount++;
    } catch (err: unknown) {
      console.error(`Error saving item ${item.name}:`, err instanceof Error ? err.message : String(err));
    }
  }

  return savedCount;
}

export async function crawlCategory(category: ComponentCategory): Promise<{
  category: ComponentCategory;
  startechCount: number;
  techlandCount: number;
  ryansCount: number;
  totalSaved: number;
}> {
  console.log(`[Crawler] Starting crawl for category: ${category}...`);

  // Parallel fetch from Star Tech and Techland
  const [startechItems, techlandItems, ryansItems] = await Promise.all([
    scrapeStarTechCategory(category, 1).catch((e) => {
      console.error(`StarTech crawl failed for ${category}:`, e.message);
      return [] as ScrapedItem[];
    }),
    scrapeTechlandCategory(category, 1).catch((e) => {
      console.error(`Techland crawl failed for ${category}:`, e.message);
      return [] as ScrapedItem[];
    }),
    scrapeRyansCategory(category, 1).catch((e) => {
      console.error(`Ryans crawl failed for ${category}:`, e.message);
      return [] as ScrapedItem[];
    }),
  ]);

  const allItems = [...startechItems, ...techlandItems, ...ryansItems];
  const totalSaved = await saveScrapedItems(allItems);

  console.log(
    `[Crawler] Finished ${category}: StarTech (${startechItems.length}), TechLand (${techlandItems.length}), Ryans (${ryansItems.length}) -> ${totalSaved} saved.`
  );

  return {
    category,
    startechCount: startechItems.length,
    techlandCount: techlandItems.length,
    ryansCount: ryansItems.length,
    totalSaved,
  };
}

export async function crawlAllCategories() {
  const categories: ComponentCategory[] = [
    'CPU',
    'MOTHERBOARD',
    'RAM',
    'STORAGE',
    'GPU',
    'PSU',
    'CASING',
    'COOLER',
    'MONITOR',
  ];

  const results = [];
  for (const cat of categories) {
    const res = await crawlCategory(cat);
    results.push(res);
  }
  return results;
}
