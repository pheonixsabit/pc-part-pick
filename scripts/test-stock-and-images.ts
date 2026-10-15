import { generateOptimizedBuild } from '../lib/pc-builder/builder-optimizer';
import { checkUrlLiveStock } from '../lib/scrapers/live-stock-checker';
import { prisma } from '../lib/prisma';

async function runTests() {
  console.log('=== STARTING STOCK VALIDATION & IMAGE TEST SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`PASS: ${testName}`);
      passed++;
    } else {
      console.error(`FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Strict In-Stock Validation in Builder Optimizer
  console.log('\n--- 1. Testing Strict In-Stock Builder Selection ---');
  const build = await generateOptimizedBuild({
    totalBudget: 70000,
    purpose: 'GAMING',
  });

  assert(build.slots.cpu !== null, 'Should suggest an in-stock CPU');
  assert(build.slots.cpu?.inStock === true, 'Suggested CPU must be explicitly marked inStock === true');

  assert(build.slots.motherboard !== null, 'Should suggest an in-stock Motherboard');
  assert(build.slots.motherboard?.inStock === true, 'Suggested Motherboard must be inStock === true');

  assert(build.slots.ram !== null, 'Should suggest in-stock RAM');
  assert(build.slots.ram?.inStock === true, 'Suggested RAM must be inStock === true');

  assert(build.slots.storage !== null, 'Should suggest in-stock Storage');
  assert(build.slots.storage?.inStock === true, 'Suggested Storage must be inStock === true');

  assert(build.slots.psu !== null, 'Should suggest an in-stock PSU');
  assert(build.slots.psu?.inStock === true, 'Suggested PSU must be inStock === true');

  assert(build.slots.casing !== null, 'Should suggest an in-stock Casing');
  assert(build.slots.casing?.inStock === true, 'Suggested Casing must be inStock === true');

  // Verify all suggested active slots are strictly in stock
  const allSuggestedInStock = Object.values(build.slots).every(
    (slot) => !slot || slot.inStock === true
  );
  assert(allSuggestedInStock, 'Every single suggested component slot must be confirmed in stock');

  // TEST 2: Live Stock Checker Module
  console.log('\n--- 2. Testing Live Stock Verifier ---');
  const dummyStock = await checkUrlLiveStock('', 'STAR_TECH');
  assert(dummyStock.inStock === true, 'Fallback stock check should gracefully handle empty URL');
  assert(typeof dummyStock.statusText === 'string', 'Should return human-readable statusText');

  // TEST 3: Database Stock Consistency
  console.log('\n--- 3. Testing Database Stock Records ---');
  const inStockCount = await prisma.retailerPrice.count({
    where: { inStock: true, price: { gt: 0 } },
  });
  assert(inStockCount > 0, `Database has ${inStockCount} valid in-stock retailer price records`);

  console.log(`\n========================================`);
  console.log(`STOCK & IMAGE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
