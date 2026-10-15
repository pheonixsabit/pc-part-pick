'use client';

import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  Store,
  ExternalLink,
} from 'lucide-react';
import { ComponentCategory } from '@/lib/scrapers/types';

interface CatalogStats {
  totalProducts: number;
  totalListings: number;
  retailers: {
    starTech: number;
    ucc: number;
    ryans: number;
  };
}

export default function CrawlerPage() {
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [crawlingCategory, setCrawlingCategory] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/crawl');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Stats error:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 30)]);
  };

  const triggerCrawl = async (category?: ComponentCategory) => {
    const target = category || 'ALL';
    setCrawlingCategory(target);
    addLog(`Initiating live crawl for ${target}...`);

    try {
      const url = category ? `/api/crawl?category=${category}` : '/api/crawl';
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        if (category) {
          addLog(
            `✓ Successfully crawled ${category}: StarTech (${data.result.startechCount}), UCC BD (${data.result.uccCount}), Ryans (${data.result.ryansCount}) -> ${data.result.totalSaved} saved.`
          );
        } else {
          addLog(`✓ All categories successfully crawled and catalog synchronized!`);
        }
        await fetchStats();
      } else {
        addLog(`✗ Crawl failed: ${data.error}`);
      }
    } catch (err: unknown) {
      addLog(`✗ Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setCrawlingCategory(null);
    }
  };

  const categories: { id: ComponentCategory; label: string }[] = [
    { id: 'CPU', label: 'Processors (CPU)' },
    { id: 'MOTHERBOARD', label: 'Motherboards' },
    { id: 'RAM', label: 'Desktop RAM' },
    { id: 'STORAGE', label: 'Storage (SSD/HDD)' },
    { id: 'GPU', label: 'Graphics Cards (GPU)' },
    { id: 'PSU', label: 'Power Supplies (PSU)' },
    { id: 'CASING', label: 'Casings' },
    { id: 'MONITOR', label: 'Monitors' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-cyan-600" />
          Live Scraper & Catalog Synchronization
        </h1>
        <p className="text-xs text-slate-500">
          Monitor and execute automated web scrapers across Star Tech, UCC BD, and Ryans Computers.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-cyan-600" />
            Total Catalog Products
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {loadingStats ? '...' : stats?.totalProducts || 0}
          </div>
          <div className="text-[11px] text-slate-500">Unique hardware models</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4 text-red-600" />
            Star Tech Listings
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {loadingStats ? '...' : stats?.retailers.starTech || 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Direct HTTP Cheerio</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4 text-sky-600" />
            UCC BD Listings
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {loadingStats ? '...' : stats?.retailers.ucc || 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Direct HTTP Cheerio</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4 text-amber-600" />
            Ryans Listings
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {loadingStats ? '...' : stats?.retailers.ryans || 0}
          </div>
          <div className="text-[11px] text-amber-600 font-medium">Cloudflare Resilient / Sync</div>
        </div>
      </div>

      {/* Crawl Control Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Trigger Category Scrapers
            </h2>
            <p className="text-xs text-slate-500">
              Run real-time scrapers against retailer websites to ingest the latest pricing and in-stock inventory.
            </p>
          </div>

          <button
            onClick={() => triggerCrawl()}
            disabled={crawlingCategory !== null}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {crawlingCategory === 'ALL' ? 'Crawling All...' : 'Crawl All Categories'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {categories.map((cat) => {
            const isCrawling = crawlingCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => triggerCrawl(cat.id)}
                disabled={crawlingCategory !== null}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isCrawling
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="font-semibold text-xs truncate">{cat.label}</span>
                {isCrawling ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-600 shrink-0 ml-1" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Activity Logs */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-sm space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            Scraper Activity Log
          </span>
          <span className="text-slate-500 text-[10px]">Real-time worker output</span>
        </div>

        <div className="h-44 overflow-y-auto space-y-1.5 pr-2">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">No scrape events yet. Click any category button above to start.</div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={
                  log.includes('✓')
                    ? 'text-emerald-400'
                    : log.includes('✗')
                    ? 'text-rose-400'
                    : 'text-slate-300'
                }
              >
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
