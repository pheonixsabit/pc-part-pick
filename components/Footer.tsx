import Link from 'next/link';
import { Cpu, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-base">PCPartPicker Bangladesh</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              The intelligent PC building and price comparison platform for tech enthusiasts in Bangladesh. We scan
              and compare real-time hardware prices across leading national retailers to help you assemble the best
              compatible PC for your budget.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Star Tech</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Tech Land</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Ryans Computers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/builder" className="hover:text-cyan-400 transition-colors">
                  Automated Budget Builder
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-cyan-400 transition-colors">
                  Search & Compare PC Parts
                </Link>
              </li>
              <li>
                <Link href="/crawler" className="hover:text-cyan-400 transition-colors">
                  Live Scraper & Catalog Sync
                </Link>
              </li>
            </ul>
          </div>

          {/* Retailer Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Scanned Retailers</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.startech.com.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  Star Tech & Engineering <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.techlandbd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  Tech Land BD <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ryans.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  Ryans Computers <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PCPartPicker BD. Product names and trademarks are property of their respective owners.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Crafted for PC builders in Bangladesh <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
