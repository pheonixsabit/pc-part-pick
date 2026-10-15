'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Gamepad2,
  Video,
  Code2,
  Monitor,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Store,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { formatBDT } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [budget, setBudget] = useState<number>(65000);
  const [purpose, setPurpose] = useState<string>('GAMING');
  const [includeMonitor, setIncludeMonitor] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleQuickBuild = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/builder?budget=${budget}&purpose=${purpose}&monitor=${includeMonitor ? '1' : '0'}`
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const presetBudgets = [40000, 55000, 75000, 100000, 150000];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cyan-900/10 via-slate-50 to-slate-50 pt-12 pb-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold border border-cyan-200">
              <Zap className="w-3.5 h-3.5 text-cyan-600" />
              Real-time prices from Star Tech • UCC BD • Ryans
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Build Your Dream PC in Bangladesh for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-500">
                Any Budget
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Tell us your budget in Taka. Our smart engine scans Bangladesh&apos;s leading computer shops, validates component compatibility, and pieces together the highest-performance build.
            </p>
          </div>

          {/* Quick PC Builder Card */}
          <div className="mt-10 max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-8">
            <form onSubmit={handleQuickBuild} className="space-y-6">
              {/* Budget Input & Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-900">
                    Your Target Budget
                  </label>
                  <span className="text-2xl font-bold text-cyan-700">
                    {formatBDT(budget)}
                  </span>
                </div>

                <input
                  type="range"
                  min={30000}
                  max={250000}
                  step={2500}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs text-slate-400 self-center mr-1">Quick Select:</span>
                  {presetBudgets.map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setBudget(val)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        budget === val
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {formatBDT(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose Selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">
                  Primary Usage
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'GAMING', label: 'Gaming', icon: Gamepad2, desc: 'Prioritize GPU' },
                    { id: 'EDITING', label: 'Video / 3D', icon: Video, desc: 'Balanced CPU & GPU' },
                    { id: 'OFFICE', label: 'Programming', icon: Code2, desc: 'Fast CPU & RAM' },
                    { id: 'GENERAL', label: 'Everyday', icon: Monitor, desc: 'Budget Friendly' },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = purpose === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPurpose(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-cyan-600 bg-cyan-50/60 ring-2 ring-cyan-600/20'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-cyan-700' : 'text-slate-500'}`} />
                        <div className={`font-semibold text-xs ${isSelected ? 'text-cyan-900' : 'text-slate-900'}`}>
                          {p.label}
                        </div>
                        <div className="text-[10px] text-slate-500">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-1 text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeMonitor}
                    onChange={(e) => setIncludeMonitor(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                  />
                  <span className="text-xs font-medium text-slate-700">Include Monitor in Budget</span>
                </label>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold text-base shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Sparkles className="w-5 h-5" />
                Assemble Optimal Build for {formatBDT(budget)}
              </button>
            </form>
          </div>

          {/* Quick Search Engine Strip */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Or search component: RTX 4060, Ryzen 5600, B550, DDR4..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-28 py-3 bg-white rounded-xl border border-slate-200 shadow-sm text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
              >
                Search
              </button>
            </form>
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 text-xs text-slate-500">
              <span>Popular searches:</span>
              {['Ryzen 5 5600', 'RTX 4060', 'Ryzen 5 5600G', 'Core i5-12400F', 'B550M PRO-VDH'].map((term) => (
                <button
                  type="button"
                  key={term}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                  className="px-2 py-0.5 rounded-md bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-[11px] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Cheapest Cross-Store Prices</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Why buy all parts from one store? We check Star Tech, UCC BD, and Ryans to find which retailer offers the lowest price for each individual part.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">100% Guaranteed Compatibility</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never worry about socket mismatches (AM4/AM5/LGA1700), DDR4 vs DDR5 RAM types, or underpowered power supplies. Every build is rigorously verified.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Direct Retailer Links</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get direct purchase links to product pages on Bangladeshi retailer websites with stock availability badges. No middleman markup or hidden costs.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Budget PC Guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Popular Bangladesh PC Builds</h2>
            <p className="text-xs text-slate-500">Hand-tuned configurations matched with today&apos;s lowest prices</p>
          </div>
          <Link
            href="/builder"
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 group self-start sm:self-auto"
          >
            Open Custom Builder <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Esports APU PC',
              budget: 38000,
              purpose: 'GAMING',
              tag: 'Budget King',
              highlights: ['Ryzen 5 5600G (Vega 7)', '16GB Dual-Channel DDR4', '500GB NVMe SSD', 'B450M Motherboard'],
            },
            {
              title: '1080p Esports & AAA PC',
              budget: 65000,
              purpose: 'GAMING',
              tag: 'Best Value',
              highlights: ['Ryzen 5 5600 / i5-12400F', 'Radeon RX 6600 8GB', '16GB 3200MHz RAM', '550W Bronze PSU'],
            },
            {
              title: 'Content Creator & 1440p',
              budget: 95000,
              purpose: 'EDITING',
              tag: 'High Performance',
              highlights: ['Intel Core i5-13400 / 12400F', 'RTX 4060 8GB OC', '32GB RAM + 1TB NVMe', '650W Bronze PSU'],
            },
            {
              title: 'Next-Gen AM5 Futureproof',
              budget: 140000,
              purpose: 'GAMING',
              tag: 'Enthusiast',
              highlights: ['AMD Ryzen 5 7600 (AM5)', 'RTX 4070 SUPER 12GB', '32GB DDR5 6000MHz', 'B650M WIFI + 750W Gold'],
            },
          ].map((guide, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                    {guide.tag}
                  </span>
                  <span className="text-base font-bold text-slate-900">{formatBDT(guide.budget)}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{guide.title}</h3>
                <ul className="space-y-1.5 pt-1">
                  {guide.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <Link
                  href={`/builder?budget=${guide.budget}&purpose=${guide.purpose}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-cyan-600 hover:text-white text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  Configure This Build
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
