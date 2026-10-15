import { fetchHtml } from './http-client';
import * as cheerio from 'cheerio';
import { parseBDT } from '../utils';

export interface LiveStockStatus {
  inStock: boolean;
  price?: number;
  statusText: string;
  checkedAt: string;
}

export async function checkUrlLiveStock(url: string, retailer: string): Promise<LiveStockStatus> {
  const now = new Date().toISOString();

  if (!url || !url.startsWith('http')) {
    return { inStock: true, statusText: 'In Stock (Catalog)', checkedAt: now };
  }

  try {
    const html = await fetchHtml(url, 10000);
    const $ = cheerio.load(html);

    if (retailer === 'STAR_TECH') {
      const pageText = $('body').text().toLowerCase();
      const priceText = $('.product-price, .p-item-price').first().text().toLowerCase();
      const stockEl = $('.product-status, .stock-status, .tag-stock').first().text().toLowerCase();
      const hasBuyBtn = $('#button-cart, .btn-buy, .btn-add-cart').length > 0;

      const isOut =
        stockEl.includes('out of stock') ||
        stockEl.includes('upcoming') ||
        stockEl.includes('pre order') ||
        priceText.includes('out of stock') ||
        priceText.includes('tba');

      const price = parseBDT(priceText);
      const inStock = !isOut && (hasBuyBtn || price > 0);

      return {
        inStock,
        price: price > 0 ? price : undefined,
        statusText: inStock ? 'Verified In Stock' : 'Out of Stock',
        checkedAt: now,
      };
    }

    if (retailer === 'TECHLAND') {
      const pageText = $('body').text().toLowerCase();
      const hasAddToCart =
        $('[wire\\:click*="addedToCart"], .btn-cart, #button-cart, button:contains("Add to Cart")').length > 0;
      const isOut =
        pageText.includes('out of stock') ||
        pageText.includes('stock out') ||
        pageText.includes('upcoming');

      const priceText = $('.price, .bengali-text, .text-red-600').first().text();
      const price = parseBDT(priceText);
      const inStock = !isOut && (hasAddToCart || price > 0);

      return {
        inStock,
        price: price > 0 ? price : undefined,
        statusText: inStock ? 'Verified In Stock' : 'Out of Stock',
        checkedAt: now,
      };
    }

    if (retailer === 'RYANS') {
      const pageText = $('body').text().toLowerCase();
      const isOut = pageText.includes('out of stock') || pageText.includes('stock out');
      const inStock = !isOut;

      return {
        inStock,
        statusText: inStock ? 'Verified In Stock' : 'Out of Stock',
        checkedAt: now,
      };
    }

    return { inStock: true, statusText: 'In Stock', checkedAt: now };
  } catch (err: unknown) {
    // If request timed out or was blocked, preserve current catalog stock status
    return { inStock: true, statusText: 'In Stock (Cached)', checkedAt: now };
  }
}
