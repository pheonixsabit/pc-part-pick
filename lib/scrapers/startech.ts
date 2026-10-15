import * as cheerio from 'cheerio';
import { fetchHtml } from './http-client';
import { ComponentCategory, ScrapedItem } from './types';
import { parseBDT } from '../utils';
import { enrichComponentSpecs } from './spec-extractor';

export const STARTECH_CATEGORY_URLS: Record<ComponentCategory, string> = {
  CPU: 'https://www.startech.com.bd/component/processor',
  MOTHERBOARD: 'https://www.startech.com.bd/component/motherboard',
  RAM: 'https://www.startech.com.bd/component/desktop-ram',
  STORAGE: 'https://www.startech.com.bd/component/ssd-hard-disk',
  GPU: 'https://www.startech.com.bd/component/graphics-card',
  PSU: 'https://www.startech.com.bd/component/power-supply',
  CASING: 'https://www.startech.com.bd/component/casing',
  COOLER: 'https://www.startech.com.bd/component/cooling-fan',
  MONITOR: 'https://www.startech.com.bd/monitor',
};

export async function scrapeStarTechSearch(query: string, category: ComponentCategory = 'CPU'): Promise<ScrapedItem[]> {
  const url = `https://www.startech.com.bd/product/search?search=${encodeURIComponent(query)}`;
  return scrapeStarTechUrl(url, category);
}

export async function scrapeStarTechCategory(category: ComponentCategory, page: number = 1): Promise<ScrapedItem[]> {
  const baseUrl = STARTECH_CATEGORY_URLS[category];
  const url = page > 1 ? `${baseUrl}?page=${page}` : baseUrl;
  return scrapeStarTechUrl(url, category);
}

export async function scrapeStarTechUrl(url: string, category: ComponentCategory): Promise<ScrapedItem[]> {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    $('.p-item').each((_, el) => {
      const $el = $(el);
      const name = $el.find('.p-item-name a').text().trim();
      const productUrl = $el.find('.p-item-name a').attr('href') || '';
      const imageUrl = $el.find('.p-item-img img').attr('src') || '';

      const priceContainer = $el.find('.p-item-price');
      const newPriceEl = priceContainer.find('.price-new');
      const oldPriceEl = priceContainer.find('.price-old');

      let price = 0;
      let regularPrice: number | undefined;

      if (newPriceEl.length > 0) {
        price = parseBDT(newPriceEl.text());
        if (oldPriceEl.length > 0) {
          regularPrice = parseBDT(oldPriceEl.text());
        }
      } else {
        price = parseBDT(priceContainer.text());
      }

      // Check stock
      const stockBadge = $el.find('.stock-status, .tag-stock').text().toLowerCase();
      const priceText = priceContainer.text().toLowerCase();
      const inStock = !stockBadge.includes('out') && !priceText.includes('tba') && price > 0;

      // Extract bullet specs
      const rawSpecs: string[] = [];
      $el.find('.short-description li').each((_, li) => {
        const text = $(li).text().trim();
        if (text) rawSpecs.push(text);
      });

      if (name && price > 0 && productUrl) {
        const enriched = enrichComponentSpecs({
          retailer: 'STAR_TECH',
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
    console.error(`StarTech scrape error on ${url}:`, err instanceof Error ? err.message : String(err));
    return [];
  }
}
