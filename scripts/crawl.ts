import { crawlCategory } from '../lib/scrapers/crawler-service';
import { ComponentCategory } from '../lib/scrapers/types';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('=== Starting Bangladesh PC Part Scraper ===\n');

  const categories: ComponentCategory[] = [
    'CPU',
    'MOTHERBOARD',
    'RAM',
    'STORAGE',
    'GPU',
    'PSU',
    'CASING',
    'MONITOR',
  ];

  for (const cat of categories) {
    try {
      console.log(`\n--- Crawling ${cat} ---`);
      const res = await crawlCategory(cat);
      console.log(
        `✓ ${cat}: StarTech (${res.startechCount}), UCC BD (${res.uccCount}), Ryans (${res.ryansCount}) -> Total Saved: ${res.totalSaved}`
      );
    } catch (err: unknown) {
      console.error(`✗ Error crawling ${cat}:`, err instanceof Error ? err.message : String(err));
    }
  }

  const totalProducts = await prisma.product.count();
  const totalPrices = await prisma.retailerPrice.count();

  console.log('\n=======================================');
  console.log(`Crawl Complete!`);
  console.log(`Total Products in Database: ${totalProducts}`);
  console.log(`Total Retailer Listings: ${totalPrices}`);
  console.log('=======================================\n');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
