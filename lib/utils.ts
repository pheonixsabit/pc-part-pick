import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '৳ 0';
  return '৳ ' + Math.round(amount).toLocaleString('en-IN');
}

export function parseBDT(str: string | null | undefined): number {
  if (!str) return 0;
  // Replace Bengali numerals if any
  const bengaliNumerals: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  let normalized = str.replace(/[০-৯]/g, (digit) => bengaliNumerals[digit] || digit);
  // Remove non-numeric characters except decimal point
  normalized = normalized.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getRetailerMeta(retailer: string) {
  switch (retailer) {
    case 'STAR_TECH':
      return {
        name: 'Star Tech',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        brandColor: '#ef4a23',
        logoText: 'Star Tech',
        domain: 'startech.com.bd'
      };
    case 'UCC_BD':
      return {
        name: 'UCC BD',
        badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
        brandColor: '#005b94',
        logoText: 'UCC BD',
        domain: 'ucc.com.bd'
      };
    case 'RYANS':
      return {
        name: 'Ryans Computers',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        brandColor: '#f59e0b',
        logoText: 'Ryans',
        domain: 'ryans.com'
      };
    default:
      return {
        name: retailer,
        badgeBg: 'bg-gray-50 text-gray-700 border-gray-200',
        brandColor: '#6b7280',
        logoText: retailer,
        domain: ''
      };
  }
}
