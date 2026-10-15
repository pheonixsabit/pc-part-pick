import * as cheerio from 'cheerio';
import { fetchHtml } from './http-client';
import { ComponentCategory, ScrapedItem } from './types';
import { parseBDT } from '../utils';
import { enrichComponentSpecs } from './spec-extractor';

export const UCC_CATEGORY_URLS: Record<ComponentCategory, string> = {
  CPU: 'https://www.ucc.com.bd/processors',
  MOTHERBOARD: 'https://www.ucc.com.bd/motherboards',
  RAM: 'https://www.ucc.com.bd/desktop-ram',
  STORAGE: 'https://www.ucc.com.bd/solid-state-drives',
  GPU: 'https://www.ucc.com.bd/graphics-card',
  PSU: 'https://www.ucc.com.bd/power-supply-unit',
  CASING: 'https://www.ucc.com.bd/casing-chassis',
  COOLER: 'https://www.ucc.com.bd/cooling-system',
  MONITOR: 'https://www.ucc.com.bd/monitors',
};

export async function scrapeUccCategory(category: ComponentCategory, page: number = 1): Promise<ScrapedItem[]> {
  const baseUrl = UCC_CATEGORY_URLS[category];
  const url = page > 1 ? `${baseUrl}?page=${page}` : baseUrl;
  return scrapeUccUrl(url, category);
}

export async function scrapeUccUrl(url: string, category: ComponentCategory): Promise<ScrapedItem[]> {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    // OpenCart Journal 3 uses .product-thumb within .product-layout
    $('.product-thumb').each((_, el) => {
      const $card = $(el);

      // Title and Link
      const $titleLink = $card.find('.name a, .caption h4 a, h4 a').first();
      const name = $titleLink.text().trim();
      let productUrl = $titleLink.attr('href') || '';
      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = `https://www.ucc.com.bd${productUrl}`;
      }

      // Product Image
      const $img = $card.find('.image img').first();
      let imageUrl =
        $img.attr('data-src') ||
        $img.attr('src') ||
        $img.attr('data-image') ||
        '';

      if (imageUrl && !imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
          imageUrl = `https:${imageUrl}`;
        } else {
          imageUrl = `https://www.ucc.com.bd${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
      }
      if (imageUrl.startsWith('data:')) {
        imageUrl = '';
      }

      // Prices: discounted (.price-new), regular (.price-old), normal (.price-normal, .price)
      const priceNewText = $card.find('.price-new').text().trim();
      const priceNormalText = $card.find('.price-normal').text().trim();
      const priceOldText = $card.find('.price-old').text().trim();
      const generalPriceText = $card.find('.price').first().text().trim();

      const price = priceNewText
        ? parseBDT(priceNewText)
        : priceNormalText
        ? parseBDT(priceNormalText)
        : parseBDT(generalPriceText);

      const regularPrice = priceOldText ? parseBDT(priceOldText) : undefined;

      // Stock status from .stats, .stat-2, or card text
      const statsText = $card.find('.stats, .stat-2, .product-stats').text().trim().toLowerCase();
      const fullCardText = $card.text().toLowerCase();

      const isExplicitlyOut =
        statsText.includes('out of stock') ||
        statsText.includes('call for price') ||
        statsText.includes('upcoming') ||
        statsText.includes('pre order') ||
        fullCardText.includes('call for price') ||
        fullCardText.includes('out of stock');

      const isExplicitlyIn = statsText.includes('in stock') || fullCardText.includes('in stock');
      const inStock = !isExplicitlyOut && isExplicitlyIn && price > 0;

      // Extract specs from stats or description
      const rawSpecs: string[] = [];
      $card.find('.stats > div, .description, ul li').each((_, li) => {
        const text = $(li).text().trim();
        if (text && !text.toLowerCase().includes('stock:') && !text.toLowerCase().includes('brand:')) {
          rawSpecs.push(text);
        }
      });

      if (name && price > 0 && productUrl) {
        const enriched = enrichComponentSpecs({
          retailer: 'UCC_BD',
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
    console.error(`UCC scrape error on ${url}:`, err instanceof Error ? err.message : String(err));
    return [];
  }
}

export async function scrapeUccSearch(query: string, category: ComponentCategory = 'CPU'): Promise<ScrapedItem[]> {
  const searchUrl = `https://www.ucc.com.bd/index.php?route=product/search&search=${encodeURIComponent(query)}`;
  return scrapeUccUrl(searchUrl, category);
}
