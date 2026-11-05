import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CALCULATOR_CATALOG,
  CALCULATOR_CATEGORIES,
  CalculatorCategory,
  CalculatorMeta,
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
  ArrowRight,
  Calculator as CalcIcon,
  ChevronDown,
} from 'lucide-react';
import { ARC_GALLERY_CONSTANTS } from './arcGalleryConstants';
import { getCalculatorCardData } from './calculatorVisuals';
import { CalculatorArcGallery } from './CalculatorArcGallery';
import { scrollWindowTo } from '@/lib/smoothScroll';

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
  activeCalculatorSlug,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const sectionTopRef = useRef<HTMLDivElement>(null);

  // Monitor user preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const filteredCalculators = useMemo(() => {
    return searchCalculators(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  const popularCalculators = useMemo(() => {
    return CALCULATOR_CATALOG.filter((c) => c.isPopular && c.isPublicDirectory);
  }, []);

  // Filter change always returns to the collapsed state
  const handleCategoryChange = (cat: CalculatorCategory) => {
    setActiveCategory(cat);
    setIsExpanded(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsExpanded(false);
  };

  // Toggle between collapsed 4-card grid and full-screen cinematic Arc Gallery
  const handleToggleExpand = () => {
    setIsExpanded((prev) => {
      const nextState = !prev;
      // When toggling, smoothly jump back to the top of the section
      setTimeout(() => {
        if (sectionTopRef.current) {
          const topPos = sectionTopRef.current.getBoundingClientRect().top + window.scrollY - 84;
          scrollWindowTo(topPos, true);
        }
      }, 50);
      return nextState;
    });
  };

  // Determine which calculators to show in collapsed state
  const hasMoreThanInitial = filteredCalculators.length > ARC_GALLERY_CONSTANTS.INITIAL_VISIBLE_COUNT;
  const collapsedCalculators = useMemo(() => {
    return filteredCalculators.slice(0, ARC_GALLERY_CONSTANTS.INITIAL_VISIBLE_COUNT);
  }, [filteredCalculators]);

  return (
    <div ref={sectionTopRef} id="explore-calculators-section" className="w-full space-y-8 scroll-mt-24">
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
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search calculator (e.g. SIP, EMI, PPF)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-400 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
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
                onClick={() => handleCategoryChange(cat.id)}
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

      {/* State Switch: Expanded Full-Screen Arc Gallery vs Collapsed 2-Column Grid */}
      {isExpanded && !prefersReducedMotion ? (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
          <CalculatorArcGallery
            calculators={filteredCalculators}
            onSelectCalculator={onSelectCalculator}
            onCollapse={handleToggleExpand}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeCategory === 'all'
                ? 'Featured Calculators'
                : CALCULATOR_CATEGORIES.find((c) => c.id === activeCategory)?.label}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                (Showing {Math.min(ARC_GALLERY_CONSTANTS.INITIAL_VISIBLE_COUNT, filteredCalculators.length)} of {filteredCalculators.length} available)
              </span>
            </h3>

            {hasMoreThanInitial && (
              <button
                type="button"
                onClick={handleToggleExpand}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                <span>View All {filteredCalculators.length} Calculators ↓</span>
              </button>
            )}
          </div>

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
            <>
              {/* Normal 2-Column Grid (single column below 820px) */}
              <div className="grid grid-cols-1 min-[820px]:grid-cols-2 gap-6">
                {(prefersReducedMotion ? filteredCalculators : collapsedCalculators).map((calc, idx) => {
                  const data = getCalculatorCardData(calc, idx);
                  const isSelected = activeCalculatorSlug === calc.slug || activeCalculatorSlug === calc.id;

                  return (
                    <div
                      key={calc.id}
                      onClick={() => onSelectCalculator(calc.slug)}
                      className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 dark:hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 dark:border-cyan-400 ring-2 ring-blue-500/20 dark:ring-cyan-400/20 bg-blue-50/20 dark:bg-blue-950/20'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md'
                      }`}
                    >
                      {/* 16:10 Rounded Visual Image on Top */}
                      <div className="p-4 sm:p-5 pb-0">
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-inner">
                          <img
                            src={data.imageUrl}
                            alt={calc.name}
                            loading="lazy"
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-sm border border-white/10">
                              {data.numberStr}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 backdrop-blur-sm">
                              {calc.categoryLabel}
                            </span>
                          </div>
                          {calc.isPopular && (
                            <span className="absolute top-2.5 right-2.5 z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 backdrop-blur-sm">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 sm:p-6 pt-4 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                            {calc.name}
                          </h4>

                          {/* Up to 3 Tech/Feature Tags */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {data.tags.slice(0, 3).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {calc.shortDescription}
                          </p>
                        </div>

                        {/* Card Bottom Links */}
                        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono text-[11px] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            Formula: {data.formulaBadge}
                          </span>
                          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                            Calculate Now <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Centered "View All Calculators ↓" Button */}
              {hasMoreThanInitial && !prefersReducedMotion && (
                <div className="pt-6 pb-2 flex flex-col items-center justify-center">
                  <button
                    type="button"
                    onClick={handleToggleExpand}
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 shadow-lg shadow-blue-500/20 dark:shadow-cyan-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>View All {filteredCalculators.length} Calculators</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Click to launch the full-screen interactive 3D Arc Gallery
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculatorDirectory;
