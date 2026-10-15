import * as cheerio from 'cheerio';
import { fetchHtml } from './http-client';
import { ComponentCategory, ScrapedItem } from './types';
import { parseBDT } from '../utils';
import { enrichComponentSpecs } from './spec-extractor';

export const TECHLAND_CATEGORY_URLS: Record<ComponentCategory, string> = {
  CPU: 'https://www.techlandbd.com/pc-components/processor',
  MOTHERBOARD: 'https://www.techlandbd.com/pc-components/motherboard',
  RAM: 'https://www.techlandbd.com/pc-components/ram',
  STORAGE: 'https://www.techlandbd.com/pc-components/storage-ssd-hdd',
  GPU: 'https://www.techlandbd.com/pc-components/graphics-card',
  PSU: 'https://www.techlandbd.com/pc-components/power-supply',
  CASING: 'https://www.techlandbd.com/pc-components/casing',
  COOLER: 'https://www.techlandbd.com/pc-components/cpu-cooler',
  MONITOR: 'https://www.techlandbd.com/monitors',
};

export async function scrapeTechlandCategory(category: ComponentCategory, page: number = 1): Promise<ScrapedItem[]> {
  const baseUrl = TECHLAND_CATEGORY_URLS[category];
  const url = page > 1 ? `${baseUrl}?page=${page}` : baseUrl;
  return scrapeTechlandUrl(url, category);
}

export async function scrapeTechlandUrl(url: string, category: ComponentCategory): Promise<ScrapedItem[]> {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    // Techland cards have .v2-card-title
    $('.v2-card-title').each((_, titleEl) => {
      const $title = $(titleEl);
      const name = $title.text().trim();
      const $card = $title.closest('div.bg-white, div.group, div.relative');

      // Find link
      let productUrl = $title.parent('a').attr('href') || $card.find('a[href*="techlandbd.com/"]').attr('href') || '';
      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = `https://www.techlandbd.com${productUrl}`;
      }

      // Find image
      const imageUrl = $card.find('img').attr('src') || '';

      // Find prices
      const priceText = $card.find('.text-red-600, .bengali-text').first().text();
      const oldPriceText = $card.find('.line-through').text();

      const price = parseBDT(priceText);
      const regularPrice = oldPriceText ? parseBDT(oldPriceText) : undefined;

      // Extract specs from lists
      const rawSpecs: string[] = [];
      $card.find('ul li').each((_, li) => {
        const text = $(li).text().trim();
        if (text) rawSpecs.push(text);
      });

      const inStock = price > 0 && !$card.text().toLowerCase().includes('out of stock');

      if (name && price > 0 && productUrl) {
        const enriched = enrichComponentSpecs({
          retailer: 'TECHLAND',
          name,
          category,
          price,
          regularPrice,
          url: productUrl,
          imageUrl,
          inStock,
          rawSpecs,
        });
        items.push(enriched);
      }
    });

    return items;
  } catch (err: unknown) {
    console.error(`Techland scrape error on ${url}:`, err instanceof Error ? err.message : String(err));
    return [];
  }
}
