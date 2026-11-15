import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
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
} from 'recharts';
import {
  calculateLumpsum,
  formatINR,
  formatCompactINR,
  MAX_LUMPSUM_AMOUNT,
  MIN_LUMPSUM_AMOUNT,
  LUMPSUM_QUICK_PRESETS,
} from '@/utils/lumpsumCalculator';
import {
  valueToSliderPos,
  sliderPosToValue,
  LUMPSUM_INVESTMENT_SCALE,
} from '@/utils/sliderScaleUtils';
import { CalculatorCTAButtons } from './CalculatorCTAButtons';
import { CalculatorDisclaimer } from './CalculatorDisclaimer';
import { VpfVsPpfComparison } from './VpfVsPpfComparison';
import { DownloadResultsSection } from './DownloadResultsSection';
import { CalculatorExportData } from '@/utils/calculatorExportGenerator';
import { cn } from '@/lib/utils';

export default function LumpsumCalculator() {
  const [initialInvestment, setInitialInvestment] = useState<number>(100000);
  const [investmentInputStr, setInvestmentInputStr] = useState<string>('1,00,000');
  const [isInvestmentFocused, setIsInvestmentFocused] = useState<boolean>(false);

  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [returnInputStr, setReturnInputStr] = useState<string>('12');

  const [investmentDuration, setInvestmentDuration] = useState<number>(10);
  const [durationInputStr, setDurationInputStr] = useState<string>('10');

  const [chartView, setChartView] = useState<'donut' | 'growth'>('donut');
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);

  const [errors, setErrors] = useState<{ investment?: string; returnRate?: string; duration?: string }>({});

  const result = useMemo(() => {
    return calculateLumpsum({
      initialInvestment,
      expectedAnnualReturn: expectedReturn,
      investmentDurationYears: investmentDuration,
    });
  }, [initialInvestment, expectedReturn, investmentDuration]);

  const getExportData = (): CalculatorExportData => {
    const wealthMultiplier = result.totalInvested > 0 
      ? (result.futureValue / result.totalInvested).toFixed(2)
      : '1.00';
    return {
      calculatorType: 'lumpsum',
      calculatorTitle: 'Lumpsum Investment Calculator',
      generatedDateStr: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      inputs: [
        { label: 'Total Initial Investment', value: formatINR(initialInvestment) },
        { label: 'Expected Annual Return Rate', value: `${expectedReturn}% per annum` },
        { label: 'Investment Time Horizon', value: `${investmentDuration} Years` },
      ],
      summaryMetrics: [
        { label: 'Total Invested Capital', value: formatINR(result.totalInvested) },
        { label: 'Estimated Wealth Returns', value: `+${formatINR(result.estimatedReturns)}` },
        { label: 'Projected Future Value', value: formatINR(result.futureValue), isHighlight: true },
        { label: 'Wealth Multiplier', value: `${wealthMultiplier}x` },
      ],
      scheduleHeaders: [
        'Year',
        'Invested Capital',
        'Growth Multiplier',
        'Estimated Returns',
        'Portfolio Value',
      ],
      growthSchedule: result.yearlyBreakdown.map((row) => {
        const mult = row.invested > 0 ? (row.futureValue / row.invested).toFixed(2) : '1.00';
        return {
          col1: `Year ${row.year}`,
          col2: formatINR(row.invested),
          col3: `${mult}x`,
          col4: `+${formatINR(row.estimatedReturns)}`,
          col5: formatINR(row.futureValue),
        };
      }),
      notes: `Lumpsum compounding assumes the entire principal is invested upfront and grows at an effective annual return rate of ${expectedReturn}% over ${investmentDuration} years.`,
      disclaimer: 'These calculations are illustrative estimates based on the selected return assumptions and cash-flow schedule. Actual investment returns may vary and are not guaranteed. Market risks apply. This calculator does not constitute investment advice.',
    };
  };

  const handleInvestmentChange = (valStr: string) => {
    setInvestmentInputStr(valStr);
    const cleaned = valStr.replace(/[^0-9]/g, '');
    const num = Number(cleaned);

    if (valStr.trim() === '') {
      setErrors((prev) => ({ ...prev, investment: 'Investment amount is required.' }));
      setInitialInvestment(0);
    } else if (isNaN(num) || num < 0) {
      setErrors((prev) => ({ ...prev, investment: 'Please enter a valid positive number.' }));
      setInitialInvestment(0);
    } else if (num < MIN_LUMPSUM_AMOUNT) {
      setErrors((prev) => ({ ...prev, investment: `Minimum lumpsum investment is ₹${MIN_LUMPSUM_AMOUNT.toLocaleString('en-IN')}.` }));
      setInitialInvestment(num > 0 ? num : 0);
    } else if (num > MAX_LUMPSUM_AMOUNT) {
      setErrors((prev) => ({ ...prev, investment: 'Maximum investment supported is ₹100 Crore (₹1,00,00,00,000).' }));
      // Strictly enforce limit: clamp calculation state to ₹100 Crore, never silently calculate above limit
      setInitialInvestment(MAX_LUMPSUM_AMOUNT);
    } else {
      setErrors((prev) => ({ ...prev, investment: undefined }));
      setInitialInvestment(num);
    }
  };

  const handleInvestmentBlur = () => {
    setIsInvestmentFocused(false);
    if (initialInvestment > MAX_LUMPSUM_AMOUNT) {
      setInitialInvestment(MAX_LUMPSUM_AMOUNT);
      setInvestmentInputStr(MAX_LUMPSUM_AMOUNT.toLocaleString('en-IN'));
      setErrors((prev) => ({ ...prev, investment: undefined }));
    } else if (initialInvestment > 0) {
      setInvestmentInputStr(initialInvestment.toLocaleString('en-IN'));
    }
  };

  const handleInvestmentFocus = () => {
    setIsInvestmentFocused(true);
    if (initialInvestment > 0) {
      setInvestmentInputStr(initialInvestment.toString());
    }
  };

  const handleReturnChange = (valStr: string) => {
    if (valStr.trim() === '') {
      setReturnInputStr('');
      setExpectedReturn(0);
      setErrors((prev) => ({ ...prev, returnRate: 'Return rate is required.' }));
      return;
    }

    const num = parseFloat(valStr);
    if (isNaN(num)) {
      setReturnInputStr('');
      setExpectedReturn(0);
      setErrors((prev) => ({ ...prev, returnRate: 'Return rate is required.' }));
      return;
    }

    if (num < 0) {
      setReturnInputStr('0');
      setExpectedReturn(0);
      setErrors((prev) => ({ ...prev, returnRate: undefined }));
      return;
    }

    if (num > 60) {
      // Strictly prevent values above 60%: clamp immediately
      setReturnInputStr('60');
      setExpectedReturn(60);
      setErrors((prev) => ({ ...prev, returnRate: undefined }));
      return;
    }

    // Valid value between 0 and 60
    setReturnInputStr(valStr);
    setExpectedReturn(num);
    setErrors((prev) => ({ ...prev, returnRate: undefined }));
  };

  const handleReturnBlur = () => {
    const num = parseFloat(returnInputStr);
    if (isNaN(num) || num < 1) {
      setReturnInputStr('1');
      setExpectedReturn(1);
    } else if (num > 60) {
      setReturnInputStr('60');
      setExpectedReturn(60);
    } else {
      setReturnInputStr(num.toString());
      setExpectedReturn(num);
    }
    setErrors((prev) => ({ ...prev, returnRate: undefined }));
  };

  const handleDurationChange = (valStr: string) => {
    if (valStr.trim() === '') {
      setDurationInputStr('');
      setInvestmentDuration(1);
      setErrors((prev) => ({ ...prev, duration: 'Duration is required.' }));
      return;
    }

    const num = parseInt(valStr, 10);
    if (isNaN(num)) {
      setDurationInputStr('');
      setInvestmentDuration(1);
      setErrors((prev) => ({ ...prev, duration: 'Duration is required.' }));
      return;
    }

    if (num < 1) {
      setDurationInputStr('1');
      setInvestmentDuration(1);
      setErrors((prev) => ({ ...prev, duration: undefined }));
      return;
    }

    if (num > 100) {
      // Strictly prevent values above 100 years: clamp immediately
      setDurationInputStr('100');
      setInvestmentDuration(100);
      setErrors((prev) => ({ ...prev, duration: undefined }));
      return;
    }

    // Valid duration between 1 and 100 years
    setDurationInputStr(valStr);
    setInvestmentDuration(num);
    setErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const handleDurationBlur = () => {
    const num = parseInt(durationInputStr, 10);
    if (isNaN(num) || num < 1) {
      setDurationInputStr('1');
      setInvestmentDuration(1);
    } else if (num > 100) {
      setDurationInputStr('100');
      setInvestmentDuration(100);
    } else {
      setDurationInputStr(num.toString());
      setInvestmentDuration(num);
    }
    setErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const pieData = [
    { name: 'Initial Investment', value: result.totalInvested },
    { name: 'Estimated Returns', value: result.estimatedReturns },
  ];
  const PIE_COLORS = ['#2563EB', '#06B6D4'];

  const areaData = result.yearlyBreakdown.map((item) => ({
    name: `Yr ${item.year}`,
    Invested: item.invested,
    Returns: item.estimatedReturns,
    Total: item.futureValue,
  }));

  return (
    <div className="space-y-8">
      {/* 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <CardContent className="p-6 space-y-6">
              {/* Initial Investment */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                  <Label htmlFor="lumpsum-amount" className="text-sm font-semibold flex items-center gap-1.5 shrink-0">
                    <IndianRupee size={15} className="text-cyan-600 dark:text-cyan-400" />
                    Total Investment
                  </Label>
                  <div className="relative min-w-[160px] sm:w-52 lg:w-56 max-w-full">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none pointer-events-none">₹</span>
                    <Input
                      id="lumpsum-amount"
                      type="text"
                      value={investmentInputStr}
                      onChange={(e) => handleInvestmentChange(e.target.value)}
                      onFocus={handleInvestmentFocus}
                      onBlur={handleInvestmentBlur}
                      className="pl-6 pr-3 text-right font-mono text-sm h-9 border-slate-200 dark:border-slate-700 w-full min-w-0"
                      style={{
                        fontSize: investmentInputStr.length > 13 ? '0.75rem' : investmentInputStr.length > 10 ? '0.8125rem' : '0.875rem',
                      }}
                      aria-label="Total Investment Amount in Rupees"
                    />
                    {initialInvestment >= 100000 && !isInvestmentFocused && (
                      <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold block text-right mt-0.5">
                        ({formatCompactINR(initialInvestment)})
                      </span>
                    )}
                  </div>
                </div>
                <Slider
                  value={[valueToSliderPos(initialInvestment, LUMPSUM_INVESTMENT_SCALE)]}
                  min={0}
                  max={100}
                  step={0.5}
                  onValueChange={(val) => {
                    const snapped = sliderPosToValue(val[0], LUMPSUM_INVESTMENT_SCALE);
                    setInitialInvestment(snapped);
                    setInvestmentInputStr(snapped.toLocaleString('en-IN'));
                    setErrors((prev) => ({ ...prev, investment: undefined }));
                  }}
                  className="py-1 cursor-pointer"
                  aria-label="Total Investment Slider"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  {LUMPSUM_INVESTMENT_SCALE.labels.map((item, idx) => (
                    <span key={idx}>{item.label}</span>
                  ))}
                </div>

                {/* Quick preset buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {LUMPSUM_QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setInitialInvestment(preset);
                        setInvestmentInputStr(preset.toLocaleString('en-IN'));
                        setErrors((prev) => ({ ...prev, investment: undefined }));
                      }}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 border",
                        initialInvestment === preset
                          ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                      )}
                    >
                      {preset >= 100000 ? formatCompactINR(preset) : `₹${preset.toLocaleString('en-IN')}`}
                    </button>
                  ))}
                </div>

                {errors.investment && <p className="text-xs text-rose-500">{errors.investment}</p>}
              </div>

              {/* Expected Return */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="lumpsum-return" className="text-sm font-semibold flex items-center gap-1.5">
                    <TrendingUp size={15} className="text-cyan-600 dark:text-cyan-400" />
                    Expected Return Rate (p.a.)
                  </Label>
                  <div className="relative w-28">
                    <Input
                      id="lumpsum-return"
                      type="number"
                      min="1"
                      max="60"
                      step="0.5"
                      value={returnInputStr}
                      onChange={(e) => handleReturnChange(e.target.value)}
                      onBlur={handleReturnBlur}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') e.preventDefault();
                      }}
                      className="pr-6 text-right font-mono text-sm h-9 border-slate-200 dark:border-slate-700"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none">%</span>
                  </div>
                </div>
                <Slider
                  value={[expectedReturn]}
                  min={1}
                  max={60}
                  step={0.5}
                  onValueChange={(val) => {
                    const clamped = Math.min(60, Math.max(1, val[0]));
                    setExpectedReturn(clamped);
                    setReturnInputStr(clamped.toString());
                    setErrors((prev) => ({ ...prev, returnRate: undefined }));
                  }}
                  className="py-1"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>1%</span>
                  <span>30%</span>
                  <span>60%</span>
                </div>
                {errors.returnRate && <p className="text-xs text-rose-500">{errors.returnRate}</p>}
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="lumpsum-duration" className="text-sm font-semibold flex items-center gap-1.5">
                    <Calendar size={15} className="text-cyan-600 dark:text-cyan-400" />
                    Time Period
                  </Label>
                  <div className="relative w-28">
                    <Input
                      id="lumpsum-duration"
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={durationInputStr}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      onBlur={handleDurationBlur}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === '.') e.preventDefault();
                      }}
                      className="pr-8 text-right font-mono text-sm h-9 border-slate-200 dark:border-slate-700"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none">Yr</span>
                  </div>
                </div>
                <Slider
                  value={[investmentDuration]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(val) => {
                    const clamped = Math.min(100, Math.max(1, val[0]));
                    setInvestmentDuration(clamped);
                    setDurationInputStr(clamped.toString());
                    setErrors((prev) => ({ ...prev, duration: undefined }));
                  }}
                  className="py-1"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>1 Year</span>
                  <span>50 Years</span>
                  <span>100 Years</span>
                </div>
                {errors.duration && <p className="text-xs text-rose-500">{errors.duration}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Results & Visualizations Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
            <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4 min-w-0 overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Invested Amount
                </span>
                <p 
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight break-words"
                  title={formatINR(result.totalInvested)}
                >
                  {result.totalInvested >= 10000000 
                    ? formatCompactINR(result.totalInvested) 
                    : formatINR(result.totalInvested)}
                </p>
                {result.totalInvested >= 10000000 && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate" title={formatINR(result.totalInvested)}>
                    {formatINR(result.totalInvested)}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">One-time capital</span>
            </Card>

            <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4 min-w-0 overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Estimated Returns
                </span>
                <p 
                  className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono tracking-tight break-words"
                  title={formatINR(result.estimatedReturns)}
                >
                  {result.estimatedReturns >= 10000000 
                    ? formatCompactINR(result.estimatedReturns) 
                    : formatINR(result.estimatedReturns)}
                </p>
                {result.estimatedReturns >= 10000000 && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate" title={formatINR(result.estimatedReturns)}>
                    +{formatINR(result.estimatedReturns)}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {result.totalInvested > 0
                  ? `+${((result.estimatedReturns / result.totalInvested) * 100).toFixed(0)}% total gain`
                  : '0%'}
              </span>
            </Card>

            <Card className="border-cyan-500/30 dark:border-cyan-500/40 bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/30 dark:from-slate-900 dark:to-cyan-950/30 shadow-sm p-4 min-w-0 overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-800 dark:text-cyan-300 block mb-1">
                  Total Future Value
                </span>
                <p 
                  className="text-lg sm:text-xl lg:text-2xl font-extrabold text-blue-700 dark:text-cyan-300 font-mono tracking-tight break-words"
                  title={formatINR(result.futureValue)}
                >
                  {result.futureValue >= 10000000 
                    ? formatCompactINR(result.futureValue) 
                    : formatINR(result.futureValue)}
                </p>
                {result.futureValue >= 10000000 && (
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 block truncate" title={formatINR(result.futureValue)}>
                    {formatINR(result.futureValue)}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                After {result.investmentDurationYears} years
              </span>
            </Card>
          </div>

          {/* Action CTAs */}
          <CalculatorCTAButtons sourceCalculator="lumpsum" />

          {/* Visualization Section */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {chartView === 'donut' ? 'Asset Breakdown' : 'Compounding Growth Curve'}
                </span>
              </div>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setChartView('donut')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    chartView === 'donut'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <PieChartIcon size={13} />
                  Breakdown
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('growth')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    chartView === 'growth'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 size={13} />
                  Growth Curve
                </button>
              </div>
            </div>

            <div className="p-6">
              {chartView === 'donut' ? (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-7 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(val: number) => formatINR(val)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="sm:col-span-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-600" />
                        <span className="text-slate-600 dark:text-slate-300">Invested Capital</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {result.futureValue > 0
                          ? `${((result.totalInvested / result.futureValue) * 100).toFixed(0)}%`
                          : '100%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-500" />
                        <span className="text-slate-600 dark:text-slate-300">Estimated Returns</span>
                      </div>
                      <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                        {result.futureValue > 0
                          ? `${((result.estimatedReturns / result.futureValue) * 100).toFixed(0)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="lumpsumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(val) => formatCompactINR(val)} tick={{ fontSize: 11 }} />
                      <RechartsTooltip formatter={(val: number) => formatINR(val)} />
                      <Area type="monotone" dataKey="Total" stroke="#06B6D4" strokeWidth={2.5} fill="url(#lumpsumGrad)" name="Total Value" />
                      <Area type="monotone" dataKey="Invested" stroke="#2563EB" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" name="Invested Capital" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Year-by-Year Compounding Projection Table */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/60">
        <button
          type="button"
          onClick={() => setIsScheduleOpen(!isScheduleOpen)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Yearly Compounding Breakdown
            </span>
            <span className="text-xs text-slate-500 font-mono">({result.yearlyBreakdown.length} Years)</span>
          </div>
          {isScheduleOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>

        {isScheduleOpen && (
          <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 font-semibold">Year</th>
                  <th className="py-2.5 font-semibold">Invested Capital</th>
                  <th className="py-2.5 font-semibold">Estimated Returns</th>
                  <th className="py-2.5 font-semibold text-right">Future Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {result.yearlyBreakdown.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-2 font-medium text-slate-700 dark:text-slate-300">Year {row.year}</td>
                    <td className="py-2 text-slate-600 dark:text-slate-400">{formatINR(row.invested)}</td>
                    <td className="py-2 text-cyan-600 dark:text-cyan-400">+{formatINR(row.estimatedReturns)}</td>
                    <td className="py-2 text-right font-semibold text-slate-900 dark:text-white">{formatINR(row.futureValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Download Calculation Results (PDF and Word exports) */}
      <DownloadResultsSection getData={getExportData} className="mt-6 mb-6" />

      {/* Assumptions Explanation */}
      <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-slate-900/40 border border-blue-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Info size={14} className="text-cyan-500" />
          Calculation Assumptions
        </div>
        <p>
          Lumpsum compounding assumes the entire principal is invested upfront and grows at an effective annual return rate of {expectedReturn}% over {investmentDuration} years. Returns compound continuously across the period without intermittent withdrawals or taxes deducted.
        </p>
      </div>

      {/* Required Financial Disclaimer */}
      <CalculatorDisclaimer />

      {/* VPF vs PPF Educational Comparison Section */}
      <VpfVsPpfComparison calculatorId="lumpsum" />
    </div>
  );
}
