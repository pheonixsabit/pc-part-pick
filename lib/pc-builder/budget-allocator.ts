export type BuildPurpose = 'GAMING' | 'EDITING' | 'OFFICE' | 'GENERAL';

export interface BudgetConfig {
  totalBudget: number;
  purpose: BuildPurpose;
  includeMonitor?: boolean;
  includePeripherals?: boolean;
}

export interface SlotBudgetShare {
  min: number;
  target: number;
  max: number;
}

export interface BudgetAllocation {
  cpu?: SlotBudgetShare;
  motherboard?: SlotBudgetShare;
  ram?: SlotBudgetShare;
  storage?: SlotBudgetShare;
  gpu?: SlotBudgetShare;
  psu?: SlotBudgetShare;
  casing?: SlotBudgetShare;
  monitor?: SlotBudgetShare;
  strategy: 'DISCRETE_GPU' | 'APU_INTEGRATED';
  explanation: string;
}

export function calculateBudgetAllocation(config: BudgetConfig): BudgetAllocation {
  let effectiveBudget = config.totalBudget;

  // If monitor is included, reserve ~15-20% for monitor
  let monitorShare = 0;
  if (config.includeMonitor) {
    monitorShare = Math.min(18000, Math.max(9000, effectiveBudget * 0.17));
    effectiveBudget -= monitorShare;
  }

  // Strategy decision:
  // In BD market, discrete GPU (even GTX 1650 / RX 6500XT) costs at least ~16,000 - 19,000 BDT.
  // An entire tower requires at least ~55,000 BDT to accommodate a dedicated GPU comfortably.
  const isApuBuild =
    config.purpose === 'OFFICE' ||
    config.purpose === 'GENERAL' ||
    (config.purpose === 'GAMING' && effectiveBudget < 52000) ||
    (config.purpose === 'EDITING' && effectiveBudget < 48000);

  const strategy = isApuBuild ? 'APU_INTEGRATED' : 'DISCRETE_GPU';

  let explanation = '';
  if (isApuBuild && config.purpose === 'GAMING') {
    explanation =
      'Budget Optimization: For budgets under ৳52,000, our algorithm selects a high-performance APU (AMD Ryzen G-Series) with dual-channel high-speed RAM. This avoids low-end bottlenecks, provides smooth esports gaming (VALORANT, CS2, GTA V), and leaves an upgrade path to add a dedicated GPU later!';
  } else if (strategy === 'DISCRETE_GPU') {
    explanation =
      'Performance Optimization: Budget accommodates a dedicated graphics card. Funds are prioritized for maximum GPU and CPU gaming/render performance while preserving full compatibility.';
  } else {
    explanation =
      'Productivity Optimization: Allocated for snappy multi-core processing, fast NVMe SSD storage, and generous RAM with reliable power delivery.';
  }

  const alloc: Record<string, SlotBudgetShare> = {};

  if (strategy === 'DISCRETE_GPU') {
    if (config.purpose === 'GAMING') {
      // GPU focused (36%), CPU (22%), Mobo (12%), RAM (8%), Storage (8%), PSU (8%), Casing (6%)
      alloc.gpu = { min: effectiveBudget * 0.30, target: effectiveBudget * 0.37, max: effectiveBudget * 0.44 };
      alloc.cpu = { min: effectiveBudget * 0.18, target: effectiveBudget * 0.22, max: effectiveBudget * 0.28 };
      alloc.motherboard = { min: effectiveBudget * 0.10, target: effectiveBudget * 0.12, max: effectiveBudget * 0.16 };
      alloc.ram = { min: effectiveBudget * 0.06, target: effectiveBudget * 0.08, max: effectiveBudget * 0.12 };
      alloc.storage = { min: effectiveBudget * 0.06, target: effectiveBudget * 0.08, max: effectiveBudget * 0.12 };
      alloc.psu = { min: effectiveBudget * 0.06, target: effectiveBudget * 0.08, max: effectiveBudget * 0.11 };
      alloc.casing = { min: effectiveBudget * 0.04, target: effectiveBudget * 0.05, max: effectiveBudget * 0.08 };
    } else {
      // Video Editing / 3D: Balance CPU (28%), GPU (28%), RAM (14%), SSD (12%), Mobo (10%), PSU (8%)
      alloc.cpu = { min: effectiveBudget * 0.24, target: effectiveBudget * 0.28, max: effectiveBudget * 0.35 };
      alloc.gpu = { min: effectiveBudget * 0.22, target: effectiveBudget * 0.28, max: effectiveBudget * 0.34 };
      alloc.ram = { min: effectiveBudget * 0.10, target: effectiveBudget * 0.14, max: effectiveBudget * 0.18 };
      alloc.motherboard = { min: effectiveBudget * 0.09, target: effectiveBudget * 0.11, max: effectiveBudget * 0.14 };
      alloc.storage = { min: effectiveBudget * 0.08, target: effectiveBudget * 0.11, max: effectiveBudget * 0.15 };
      alloc.psu = { min: effectiveBudget * 0.06, target: effectiveBudget * 0.08, max: effectiveBudget * 0.11 };
      alloc.casing = { min: effectiveBudget * 0.04, target: effectiveBudget * 0.05, max: effectiveBudget * 0.08 };
    }
  } else {
    // APU / Integrated graphics build: No discrete GPU
    // CPU (32%), Motherboard (20%), RAM (16%), Storage (14%), PSU (10%), Casing (8%)
    alloc.cpu = { min: effectiveBudget * 0.26, target: effectiveBudget * 0.32, max: effectiveBudget * 0.40 };
    alloc.motherboard = { min: effectiveBudget * 0.16, target: effectiveBudget * 0.20, max: effectiveBudget * 0.26 };
    alloc.ram = { min: effectiveBudget * 0.12, target: effectiveBudget * 0.16, max: effectiveBudget * 0.22 };
    alloc.storage = { min: effectiveBudget * 0.10, target: effectiveBudget * 0.14, max: effectiveBudget * 0.20 };
    alloc.psu = { min: effectiveBudget * 0.08, target: effectiveBudget * 0.10, max: effectiveBudget * 0.14 };
    alloc.casing = { min: effectiveBudget * 0.06, target: effectiveBudget * 0.08, max: effectiveBudget * 0.12 };
  }

  if (config.includeMonitor && monitorShare > 0) {
    alloc.monitor = { min: monitorShare * 0.8, target: monitorShare, max: monitorShare * 1.25 };
  }

  return {
    ...alloc,
    strategy,
    explanation,
  };
}
