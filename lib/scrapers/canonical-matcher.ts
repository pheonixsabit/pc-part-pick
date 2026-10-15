import { slugify } from '../utils';

/**
 * Normalizes retailer product titles so that identical components
 * from Star Tech, UCC BD, and Ryans link to the same master product.
 */
export function normalizeProductName(rawName: string): { cleanName: string; canonicalSlug: string } {
  let clean = rawName
    // Remove retailer-specific buzzwords
    .replace(/\b(processor|desktop processor|gaming processor)\b/gi, 'Processor')
    .replace(/\b(graphics card|gaming graphics card|gpu)\b/gi, 'Graphics Card')
    .replace(/\b(motherboard|gaming motherboard)\b/gi, 'Motherboard')
    .replace(/\b(power supply|power supply unit|psu)\b/gi, 'Power Supply')
    .replace(/\b(gaming casing|casing|desktop casing)\b/gi, 'Casing')
    .replace(/\s+/g, ' ')
    .trim();

  // Create a normalized key for matching
  // E.g. "AMD Ryzen 5 5600 Processor" and "AMD Ryzen 5 5600 6-Core Processor"
  // will share the core model tokens
  const keyTokens = clean
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter((token) => !['desktop', 'gaming', 'edition', 'box', 'tray', 'pack'].includes(token));

  const canonicalSlug = slugify(keyTokens.slice(0, 7).join('-'));

  return { cleanName: clean, canonicalSlug };
}
