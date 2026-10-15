'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Wrench,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  Share2,
  Printer,
  Copy,
  Check,
  Zap,
  SlidersHorizontal,
  ArrowRightLeft,
  X,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import { formatBDT, getRetailerMeta } from '@/lib/utils';
import { SelectedPart, BuildSlots, CompatibilityReport } from '@/lib/pc-builder/compatibility-checker';
import ComponentImage from '@/components/ComponentImage';

const SLOT_DEFINITIONS: { key: keyof BuildSlots; label: string; category: string }[] = [
  { key: 'cpu', label: 'Processor (CPU)', category: 'CPU' },
  { key: 'motherboard', label: 'Motherboard', category: 'MOTHERBOARD' },
  { key: 'ram', label: 'Memory (RAM)', category: 'RAM' },
  { key: 'storage', label: 'Storage (SSD)', category: 'STORAGE' },
  { key: 'gpu', label: 'Graphics Card (GPU)', category: 'GPU' },
  { key: 'psu', label: 'Power Supply (PSU)', category: 'PSU' },
  { key: 'casing', label: 'Casing / Cabinet', category: 'CASING' },
  { key: 'monitor', label: 'Monitor', category: 'MONITOR' },
];

function BuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [budget, setBudget] = useState<number>(() => {
    const p = searchParams.get('budget');
    return p ? Number(p) : 65000;
  });

  const [purpose, setPurpose] = useState<string>(() => {
    return searchParams.get('purpose') || 'GAMING';
  });

  const [includeMonitor, setIncludeMonitor] = useState<boolean>(() => {
    return searchParams.get('monitor') === '1';
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [slots, setSlots] = useState<BuildSlots>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [targetBudget, setTargetBudget] = useState<number>(65000);
  const [strategyExplanation, setStrategyExplanation] = useState<string>('');
  const [strategy, setStrategy] = useState<string>('DISCRETE_GPU');
  const [compatibility, setCompatibility] = useState<CompatibilityReport>({
    isCompatible: true,
    issues: [],
    estimatedWattage: 0,
    recommendedPsuWattage: 450,
  });
  const [retailerBreakdown, setRetailerBreakdown] = useState<{ retailer: string; itemCount: number; subtotal: number }[]>([]);

  // Swap Modal State
  const [swapSlotKey, setSwapSlotKey] = useState<keyof BuildSlots | null>(null);
  const [swapCategory, setSwapCategory] = useState<string>('');
  const [availableAlternatives, setAvailableAlternatives] = useState<SelectedPart[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState<boolean>(false);

  // Share / Copy State
  const [copied, setCopied] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Live Stock Verification State
  const [verifyingStock, setVerifyingStock] = useState<boolean>(false);
  const [stockVerificationMsg, setStockVerificationMsg] = useState<{
    status: 'success' | 'warning' | 'idle';
    text: string;
  } | null>(null);

  const handleVerifyLiveStock = async () => {
    setVerifyingStock(true);
    setStockVerificationMsg(null);
    try {
      const res = await fetch('/api/pc-builder/verify-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.allInStock) {
          setStockVerificationMsg({
            status: 'success',
            text: 'All selected components verified 100% IN STOCK at their respective stores!',
          });
        } else {
          setStockVerificationMsg({
            status: 'warning',
            text: 'One or more items may have low or unconfirmed live inventory. Check retailer links before purchase.',
          });
        }
      }
    } catch (e) {
      console.error('Stock verification error:', e);
    } finally {
      setVerifyingStock(false);
    }
  };

  const fetchOptimizedBuild = useCallback(async (b: number, p: string, mon: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/pc-builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: b,
          purpose: p,
          includeMonitor: mon,
        }),
      });

      const data = await res.json();
      if (data.success && data.build) {
        setSlots(data.build.slots);
        setTotalPrice(data.build.totalPrice);
        setTargetBudget(data.build.targetBudget);
        setStrategyExplanation(data.build.explanation);
        setStrategy(data.build.strategy);
        setCompatibility(data.build.compatibility);
        setRetailerBreakdown(data.build.retailerBreakdown);
      }
    } catch (err) {
      console.error('Failed to generate build:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptimizedBuild(budget, purpose, includeMonitor);
  }, [budget, purpose, includeMonitor, fetchOptimizedBuild]);

  // Recalculate totals whenever slots change manually
  const recalculateFromSlots = (updatedSlots: BuildSlots) => {
    let sum = 0;
    const rMap: Record<string, { count: number; subtotal: number }> = {};

    Object.values(updatedSlots).forEach((part) => {
      if (part) {
        sum += part.price;
        if (!rMap[part.retailer]) {
          rMap[part.retailer] = { count: 0, subtotal: 0 };
        }
        rMap[part.retailer].count += 1;
        rMap[part.retailer].subtotal += part.price;
      }
    });

    setTotalPrice(sum);
    setRetailerBreakdown(
      Object.entries(rMap).map(([retailer, stats]) => ({
        retailer,
        itemCount: stats.count,
        subtotal: stats.subtotal,
      }))
    );
  };

  // Open Swap Modal
  const openSwapModal = async (slotKey: keyof BuildSlots, category: string) => {
    setSwapSlotKey(slotKey);
    setSwapCategory(category);
    setLoadingAlternatives(true);
    setAvailableAlternatives([]);

    try {
      const params = new URLSearchParams();
      params.set('category', category);

      // Contextual compatibility filters
      if (category === 'MOTHERBOARD' && slots.cpu?.socket) {
        params.set('socket', slots.cpu.socket);
      }
      if (category === 'RAM' && slots.motherboard?.ramType) {
        params.set('ramType', slots.motherboard.ramType);
      }
      if (category === 'CPU' && slots.motherboard?.socket) {
        params.set('socket', slots.motherboard.socket);
      }

      const res = await fetch(`/api/pc-builder/parts?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.parts) {
        setAvailableAlternatives(data.parts);
      }
    } catch (e) {
      console.error('Error fetching alternatives:', e);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  // Select alternative part
  const selectAlternativePart = (part: SelectedPart) => {
    if (!swapSlotKey) return;

    const updated = {
      ...slots,
      [swapSlotKey]: part,
    };

    setSlots(updated);
    recalculateFromSlots(updated);
    setSwapSlotKey(null);
  };

  // Remove slot part
  const removeSlotPart = (slotKey: keyof BuildSlots) => {
    const updated = {
      ...slots,
      [slotKey]: null,
    };
    setSlots(updated);
    recalculateFromSlots(updated);
  };

  // Copy specs to clipboard
  const handleCopySpecs = () => {
    const lines = [
      `🖥️ PC Build Specification (PCPartPicker BD)`,
      `🎯 Purpose: ${purpose} | Total Price: ${formatBDT(totalPrice)}`,
      `------------------------------------------`,
    ];

    SLOT_DEFINITIONS.forEach(({ key, label }) => {
      const part = slots[key];
      if (part) {
        lines.push(`• ${label}: ${part.name} - ${formatBDT(part.price)} (${getRetailerMeta(part.retailer).name})`);
      }
    });

    lines.push(`------------------------------------------`);
    lines.push(`⚡ Estimated Wattage: ~${compatibility.estimatedWattage}W`);
    lines.push(`🔗 Generated on PCPartPicker Bangladesh`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Save and generate share link
  const handleShare = async () => {
    try {
      const res = await fetch('/api/pc-builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose,
          targetBudget,
          totalPrice,
          slots,
        }),
      });
      const data = await res.json();
      if (data.success && data.slug) {
        const fullUrl = `${window.location.origin}/b/${data.slug}`;
        setShareUrl(fullUrl);
        navigator.clipboard.writeText(fullUrl);
        alert(`Build saved! Share link copied to clipboard:\n${fullUrl}`);
      }
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  const budgetDelta = totalPrice - targetBudget;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Controls / Budget Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm no-print space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-cyan-600" />
              Interactive Budget PC Builder
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Prices dynamically scanned across Star Tech, UCC BD, and Ryans Computers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleVerifyLiveStock}
              disabled={verifyingStock}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${verifyingStock ? 'animate-spin' : 'text-emerald-600'}`} />
              {verifyingStock ? 'Checking Live Stock...' : 'Verify Live Stock'}
            </button>
            <button
              onClick={handleCopySpecs}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Specs!' : 'Copy Specs'}
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Save & Share Link
            </button>
          </div>
        </div>

        {stockVerificationMsg && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-medium animate-in fade-in ${
              stockVerificationMsg.status === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {stockVerificationMsg.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{stockVerificationMsg.text}</span>
          </div>
        )}

        {/* Budget Config Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Target Budget (BDT)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={25000}
                max={300000}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Usage Profile</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
            >
              <option value="GAMING">Gaming (Prioritize GPU)</option>
              <option value="EDITING">Video Editing / 3D (Balanced)</option>
              <option value="OFFICE">Programming / Office</option>
              <option value="GENERAL">General Everyday</option>
            </select>
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2 text-xs font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={includeMonitor}
                onChange={(e) => setIncludeMonitor(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 border-slate-300"
              />
              Include Monitor in Budget
            </label>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => fetchOptimizedBuild(budget, purpose, includeMonitor)}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-Calculate Best Build
            </button>
          </div>
        </div>
      </div>

      {/* Build Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Build Cost</div>
          <div className="text-2xl font-extrabold text-slate-900">{formatBDT(totalPrice)}</div>
          <div className="text-[11px] font-medium text-slate-500">
            Target: {formatBDT(targetBudget)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Budget Balance</div>
          <div
            className={`text-2xl font-extrabold ${
              budgetDelta > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {budgetDelta > 0 ? `+${formatBDT(budgetDelta)}` : formatBDT(budgetDelta)}
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            {budgetDelta <= 0 ? 'Within budget!' : 'Slightly above target'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Estimated Power</div>
          <div className="text-2xl font-extrabold text-cyan-700 flex items-center gap-1">
            <Zap className="w-5 h-5 fill-cyan-700" />
            ~{compatibility.estimatedWattage} W
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            Recommended PSU: {compatibility.recommendedPsuWattage}W+
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Compatibility</div>
          <div className="flex items-center gap-1.5 pt-0.5">
            {compatibility.isCompatible ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Compatible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5" /> Issues Detected
              </span>
            )}
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            {compatibility.issues.length} notice(s)
          </div>
        </div>
      </div>

      {/* Strategy Explanation Alert */}
      {strategyExplanation && (
        <div className="bg-cyan-50/70 border border-cyan-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-cyan-950">
          <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-cyan-900">
              {strategy === 'APU_INTEGRATED' ? 'Smart APU Allocation Mode' : 'Discrete GPU Allocation Mode'}
            </span>
            <p className="leading-relaxed text-slate-700">{strategyExplanation}</p>
          </div>
        </div>
      )}

      {/* Compatibility Issues Alert Box (if any) */}
      {compatibility.issues.length > 0 && (
        <div className="space-y-2">
          {compatibility.issues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                issue.severity === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : issue.severity === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              {issue.severity === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Component Slots Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Chosen Components & Retailer Pricing
          </h2>
          <span className="text-xs text-slate-500">Click &quot;Swap&quot; to customize any part</span>
        </div>

        <div className="divide-y divide-slate-100">
          {SLOT_DEFINITIONS.map(({ key, label, category }) => {
            const part = slots[key];
            const meta = part ? getRetailerMeta(part.retailer) : null;

            // Skip monitor if not selected
            if (key === 'monitor' && !includeMonitor && !part) return null;

            return (
              <div
                key={key}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                {/* Slot Label & Info */}
                <div className="flex items-center gap-4 min-w-[260px]">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    <ComponentImage
                      src={part?.imageUrl}
                      alt={part?.name || label}
                      category={category}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {label}
                    </span>
                    {part ? (
                      <div className="font-semibold text-slate-900 text-sm max-w-md line-clamp-1">
                        {part.name}
                      </div>
                    ) : (
                      <div className="text-xs italic text-slate-400">
                        {key === 'gpu' && strategy === 'APU_INTEGRATED'
                          ? 'Included in CPU (Integrated Vega / Radeon Graphics)'
                          : 'No component selected'}
                      </div>
                    )}

                    {part && (
                      <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-500">
                        {part.socket && <span>Socket: {part.socket}</span>}
                        {part.ramType && <span>• {part.ramType}</span>}
                        {part.tdpWatts && <span>• {part.tdpWatts}W</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Retailer Badge & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {part && meta ? (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${meta.badgeBg}`}>
                            {meta.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <Check className="w-2.5 h-2.5 stroke-[3]" /> In Stock
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-base">{formatBDT(part.price)}</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {key === 'gpu' && strategy === 'APU_INTEGRATED' ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          ৳0 (Integrated)
                        </span>
                      ) : null}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {part?.url && (
                      <a
                        href={part.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="View on store website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => openSwapModal(key, category)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Swap
                    </button>
                    {part && (
                      <button
                        onClick={() => removeSlotPart(key)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove part"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retailer Store Checkout Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <ShoppingBag className="w-4 h-4 text-cyan-600" />
          Where to Buy This Build in Bangladesh
        </h3>
        <p className="text-xs text-slate-500">
          We split the components across retailers offering the lowest verified price for each individual item:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {retailerBreakdown.map(({ retailer, itemCount, subtotal }) => {
            const meta = getRetailerMeta(retailer);
            return (
              <div
                key={retailer}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${meta.badgeBg}`}>
                      {meta.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{itemCount} items</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-2">{formatBDT(subtotal)}</div>
                </div>

                <a
                  href={`https://${meta.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  Visit {meta.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Swap Modal */}
      {swapSlotKey && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Choose Compatible {swapCategory}
                </h3>
                <p className="text-xs text-slate-500">
                  Filtered by compatibility with your currently chosen components
                </p>
              </div>
              <button
                onClick={() => setSwapSlotKey(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100">
              {loadingAlternatives ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-600" />
                  <span>Loading compatible parts...</span>
                </div>
              ) : availableAlternatives.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No alternative parts found in the catalog for this category.
                </div>
              ) : (
                availableAlternatives.map((alt) => {
                  const currentPartPrice = slots[swapSlotKey]?.price || 0;
                  const priceDiff = alt.price - currentPartPrice;
                  const meta = getRetailerMeta(alt.retailer);

                  return (
                    <div
                      key={alt.id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          <ComponentImage
                            src={alt.imageUrl}
                            alt={alt.name}
                            category={swapCategory}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate max-w-sm">
                            {alt.name}
                          </div>
                          <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-500">
                            <span className={`px-1.5 py-0.2 rounded font-medium border text-[10px] ${meta.badgeBg}`}>
                              {meta.name}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                              In Stock
                            </span>
                            {alt.socket && <span>Socket: {alt.socket}</span>}
                            {alt.ramType && <span>• {alt.ramType}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-slate-900 text-sm sm:text-base">
                            {formatBDT(alt.price)}
                          </div>
                          {slots[swapSlotKey] && (
                            <div
                              className={`text-[10px] font-semibold ${
                                priceDiff > 0 ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            >
                              {priceDiff > 0 ? `+${formatBDT(priceDiff)}` : `${formatBDT(priceDiff)}`}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => selectAlternativePart(alt)}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs transition-colors"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading PC Builder...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
