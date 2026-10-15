import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatBDT, getRetailerMeta } from '@/lib/utils';
import { checkBuildCompatibility, BuildSlots } from '@/lib/pc-builder/compatibility-checker';
import {
  Wrench,
  CheckCircle2,
  ExternalLink,
  Zap,
  ShoppingBag,
  ArrowRight,
  Share2,
} from 'lucide-react';

interface Props {
  params: {
    slug: string;
  };
}

export default async function SharedBuildPage({ params }: Props) {
  const saved = await prisma.savedBuild.findUnique({
    where: { slug: params.slug },
  });

  if (!saved) {
    notFound();
  }

  const slots = JSON.parse(saved.partsJson) as BuildSlots;
  const compatibility = checkBuildCompatibility(slots);

  const slotEntries = [
    { label: 'Processor (CPU)', part: slots.cpu },
    { label: 'Motherboard', part: slots.motherboard },
    { label: 'Memory (RAM)', part: slots.ram },
    { label: 'Storage (SSD)', part: slots.storage },
    { label: 'Graphics Card (GPU)', part: slots.gpu },
    { label: 'Power Supply (PSU)', part: slots.psu },
    { label: 'Casing', part: slots.casing },
    { label: 'Monitor', part: slots.monitor },
  ].filter((s) => s.part);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-bold">
            <Share2 className="w-3 h-3" /> Shared Bangladesh PC Build
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{saved.title}</h1>
          <p className="text-xs text-slate-500">
            Target Budget: {formatBDT(saved.targetBudget)} • Created on{' '}
            {new Date(saved.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-3">
          <div className="text-3xl font-extrabold text-cyan-700">{formatBDT(saved.totalPrice)}</div>
          <Link
            href={`/builder?budget=${saved.targetBudget}&purpose=${saved.purpose}`}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            Customize / Fork Build
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Specs & Compatibility Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-0.5">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Price</span>
          <div className="text-xl font-bold text-slate-900">{formatBDT(saved.totalPrice)}</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-0.5">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Power Consumption</span>
          <div className="text-xl font-bold text-cyan-700 flex items-center gap-1">
            <Zap className="w-4 h-4" /> ~{compatibility.estimatedWattage} W
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Hardware Compatibility</span>
          <div className="text-xl font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> 100% Compatible
          </div>
        </div>
      </div>

      {/* Component Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="px-6 py-4 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700">
          Component Specification Breakdown
        </div>

        {slotEntries.map(({ label, part }) => {
          if (!part) return null;
          const meta = getRetailerMeta(part.retailer);

          return (
            <div key={label} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {part.imageUrl ? (
                    <img src={part.imageUrl} alt={part.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Wrench className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {label}
                  </span>
                  <div className="font-semibold text-slate-900 text-sm max-w-md line-clamp-1">
                    {part.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${meta.badgeBg}`}>
                  {meta.name}
                </span>
                <div className="font-bold text-slate-900 text-sm sm:text-base">
                  {formatBDT(part.price)}
                </div>
                {part.url && (
                  <a
                    href={part.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                    title="View Store"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
