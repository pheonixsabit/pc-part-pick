'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  ExternalLink,
  Store,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Cpu,
  Wrench,
  Filter,
  Check,
} from 'lucide-react';
import { formatBDT, getRetailerMeta } from '@/lib/utils';
import ComponentImage from '@/components/ComponentImage';

interface RetailerPriceItem {
  id: string;
  retailer: string;
  retailerName: string;
  price: number;
  regularPrice?: number | null;
  url: string;
  imageUrl?: string | null;
  inStock: boolean;
}

interface SearchProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  socket?: string | null;
  ramType?: string | null;
  formFactor?: string | null;
  imageUrl?: string | null;
  lowestPrice: number;
  highestPrice: number;
  hasMultiRetailer: boolean;
  retailerPrices: RetailerPriceItem[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState<string>(() => searchParams.get('q') || '');
  const [category, setCategory] = useState<string>(() => searchParams.get('category') || 'ALL');
  const [retailer, setRetailer] = useState<string>(() => searchParams.get('retailer') || 'ALL');
  const [sort, setSort] = useState<string>('price_asc');
  const [inStockOnly, setInStockOnly] = useState<boolean>(true);

  const [products, setProducts] = useState<SearchProductItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const executeSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (category && category !== 'ALL') params.set('category', category);
      if (retailer && retailer !== 'ALL') params.set('retailer', retailer);
      if (inStockOnly) params.set('inStock', 'true');
      params.set('sort', sort);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.results || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, category, retailer, sort, inStockOnly]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const categories = [
    { id: 'ALL', label: 'All Components' },
    { id: 'CPU', label: 'Processors' },
    { id: 'MOTHERBOARD', label: 'Motherboards' },
    { id: 'RAM', label: 'RAM' },
    { id: 'STORAGE', label: 'Storage' },
    { id: 'GPU', label: 'Graphics Cards' },
    { id: 'PSU', label: 'Power Supplies' },
    { id: 'CASING', label: 'Casings' },
    { id: 'MONITOR', label: 'Monitors' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-cyan-600" />
            PC Parts Search & Price Comparison Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search any PC component and compare real-time prices across Star Tech, Tech Land, and Ryans Computers.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search component: Ryzen 5600, RTX 4060, B550, DDR4 3200MHz, 650W PSU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-28 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  category === c.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Retailer & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Retailer Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Store:</span>
              <select
                value={retailer}
                onChange={(e) => setRetailer(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:ring-cyan-500"
              >
                <option value="ALL">All Stores</option>
                <option value="STAR_TECH">Star Tech</option>
                <option value="TECHLAND">Tech Land</option>
                <option value="RYANS">Ryans</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:ring-cyan-500"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>

            {/* In Stock Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-cyan-600 border-slate-300"
              />
              <span className="text-slate-700 font-medium">In Stock Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Count & Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{products.length}</strong> product(s) matching your criteria
        </span>
        {loading && (
          <span className="flex items-center gap-1.5 text-cyan-700 font-medium">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scanning live listings...
          </span>
        )}
      </div>

      {/* Product Listings Stream */}
      <div className="space-y-4">
        {products.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">No Components Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with a shorter keyword (e.g. &quot;5600&quot; or &quot;4060&quot;) or select &quot;All Components&quot;.
            </p>
          </div>
        ) : (
          products.map((prod) => {
            const savings =
              prod.hasMultiRetailer && prod.highestPrice > prod.lowestPrice
                ? prod.highestPrice - prod.lowestPrice
                : 0;

            const lowestRetailer = prod.retailerPrices[0];
            const lowestMeta = lowestRetailer ? getRetailerMeta(lowestRetailer.retailer) : null;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                {/* Left: Thumbnail & Master Info */}
                <div className="flex items-start gap-4 min-w-[280px]">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    <ComponentImage
                      src={prod.imageUrl}
                      alt={prod.name}
                      category={prod.category}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {prod.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {prod.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      {prod.socket && <span>Socket: {prod.socket}</span>}
                      {prod.ramType && <span>• {prod.ramType}</span>}
                      {prod.formFactor && <span>• {prod.formFactor}</span>}
                    </div>

                    {savings > 0 && lowestMeta && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <TrendingDown className="w-3 h-3" />
                        Save {formatBDT(savings)} by buying at {lowestMeta.name}!
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Comparative Retailer Listing Cards */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {prod.retailerPrices.map((rp) => {
                    const meta = getRetailerMeta(rp.retailer);
                    const isLowest = rp.price === prod.lowestPrice;

                    return (
                      <div
                        key={rp.id}
                        className={`p-3 rounded-xl border flex flex-col justify-between gap-2 min-w-[145px] ${
                          isLowest
                            ? 'border-cyan-500 bg-cyan-50/40 ring-1 ring-cyan-500/20'
                            : 'border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${meta.badgeBg}`}>
                            {meta.name}
                          </span>
                          {isLowest && (
                            <span className="text-[9px] font-extrabold uppercase text-cyan-700 tracking-wider">
                              Lowest
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="font-extrabold text-slate-900 text-base">
                            {formatBDT(rp.price)}
                          </div>
                          {rp.regularPrice && rp.regularPrice > rp.price && (
                            <div className="text-[10px] text-slate-400 line-through">
                              {formatBDT(rp.regularPrice)}
                            </div>
                          )}
                          <div className="pt-1">
                            {rp.inStock ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> In Stock
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>

                        <a
                          href={rp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                          View Store
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
