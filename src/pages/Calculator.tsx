import { useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import MutualFundCalculator from '@/components/calculator/MutualFundCalculator';
import { CalculationWatcher } from '@/components/calculator/calculationWatcher';
import { CalculatorDirectory } from '@/components/calculator/CalculatorDirectory';
import { UniversalCalculatorView } from '@/components/calculator/UniversalCalculatorView';
import {
  CALCULATOR_CATALOG,
  getCalculatorBySlugOrId,
} from '@/utils/calculators/calculatorCatalog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Grid } from 'lucide-react';

const Calculator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ calculatorSlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine active calculator from params, query, or path
  const activeCalculator = useMemo(() => {
    // 1. Check path param /calculator/:calculatorSlug
    if (params.calculatorSlug) {
      const found = getCalculatorBySlugOrId(params.calculatorSlug);
      if (found) return found;
    }

    // 2. Check query param ?calc=...
    const calcQuery = searchParams.get('calc');
    if (calcQuery) {
      const found = getCalculatorBySlugOrId(calcQuery);
      if (found) return found;
    }

    // 3. Check standalone vanity routes like /sip-calculator, /lumpsum-calculator
    const path = location.pathname.toLowerCase().replace(/^\//, '');
    if (path.endsWith('-calculator')) {
      const found = getCalculatorBySlugOrId(path);
      if (found) return found;
    }

    return null;
  }, [params.calculatorSlug, searchParams, location.pathname]);

  const handleSelectCalculator = useCallback((slug: string) => {
    setSearchParams({ calc: slug }, { replace: false });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }, [setSearchParams]);

  const handleBackToDirectory = useCallback(() => {
    if (params.calculatorSlug) {
      navigate('/calculator');
    } else {
      setSearchParams({}, { replace: true });
    }
    window.scrollTo({ top: 120, behavior: 'smooth' });
  }, [navigate, params.calculatorSlug, setSearchParams]);

  const handleHeaderBack = () => {
    if (activeCalculator) {
      handleBackToDirectory();
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <main className="flex-grow pt-20 md:pt-24 pb-24 min-h-screen">
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 3xl:max-w-[1680px] px-4 sm:px-6 lg:px-8 mx-auto space-y-8">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleHeaderBack}
              className="text-blue-600 dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-cyan-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Finance Brunch Calculators</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {activeCalculator ? activeCalculator.name : 'Financial Calculators Directory'}
              </h1>
            </div>
          </div>

          {activeCalculator && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToDirectory}
              className="w-fit text-xs sm:text-sm font-semibold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Grid className="w-4 h-4 mr-1.5" />
              <span>Browse All 26 Calculators</span>
            </Button>
          )}
        </div>

        {/* View Switch: Specific Universal Calculator View vs Directory */}
        {activeCalculator ? (
          <UniversalCalculatorView
            calculator={activeCalculator}
            onBackToDirectory={handleBackToDirectory}
          />
        ) : (
          <div className="space-y-12">
            {/* Mutual Fund Calculator Suite (SIP, Step-Up, Lumpsum, SWP) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Featured: Mutual Fund Investment Calculators
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Switch between SIP, Step-Up SIP, Lumpsum, and SWP for core mutual fund planning.
                  </p>
                </div>
              </div>

              <MutualFundCalculator />
            </div>

            {/* Complete 26-Calculator Directory with Search & Filters */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <CalculatorDirectory
                onSelectCalculator={handleSelectCalculator}
                activeCalculatorSlug={activeCalculator ? (activeCalculator as any).slug : null}
              />
            </div>
          </div>
        )}

        <CalculationWatcher />
      </div>
    </main>
  );
};

export default Calculator;
