import * as cheerio from 'cheerio';
import { fetchHtml } from './http-client';
import { ComponentCategory, ScrapedItem } from './types';
import { parseBDT } from '../utils';
import { enrichComponentSpecs } from './spec-extractor';

export const RYANS_CATEGORY_URLS: Record<ComponentCategory, string> = {
  CPU: 'https://www.ryans.com/category/desktop-component-processor',
  MOTHERBOARD: 'https://www.ryans.com/category/desktop-component-motherboard',
  RAM: 'https://www.ryans.com/category/desktop-component-desktop-ram',
  STORAGE: 'https://www.ryans.com/category/desktop-component-internal-ssd',
  GPU: 'https://www.ryans.com/category/desktop-component-graphics-card',
  PSU: 'https://www.ryans.com/category/desktop-component-power-supply',
  CASING: 'https://www.ryans.com/category/desktop-component-casing',
  COOLER: 'https://www.ryans.com/category/desktop-component-cpu-cooler',
  MONITOR: 'https://www.ryans.com/category/monitor-all-monitor',
};

export async function scrapeRyansCategory(category: ComponentCategory, page: number = 1): Promise<ScrapedItem[]> {
  const baseUrl = RYANS_CATEGORY_URLS[category];
  const url = page > 1 ? `${baseUrl}?page=${page}` : baseUrl;

  try {
    const html = await fetchHtml(url);
    if (html.includes('cf-mitigated') || html.includes('Attention Required! | Cloudflare')) {
      console.warn(`[Ryans] Cloudflare Turnstile challenge encountered for ${url}`);
      return [];
    }

    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    $('.product-box, .card, .product-item').each((_, el) => {
      const $el = $(el);
      const name = $el.find('.product-title, .card-title, h2, h3').first().text().trim();
      const productUrl = $el.find('a[href*="/product/"], a[href*="/detail/"]').first().attr('href') || '';
      const imageUrl = $el.find('img').first().attr('src') || '';
      const priceText = $el.find('.pr-text, .price, .special-price').first().text();
      const price = parseBDT(priceText);

      if (name && price > 0 && productUrl) {
        items.push(
          enrichComponentSpecs({
            retailer: 'RYANS',
            name,
            category,
            price,
            url: productUrl.startsWith('http') ? productUrl : `https://www.ryans.com${productUrl}`,
            imageUrl,
            inStock: true,
          })
        );
      }
    });

    return items;
  } catch (err: unknown) {
    console.warn(`Ryans scrape notice: ${err instanceof Error ? err.message : String(err)}`);
    return [];
  }
}
