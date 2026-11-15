import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  IndianRupee,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { CalculatorCTAButtons } from './CalculatorCTAButtons';
import { DownloadResultsSection } from './DownloadResultsSection';
import { CalculatorExportData } from '@/utils/calculatorExportGenerator';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  calculateSIP,
  formatINR,
  formatCompactINR,
  SIPCalculatorInputs,
  MAX_SIP_MONTHLY,
  MIN_SIP_MONTHLY,
  SIP_QUICK_PRESETS,
} from '@/utils/sipCalculator';
import {
  valueToSliderPos,
  sliderPosToValue,
  SIP_MONTHLY_SCALE,
} from '@/utils/sliderScaleUtils';
import { VpfVsPpfComparison } from './VpfVsPpfComparison';
import { cn } from '@/lib/utils';

interface SIPCalculatorProps {
  className?: string;
  showHeading?: boolean;
}

export default function SIPCalculator({ className, showHeading = false }: SIPCalculatorProps) {
  // Input states with sensible defaults
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [monthlyInputStr, setMonthlyInputStr] = useState<string>('5,000');
  const [isMonthlyFocused, setIsMonthlyFocused] = useState<boolean>(false);

  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [returnInputStr, setReturnInputStr] = useState<string>('12');

  const [investmentDuration, setInvestmentDuration] = useState<number>(10);
  const [durationInputStr, setDurationInputStr] = useState<string>('10');

  // Step-up options
  const [isStepUpEnabled, setIsStepUpEnabled] = useState<boolean>(false);
  const [stepUpPercentage, setStepUpPercentage] = useState<number>(10);
  const [stepUpInputStr, setStepUpInputStr] = useState<string>('10');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  // Expandable sections
  const [isGrowthTableOpen, setIsGrowthTableOpen] = useState<boolean>(false);
  const [chartView, setChartView] = useState<'donut' | 'growth'>('donut');

  // Validation messages
  const [validationErrors, setValidationErrors] = useState<{
    monthly?: string;
    returnRate?: string;
    duration?: string;
    stepUp?: string;
  }>({});

  // Memoized SIP calculation
  const calculationResult = useMemo(() => {
    const inputs: SIPCalculatorInputs = {
      monthlyInvestment,
      expectedAnnualReturn: expectedReturn,
      investmentDurationYears: investmentDuration,
      isStepUpEnabled,
      stepUpPercentage,
    };
    return calculateSIP(inputs);
  }, [monthlyInvestment, expectedReturn, investmentDuration, isStepUpEnabled, stepUpPercentage]);

  const getExportData = (): CalculatorExportData => {
    return {
      calculatorType: 'sip',
      calculatorTitle: isStepUpEnabled ? 'Step-Up SIP Investment Calculator' : 'Systematic Investment Plan (SIP) Calculator',
      generatedDateStr: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      inputs: [
        { label: 'Monthly SIP Installment', value: formatINR(monthlyInvestment) },
        { label: 'Expected Annual Return Rate', value: `${expectedReturn}% per annum` },
        { label: 'Investment Time Horizon', value: `${investmentDuration} Years` },
        ...(isStepUpEnabled ? [{ label: 'Annual Step-Up Increment', value: `${stepUpPercentage}% per year` }] : []),
      ],
      summaryMetrics: [
        { label: 'Total Invested Capital', value: formatINR(calculationResult.totalInvested) },
        { label: 'Estimated Wealth Returns', value: `+${formatINR(calculationResult.estimatedReturns)}` },
        { label: 'Projected Portfolio Value', value: formatINR(calculationResult.futureValue), isHighlight: true },
        { label: 'Wealth Multiplier', value: `${(calculationResult.futureValue / (calculationResult.totalInvested || 1)).toFixed(2)}x` },
      ],
      scheduleHeaders: [
        'Year',
        'Monthly Contribution',
        'Cumulative Invested',
        'Estimated Returns',
        'Portfolio Value',
      ],
      growthSchedule: calculationResult.yearlyBreakdown.map((row) => ({
        col1: `Year ${row.year}`,
        col2: formatINR(row.monthlyContribution),
        col3: formatINR(row.cumulativeInvested),
        col4: `+${formatINR(row.estimatedReturns)}`,
        col5: formatINR(row.futureValue),
      })),
      notes: `Based on ${Math.round(investmentDuration * 12)} beginning-of-month contributions at ${expectedReturn}% annualized growth compounding monthly.`,
      disclaimer: 'These calculations are illustrative estimates based on the selected return assumptions and cash-flow schedule. Actual investment returns may vary and are not guaranteed. Market risks apply. This calculator does not constitute investment advice.',
    };
  };

  // Input change handlers with validation
  const handleMonthlyChange = (valStr: string) => {
    setMonthlyInputStr(valStr);
    const cleaned = valStr.replace(/[^0-9]/g, '');
    const num = Number(cleaned);

    if (valStr.trim() === '') {
      setValidationErrors((prev) => ({ ...prev, monthly: 'Monthly investment is required.' }));
      setMonthlyInvestment(0);
    } else if (isNaN(num) || num < 0) {
      setValidationErrors((prev) => ({ ...prev, monthly: 'Please enter a valid positive number.' }));
      setMonthlyInvestment(0);
    } else if (num < MIN_SIP_MONTHLY) {
      setValidationErrors((prev) => ({ ...prev, monthly: `Minimum recommended monthly SIP is ₹${MIN_SIP_MONTHLY.toLocaleString('en-IN')}.` }));
      setMonthlyInvestment(num > 0 ? num : 0);
    } else if (num > MAX_SIP_MONTHLY) {
      setValidationErrors((prev) => ({ ...prev, monthly: 'Maximum monthly SIP supported is ₹100 Crore (₹1,00,00,00,000).' }));
      // Strictly enforce limit: clamp calculation state to ₹100 Crore, never silently calculate above limit
      setMonthlyInvestment(MAX_SIP_MONTHLY);
    } else {
      setValidationErrors((prev) => ({ ...prev, monthly: undefined }));
      setMonthlyInvestment(num);
    }
  };

  const handleMonthlyBlur = () => {
    setIsMonthlyFocused(false);
    if (monthlyInvestment > MAX_SIP_MONTHLY) {
      setMonthlyInvestment(MAX_SIP_MONTHLY);
      setMonthlyInputStr(MAX_SIP_MONTHLY.toLocaleString('en-IN'));
      setValidationErrors((prev) => ({ ...prev, monthly: undefined }));
    } else if (monthlyInvestment > 0) {
      setMonthlyInputStr(monthlyInvestment.toLocaleString('en-IN'));
    }
  };

  const handleMonthlyFocus = () => {
    setIsMonthlyFocused(true);
    if (monthlyInvestment > 0) {
      setMonthlyInputStr(monthlyInvestment.toString());
    }
  };

  const handleReturnChange = (valStr: string) => {
    if (valStr.trim() === '') {
      setReturnInputStr('');
      setExpectedReturn(0);
      setValidationErrors((prev) => ({ ...prev, returnRate: 'Expected return is required.' }));
      return;
    }

    const num = parseFloat(valStr);
    if (isNaN(num)) {
      setReturnInputStr('');
      setExpectedReturn(0);
      setValidationErrors((prev) => ({ ...prev, returnRate: 'Expected return is required.' }));
      return;
    }

    if (num < 0) {
      setReturnInputStr('0');
      setExpectedReturn(0);
      setValidationErrors((prev) => ({ ...prev, returnRate: undefined }));
      return;
    }

    if (num > 35) {
      // Strictly prevent values above 35%: clamp immediately
      setReturnInputStr('35');
      setExpectedReturn(35);
      setValidationErrors((prev) => ({ ...prev, returnRate: undefined }));
      return;
    }

    setReturnInputStr(valStr);
    setExpectedReturn(num);
    setValidationErrors((prev) => ({ ...prev, returnRate: undefined }));
  };

  const handleReturnBlur = () => {
    const num = parseFloat(returnInputStr);
    if (isNaN(num) || num < 1) {
      setReturnInputStr('1');
      setExpectedReturn(1);
    } else if (num > 35) {
      setReturnInputStr('35');
      setExpectedReturn(35);
    } else {
      setReturnInputStr(num.toString());
      setExpectedReturn(num);
    }
    setValidationErrors((prev) => ({ ...prev, returnRate: undefined }));
  };

  const handleDurationChange = (valStr: string) => {
    if (valStr.trim() === '') {
      setDurationInputStr('');
      setInvestmentDuration(1);
      setValidationErrors((prev) => ({ ...prev, duration: 'Duration must be at least 1 year.' }));
      return;
    }

    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) {
      setDurationInputStr('1');
      setInvestmentDuration(1);
      setValidationErrors((prev) => ({ ...prev, duration: undefined }));
      return;
    }

    if (num > 40) {
      // Strictly prevent values above 40: clamp immediately
      setDurationInputStr('40');
      setInvestmentDuration(40);
      setValidationErrors((prev) => ({ ...prev, duration: undefined }));
      return;
    }

    setDurationInputStr(valStr);
    setInvestmentDuration(num);
    setValidationErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const handleDurationBlur = () => {
    const num = parseFloat(durationInputStr);
    if (isNaN(num) || num < 1) {
      setDurationInputStr('1');
      setInvestmentDuration(1);
    } else if (num > 40) {
      setDurationInputStr('40');
      setInvestmentDuration(40);
    } else {
      setDurationInputStr(num.toString());
      setInvestmentDuration(num);
    }
    setValidationErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const handleStepUpChange = (valStr: string) => {
    setStepUpInputStr(valStr);
    const num = parseFloat(valStr);

    if (valStr.trim() === '' || isNaN(num) || num < 1) {
      setValidationErrors((prev) => ({ ...prev, stepUp: 'Minimum step-up is 1%.' }));
      setStepUpPercentage(1);
    } else if (num > 50) {
      setValidationErrors((prev) => ({ ...prev, stepUp: 'Maximum recommended step-up is 50%.' }));
      setStepUpPercentage(50);
    } else {
      setValidationErrors((prev) => ({ ...prev, stepUp: undefined }));
      setStepUpPercentage(num);
    }
  };

  // Synchronized slider handlers
  const handleMonthlySlider = (val: number) => {
    setMonthlyInvestment(val);
    setMonthlyInputStr(val.toLocaleString('en-IN'));
    setValidationErrors((prev) => ({ ...prev, monthly: undefined }));
  };

  const handleReturnSlider = (val: number) => {
    setExpectedReturn(val);
    setReturnInputStr(val.toString());
    setValidationErrors((prev) => ({ ...prev, returnRate: undefined }));
  };

  const handleDurationSlider = (val: number) => {
    setInvestmentDuration(val);
    setDurationInputStr(val.toString());
    setValidationErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const handleStepUpSlider = (val: number) => {
    setStepUpPercentage(val);
    setStepUpInputStr(val.toString());
    setValidationErrors((prev) => ({ ...prev, stepUp: undefined }));
  };

  // Donut chart dataset
  const donutData = useMemo(() => {
    return [
      { name: 'Total Invested', value: Math.round(calculationResult.totalInvested) },
      { name: 'Estimated Returns', value: Math.round(calculationResult.estimatedReturns) },
    ];
  }, [calculationResult.totalInvested, calculationResult.estimatedReturns]);

  const DONUT_COLORS = ['#3B82F6', '#10B981'];

  // Year-by-year chart dataset
  const growthChartData = useMemo(() => {
    return calculationResult.yearlyBreakdown.map((item) => ({
      name: `Yr ${item.year}`,
      year: item.year,
      invested: Math.round(item.cumulativeInvested),
      returns: Math.round(item.estimatedReturns),
      futureValue: Math.round(item.futureValue),
    }));
  }, [calculationResult.yearlyBreakdown]);

  const investedRatio = calculationResult.futureValue > 0
    ? Math.round((calculationResult.totalInvested / calculationResult.futureValue) * 100)
    : 0;
  const returnsRatio = Math.max(0, 100 - investedRatio);

  return (
    <div className={cn("w-full space-y-8", className)}>
      {showHeading && (
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3 border border-blue-200 dark:border-blue-900/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Mutual Fund Tool</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Systematic Investment Plan (SIP) Calculator
          </h2>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            Forecast your wealth accumulation through disciplined monthly compounding.
          </p>
        </div>
      )}

      {/* Main Calculator Layout: Left Inputs, Right Result Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Input Controls */}
        <div className="lg:col-span-6 space-y-6 bg-white dark:bg-gray-900/90 rounded-2xl p-6 sm:p-7 border border-gray-200/80 dark:border-gray-800 shadow-sm backdrop-blur-md">
          {/* 1. Monthly SIP Investment */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Label htmlFor="sip-monthly-amount" className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Monthly SIP Investment</span>
              </Label>
              <div className="relative min-w-[160px] sm:w-52 lg:w-56 max-w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm pointer-events-none select-none">₹</span>
                <Input
                  id="sip-monthly-amount"
                  type="text"
                  value={monthlyInputStr}
                  onChange={(e) => handleMonthlyChange(e.target.value)}
                  onFocus={handleMonthlyFocus}
                  onBlur={handleMonthlyBlur}
                  className="pl-7 pr-3 text-right font-bold text-gray-900 dark:text-white bg-gray-50/70 dark:bg-gray-800/80 border-gray-300 dark:border-gray-700 h-10 w-full min-w-0 focus-visible:ring-blue-500"
                  style={{
                    fontSize: monthlyInputStr.length > 13 ? '0.8125rem' : monthlyInputStr.length > 10 ? '0.875rem' : '1rem',
                  }}
                  aria-label="Monthly SIP Amount in Rupees"
                />
                {monthlyInvestment >= 100000 && !isMonthlyFocused && (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block text-right mt-0.5">
                    ({formatCompactINR(monthlyInvestment)})
                  </span>
                )}
              </div>
            </div>

            <Slider
              value={[valueToSliderPos(monthlyInvestment, SIP_MONTHLY_SCALE)]}
              min={0}
              max={100}
              step={0.5}
              onValueChange={(vals) => handleMonthlySlider(sliderPosToValue(vals[0], SIP_MONTHLY_SCALE))}
              className="py-1 cursor-pointer"
              aria-label="Monthly Investment Slider"
            />

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
              {SIP_MONTHLY_SCALE.labels.map((item, idx) => (
                <span key={idx}>{item.label}</span>
              ))}
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SIP_QUICK_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleMonthlySlider(preset)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 border",
                    monthlyInvestment === preset
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  {preset >= 100000 ? formatCompactINR(preset) : `₹${preset.toLocaleString('en-IN')}`}
                </button>
              ))}
            </div>

            {validationErrors.monthly && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.monthly}
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800/80" />

          {/* 2. Expected Annual Return */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sip-expected-return" className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Expected Annual Return
                </Label>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">
                  Illustrative rate assumption (non-guaranteed)
                </span>
              </div>
              <div className="relative w-28 sm:w-32">
                <Input
                  id="sip-expected-return"
                  type="number"
                  step="0.1"
                  min="1"
                  max="35"
                  value={returnInputStr}
                  onChange={(e) => handleReturnChange(e.target.value)}
                  onBlur={handleReturnBlur}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                  }}
                  className="pr-7 text-right font-bold text-gray-900 dark:text-white bg-gray-50/70 dark:bg-gray-800/80 border-gray-300 dark:border-gray-700 h-10 text-base focus-visible:ring-blue-500"
                  aria-label="Expected Annual Return Percentage"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">%</span>
              </div>
            </div>

            <Slider
              value={[expectedReturn]}
              min={1}
              max={35}
              step={0.5}
              onValueChange={(vals) => handleReturnSlider(vals[0])}
              className="py-1 cursor-pointer"
              aria-label="Expected Return Slider"
            />

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>1%</span>
              <span>12%</span>
              <span>20%</span>
              <span>35%</span>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 pt-1">
              {[
                { label: '8% (Debt)', val: 8 },
                { label: '12% (Balanced)', val: 12 },
                { label: '15% (Equity)', val: 15 },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => handleReturnSlider(item.val)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 border",
                    expectedReturn === item.val
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {validationErrors.returnRate && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.returnRate}
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800/80" />

          {/* 3. Investment Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sip-duration" className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Investment Duration
                </Label>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">
                  {Math.round(investmentDuration * 12)} monthly contributions
                </span>
              </div>
              <div className="relative w-28 sm:w-32">
                <Input
                  id="sip-duration"
                  type="number"
                  min="1"
                  max="40"
                  step="1"
                  value={durationInputStr}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  onBlur={handleDurationBlur}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === '.') e.preventDefault();
                  }}
                  className="pr-9 text-right font-bold text-gray-900 dark:text-white bg-gray-50/70 dark:bg-gray-800/80 border-gray-300 dark:border-gray-700 h-10 text-base focus-visible:ring-blue-500"
                  aria-label="Investment Duration in Years"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-xs">Yrs</span>
              </div>
            </div>

            <Slider
              value={[investmentDuration]}
              min={1}
              max={40}
              step={1}
              onValueChange={(vals) => handleDurationSlider(vals[0])}
              className="py-1 cursor-pointer"
              aria-label="Investment Duration Slider"
            />

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>1 Yr</span>
              <span>10 Yrs</span>
              <span>25 Yrs</span>
              <span>40 Yrs</span>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 pt-1">
              {[3, 5, 10, 15, 20].map((yrs) => (
                <button
                  key={yrs}
                  type="button"
                  onClick={() => handleDurationSlider(yrs)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 border",
                    investmentDuration === yrs
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400"
                  )}
                >
                  {yrs} Years
                </button>
              ))}
            </div>

            {validationErrors.duration && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.duration}
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800/80" />

          {/* 4. Advanced SIP Options (Step-Up SIP) */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden transition-all duration-200">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left font-medium text-sm sm:text-base text-gray-900 dark:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-colors"
              aria-expanded={isAdvancedOpen}
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Advanced SIP Options</span>
                {isStepUpEnabled && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/60">
                    Step-Up Active (+{stepUpPercentage}%)
                  </span>
                )}
              </div>
              {isAdvancedOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
            </button>

            {isAdvancedOpen && (
              <div className="p-4 pt-2 border-t border-gray-200 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="stepup-toggle" className="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                      Annual SIP Step-Up
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-sm">
                      Increase your monthly SIP contribution annually to keep pace with income growth.
                    </p>
                  </div>
                  <Switch
                    id="stepup-toggle"
                    checked={isStepUpEnabled}
                    onCheckedChange={setIsStepUpEnabled}
                    aria-label="Toggle Annual Step-Up SIP"
                  />
                </div>

                {isStepUpEnabled && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stepup-rate" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Annual Increase Rate (%)
                      </Label>
                      <div className="relative w-24">
                        <Input
                          id="stepup-rate"
                          type="number"
                          min="1"
                          max="50"
                          value={stepUpInputStr}
                          onChange={(e) => handleStepUpChange(e.target.value)}
                          className="pr-6 text-right font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 h-9 text-sm"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-semibold">%</span>
                      </div>
                    </div>

                    <Slider
                      value={[stepUpPercentage]}
                      min={1}
                      max={50}
                      step={1}
                      onValueChange={(vals) => handleStepUpSlider(vals[0])}
                      className="py-1 cursor-pointer"
                    />

                    <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                      <span>1%</span>
                      <span>10% (Default)</span>
                      <span>25%</span>
                      <span>50%</span>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Your SIP starts at <strong>{formatINR(monthlyInvestment)}</strong>/mo in Year 1, increasing by {stepUpPercentage}% to <strong>{formatINR(monthlyInvestment * (1 + stepUpPercentage / 100))}</strong>/mo in Year 2.
                      </span>
                    </div>

                    {validationErrors.stepUp && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {validationErrors.stepUp}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Result Cards & Visual Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          {/* Primary Result Dashboard: 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Featured Primary Result Card: Estimated Future Value */}
            <Card className="sm:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl shadow-lg border-0 min-w-0">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <TrendingUp size={120} />
              </div>
              <CardContent className="p-6 relative z-10 min-w-0">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <span className="text-xs uppercase font-bold tracking-widest text-blue-200">
                    Projected Wealth
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20 shrink-0">
                    {calculationResult.investmentDurationYears} Years ({calculationResult.investmentDurationMonths} Mo)
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-blue-100 font-medium">
                  Estimated Future Value
                </div>
                <div 
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-1 text-white break-words"
                  title={formatINR(calculationResult.futureValue)}
                >
                  {formatINR(calculationResult.futureValue)}
                </div>
                <div className="mt-2 text-xs text-blue-100 flex items-center gap-2 flex-wrap">
                  <span>Equivalent to: <strong>{formatCompactINR(calculationResult.futureValue)}</strong></span>
                  {isStepUpEnabled && (
                    <span className="bg-amber-400 text-gray-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      With Step-Up
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Total Invested Amount */}
            <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 shadow-sm min-w-0 overflow-hidden">
              <CardContent className="p-5 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                    Total Invested
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 ml-2" />
                </div>
                <div 
                  className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words"
                  title={formatINR(calculationResult.totalInvested)}
                >
                  {calculationResult.totalInvested >= 10000000 
                    ? formatCompactINR(calculationResult.totalInvested) 
                    : formatINR(calculationResult.totalInvested)}
                </div>
                {calculationResult.totalInvested >= 10000000 && (
                  <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate mt-0.5" title={formatINR(calculationResult.totalInvested)}>
                    {formatINR(calculationResult.totalInvested)}
                  </div>
                )}
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {investedRatio}% of total corpus
                </div>
              </CardContent>
            </Card>

            {/* 3. Estimated Returns */}
            <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 shadow-sm min-w-0 overflow-hidden">
              <CardContent className="p-5 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">
                    Estimated Returns
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ml-2" />
                </div>
                <div 
                  className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 break-words"
                  title={formatINR(calculationResult.estimatedReturns)}
                >
                  {calculationResult.estimatedReturns >= 10000000 
                    ? formatCompactINR(calculationResult.estimatedReturns) 
                    : formatINR(calculationResult.estimatedReturns)}
                </div>
                {calculationResult.estimatedReturns >= 10000000 && (
                  <div className="text-[11px] font-mono text-emerald-600/80 dark:text-emerald-400/80 truncate mt-0.5" title={formatINR(calculationResult.estimatedReturns)}>
                    +{formatINR(calculationResult.estimatedReturns)}
                  </div>
                )}
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {returnsRatio}% compounding growth
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculator Call-to-Action Buttons */}
          <CalculatorCTAButtons sourceCalculator="sip" />

          {/* Visual Breakdown: Chart Container */}
          <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  Visual Investment Breakdown
                </span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setChartView('donut')}
                  className={cn(
                    "px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all",
                    chartView === 'donut'
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                  aria-label="Show Donut Ratio Chart"
                >
                  <PieChartIcon className="w-3.5 h-3.5" />
                  <span>Ratio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('growth')}
                  className={cn(
                    "px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all",
                    chartView === 'growth'
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                  aria-label="Show Growth Timeline Chart"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Growth Curve</span>
                </button>
              </div>
            </div>

            {chartView === 'donut' ? (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-4 h-60">
                <div className="w-48 h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={DONUT_COLORS[index]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val: number) => [formatINR(val), ""]}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          color: '#fff',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase">Returns</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{returnsRatio}%</span>
                  </div>
                </div>

                <div className="space-y-3 w-full sm:w-auto text-xs">
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Invested Capital</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{formatINR(calculationResult.totalInvested)}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Estimated Gains</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(calculationResult.estimatedReturns)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-gray-500 font-semibold">Total Wealth</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{formatINR(calculationResult.futureValue)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorFutureValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(val) => formatCompactINR(val)} tick={{ fontSize: 10 }} />
                    <RechartsTooltip
                      formatter={(val: number, name: string) => [
                        formatINR(val),
                        name === 'futureValue' ? 'Total Portfolio Value' : 'Invested Capital',
                      ]}
                      labelFormatter={(label) => `Timeline: ${label}`}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      formatter={(val) => (val === 'futureValue' ? 'Projected Portfolio Value' : 'Invested Capital')}
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="invested" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorInvested)" />
                    <Area type="monotone" dataKey="futureValue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFutureValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 text-center">
              Based on {Math.round(investmentDuration * 12)} beginning-of-month contributions at {expectedReturn}% annualized growth compounding monthly.
            </p>
          </Card>
        </div>
      </div>

      {/* Year-by-Year Growth Projection Table (Expandable Section) */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/90 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setIsGrowthTableOpen(!isGrowthTableOpen)}
          className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-base text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          aria-expanded={isGrowthTableOpen}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-sm sm:text-base font-bold">View Investment Growth</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                Year-by-year schedule of monthly contributions, cumulative investment, and wealth accumulation
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {calculationResult.yearlyBreakdown.length} Years Schedule
            </span>
            {isGrowthTableOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
          </div>
        </button>

        {isGrowthTableOpen && (
          <div className="border-t border-gray-200 dark:border-gray-800 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Year</th>
                  <th className="py-3.5 px-4">Monthly SIP</th>
                  <th className="py-3.5 px-4">Cumulative Invested</th>
                  <th className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400">Estimated Returns</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right font-bold text-blue-600 dark:text-blue-400">Portfolio Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 font-medium">
                {calculationResult.yearlyBreakdown.map((row) => (
                  <tr key={row.year} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
                    <td className="py-3 px-4 sm:px-6 font-bold text-gray-900 dark:text-white">
                      Year {row.year}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {formatINR(row.monthlyContribution)}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {formatINR(row.cumulativeInvested)}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{formatINR(row.estimatedReturns)}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right font-bold text-gray-900 dark:text-white">
                      {formatINR(row.futureValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Download Calculation Results (PDF and Word exports) */}
      <DownloadResultsSection getData={getExportData} className="mt-6 mb-6" />

      {/* Financial Accuracy & User Disclaimer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 text-xs sm:text-sm leading-relaxed">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
              Important Financial Disclaimer
            </p>
            <p>
              These calculations are illustrative estimates based on the selected return assumptions and cash-flow schedule. Actual investment returns may vary and are not guaranteed. Market risks apply. This calculator does not constitute investment advice.
            </p>
          </div>
        </div>
      </div>

      {/* VPF vs PPF Educational Comparison Section */}
      <VpfVsPpfComparison calculatorId="sip" />
    </div>
  );
}
