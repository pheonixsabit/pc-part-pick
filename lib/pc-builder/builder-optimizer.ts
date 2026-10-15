import { prisma } from '../prisma';
import {
  BuildPurpose,
  calculateBudgetAllocation,
  BudgetConfig,
} from './budget-allocator';
import {
  checkBuildCompatibility,
  BuildSlots,
  SelectedPart,
  CompatibilityReport,
} from './compatibility-checker';

interface EnrichedProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  socket: string | null;
  ramType: string | null;
  formFactor: string | null;
  tdpWatts: number | null;
  recommendedPsu: number | null;
  hasIgpu: boolean;
  imageUrl: string | null;
  lowestPrice: number;
  bestRetailer: string;
  storeUrl: string;
  allPrices: {
    retailer: string;
    retailerName: string;
    price: number;
    url: string;
    inStock: boolean;
  }[];
}

async function getAvailableProductsByCategory(category: string): Promise<EnrichedProduct[]> {
  const products = await prisma.product.findMany({
    where: { category },
    include: {
      prices: {
        where: { inStock: true, price: { gt: 0 } },
        orderBy: { price: 'asc' },
      },
    },
  });

  return products
    .filter((p) => p.prices.length > 0 && p.prices.some((pr) => pr.inStock && pr.price > 0))
    .map((p) => {
      const inStockPrices = p.prices.filter((pr) => pr.inStock && pr.price > 0);
      const best = inStockPrices[0] || p.prices[0];
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
        lowestPrice: best.price,
        bestRetailer: best.retailer,
        storeUrl: best.url,
        allPrices: p.prices.map((pr) => ({
          retailer: pr.retailer,
          retailerName: pr.retailerName,
          price: pr.price,
          url: pr.url,
          inStock: pr.inStock,
        })),
      };
    });
}

function findBestFit(
  items: EnrichedProduct[],
  targetPrice: number,
  filterFn?: (item: EnrichedProduct) => boolean
): SelectedPart | null {
  const candidates = filterFn ? items.filter(filterFn) : items;
  if (candidates.length === 0) return null;

  // Find candidate closest to target price that doesn't exceed 1.4x target
  let best = candidates[0];
  let minDiff = Infinity;

  for (const item of candidates) {
    const diff = Math.abs(item.lowestPrice - targetPrice);
    if (diff < minDiff) {
      minDiff = diff;
      best = item;
    }
  }

  return {
    id: best.id,
    name: best.name,
    category: best.category,
    price: best.lowestPrice,
    retailer: best.bestRetailer,
    socket: best.socket,
    ramType: best.ramType,
    formFactor: best.formFactor,
    tdpWatts: best.tdpWatts,
    recommendedPsu: best.recommendedPsu,
    hasIgpu: best.hasIgpu,
    imageUrl: best.imageUrl,
    url: best.storeUrl,
    inStock: true,
  };
}

export interface OptimizedBuildResult {
  slots: BuildSlots;
  totalPrice: number;
  targetBudget: number;
  budgetDifference: number;
  purpose: BuildPurpose;
  strategy: 'DISCRETE_GPU' | 'APU_INTEGRATED';
  explanation: string;
  compatibility: CompatibilityReport;
  retailerBreakdown: {
    retailer: string;
    itemCount: number;
    subtotal: number;
  }[];
}

export async function generateOptimizedBuild(config: BudgetConfig): Promise<OptimizedBuildResult> {
  const allocation = calculateBudgetAllocation(config);

  // 1. Fetch available products in parallel
  const [cpus, motherboards, rams, storages, gpus, psus, casings, monitors] = await Promise.all([
    getAvailableProductsByCategory('CPU'),
    getAvailableProductsByCategory('MOTHERBOARD'),
    getAvailableProductsByCategory('RAM'),
    getAvailableProductsByCategory('STORAGE'),
    getAvailableProductsByCategory('GPU'),
    getAvailableProductsByCategory('PSU'),
    getAvailableProductsByCategory('CASING'),
    config.includeMonitor ? getAvailableProductsByCategory('MONITOR') : Promise.resolve([]),
  ]);

  const slots: BuildSlots = {};

  // Find motherboard sockets and RAM types currently available in stock
  const availableMoboSockets = new Set(
    motherboards.map((m) => m.socket?.toUpperCase()).filter(Boolean)
  );
  const availableRamTypes = new Set(
    rams.map((r) => r.ramType?.toUpperCase()).filter(Boolean)
  );

  // 2. Select CPU
  const cpuTarget = allocation.cpu?.target || 12000;
  const isApuStrategy = allocation.strategy === 'APU_INTEGRATED';

  slots.cpu = findBestFit(cpus, cpuTarget, (c) => {
    if (isApuStrategy && !c.hasIgpu) return false;
    // Ensure we have a compatible motherboard in stock for this CPU
    if (c.socket && availableMoboSockets.size > 0 && !availableMoboSockets.has(c.socket.toUpperCase())) {
      return false;
    }
    return true;
  });

  // If no CPU matched the strict filter, fallback
  if (!slots.cpu && cpus.length > 0) {
    slots.cpu = findBestFit(cpus, cpuTarget, (c) => {
      if (c.socket && availableMoboSockets.size > 0) {
        return availableMoboSockets.has(c.socket.toUpperCase());
      }
      return true;
    }) || findBestFit(cpus, cpuTarget);
  }

  // 3. Select Motherboard strictly compatible with CPU socket
  const moboTarget = allocation.motherboard?.target || 9000;
  const cpuSocket = slots.cpu?.socket;

  slots.motherboard = findBestFit(motherboards, moboTarget, (m) => {
    if (cpuSocket && m.socket) {
      if (m.socket.toUpperCase() !== cpuSocket.toUpperCase()) return false;
    }
    if (m.ramType && availableRamTypes.size > 0 && !availableRamTypes.has(m.ramType.toUpperCase())) {
      return false;
    }
    return true;
  });

  // 4. Select RAM compatible with Motherboard ramType
  const ramTarget = allocation.ram?.target || 5000;
  const moboRamType = slots.motherboard?.ramType;

  slots.ram = findBestFit(rams, ramTarget, (r) => {
    if (moboRamType && r.ramType) {
      return r.ramType.toUpperCase() === moboRamType.toUpperCase();
    }
    return true;
  });

  if (!slots.ram && rams.length > 0) {
    slots.ram = findBestFit(rams, ramTarget);
  }

  // 5. Select GPU (if discrete strategy)
  if (allocation.strategy === 'DISCRETE_GPU') {
    const gpuTarget = allocation.gpu?.target || 25000;
    slots.gpu = findBestFit(gpus, gpuTarget);
  }

  // 6. Select Storage (SSD)
  const storageTarget = allocation.storage?.target || 4500;
  slots.storage = findBestFit(storages, storageTarget);

  // 7. Select PSU (ensuring enough wattage)
  const psuTarget = allocation.psu?.target || 4000;
  const currentEstWattage =
    (slots.cpu?.tdpWatts || 65) + (slots.gpu?.tdpWatts || 0) + 80;
  const minPsuWatts = Math.max(slots.gpu?.recommendedPsu || 450, currentEstWattage * 1.25);

  slots.psu = findBestFit(psus, psuTarget, (p) => {
    return (p.tdpWatts || 450) >= minPsuWatts;
  });

  if (!slots.psu && psus.length > 0) {
    slots.psu = findBestFit(psus, psuTarget);
  }

  // 8. Select Casing
  const caseTarget = allocation.casing?.target || 3500;
  const moboFormFactor = slots.motherboard?.formFactor;

  slots.casing = findBestFit(casings, caseTarget, (c) => {
    if (moboFormFactor === 'ATX') {
      return c.formFactor !== 'Micro-ATX' && c.formFactor !== 'Mini-ITX';
    }
    return true;
  });

  if (!slots.casing && casings.length > 0) {
    slots.casing = findBestFit(casings, caseTarget);
  }

  // 9. Select Monitor (if requested)
  if (config.includeMonitor && monitors.length > 0) {
    const monitorTarget = allocation.monitor?.target || 12000;
    slots.monitor = findBestFit(monitors, monitorTarget);
  }

  // Calculate totals and retailer breakdown
  let totalPrice = 0;
  const retailerMap: Record<string, { count: number; subtotal: number }> = {};

  const activeSlots = Object.values(slots).filter((p): p is SelectedPart => !!p);
  for (const part of activeSlots) {
    totalPrice += part.price;
    if (!retailerMap[part.retailer]) {
      retailerMap[part.retailer] = { count: 0, subtotal: 0 };
    }
    retailerMap[part.retailer].count += 1;
    retailerMap[part.retailer].subtotal += part.price;
  }

  const retailerBreakdown = Object.entries(retailerMap).map(([retailer, stats]) => ({
    retailer,
    itemCount: stats.count,
    subtotal: stats.subtotal,
  }));

  const compatibility = checkBuildCompatibility(slots);

  return {
    slots,
    totalPrice,
    targetBudget: config.totalBudget,
    budgetDifference: totalPrice - config.totalBudget,
    purpose: config.purpose,
    strategy: allocation.strategy,
    explanation: allocation.explanation,
    compatibility,
    retailerBreakdown,
  };
}
