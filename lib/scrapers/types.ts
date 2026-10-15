export type RetailerId = 'STAR_TECH' | 'UCC_BD' | 'RYANS';

export type ComponentCategory =
  | 'CPU'
  | 'MOTHERBOARD'
  | 'RAM'
  | 'STORAGE'
  | 'GPU'
  | 'PSU'
  | 'CASING'
  | 'COOLER'
  | 'MONITOR';

export interface ScrapedItem {
  retailer: RetailerId;
  name: string;
  category: ComponentCategory;
  price: number;
  regularPrice?: number;
  url: string;
  imageUrl?: string;
  inStock: boolean;
  rawSpecs?: string[];
  // Normalized hardware specs for compatibility:
  socket?: string;
  ramType?: string;
  formFactor?: string;
  tdpWatts?: number;
  recommendedPsu?: number;
  hasIgpu?: boolean;
}

export interface ScrapeResult {
  retailer: RetailerId;
  category?: ComponentCategory;
  items: ScrapedItem[];
  error?: string;
}
