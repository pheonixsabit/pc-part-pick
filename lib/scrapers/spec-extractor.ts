import { ComponentCategory, ScrapedItem } from './types';

export function enrichComponentSpecs(
  item: Omit<ScrapedItem, 'socket' | 'ramType' | 'formFactor' | 'tdpWatts' | 'recommendedPsu' | 'hasIgpu'>
): ScrapedItem {
  const text = `${item.name} ${(item.rawSpecs || []).join(' ')}`.toLowerCase();

  let socket: string | undefined;
  let ramType: string | undefined;
  let formFactor: string | undefined;
  let tdpWatts: number | undefined;
  let recommendedPsu: number | undefined;
  let hasIgpu: boolean = false;

  // Socket Detection
  if (text.includes('am5') || text.includes('socket am5')) {
    socket = 'AM5';
  } else if (text.includes('am4') || text.includes('socket am4')) {
    socket = 'AM4';
  } else if (text.includes('lga 1700') || text.includes('lga1700') || text.includes('1700 socket')) {
    socket = 'LGA1700';
  } else if (text.includes('lga 1851') || text.includes('lga1851')) {
    socket = 'LGA1851';
  } else if (text.includes('lga 1200') || text.includes('lga1200')) {
    socket = 'LGA1200';
  }

  // RAM Type Detection
  if (text.includes('ddr5')) {
    ramType = 'DDR5';
  } else if (text.includes('ddr4')) {
    ramType = 'DDR4';
  } else if (text.includes('ddr3')) {
    ramType = 'DDR3';
  }

  // Form Factor Detection
  if (text.includes('mini-itx') || text.includes('mini itx') || text.includes('itx')) {
    formFactor = 'Mini-ITX';
  } else if (text.includes('micro-atx') || text.includes('micro atx') || text.includes('matx') || text.includes('m-atx')) {
    formFactor = 'Micro-ATX';
  } else if (text.includes('e-atx') || text.includes('eatx')) {
    formFactor = 'E-ATX';
  } else if (text.includes('atx')) {
    formFactor = 'ATX';
  }

  // Category specific logic
  if (item.category === 'CPU') {
    // Check iGPU
    const nameLower = item.name.toLowerCase();
    // AMD Ryzen G series
    if (/\b\d{4}g\b/.test(nameLower) || nameLower.includes('vega') || nameLower.includes('radeon graphics')) {
      hasIgpu = true;
    } else if (nameLower.includes('intel') || nameLower.includes('core i3') || nameLower.includes('core i5') || nameLower.includes('core i7') || nameLower.includes('core i9')) {
      // Intel without 'f' has UHD/Iris iGPU
      if (!/\bi[3579]-\d{4,5}f\b/.test(nameLower) && !nameLower.includes(' f ') && !nameLower.endsWith('f processor')) {
        hasIgpu = true;
      }
    } else if (nameLower.includes('ryzen 7000') || nameLower.includes('ryzen 9000') || socket === 'AM5') {
      // AM5 CPUs (7000/9000) have basic 2CU RDNA2 iGPU for display output
      hasIgpu = true;
    }

    // Default TDP
    if (text.includes('65w') || text.includes('tdp 65')) {
      tdpWatts = 65;
    } else if (text.includes('105w') || text.includes('tdp 105')) {
      tdpWatts = 105;
    } else if (text.includes('125w') || text.includes('tdp 125')) {
      tdpWatts = 125;
    } else if (text.includes('170w')) {
      tdpWatts = 170;
    } else {
      tdpWatts = 65; // standard modern default
    }
  }

  if (item.category === 'GPU') {
    const nameLower = item.name.toLowerCase();
    if (nameLower.includes('4090') || nameLower.includes('7900 xtx')) {
      recommendedPsu = 850;
      tdpWatts = 450;
    } else if (nameLower.includes('4080') || nameLower.includes('7900 xt')) {
      recommendedPsu = 750;
      tdpWatts = 320;
    } else if (nameLower.includes('4070 ti') || nameLower.includes('7800 xt')) {
      recommendedPsu = 700;
      tdpWatts = 285;
    } else if (nameLower.includes('4070') || nameLower.includes('7700 xt') || nameLower.includes('3070')) {
      recommendedPsu = 650;
      tdpWatts = 200;
    } else if (nameLower.includes('4060 ti') || nameLower.includes('6700 xt') || nameLower.includes('3060 ti')) {
      recommendedPsu = 600;
      tdpWatts = 165;
    } else if (nameLower.includes('4060') || nameLower.includes('7600') || nameLower.includes('3060') || nameLower.includes('6600')) {
      recommendedPsu = 550;
      tdpWatts = 130;
    } else if (nameLower.includes('1650') || nameLower.includes('6500') || nameLower.includes('6400') || nameLower.includes('rx 580') || nameLower.includes('rx 550')) {
      recommendedPsu = 450;
      tdpWatts = 90;
    } else {
      recommendedPsu = 500;
      tdpWatts = 120;
    }
  }

  if (item.category === 'PSU') {
    // Extract Wattage from name (e.g. 550W, 650W, 750W, 850W)
    const match = item.name.match(/(\d{3,4})\s*w(att)?/i);
    if (match) {
      tdpWatts = parseInt(match[1], 10);
    }
  }

  return {
    ...item,
    socket,
    ramType,
    formFactor,
    tdpWatts,
    recommendedPsu,
    hasIgpu,
  };
}
