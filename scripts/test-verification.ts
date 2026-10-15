import { checkBuildCompatibility, BuildSlots } from '../lib/pc-builder/compatibility-checker';
import { calculateBudgetAllocation } from '../lib/pc-builder/budget-allocator';
import { generateOptimizedBuild } from '../lib/pc-builder/builder-optimizer';
import { prisma } from '../lib/prisma';

async function runTests() {
  console.log('=== STARTING AUTOMATED PLATFORM VERIFICATION ===\n');

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

  // TEST 1: Compatibility Engine - Socket Mismatch
  console.log('\n--- 1. Testing Socket Compatibility ---');
  const socketMismatchBuild: BuildSlots = {
    cpu: {
      id: '1',
      name: 'AMD Ryzen 5 5600',
      category: 'CPU',
      price: 12200,
      retailer: 'STAR_TECH',
      socket: 'AM4',
      tdpWatts: 65,
    },
    motherboard: {
      id: '2',
      name: 'ASUS PRIME B650M-A',
      category: 'MOTHERBOARD',
      price: 19800,
      retailer: 'STAR_TECH',
      socket: 'AM5',
      ramType: 'DDR5',
    },
  };
  const socketReport = checkBuildCompatibility(socketMismatchBuild);
  assert(!socketReport.isCompatible, 'AM4 CPU + AM5 Motherboard should be flagged incompatible');
  assert(
    socketReport.issues.some((i) => i.message.includes('Socket Mismatch')),
    'Should contain "Socket Mismatch" error message'
  );

  // TEST 2: Compatibility Engine - RAM Generation Mismatch
  console.log('\n--- 2. Testing RAM Generation Compatibility ---');
  const ramMismatchBuild: BuildSlots = {
    motherboard: {
      id: '2',
      name: 'MSI B550M PRO-VDH',
      category: 'MOTHERBOARD',
      price: 12800,
      retailer: 'STAR_TECH',
      socket: 'AM4',
      ramType: 'DDR4',
    },
    ram: {
      id: '3',
      name: 'Corsair Vengeance 32GB DDR5',
      category: 'RAM',
      price: 13500,
      retailer: 'STAR_TECH',
      ramType: 'DDR5',
    },
  };
  const ramReport = checkBuildCompatibility(ramMismatchBuild);
  assert(!ramReport.isCompatible, 'DDR4 Motherboard + DDR5 RAM should be flagged incompatible');
  assert(
    ramReport.issues.some((i) => i.message.includes('RAM Incompatible')),
    'Should contain "RAM Incompatible" error message'
  );

  // TEST 3: Compatibility Engine - Display Output & Missing iGPU Check
  console.log('\n--- 3. Testing Missing iGPU Display Warning ---');
  const missingIgpuBuild: BuildSlots = {
    cpu: {
      id: '1',
      name: 'Intel Core i5-12400F',
      category: 'CPU',
      price: 13800,
      retailer: 'STAR_TECH',
      socket: 'LGA1700',
      hasIgpu: false,
    },
    // No GPU provided!
  };
  const igpuReport = checkBuildCompatibility(missingIgpuBuild);
  assert(!igpuReport.isCompatible, 'CPU without iGPU and no dedicated GPU must be flagged');
  assert(
    igpuReport.issues.some((i) => i.message.includes('Display Output Missing')),
    'Should flag missing display output warning'
  );

  // TEST 4: Compatibility Engine - PSU Wattage Safety Margin
  console.log('\n--- 4. Testing PSU Power Headroom Check ---');
  const underpoweredPsuBuild: BuildSlots = {
    cpu: {
      id: '1',
      name: 'Intel Core i7-14700K',
      category: 'CPU',
      price: 42000,
      retailer: 'STAR_TECH',
      tdpWatts: 250,
      hasIgpu: true,
    },
    gpu: {
      id: '2',
      name: 'GeForce RTX 4070 SUPER',
      category: 'GPU',
      price: 79500,
      retailer: 'STAR_TECH',
      tdpWatts: 220,
      recommendedPsu: 650,
    },
    psu: {
      id: '3',
      name: 'Basic 450W PSU',
      category: 'PSU',
      price: 3500,
      retailer: 'STAR_TECH',
      tdpWatts: 450,
    },
  };
  const psuReport = checkBuildCompatibility(underpoweredPsuBuild);
  assert(
    psuReport.issues.some((i) => i.severity === 'error' || i.severity === 'warning'),
    '450W PSU with 250W CPU + 220W GPU must trigger PSU inadequacy warning'
  );

  // TEST 5: Budget Allocator - Smart APU Fallback for Low Budget
  console.log('\n--- 5. Testing Budget Allocator Strategy & APU Fallback ---');
  const lowBudgetGaming = calculateBudgetAllocation({ totalBudget: 40000, purpose: 'GAMING' });
  assert(lowBudgetGaming.strategy === 'APU_INTEGRATED', '40k Gaming budget must activate APU strategy');

  const midBudgetGaming = calculateBudgetAllocation({ totalBudget: 75000, purpose: 'GAMING' });
  assert(midBudgetGaming.strategy === 'DISCRETE_GPU', '75k Gaming budget must activate Discrete GPU strategy');

  // TEST 6: Build Optimizer End-to-End
  console.log('\n--- 6. Testing End-to-End Build Optimizer ---');
  const gaming65k = await generateOptimizedBuild({ totalBudget: 65000, purpose: 'GAMING' });
  assert(gaming65k.totalPrice > 0, `Total price generated: ${gaming65k.totalPrice} BDT`);
  assert(gaming65k.slots.cpu !== null, 'Optimal build must include CPU');
  assert(gaming65k.slots.motherboard !== null, 'Optimal build must include Motherboard');
  assert(gaming65k.slots.ram !== null, 'Optimal build must include RAM');
  assert(gaming65k.slots.storage !== null, 'Optimal build must include Storage');
  assert(gaming65k.slots.psu !== null, 'Optimal build must include PSU');
  assert(gaming65k.slots.casing !== null, 'Optimal build must include Casing');
  assert(gaming65k.compatibility.isCompatible, 'Generated 65k build must pass compatibility with 0 errors');
  assert(gaming65k.retailerBreakdown.length > 0, 'Must have retailer breakdown stats');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
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
