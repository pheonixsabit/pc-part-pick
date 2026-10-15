'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  HardDrive,
  Monitor,
  Zap,
  Box,
  Fan,
  Wrench,
  CircuitBoard,
} from 'lucide-react';

interface ComponentImageProps {
  src?: string | null;
  alt: string;
  category: string;
  className?: string;
  containerClassName?: string;
}

export default function ComponentImage({
  src,
  alt,
  category,
  className = 'w-full h-full object-contain p-1',
  containerClassName = 'w-full h-full flex items-center justify-center',
}: ComponentImageProps) {
  const [hasError, setHasError] = useState(false);

  const getCategoryIllustration = () => {
    const cat = category.toUpperCase();
    switch (cat) {
      case 'CPU':
        return (
          <div className="flex flex-col items-center justify-center text-cyan-600 bg-gradient-to-br from-cyan-50 to-blue-50 w-full h-full p-2 rounded-lg">
            <Cpu className="w-7 h-7 stroke-[1.8]" />
            <span className="text-[9px] font-bold text-cyan-800 tracking-wider uppercase mt-1">CPU</span>
          </div>
        );
      case 'MOTHERBOARD':
        return (
          <div className="flex flex-col items-center justify-center text-indigo-600 bg-gradient-to-br from-indigo-50 to-violet-50 w-full h-full p-2 rounded-lg">
            <CircuitBoard className="w-7 h-7 stroke-[1.8]" />
            <span className="text-[9px] font-bold text-indigo-800 tracking-wider uppercase mt-1">MOBO</span>
          </div>
        );
      case 'RAM':
        return (
          <div className="flex flex-col items-center justify-center text-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 w-full h-full p-2 rounded-lg">
            <Layers className="w-7 h-7 stroke-[1.8]" />
            <span className="text-[9px] font-bold text-emerald-800 tracking-wider uppercase mt-1">RAM</span>
          </div>
        );
      case 'STORAGE':
        return (
          <div className="flex flex-col items-center justify-center text-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 w-full h-full p-2 rounded-lg">
            <HardDrive className="w-7 h-7 stroke-[1.8]" />
            <span className="text-[9px] font-bold text-amber-800 tracking-wider uppercase mt-1">SSD</span>
          </div>
        );
      case 'GPU':
        return (
          <div className="flex flex-col items-center justify-center text-rose-600 bg-gradient-to-br from-rose-50 to-pink-50 w-full h-full p-2 rounded-lg">
            <div className="relative flex items-center justify-center">
              <Fan className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-[9px] font-bold text-rose-800 tracking-wider uppercase mt-1">GPU</span>
          </div>
        );
      case 'PSU':
        return (
          <div className="flex flex-col items-center justify-center text-yellow-600 bg-gradient-to-br from-yellow-50 to-amber-50 w-full h-full p-2 rounded-lg">
            <Zap className="w-7 h-7 stroke-[1.8]" />
            <span className="text-[9px] font-bold text-yellow-800 tracking-wider uppercase mt-1">PSU</span>
          </div>
        );
      case 'CASING':
        return (
          <div className="flex flex-col items-center justify-center text-slate-600 bg-gradient-to-br from-slate-100 to-slate-200 w-full h-full p-2 rounded-lg">
            <Box className="w-7 h-7 stroke-[1.8]" />
            <span className="text-[9px] font-bold text-slate-800 tracking-wider uppercase mt-1">CASE</span>
          </div>
        );
      case 'MONITOR':
        return (
          <div className="flex flex-col items-center justify-center text-blue-600 bg-gradient-to-br from-blue-50 to-sky-50 w-full h-full p-2 rounded-lg">
            <Monitor className="w-7 h-7 stroke-[1.8]" />
            <span className="text-[9px] font-bold text-blue-800 tracking-wider uppercase mt-1">DISPLAY</span>
          </div>
        );
      case 'COOLER':
        return (
          <div className="flex flex-col items-center justify-center text-teal-600 bg-gradient-to-br from-teal-50 to-emerald-50 w-full h-full p-2 rounded-lg">
            <Fan className="w-7 h-7 stroke-[1.8]" />
            <span className="text-[9px] font-bold text-teal-800 tracking-wider uppercase mt-1">COOLER</span>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center text-slate-400 bg-slate-100 w-full h-full p-2 rounded-lg">
            <Wrench className="w-6 h-6 stroke-[1.8]" />
          </div>
        );
    }
  };

  const isValidUrl = src && src.trim().length > 0 && !src.startsWith('data:image/svg+xml');

  if (!isValidUrl || hasError) {
    return <div className={containerClassName}>{getCategoryIllustration()}</div>;
  }

  return (
    <div className={containerClassName}>
      <img
        src={src!}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
