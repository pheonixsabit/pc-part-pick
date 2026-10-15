export interface SelectedPart {
  id: string;
  name: string;
  category: string;
  price: number;
  retailer: string;
  socket?: string | null;
  ramType?: string | null;
  formFactor?: string | null;
  tdpWatts?: number | null;
  recommendedPsu?: number | null;
  hasIgpu?: boolean | null;
  imageUrl?: string | null;
  url?: string | null;
}

export type BuildSlots = {
  cpu?: SelectedPart | null;
  motherboard?: SelectedPart | null;
  ram?: SelectedPart | null;
  storage?: SelectedPart | null;
  gpu?: SelectedPart | null;
  psu?: SelectedPart | null;
  casing?: SelectedPart | null;
  cooler?: SelectedPart | null;
  monitor?: SelectedPart | null;
};

export interface CompatibilityIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  componentKeys: (keyof BuildSlots)[];
}

export interface CompatibilityReport {
  isCompatible: boolean;
  issues: CompatibilityIssue[];
  estimatedWattage: number;
  recommendedPsuWattage: number;
}

export function checkBuildCompatibility(build: BuildSlots): CompatibilityReport {
  const issues: CompatibilityIssue[] = [];

  // 1. Calculate Estimated System Wattage
  const cpuWatts = build.cpu?.tdpWatts || 65;
  const gpuWatts = build.gpu?.tdpWatts || 0;
  const baseSystemWatts = 80; // Motherboard, RAM, Fans, SSDs
  const estimatedWattage = cpuWatts + gpuWatts + baseSystemWatts;
  const recommendedPsuWattage = Math.max(
    build.gpu?.recommendedPsu || 450,
    Math.ceil((estimatedWattage * 1.3) / 50) * 50
  );

  // 2. CPU and Motherboard Socket Check
  if (build.cpu && build.motherboard) {
    const cpuSocket = build.cpu.socket?.toUpperCase();
    const moboSocket = build.motherboard.socket?.toUpperCase();

    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
      issues.push({
        severity: 'error',
        message: `Socket Mismatch: CPU has socket ${cpuSocket}, but Motherboard has socket ${moboSocket}. These parts are physically incompatible.`,
        componentKeys: ['cpu', 'motherboard'],
      });
    }
  }

  // 3. Motherboard and RAM Generation Check
  if (build.motherboard && build.ram) {
    const moboRam = build.motherboard.ramType?.toUpperCase();
    const ramType = build.ram.ramType?.toUpperCase();

    if (moboRam && ramType && moboRam !== ramType) {
      issues.push({
        severity: 'error',
        message: `RAM Incompatible: Motherboard requires ${moboRam} memory, but selected RAM is ${ramType}.`,
        componentKeys: ['motherboard', 'ram'],
      });
    }
  }

  // 4. Integrated Graphics vs Dedicated GPU Check
  if (build.cpu && !build.gpu) {
    if (!build.cpu.hasIgpu) {
      issues.push({
        severity: 'error',
        message: `Display Output Missing: ${build.cpu.name} lacks integrated graphics (no iGPU) and no dedicated graphics card is selected. The PC will not output any display. Choose a processor with iGPU (like AMD G-series or non-F Intel) or add a graphics card.`,
        componentKeys: ['cpu', 'gpu'],
      });
    } else {
      issues.push({
        severity: 'info',
        message: `Using Integrated Graphics: The build relies on the CPU's built-in GPU (${build.cpu.name}). Ideal for office, programming, or budget light gaming.`,
        componentKeys: ['cpu'],
      });
    }
  }

  // 5. PSU Wattage Headroom Check
  if (build.psu) {
    const psuWattage = build.psu.tdpWatts || 450;
    if (psuWattage < estimatedWattage) {
      issues.push({
        severity: 'error',
        message: `Underpowered PSU: The system's estimated power draw is ~${estimatedWattage}W, but the selected power supply is only ${psuWattage}W. The system will likely shut down under load.`,
        componentKeys: ['psu', 'gpu', 'cpu'],
      });
    } else if (psuWattage < recommendedPsuWattage) {
      issues.push({
        severity: 'warning',
        message: `Low PSU Headroom: Selected PSU is ${psuWattage}W, while the recommended wattage for stable operation with transient power spikes is ${recommendedPsuWattage}W.`,
        componentKeys: ['psu'],
      });
    }
  }

  // 6. Motherboard & Case Form Factor Compatibility
  if (build.motherboard && build.casing) {
    const moboFF = build.motherboard.formFactor?.toUpperCase();
    const caseFF = build.casing.formFactor?.toUpperCase();

    // Standard containment: E-ATX case fits all, ATX case fits ATX/mATX/ITX, mATX fits mATX/ITX, ITX fits only ITX
    if (caseFF === 'MINI-ITX' && moboFF && moboFF !== 'MINI-ITX') {
      issues.push({
        severity: 'error',
        message: `Form Factor Mismatch: ${build.motherboard.name} (${moboFF}) is too large to fit in a Mini-ITX case (${build.casing.name}).`,
        componentKeys: ['motherboard', 'casing'],
      });
    } else if (caseFF === 'MICRO-ATX' && moboFF === 'ATX') {
      issues.push({
        severity: 'error',
        message: `Form Factor Mismatch: Standard ATX motherboard cannot fit into a Micro-ATX casing.`,
        componentKeys: ['motherboard', 'casing'],
      });
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error');

  return {
    isCompatible: !hasErrors,
    issues,
    estimatedWattage,
    recommendedPsuWattage,
  };
}
