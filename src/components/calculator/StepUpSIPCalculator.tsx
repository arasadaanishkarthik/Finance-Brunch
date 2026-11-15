import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  Layers,
  PieChart as PieChartIcon,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
  calculateStepUpSIP,
  formatINR,
  formatCompactINR,
  MAX_STEPUP_MONTHLY,
  MIN_STEPUP_MONTHLY,
  STEPUP_QUICK_PRESETS,
} from '@/utils/stepUpSipCalculator';
import {
  valueToSliderPos,
  sliderPosToValue,
  SIP_MONTHLY_SCALE,
} from '@/utils/sliderScaleUtils';
import { CalculatorCTAButtons } from './CalculatorCTAButtons';
import { CalculatorDisclaimer } from './CalculatorDisclaimer';
import { VpfVsPpfComparison } from './VpfVsPpfComparison';
import { DownloadResultsSection } from './DownloadResultsSection';
import { CalculatorExportData } from '@/utils/calculatorExportGenerator';
import { cn } from '@/lib/utils';

export default function StepUpSIPCalculator() {
  const [initialMonthly, setInitialMonthly] = useState<number>(5000);
  const [monthlyInputStr, setMonthlyInputStr] = useState<string>('5,000');
  const [isMonthlyFocused, setIsMonthlyFocused] = useState<boolean>(false);

  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [returnInputStr, setReturnInputStr] = useState<string>('12');

  const [investmentDuration, setInvestmentDuration] = useState<number>(10);
  const [durationInputStr, setDurationInputStr] = useState<string>('10');

  const [stepUpPercentage, setStepUpPercentage] = useState<number>(10);
  const [stepUpInputStr, setStepUpInputStr] = useState<string>('10');

  const [chartView, setChartView] = useState<'schedule' | 'growth'>('schedule');
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);

  const [errors, setErrors] = useState<{
    monthly?: string;
    returnRate?: string;
    duration?: string;
    stepUp?: string;
  }>({});

  const result = useMemo(() => {
    return calculateStepUpSIP({
      initialMonthlyInvestment: initialMonthly,
      expectedAnnualReturn: expectedReturn,
      investmentDurationYears: investmentDuration,
      annualStepUpPercentage: stepUpPercentage,
    });
  }, [initialMonthly, expectedReturn, investmentDuration, stepUpPercentage]);

  const getExportData = (): CalculatorExportData => {
    return {
      calculatorType: 'stepup',
      calculatorTitle: 'Step-Up SIP Investment Calculator',
      generatedDateStr: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      inputs: [
        { label: 'Initial Monthly SIP', value: formatINR(initialMonthly) },
        { label: 'Annual Step-Up Rate', value: `${stepUpPercentage}% per year` },
        { label: 'Expected Annual Return Rate', value: `${expectedReturn}% per annum` },
        { label: 'Investment Time Horizon', value: `${investmentDuration} Years` },
      ],
      summaryMetrics: [
        { label: 'Total Invested Capital', value: formatINR(result.totalInvested) },
        { label: 'Estimated Wealth Returns', value: `+${formatINR(result.estimatedReturns)}` },
        { label: 'Projected Portfolio Value', value: formatINR(result.futureValue), isHighlight: true },
        { label: 'Advantage Over Fixed SIP', value: `+${formatINR(result.stepUpAdvantage)}` },
      ],
      scheduleHeaders: [
        'Year',
        'Monthly SIP',
        'Yearly Invested',
        'Cumulative Invested',
        'Portfolio Value',
      ],
      growthSchedule: result.annualSchedule.map((row) => ({
        col1: `Year ${row.year}`,
        col2: formatINR(row.monthlyContribution),
        col3: formatINR(row.yearlyInvested),
        col4: formatINR(row.cumulativeInvested),
        col5: formatINR(row.futureValue),
      })),
      notes: `Starting SIP installment of ${formatINR(initialMonthly)}/mo stepping up by ${stepUpPercentage}% each year compounded at ${expectedReturn}% p.a. over ${investmentDuration} years.`,
      disclaimer: 'These calculations are illustrative estimates based on the selected return assumptions and cash-flow schedule. Actual investment returns may vary and are not guaranteed. Market risks apply. This calculator does not constitute investment advice.',
    };
  };

  const handleMonthlyChange = (valStr: string) => {
    setMonthlyInputStr(valStr);
    const cleaned = valStr.replace(/[^0-9]/g, '');
    const num = Number(cleaned);

    if (valStr.trim() === '') {
      setErrors((prev) => ({ ...prev, monthly: 'Monthly investment is required.' }));
      setInitialMonthly(0);
    } else if (isNaN(num) || num < 0) {
      setErrors((prev) => ({ ...prev, monthly: 'Please enter a valid positive number.' }));
      setInitialMonthly(0);
    } else if (num < MIN_STEPUP_MONTHLY) {
      setErrors((prev) => ({ ...prev, monthly: `Minimum recommended monthly SIP is ₹${MIN_STEPUP_MONTHLY.toLocaleString('en-IN')}.` }));
      setInitialMonthly(num > 0 ? num : 0);
    } else if (num > MAX_STEPUP_MONTHLY) {
      setErrors((prev) => ({ ...prev, monthly: 'Maximum monthly SIP supported is ₹100 Crore (₹1,00,00,00,000).' }));
      // Strictly enforce limit: clamp calculation state to ₹100 Crore, never silently calculate above limit
      setInitialMonthly(MAX_STEPUP_MONTHLY);
    } else {
      setErrors((prev) => ({ ...prev, monthly: undefined }));
      setInitialMonthly(num);
    }
  };

  const handleMonthlyBlur = () => {
    setIsMonthlyFocused(false);
    if (initialMonthly > MAX_STEPUP_MONTHLY) {
      setInitialMonthly(MAX_STEPUP_MONTHLY);
      setMonthlyInputStr(MAX_STEPUP_MONTHLY.toLocaleString('en-IN'));
      setErrors((prev) => ({ ...prev, monthly: undefined }));
    } else if (initialMonthly > 0) {
      setMonthlyInputStr(initialMonthly.toLocaleString('en-IN'));
    }
  };

  const handleMonthlyFocus = () => {
    setIsMonthlyFocused(true);
    if (initialMonthly > 0) {
      setMonthlyInputStr(initialMonthly.toString());
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

    if (num > 35) {
      // Strictly prevent values above 35%: clamp immediately
      setReturnInputStr('35');
      setExpectedReturn(35);
      setErrors((prev) => ({ ...prev, returnRate: undefined }));
      return;
    }

    // Valid value between 0 and 35
    setReturnInputStr(valStr);
    setExpectedReturn(num);
    setErrors((prev) => ({ ...prev, returnRate: undefined }));
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

    if (num > 55) {
      // Strictly prevent values above 55 years: clamp immediately
      setDurationInputStr('55');
      setInvestmentDuration(55);
      setErrors((prev) => ({ ...prev, duration: undefined }));
      return;
    }

    // Valid duration between 1 and 55 years
    setDurationInputStr(valStr);
    setInvestmentDuration(num);
    setErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const handleDurationBlur = () => {
    const num = parseInt(durationInputStr, 10);
    if (isNaN(num) || num < 1) {
      setDurationInputStr('1');
      setInvestmentDuration(1);
    } else if (num > 55) {
      setDurationInputStr('55');
      setInvestmentDuration(55);
    } else {
      setDurationInputStr(num.toString());
      setInvestmentDuration(num);
    }
    setErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const handleStepUpChange = (valStr: string) => {
    if (valStr.trim() === '') {
      setStepUpInputStr('');
      setStepUpPercentage(0);
      setErrors((prev) => ({ ...prev, stepUp: 'Step-up rate is required.' }));
      return;
    }

    const num = parseFloat(valStr);
    if (isNaN(num)) {
      setStepUpInputStr('');
      setStepUpPercentage(0);
      setErrors((prev) => ({ ...prev, stepUp: 'Step-up rate is required.' }));
      return;
    }

    if (num < 0) {
      setStepUpInputStr('0');
      setStepUpPercentage(0);
      setErrors((prev) => ({ ...prev, stepUp: undefined }));
      return;
    }

    if (num > 50) {
      setStepUpInputStr('50');
      setStepUpPercentage(50);
      setErrors((prev) => ({ ...prev, stepUp: undefined }));
      return;
    }

    setStepUpInputStr(valStr);
    setStepUpPercentage(num);
    setErrors((prev) => ({ ...prev, stepUp: undefined }));
  };

  const handleStepUpBlur = () => {
    const num = parseFloat(stepUpInputStr);
    if (isNaN(num) || num < 1) {
      setStepUpInputStr('1');
      setStepUpPercentage(1);
    } else if (num > 50) {
      setStepUpInputStr('50');
      setStepUpPercentage(50);
    } else {
      setStepUpInputStr(num.toString());
      setStepUpPercentage(num);
    }
    setErrors((prev) => ({ ...prev, stepUp: undefined }));
  };

  const scheduleBarData = result.annualSchedule.map((item) => ({
    name: `Yr ${item.year}`,
    MonthlySIP: item.monthlyContribution,
    YearlyInvested: item.yearlyInvested,
  }));

  const growthAreaData = result.annualSchedule.map((item) => ({
    name: `Yr ${item.year}`,
    Invested: item.cumulativeInvested,
    TotalValue: item.futureValue,
  }));

  return (
    <div className="space-y-8">
      {/* 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <CardContent className="p-6 space-y-6">
              {/* Initial Monthly Investment */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                  <Label htmlFor="stepup-monthly" className="text-sm font-semibold flex items-center gap-1.5 shrink-0">
                    <IndianRupee size={15} className="text-cyan-600 dark:text-cyan-400" />
                    Starting Monthly SIP
                  </Label>
                  <div className="relative min-w-[160px] sm:w-52 lg:w-56 max-w-full">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none pointer-events-none">₹</span>
                    <Input
                      id="stepup-monthly"
                      type="text"
                      value={monthlyInputStr}
                      onChange={(e) => handleMonthlyChange(e.target.value)}
                      onFocus={handleMonthlyFocus}
                      onBlur={handleMonthlyBlur}
                      className="pl-6 pr-3 text-right font-mono text-sm h-9 border-slate-200 dark:border-slate-700 w-full min-w-0"
                      style={{
                        fontSize: monthlyInputStr.length > 13 ? '0.75rem' : monthlyInputStr.length > 10 ? '0.8125rem' : '0.875rem',
                      }}
                      aria-label="Starting Monthly SIP Amount in Rupees"
                    />
                    {initialMonthly >= 100000 && !isMonthlyFocused && (
                      <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold block text-right mt-0.5">
                        ({formatCompactINR(initialMonthly)})
                      </span>
                    )}
                  </div>
                </div>
                <Slider
                  value={[valueToSliderPos(initialMonthly, SIP_MONTHLY_SCALE)]}
                  min={0}
                  max={100}
                  step={0.5}
                  onValueChange={(val) => {
                    const snappedVal = sliderPosToValue(val[0], SIP_MONTHLY_SCALE);
                    setInitialMonthly(snappedVal);
                    setMonthlyInputStr(snappedVal.toLocaleString('en-IN'));
                    setErrors((prev) => ({ ...prev, monthly: undefined }));
                  }}
                  className="py-1 cursor-pointer"
                  aria-label="Starting Monthly SIP Slider"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  {SIP_MONTHLY_SCALE.labels.map((item, idx) => (
                    <span key={idx}>{item.label}</span>
                  ))}
                </div>

                {/* Quick preset buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {STEPUP_QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setInitialMonthly(preset);
                        setMonthlyInputStr(preset.toLocaleString('en-IN'));
                        setErrors((prev) => ({ ...prev, monthly: undefined }));
                      }}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 border",
                        initialMonthly === preset
                          ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                      )}
                    >
                      {preset >= 100000 ? formatCompactINR(preset) : `₹${preset.toLocaleString('en-IN')}`}
                    </button>
                  ))}
                </div>

                {errors.monthly && <p className="text-xs text-rose-500">{errors.monthly}</p>}
              </div>

              {/* Annual Step-Up Percentage */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="stepup-rate" className="text-sm font-semibold flex items-center gap-1.5">
                    <Layers size={15} className="text-cyan-600 dark:text-cyan-400" />
                    Annual Step-Up Rate
                  </Label>
                  <div className="relative w-28">
                    <Input
                      id="stepup-rate"
                      type="number"
                      min="1"
                      max="50"
                      step="1"
                      value={stepUpInputStr}
                      onChange={(e) => handleStepUpChange(e.target.value)}
                      onBlur={handleStepUpBlur}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') e.preventDefault();
                      }}
                      className="pr-6 text-right font-mono text-sm h-9 border-slate-200 dark:border-slate-700"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none">%</span>
                  </div>
                </div>
                <Slider
                  value={[stepUpPercentage]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={(val) => {
                    const clamped = Math.min(50, Math.max(1, val[0]));
                    setStepUpPercentage(clamped);
                    setStepUpInputStr(clamped.toString());
                    setErrors((prev) => ({ ...prev, stepUp: undefined }));
                  }}
                  className="py-1"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>1%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
                {errors.stepUp && <p className="text-xs text-rose-500">{errors.stepUp}</p>}
              </div>

              {/* Expected Return */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="stepup-return" className="text-sm font-semibold flex items-center gap-1.5">
                    <TrendingUp size={15} className="text-cyan-600 dark:text-cyan-400" />
                    Expected Return Rate (p.a.)
                  </Label>
                  <div className="relative w-28">
                    <Input
                      id="stepup-return"
                      type="number"
                      min="1"
                      max="35"
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
                  max={35}
                  step={0.5}
                  onValueChange={(val) => {
                    const clamped = Math.min(35, Math.max(1, val[0]));
                    setExpectedReturn(clamped);
                    setReturnInputStr(clamped.toString());
                    setErrors((prev) => ({ ...prev, returnRate: undefined }));
                  }}
                  className="py-1"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>1%</span>
                  <span>15%</span>
                  <span>35%</span>
                </div>
                {errors.returnRate && <p className="text-xs text-rose-500">{errors.returnRate}</p>}
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="stepup-duration" className="text-sm font-semibold flex items-center gap-1.5">
                    <Calendar size={15} className="text-cyan-600 dark:text-cyan-400" />
                    Investment Duration
                  </Label>
                  <div className="relative w-28">
                    <Input
                      id="stepup-duration"
                      type="number"
                      min="1"
                      max="55"
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
                  max={55}
                  step={1}
                  onValueChange={(val) => {
                    const clamped = Math.min(55, Math.max(1, val[0]));
                    setInvestmentDuration(clamped);
                    setDurationInputStr(clamped.toString());
                    setErrors((prev) => ({ ...prev, duration: undefined }));
                  }}
                  className="py-1"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>1 Year</span>
                  <span>25 Years</span>
                  <span>55 Years</span>
                </div>
                {errors.duration && <p className="text-xs text-rose-500">{errors.duration}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Fixed SIP Comparison Callout */}
          <Card className="border-blue-200/60 dark:border-blue-900/60 bg-blue-50/40 dark:bg-slate-900/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-cyan-300">
              <Sparkles size={14} className="text-cyan-500" />
              <span>Step-Up Advantage vs Fixed SIP</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 break-words">
              A regular fixed SIP of {formatINR(result.initialMonthlySIP)}/mo yields{' '}
              <strong className="text-slate-900 dark:text-white font-mono">{formatINR(result.fixedSipComparison.futureValue)}</strong>.
              Stepping up by {result.annualStepUpPercentage}% yearly adds an extra{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+{formatINR(result.fixedSipComparison.differenceFV)}</strong> to your final wealth!
            </p>
          </Card>
        </div>

        {/* Right Results & Visualizations Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 min-w-0">
            <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-3.5 min-w-0 overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Starting SIP
                </span>
                <p 
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight break-words"
                  title={formatINR(result.initialMonthlySIP)}
                >
                  {result.initialMonthlySIP >= 10000000 
                    ? formatCompactINR(result.initialMonthlySIP) 
                    : formatINR(result.initialMonthlySIP)}
                </p>
                {result.initialMonthlySIP >= 10000000 && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate" title={formatINR(result.initialMonthlySIP)}>
                    {formatINR(result.initialMonthlySIP)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Month 1</span>
            </Card>

            <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-3.5 min-w-0 overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Final Monthly SIP
                </span>
                <p 
                  className="text-lg sm:text-xl font-bold text-cyan-600 dark:text-cyan-400 font-mono tracking-tight break-words"
                  title={formatINR(result.finalMonthlySIP)}
                >
                  {result.finalMonthlySIP >= 10000000 
                    ? formatCompactINR(result.finalMonthlySIP) 
                    : formatINR(result.finalMonthlySIP)}
                </p>
                {result.finalMonthlySIP >= 10000000 && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate" title={formatINR(result.finalMonthlySIP)}>
                    {formatINR(result.finalMonthlySIP)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Year {result.investmentDurationYears}</span>
            </Card>

            <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-3.5 min-w-0 overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Total Invested
                </span>
                <p 
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tight break-words"
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
              <span className="text-[10px] text-slate-400 block mt-1">Cumulative</span>
            </Card>

            <Card className="border-cyan-500/30 dark:border-cyan-500/40 bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/30 dark:from-slate-900 dark:to-cyan-950/30 shadow-sm p-3.5 min-w-0 overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-800 dark:text-cyan-300 block mb-1">
                  Estimated FV
                </span>
                <p 
                  className="text-lg sm:text-xl font-extrabold text-blue-700 dark:text-cyan-300 font-mono tracking-tight break-words"
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
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 truncate" title={`+${formatINR(result.estimatedReturns)} return`}>
                +{formatCompactINR(result.estimatedReturns)} return
              </span>
            </Card>
          </div>

          {/* Calculator Call-to-Action Buttons */}
          <CalculatorCTAButtons sourceCalculator="stepup" />

          {/* Visualization Section */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {chartView === 'schedule' ? 'Annual Step-Up SIP Progression' : 'Portfolio Compounding Growth'}
              </span>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setChartView('schedule')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    chartView === 'schedule'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 size={13} />
                  SIP Schedule
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
                  <TrendingUp size={13} />
                  Growth Curve
                </button>
              </div>
            </div>

            <div className="p-6">
              {chartView === 'schedule' ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scheduleBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(val) => formatCompactINR(val)} tick={{ fontSize: 11 }} />
                      <RechartsTooltip formatter={(val: number) => formatINR(val)} />
                      <Bar dataKey="MonthlySIP" name="Monthly Installment" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthAreaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="stepUpGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(val) => formatCompactINR(val)} tick={{ fontSize: 11 }} />
                      <RechartsTooltip formatter={(val: number) => formatINR(val)} />
                      <Area type="monotone" dataKey="TotalValue" stroke="#06B6D4" strokeWidth={2.5} fill="url(#stepUpGrad)" name="Total Portfolio" />
                      <Area type="monotone" dataKey="Invested" stroke="#2563EB" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" name="Invested Capital" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Annual Contribution Schedule Table */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/60">
        <button
          type="button"
          onClick={() => setIsScheduleOpen(!isScheduleOpen)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Annual Step-Up Contribution & Growth Schedule
            </span>
            <span className="text-xs text-slate-500 font-mono">({result.annualSchedule.length} Years)</span>
          </div>
          {isScheduleOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>

        {isScheduleOpen && (
          <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 font-semibold">Year</th>
                  <th className="py-2.5 font-semibold">Monthly SIP</th>
                  <th className="py-2.5 font-semibold">Yearly Invested</th>
                  <th className="py-2.5 font-semibold">Cumulative Invested</th>
                  <th className="py-2.5 font-semibold text-right">Future Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {result.annualSchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-2 font-medium text-slate-700 dark:text-slate-300">Year {row.year}</td>
                    <td className="py-2 text-cyan-600 dark:text-cyan-400 font-semibold">{formatINR(row.monthlyContribution)}</td>
                    <td className="py-2 text-slate-600 dark:text-slate-400">{formatINR(row.yearlyInvested)}</td>
                    <td className="py-2 text-slate-600 dark:text-slate-400">{formatINR(row.cumulativeInvested)}</td>
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
          The monthly contribution starts at {formatINR(initialMonthly)} and automatically increases by {stepUpPercentage}% after every 12 monthly installments. Compounding is calculated at an effective annual return of {expectedReturn}% on end-of-month contributions across {investmentDuration} years.
        </p>
      </div>

      {/* Required Financial Disclaimer */}
      <CalculatorDisclaimer />

      {/* VPF vs PPF Educational Comparison Section */}
      <VpfVsPpfComparison calculatorId="stepup" />
    </div>
  );
}
