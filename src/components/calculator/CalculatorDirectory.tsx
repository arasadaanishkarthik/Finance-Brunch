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
  ArrowUpRight,
} from 'lucide-react';

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
                  ? 'All Calculators'
                  : CALCULATOR_CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </span>
              <span className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 font-mono">
                ({filteredCalculators.length} available)
              </span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline-block">
              Click to calculate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5 sm:gap-5">
            {filteredCalculators.map((calc) => {
              // Category theme styling
              const isGov = calc.category === 'government';
              const isLoan = calc.category === 'loans' || calc.category === 'loans-tax-salary';
              const isTax = calc.category === 'tax';
              const isTrading = calc.category === 'trading';

              const accentBorder = isGov
                ? 'group-hover:border-emerald-500/60 dark:group-hover:border-emerald-400/60'
                : isLoan
                ? 'group-hover:border-amber-500/60 dark:group-hover:border-amber-400/60'
                : isTax
                ? 'group-hover:border-purple-500/60 dark:group-hover:border-purple-400/60'
                : isTrading
                ? 'group-hover:border-rose-500/60 dark:group-hover:border-rose-400/60'
                : 'group-hover:border-blue-500/60 dark:group-hover:border-cyan-400/60';

              const accentShadow = isGov
                ? 'group-hover:shadow-emerald-500/10'
                : isLoan
                ? 'group-hover:shadow-amber-500/10'
                : isTax
                ? 'group-hover:shadow-purple-500/10'
                : isTrading
                ? 'group-hover:shadow-rose-500/10'
                : 'group-hover:shadow-blue-500/10';

              const topBarGradient = isGov
                ? 'from-emerald-500 via-teal-400 to-emerald-600'
                : isLoan
                ? 'from-amber-500 via-orange-400 to-amber-600'
                : isTax
                ? 'from-purple-500 via-indigo-400 to-purple-600'
                : isTrading
                ? 'from-rose-500 via-pink-400 to-rose-600'
                : 'from-blue-600 via-cyan-400 to-blue-500';

              const badgeStyle = isGov
                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                : isLoan
                ? 'bg-amber-50/90 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                : isTax
                ? 'bg-purple-50/90 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60'
                : isTrading
                ? 'bg-rose-50/90 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60'
                : 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-300 border-blue-200/80 dark:border-blue-800/60';

              const hoverTextColor = isGov
                ? 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                : isLoan
                ? 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
                : isTax
                ? 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
                : isTrading
                ? 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
                : 'group-hover:text-blue-600 dark:group-hover:text-cyan-400';

              const arrowBg = isGov
                ? 'group-hover:bg-emerald-500/15 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                : isLoan
                ? 'group-hover:bg-amber-500/15 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                : isTax
                ? 'group-hover:bg-purple-500/15 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                : isTrading
                ? 'group-hover:bg-rose-500/15 group-hover:text-rose-600 dark:group-hover:text-rose-400'
                : 'group-hover:bg-blue-500/15 group-hover:text-blue-600 dark:group-hover:text-cyan-400';

              return (
                <button
                  key={calc.id}
                  onClick={() => onSelectCalculator(calc.slug)}
                  className={`group relative text-left w-full flex flex-col justify-between bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-5 shadow-xs hover:shadow-xl ${accentBorder} ${accentShadow} hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-400 overflow-hidden cursor-pointer`}
                >
                  {/* Top colored accent line with smooth expansion on hover */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${topBarGradient} opacity-60 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300`}
                  />

                  {/* Upper Content */}
                  <div className="space-y-3 pt-1">
                    {/* Header Row: Category Badge + Arrow Icon */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${badgeStyle} transition-colors`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                        <span className="truncate max-w-[170px]">{calc.categoryLabel}</span>
                      </span>

                      <div
                        className={`w-7 h-7 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 ${arrowBg} transition-all duration-200 shrink-0 group-hover:rotate-12`}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Calculator Title */}
                    <h4
                      className={`text-base font-bold text-slate-900 dark:text-white leading-snug ${hoverTextColor} transition-colors duration-200`}
                    >
                      {calc.name}
                    </h4>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {calc.shortDescription}
                    </p>
                  </div>

                  {/* Card Footer: Popular Badge + Action Cue */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/70">
                    {calc.isPopular ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/40 shadow-2xs">
                        <span>★</span>
                        <span>Popular</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {calc.formula.length > 22 ? calc.formula.slice(0, 22) + '...' : calc.formula}
                      </span>
                    )}

                    <span
                      className={`text-xs font-semibold text-slate-400 dark:text-slate-500 ${hoverTextColor} group-hover:translate-x-0.5 transition-all duration-200 flex items-center gap-1`}
                    >
                      <span>Calculate</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorDirectory;
