import React, { useState, useMemo } from 'react';
import {
  CALCULATOR_CATALOG,
  CALCULATOR_CATEGORIES,
  CalculatorCategory,
  searchCalculators,
} from '@/utils/calculators/calculatorCatalog';
import { Button } from '@/components/ui/button';
import {
  Search,
  Sparkles,
  TrendingUp,
  Landmark,
  CircleDollarSign,
  Receipt,
  CandlestickChart,
  Calculator as CalcIcon,
} from 'lucide-react';
import { CalculatorArcGallery } from './CalculatorArcGallery';

interface CalculatorDirectoryProps {
  onSelectCalculator: (slug: string) => void;
  activeCalculatorSlug?: string | null;
}

const CATEGORY_ICONS: Record<CalculatorCategory, React.ReactNode> = {
  all: <CalcIcon className="w-4 h-4" />,
  investments: <TrendingUp className="w-4 h-4 text-blue-500" />,
  government: <Landmark className="w-4 h-4 text-emerald-500" />,
  'loans-tax-salary': <CircleDollarSign className="w-4 h-4 text-purple-500" />,
  loans: <CircleDollarSign className="w-4 h-4 text-amber-500" />,
  tax: <Receipt className="w-4 h-4 text-purple-500" />,
  trading: <CandlestickChart className="w-4 h-4 text-cyan-500" />,
};

export const CalculatorDirectory: React.FC<CalculatorDirectoryProps> = ({
  onSelectCalculator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory>('all');

  const filteredCalculators = useMemo(() => {
    return searchCalculators(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  const popularCalculators = useMemo(() => {
    return CALCULATOR_CATALOG.filter((c) => c.isPopular && c.isPublicDirectory);
  }, []);

  return (
    <div id="explore-calculators-section" className="w-full space-y-8 scroll-mt-24">
      {/* Search & Filter Header */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comprehensive 26-Calculator Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore All Financial Calculators
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Search or browse verified financial tools across Mutual Funds, Government Schemes, Loans, Tax, and Salary.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search calculator (e.g. SIP, EMI, PPF)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-400 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
          {CALCULATOR_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {CATEGORY_ICONS[cat.id]}
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Popular Calculators Quick Jump */}
        {!searchQuery && activeCategory === 'all' && (
          <div className="pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
              <span>Popular Calculators:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularCalculators.slice(0, 10).map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCalculator(c.slug)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-300 border border-blue-200/70 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Section Content: Full Scroll-Driven Arc Gallery */}
      {filteredCalculators.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Search className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">No calculators found</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            We couldn't find any calculator matching "{searchQuery}". Try searching for SIP, PPF, SSY, or Salary.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {activeCategory === 'all'
                  ? 'All Calculators Arc'
                  : CALCULATOR_CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </span>
              <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 font-mono">
                ({filteredCalculators.length} available)
              </span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline-block">
              Scroll to explore • Click to calculate
            </span>
          </div>

          <CalculatorArcGallery
            key={activeCategory + searchQuery}
            calculators={filteredCalculators}
            onSelectCalculator={onSelectCalculator}
          />
        </div>
      )}
    </div>
  );
};

export default CalculatorDirectory;
