import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  calculateSWP,
  formatINR,
  formatCompactINR,
  MAX_SWP_CORPUS,
  MIN_SWP_CORPUS,
  MAX_SWP_WITHDRAWAL,
  MIN_SWP_WITHDRAWAL,
  SWP_CORPUS_QUICK_PRESETS,
  SWPWithdrawalFrequency,
} from '@/utils/swpCalculator';
import {
  valueToSliderPos,
  sliderPosToValue,
  SWP_CORPUS_SCALE,
  SWP_WITHDRAWAL_SCALE,
} from '@/utils/sliderScaleUtils';
import { CalculatorDisclaimer } from './CalculatorDisclaimer';
import { VpfVsPpfComparison } from './VpfVsPpfComparison';
import { DownloadResultsSection } from './DownloadResultsSection';
import { CalculatorExportData } from '@/utils/calculatorExportGenerator';
import { SliderTickMarks } from './SliderTickMarks';
import { cn } from '@/lib/utils';

export default function SWPCalculator() {
  const [initialCorpus, setInitialCorpus] = useState<number>(1000000);
  const [corpusInputStr, setCorpusInputStr] = useState<string>('10,00,000');
  const [isCorpusFocused, setIsCorpusFocused] = useState<boolean>(false);

  // Withdrawal Schedule Frequency: Monthly or Yearly
  const [withdrawalFrequency, setWithdrawalFrequency] = useState<SWPWithdrawalFrequency>('monthly');

  // Withdrawal Amount (per period: monthly or yearly)
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(6000);
  const [withdrawalInputStr, setWithdrawalInputStr] = useState<string>('6,000');
  const [isWithdrawalFocused, setIsWithdrawalFocused] = useState<boolean>(false);

  // Dual percentage entry state (% of initial corpus per period)
  const [withdrawalPercentage, setWithdrawalPercentage] = useState<number>(0.6);
  const [percentInputStr, setPercentInputStr] = useState<string>('0.6');
  const [isPercentFocused, setIsPercentFocused] = useState<boolean>(false);
  const [withdrawalMode, setWithdrawalMode] = useState<'rupee' | 'percent'>('rupee');

  const [expectedReturn, setExpectedReturn] = useState<number>(8);
  const [returnInputStr, setReturnInputStr] = useState<string>('8');

  const [withdrawalDuration, setWithdrawalDuration] = useState<number>(10);
  const [durationInputStr, setDurationInputStr] = useState<string>('10');

  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);

  const [errors, setErrors] = useState<{
    corpus?: string;
    withdrawal?: string;
    returnRate?: string;
    duration?: string;
  }>({});

  // Deterministic calculation result
  const result = useMemo(() => {
    return calculateSWP({
      initialCorpus,
      withdrawalAmount,
      withdrawalFrequency,
      expectedAnnualReturn: expectedReturn,
      withdrawalDurationYears: withdrawalDuration,
    });
  }, [initialCorpus, withdrawalAmount, withdrawalFrequency, expectedReturn, withdrawalDuration]);

  // Synchronize initial corpus edits
  const handleCorpusChange = (valStr: string) => {
    setCorpusInputStr(valStr);
    const cleaned = valStr.replace(/[^0-9]/g, '');
    const num = Number(cleaned);

    let effectiveCorpus = num;
    if (valStr.trim() === '') {
      setErrors((prev) => ({ ...prev, corpus: 'Initial corpus is required.' }));
      effectiveCorpus = 0;
      setInitialCorpus(0);
    } else if (isNaN(num) || num < 0) {
      setErrors((prev) => ({ ...prev, corpus: 'Please enter a valid positive number.' }));
      effectiveCorpus = 0;
      setInitialCorpus(0);
    } else if (num < MIN_SWP_CORPUS) {
      setErrors((prev) => ({ ...prev, corpus: `Minimum corpus is ₹${MIN_SWP_CORPUS.toLocaleString('en-IN')}.` }));
      setInitialCorpus(num > 0 ? num : 0);
    } else if (num > MAX_SWP_CORPUS) {
      setErrors((prev) => ({ ...prev, corpus: 'Maximum corpus supported is ₹100 Crore (₹1,00,00,00,000).' }));
      effectiveCorpus = MAX_SWP_CORPUS;
      setInitialCorpus(MAX_SWP_CORPUS);
    } else {
      setErrors((prev) => ({ ...prev, corpus: undefined }));
      setInitialCorpus(num);
    }

    // Synchronize withdrawal amount / percentage when corpus changes
    if (withdrawalMode === 'percent') {
      const newRupee = Math.round((effectiveCorpus * withdrawalPercentage) / 100);
      const clampedRupee = Math.min(MAX_SWP_WITHDRAWAL, Math.max(0, newRupee));
      setWithdrawalAmount(clampedRupee);
      setWithdrawalInputStr(clampedRupee > 0 ? clampedRupee.toLocaleString('en-IN') : '0');
    } else {
      const newPct = effectiveCorpus > 0 ? (withdrawalAmount / effectiveCorpus) * 100 : 0;
      setWithdrawalPercentage(newPct);
      setPercentInputStr(newPct > 0 ? (newPct < 0.1 ? newPct.toFixed(3) : newPct.toFixed(2)) : '0');
    }
  };

  const handleCorpusBlur = () => {
    setIsCorpusFocused(false);
    if (initialCorpus > MAX_SWP_CORPUS) {
      setInitialCorpus(MAX_SWP_CORPUS);
      setCorpusInputStr(MAX_SWP_CORPUS.toLocaleString('en-IN'));
      setErrors((prev) => ({ ...prev, corpus: undefined }));
    } else if (initialCorpus > 0) {
      setCorpusInputStr(initialCorpus.toLocaleString('en-IN'));
    }
  };

  const handleCorpusFocus = () => {
    setIsCorpusFocused(true);
    if (initialCorpus > 0) {
      setCorpusInputStr(initialCorpus.toString());
    }
  };

  // Toggle between Monthly and Yearly schedule
  const handleFrequencyChange = (newFreq: SWPWithdrawalFrequency) => {
    if (newFreq === withdrawalFrequency) return;
    setWithdrawalFrequency(newFreq);

    if (newFreq === 'yearly') {
      // Annualize withdrawal amount and percentage
      const newYearly = Math.min(MAX_SWP_WITHDRAWAL, Math.round(withdrawalAmount * 12));
      setWithdrawalAmount(newYearly);
      setWithdrawalInputStr(newYearly > 0 ? newYearly.toLocaleString('en-IN') : '0');
      const newPct = initialCorpus > 0 ? (newYearly / initialCorpus) * 100 : 0;
      setWithdrawalPercentage(newPct);
      setPercentInputStr(newPct > 0 ? (newPct < 0.1 ? newPct.toFixed(3) : newPct.toFixed(2)) : '0');
    } else {
      // Convert to monthly equivalent
      const newMonthly = Math.max(MIN_SWP_WITHDRAWAL, Math.round(withdrawalAmount / 12));
      setWithdrawalAmount(newMonthly);
      setWithdrawalInputStr(newMonthly > 0 ? newMonthly.toLocaleString('en-IN') : '0');
      const newPct = initialCorpus > 0 ? (newMonthly / initialCorpus) * 100 : 0;
      setWithdrawalPercentage(newPct);
      setPercentInputStr(newPct > 0 ? (newPct < 0.1 ? newPct.toFixed(3) : newPct.toFixed(2)) : '0');
    }
  };

  // Synchronize withdrawal rupee amount edits
  const handleWithdrawalChange = (valStr: string) => {
    setWithdrawalMode('rupee');
    setWithdrawalInputStr(valStr);
    const cleaned = valStr.replace(/[^0-9]/g, '');
    const num = Number(cleaned);

    let effectiveRupee = num;
    if (valStr.trim() === '') {
      setErrors((prev) => ({ ...prev, withdrawal: 'Withdrawal amount is required.' }));
      effectiveRupee = 0;
      setWithdrawalAmount(0);
    } else if (isNaN(num) || num < 0) {
      setErrors((prev) => ({ ...prev, withdrawal: 'Please enter a valid positive number.' }));
      effectiveRupee = 0;
      setWithdrawalAmount(0);
    } else if (num < MIN_SWP_WITHDRAWAL) {
      setErrors((prev) => ({ ...prev, withdrawal: `Minimum withdrawal is ₹${MIN_SWP_WITHDRAWAL.toLocaleString('en-IN')}.` }));
      setWithdrawalAmount(num > 0 ? num : 0);
    } else if (num > MAX_SWP_WITHDRAWAL) {
      setErrors((prev) => ({ ...prev, withdrawal: 'Maximum withdrawal is ₹100 Crore (₹1,00,00,00,000).' }));
      effectiveRupee = MAX_SWP_WITHDRAWAL;
      setWithdrawalAmount(MAX_SWP_WITHDRAWAL);
    } else {
      setErrors((prev) => ({ ...prev, withdrawal: undefined }));
      setWithdrawalAmount(num);
    }

    const newPct = initialCorpus > 0 ? (effectiveRupee / initialCorpus) * 100 : 0;
    setWithdrawalPercentage(newPct);
    setPercentInputStr(newPct > 0 ? (newPct < 0.1 ? newPct.toFixed(3) : newPct.toFixed(2)) : '0');
  };

  const handleWithdrawalBlur = () => {
    setIsWithdrawalFocused(false);
    if (withdrawalAmount > MAX_SWP_WITHDRAWAL) {
      setWithdrawalAmount(MAX_SWP_WITHDRAWAL);
      setWithdrawalInputStr(MAX_SWP_WITHDRAWAL.toLocaleString('en-IN'));
      setErrors((prev) => ({ ...prev, withdrawal: undefined }));
    } else if (withdrawalAmount > 0) {
      setWithdrawalInputStr(withdrawalAmount.toLocaleString('en-IN'));
    }
  };

  const handleWithdrawalFocus = () => {
    setIsWithdrawalFocused(true);
    setWithdrawalMode('rupee');
    if (withdrawalAmount > 0) {
      setWithdrawalInputStr(withdrawalAmount.toString());
    }
  };

  // Synchronize withdrawal percentage edits (% of initial corpus)
  const handlePercentageChange = (valStr: string) => {
    setWithdrawalMode('percent');
    setPercentInputStr(valStr);
    const num = parseFloat(valStr);

    if (valStr.trim() === '' || isNaN(num)) {
      setErrors((prev) => ({ ...prev, withdrawal: 'Withdrawal percentage is required.' }));
      setWithdrawalPercentage(0);
      setWithdrawalAmount(0);
      setWithdrawalInputStr('0');
    } else if (num < 0) {
      setErrors((prev) => ({ ...prev, withdrawal: 'Withdrawal percentage cannot be negative.' }));
      setWithdrawalPercentage(0);
      setWithdrawalAmount(0);
      setWithdrawalInputStr('0');
    } else if (num > 100) {
      setErrors((prev) => ({ ...prev, withdrawal: 'Withdrawal percentage cannot exceed 100% of initial corpus.' }));
      setWithdrawalPercentage(100);
      const calculatedRupee = Math.round((initialCorpus * 100) / 100);
      const effectiveRupee = Math.min(MAX_SWP_WITHDRAWAL, Math.max(0, calculatedRupee));
      setWithdrawalAmount(effectiveRupee);
      setWithdrawalInputStr(effectiveRupee.toLocaleString('en-IN'));
    } else {
      setErrors((prev) => ({ ...prev, withdrawal: undefined }));
      setWithdrawalPercentage(num);
      const calculatedRupee = Math.round((initialCorpus * num) / 100);
      const effectiveRupee = Math.min(MAX_SWP_WITHDRAWAL, Math.max(0, calculatedRupee));
      setWithdrawalAmount(effectiveRupee);
      setWithdrawalInputStr(effectiveRupee.toLocaleString('en-IN'));
    }
  };

  const handlePercentBlur = () => {
    setIsPercentFocused(false);
    if (withdrawalPercentage > 0) {
      setPercentInputStr(withdrawalPercentage < 0.1 ? withdrawalPercentage.toFixed(3) : withdrawalPercentage.toFixed(2));
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

    if (num > 30) {
      // Strictly prevent values above 30%: clamp immediately
      setReturnInputStr('30');
      setExpectedReturn(30);
      setErrors((prev) => ({ ...prev, returnRate: undefined }));
      return;
    }

    setReturnInputStr(valStr);
    setExpectedReturn(num);
    setErrors((prev) => ({ ...prev, returnRate: undefined }));
  };

  const handleReturnBlur = () => {
    const num = parseFloat(returnInputStr);
    if (isNaN(num) || num < 0) {
      setReturnInputStr('0');
      setExpectedReturn(0);
    } else if (num > 30) {
      setReturnInputStr('30');
      setExpectedReturn(30);
    } else {
      setReturnInputStr(num.toString());
      setExpectedReturn(num);
    }
    setErrors((prev) => ({ ...prev, returnRate: undefined }));
  };

  const handleDurationChange = (valStr: string) => {
    if (valStr.trim() === '') {
      setDurationInputStr('');
      setWithdrawalDuration(1);
      setErrors((prev) => ({ ...prev, duration: 'Duration is required.' }));
      return;
    }

    const num = parseInt(valStr, 10);
    if (isNaN(num)) {
      setDurationInputStr('');
      setWithdrawalDuration(1);
      setErrors((prev) => ({ ...prev, duration: 'Duration is required.' }));
      return;
    }

    if (num < 1) {
      setDurationInputStr('1');
      setWithdrawalDuration(1);
      setErrors((prev) => ({ ...prev, duration: undefined }));
      return;
    }

    if (num > 60) {
      // Strictly prevent values above 60 years: clamp immediately
      setDurationInputStr('60');
      setWithdrawalDuration(60);
      setErrors((prev) => ({ ...prev, duration: undefined }));
      return;
    }

    setDurationInputStr(valStr);
    setWithdrawalDuration(num);
    setErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const handleDurationBlur = () => {
    const num = parseInt(durationInputStr, 10);
    if (isNaN(num) || num < 1) {
      setDurationInputStr('1');
      setWithdrawalDuration(1);
    } else if (num > 60) {
      setDurationInputStr('60');
      setWithdrawalDuration(60);
    } else {
      setDurationInputStr(num.toString());
      setWithdrawalDuration(num);
    }
    setErrors((prev) => ({ ...prev, duration: undefined }));
  };

  const areaData = result.yearlySchedule.map((item) => ({
    name: `Yr ${item.year}`,
    Balance: item.closingBalance,
    CumulativeWithdrawals: item.cumulativeWithdrawals,
  }));

  // Export Data preparation for PDF & Word exports
  const getExportData = (): CalculatorExportData => {
    return {
      calculatorType: 'swp',
      calculatorTitle: 'Systematic Withdrawal Plan (SWP) Calculator',
      generatedDateStr: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      inputs: [
        { label: 'Initial Investment Corpus', value: formatINR(initialCorpus) },
        { 
          label: `${withdrawalFrequency === 'monthly' ? 'Monthly' : 'Annual'} Withdrawal Amount`, 
          value: `${formatINR(withdrawalAmount)} (${withdrawalPercentage.toFixed(2)}% of initial corpus)` 
        },
        { 
          label: 'Withdrawal Schedule Frequency', 
          value: withdrawalFrequency === 'monthly' ? 'Monthly Withdrawals (12 payouts/yr)' : 'Yearly Withdrawals (1 payout/yr)' 
        },
        { label: 'Expected Annual Return Rate', value: `${expectedReturn}% per annum` },
        { label: 'Withdrawal Duration Horizon', value: `${withdrawalDuration} Years` },
      ],
      summaryMetrics: [
        { label: 'Total Capital Withdrawn', value: formatINR(result.totalActualWithdrawals) },
        { label: 'Remaining Portfolio Corpus', value: formatINR(result.remainingCorpus), isHighlight: true },
        { label: 'Total Growth Earned', value: `+${formatINR(result.totalGrowthEarned)}` },
        { 
          label: 'Corpus Longevity Status', 
          value: result.isExhausted 
            ? `Corpus Exhausted in Year ${result.exhaustionYear}` 
            : `Sustained throughout ${withdrawalDuration} Years` 
        },
      ],
      scheduleHeaders: [
        'Year',
        'Opening Balance',
        'Growth Earned',
        withdrawalFrequency === 'monthly' ? 'Annual Withdrawals' : 'Yearly Withdrawal',
        'Closing Balance',
      ],
      growthSchedule: result.yearlySchedule.map((row) => ({
        col1: `Year ${row.year}`,
        col2: formatINR(row.openingBalance),
        col3: `+${formatINR(row.growthEarned)}`,
        col4: `-${formatINR(row.annualWithdrawal)}`,
        col5: formatINR(row.closingBalance),
      })),
      notes: 'Withdrawal Timing Convention: For monthly withdrawals, monthly compound growth is applied followed by end-of-month withdrawals. For yearly withdrawals, annual compound growth is applied followed by end-of-year withdrawals. Withdrawals stop automatically once the remaining corpus reaches zero.',
      disclaimer: 'A sustainable withdrawal rate depends on your investment returns, inflation, time horizon, and risk tolerance. Some retirement-planning approaches use an annual withdrawal rate around 4–6% as a starting point, while higher rates can increase the risk of depleting your corpus. Review your plan periodically with a qualified financial professional.',
    };
  };

  // Presets depending on schedule frequency
  const withdrawalPresets = withdrawalFrequency === 'monthly'
    ? [5000, 10000, 25000, 50000, 100000]
    : [60000, 120000, 300000, 600000, 1200000];

  return (
    <div className="space-y-8">
      {/* 1. Responsible SWP Withdrawal Guidance Note (Mandated Educational Card) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/90 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-cyan-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Responsible SWP Withdrawal Guidance
            </p>
            <p>
              A sustainable withdrawal rate depends on your investment returns, inflation, time horizon, and risk tolerance. Some retirement-planning approaches use an annual withdrawal rate around 4–6% as a starting point, while higher rates can increase the risk of depleting your corpus. Review your plan periodically with a qualified financial professional.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <CardContent className="p-6 space-y-6">
              {/* Schedule Frequency Toggle: Monthly vs Yearly */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Calendar size={15} className="text-cyan-600 dark:text-cyan-400" />
                    <span>Withdrawal Schedule Frequency</span>
                  </Label>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400">
                    {withdrawalFrequency === 'monthly' ? 'Monthly Mode' : 'Yearly Mode'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => handleFrequencyChange('monthly')}
                    className={cn(
                      "py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                      withdrawalFrequency === 'monthly'
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <span>Monthly Withdrawals</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFrequencyChange('yearly')}
                    className={cn(
                      "py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                      withdrawalFrequency === 'yearly'
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <span>Yearly Withdrawals</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {withdrawalFrequency === 'monthly'
                    ? '12 payouts per year compounded monthly. Payout deducted at month-end.'
                    : '1 single payout per year compounded annually. Payout deducted at year-end.'}
                </p>
              </div>

              {/* Total Corpus Input */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                  <Label htmlFor="swp-corpus" className="text-sm font-semibold flex items-center gap-1.5 shrink-0">
                    <IndianRupee size={15} className="text-cyan-600 dark:text-cyan-400" />
                    Total Investment Corpus
                  </Label>
                  <div className="relative min-w-[160px] sm:w-52 lg:w-56 max-w-full">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none pointer-events-none">₹</span>
                    <Input
                      id="swp-corpus"
                      type="text"
                      value={corpusInputStr}
                      onChange={(e) => handleCorpusChange(e.target.value)}
                      onFocus={handleCorpusFocus}
                      onBlur={handleCorpusBlur}
                      className="pl-6 pr-3 text-right font-mono text-sm h-9 border-slate-200 dark:border-slate-700 w-full min-w-0"
                      style={{
                        fontSize: corpusInputStr.length > 13 ? '0.75rem' : corpusInputStr.length > 10 ? '0.8125rem' : '0.875rem',
                      }}
                      aria-label="Total Investment Corpus Amount in Rupees"
                    />
                    {initialCorpus >= 100000 && !isCorpusFocused && (
                      <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold block text-right mt-0.5">
                        ({formatCompactINR(initialCorpus)})
                      </span>
                    )}
                  </div>
                </div>

                <Slider
                  value={[valueToSliderPos(initialCorpus, SWP_CORPUS_SCALE)]}
                  min={0}
                  max={100}
                  step={0.5}
                  onValueChange={(val) => {
                    const snapped = sliderPosToValue(val[0], SWP_CORPUS_SCALE);
                    setInitialCorpus(snapped);
                    setCorpusInputStr(snapped.toLocaleString('en-IN'));
                    setErrors((prev) => ({ ...prev, corpus: undefined }));

                    if (withdrawalMode === 'percent') {
                      const newRupee = Math.round((snapped * withdrawalPercentage) / 100);
                      const clampedRupee = Math.min(MAX_SWP_WITHDRAWAL, Math.max(0, newRupee));
                      setWithdrawalAmount(clampedRupee);
                      setWithdrawalInputStr(clampedRupee > 0 ? clampedRupee.toLocaleString('en-IN') : '0');
                    } else {
                      const newPct = snapped > 0 ? (withdrawalAmount / snapped) * 100 : 0;
                      setWithdrawalPercentage(newPct);
                      setPercentInputStr(newPct > 0 ? (newPct < 0.1 ? newPct.toFixed(3) : newPct.toFixed(2)) : '0');
                    }
                  }}
                  className="py-1 cursor-pointer"
                  aria-label="Total Investment Corpus Slider"
                />

                <SliderTickMarks
                  min={0}
                  max={100}
                  currentValue={valueToSliderPos(initialCorpus, SWP_CORPUS_SCALE)}
                  ticks={SWP_CORPUS_SCALE.labels.map((item) => ({
                    percent: item.percent,
                    label: item.label,
                    value: sliderPosToValue(item.percent, SWP_CORPUS_SCALE),
                  }))}
                  onSelect={(val) => {
                    setInitialCorpus(val);
                    setCorpusInputStr(val.toLocaleString('en-IN'));
                    setErrors((prev) => ({ ...prev, corpus: undefined }));

                    if (withdrawalMode === 'percent') {
                      const newRupee = Math.round((val * withdrawalPercentage) / 100);
                      const clampedRupee = Math.min(MAX_SWP_WITHDRAWAL, Math.max(0, newRupee));
                      setWithdrawalAmount(clampedRupee);
                      setWithdrawalInputStr(clampedRupee > 0 ? clampedRupee.toLocaleString('en-IN') : '0');
                    } else {
                      const newPct = val > 0 ? (withdrawalAmount / val) * 100 : 0;
                      setWithdrawalPercentage(newPct);
                      setPercentInputStr(newPct > 0 ? (newPct < 0.1 ? newPct.toFixed(3) : newPct.toFixed(2)) : '0');
                    }
                  }}
                />

                {/* Quick preset buttons for Corpus */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SWP_CORPUS_QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setInitialCorpus(preset);
                        setCorpusInputStr(preset.toLocaleString('en-IN'));
                        setErrors((prev) => ({ ...prev, corpus: undefined }));

                        if (withdrawalMode === 'percent') {
                          const newRupee = Math.round((preset * withdrawalPercentage) / 100);
                          const clampedRupee = Math.min(MAX_SWP_WITHDRAWAL, Math.max(0, newRupee));
                          setWithdrawalAmount(clampedRupee);
                          setWithdrawalInputStr(clampedRupee > 0 ? clampedRupee.toLocaleString('en-IN') : '0');
                        } else {
                          const newPct = preset > 0 ? (withdrawalAmount / preset) * 100 : 0;
                          setWithdrawalPercentage(newPct);
                          setPercentInputStr(newPct > 0 ? (newPct < 0.1 ? newPct.toFixed(3) : newPct.toFixed(2)) : '0');
                        }
                      }}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 border",
                        initialCorpus === preset
                          ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                      )}
                    >
                      {preset >= 100000 ? formatCompactINR(preset) : `₹${preset.toLocaleString('en-IN')}`}
                    </button>
                  ))}
                </div>
                {errors.corpus && <p className="text-xs text-rose-500">{errors.corpus}</p>}
              </div>

              {/* Withdrawal (Rupee & % of Initial Corpus Dual Entry) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label htmlFor="swp-withdrawal" className="text-sm font-semibold flex items-center gap-1.5 shrink-0">
                    <ArrowDownRight size={15} className="text-cyan-600 dark:text-cyan-400" />
                    <span>{withdrawalFrequency === 'monthly' ? 'Monthly Withdrawal' : 'Yearly Withdrawal'}</span>
                  </Label>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium border border-slate-200/80 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setWithdrawalMode('rupee')}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1",
                        withdrawalMode === 'rupee'
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <span>₹ Rupee</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawalMode('percent')}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1",
                        withdrawalMode === 'percent'
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <span>% of Corpus</span>
                    </button>
                  </div>
                </div>

                {/* Side-by-Side Dual Editable Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Rupee Input */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>{withdrawalFrequency === 'monthly' ? 'Monthly Rupee' : 'Annual Rupee'}</span>
                      {withdrawalMode === 'rupee' && (
                        <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-medium">Active</span>
                      )}
                    </span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none pointer-events-none">₹</span>
                      <Input
                        id="swp-withdrawal"
                        type="text"
                        value={withdrawalInputStr}
                        onChange={(e) => handleWithdrawalChange(e.target.value)}
                        onFocus={handleWithdrawalFocus}
                        onBlur={handleWithdrawalBlur}
                        className={cn(
                          "pl-6 pr-3 text-right font-mono text-sm h-9 border-slate-200 dark:border-slate-700 w-full min-w-0 transition-all",
                          withdrawalMode === 'rupee' && "ring-1 ring-blue-500/50 dark:ring-cyan-500/50"
                        )}
                        style={{
                          fontSize: withdrawalInputStr.length > 13 ? '0.75rem' : withdrawalInputStr.length > 10 ? '0.8125rem' : '0.875rem',
                        }}
                        aria-label="Withdrawal Amount in Rupees"
                      />
                    </div>
                    {withdrawalAmount >= 100000 && !isWithdrawalFocused && (
                      <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold block text-right mt-0.5">
                        ({formatCompactINR(withdrawalAmount)})
                      </span>
                    )}
                  </div>

                  {/* Percentage Input (% of Initial Corpus) */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>{withdrawalFrequency === 'monthly' ? 'Monthly % of Corpus' : 'Annual % of Corpus'}</span>
                      {withdrawalMode === 'percent' && (
                        <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-medium">Active</span>
                      )}
                    </span>
                    <div className="relative">
                      <Input
                        id="swp-withdrawal-pct"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={percentInputStr}
                        onChange={(e) => handlePercentageChange(e.target.value)}
                        onFocus={() => {
                          setIsPercentFocused(true);
                          setWithdrawalMode('percent');
                        }}
                        onBlur={handlePercentBlur}
                        className={cn(
                          "pr-7 pl-3 text-right font-mono text-sm h-9 border-slate-200 dark:border-slate-700 w-full min-w-0 transition-all",
                          withdrawalMode === 'percent' && "ring-1 ring-blue-500/50 dark:ring-cyan-500/50"
                        )}
                        aria-label="Withdrawal Rate Percentage of Initial Corpus"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none pointer-events-none">%</span>
                    </div>
                  </div>
                </div>

                {/* Subtext explaining synchronization and cross-schedule equivalent */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>
                    {withdrawalFrequency === 'monthly' ? (
                      <>Annualized: <strong>{formatINR(withdrawalAmount * 12)}/year</strong> ({(withdrawalPercentage * 12).toFixed(2)}%/yr)</>
                    ) : (
                      <>Monthly equivalent: <strong>{formatINR(Math.round(withdrawalAmount / 12))}/month</strong> ({(withdrawalPercentage / 12).toFixed(2)}%/mo)</>
                    )}
                  </span>
                  <span className="text-slate-400 font-mono">From initial corpus</span>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {withdrawalPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setWithdrawalMode('rupee');
                        setWithdrawalAmount(preset);
                        setWithdrawalInputStr(preset.toLocaleString('en-IN'));
                        setErrors((prev) => ({ ...prev, withdrawal: undefined }));

                        const newPct = initialCorpus > 0 ? (preset / initialCorpus) * 100 : 0;
                        setWithdrawalPercentage(newPct);
                        setPercentInputStr(newPct > 0 ? (newPct < 0.1 ? newPct.toFixed(3) : newPct.toFixed(2)) : '0');
                      }}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-150 border",
                        withdrawalAmount === preset
                          ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                      )}
                    >
                      {preset >= 100000 ? formatCompactINR(preset) : `₹${preset.toLocaleString('en-IN')}`}
                    </button>
                  ))}
                </div>
                {errors.withdrawal && <p className="text-xs text-rose-500">{errors.withdrawal}</p>}
              </div>

              {/* Expected Return Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="swp-return" className="text-sm font-semibold flex items-center gap-1.5">
                    <TrendingUp size={15} className="text-cyan-600 dark:text-cyan-400" />
                    Expected Return Rate (p.a.)
                  </Label>
                  <div className="relative w-24">
                    <Input
                      id="swp-return"
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={returnInputStr}
                      onChange={(e) => handleReturnChange(e.target.value)}
                      onBlur={handleReturnBlur}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') e.preventDefault();
                      }}
                      className="pr-6 text-right font-mono text-sm h-9 border-slate-200 dark:border-slate-700"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
                  </div>
                </div>
                <Slider
                  value={[expectedReturn]}
                  min={0}
                  max={30}
                  step={0.5}
                  onValueChange={(val) => {
                    const clamped = Math.min(30, Math.max(0, val[0]));
                    setExpectedReturn(clamped);
                    setReturnInputStr(clamped.toString());
                    setErrors((prev) => ({ ...prev, returnRate: undefined }));
                  }}
                  className="py-1 cursor-pointer"
                />
                <SliderTickMarks
                  min={0}
                  max={30}
                  currentValue={expectedReturn}
                  ticks={[
                    { value: 0, label: '0%' },
                    { value: 8, label: '8% (Cons)' },
                    { value: 12, label: '12% (Bal)' },
                    { value: 15, label: '15%' },
                    { value: 30, label: '30%' },
                  ]}
                  onSelect={(val) => {
                    setExpectedReturn(val);
                    setReturnInputStr(val.toString());
                    setErrors((prev) => ({ ...prev, returnRate: undefined }));
                  }}
                />
                {errors.returnRate && <p className="text-xs text-rose-500">{errors.returnRate}</p>}
              </div>

              {/* Time Horizon / Withdrawal Duration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="swp-duration" className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock size={15} className="text-cyan-600 dark:text-cyan-400" />
                    Time Horizon (Years)
                  </Label>
                  <div className="relative w-24">
                    <Input
                      id="swp-duration"
                      type="number"
                      min="1"
                      max="60"
                      step="1"
                      value={durationInputStr}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      onBlur={handleDurationBlur}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === '.') e.preventDefault();
                      }}
                      className="pr-6 text-right font-mono text-sm h-9 border-slate-200 dark:border-slate-700"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Yr</span>
                  </div>
                </div>
                <Slider
                  value={[withdrawalDuration]}
                  min={1}
                  max={60}
                  step={1}
                  onValueChange={(val) => {
                    const clamped = Math.min(60, Math.max(1, val[0]));
                    setWithdrawalDuration(clamped);
                    setDurationInputStr(clamped.toString());
                    setErrors((prev) => ({ ...prev, duration: undefined }));
                  }}
                  className="py-1 cursor-pointer"
                />
                <SliderTickMarks
                  min={1}
                  max={60}
                  currentValue={withdrawalDuration}
                  ticks={[
                    { value: 1, label: '1 Year' },
                    { value: 30, label: '30 Years' },
                    { value: 60, label: '60 Years' },
                  ]}
                  onSelect={(val) => {
                    setWithdrawalDuration(val);
                    setDurationInputStr(val.toString());
                    setErrors((prev) => ({ ...prev, duration: undefined }));
                  }}
                />
                {errors.duration && <p className="text-xs text-rose-500">{errors.duration}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Results Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Exhaustion Alert Banner (if applicable) */}
          {result.isExhausted && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Corpus Depletion Warning</p>
                <p className="text-xs mt-0.5 leading-relaxed">
                  At this withdrawal rate ({formatINR(withdrawalAmount)}/{withdrawalFrequency === 'monthly' ? 'mo' : 'yr'}), your initial corpus will be fully exhausted in <strong>Year {result.exhaustionYear}</strong>. Withdrawals have been automatically capped at the available balance to prevent a negative balance.
                </p>
              </div>
            </div>
          )}

          {/* Primary Featured Card: Remaining Corpus & Payout Summary */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl shadow-xl border border-slate-800">
            <div className="p-6 sm:p-7 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  SWP Portfolio Outcome
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {withdrawalFrequency === 'monthly' ? 'Monthly Payouts' : 'Annual Payout'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs text-slate-400 font-medium block mb-1">Total Capital Withdrawn</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                    {formatINR(result.totalActualWithdrawals)}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Across {withdrawalDuration} years ({withdrawalFrequency === 'monthly' ? `${withdrawalDuration * 12} payouts` : `${withdrawalDuration} payouts`})
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-medium block mb-1">Remaining Corpus</span>
                  <div className={cn(
                    "text-2xl sm:text-3xl font-extrabold font-mono tracking-tight",
                    result.remainingCorpus > 0 ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {formatINR(result.remainingCorpus)}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {result.remainingCorpus > 0 ? "Continues compounding" : "Fully exhausted"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 3 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">
                Scheduled Payout
              </span>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                {formatINR(withdrawalAmount)}
              </div>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                /{withdrawalFrequency === 'monthly' ? 'month' : 'year'} ({withdrawalPercentage.toFixed(2)}%)
              </span>
            </Card>

            <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">
                Compound Growth Earned
              </span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +{formatINR(result.totalGrowthEarned)}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                @ {expectedReturn}% annualized
              </span>
            </Card>

            <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 rounded-2xl">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">
                Longevity Status
              </span>
              <div className={cn(
                "text-lg font-bold font-mono",
                result.isExhausted ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-cyan-400"
              )}>
                {result.isExhausted ? `Year ${result.exhaustionYear}` : 'Sustained'}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {result.isExhausted ? 'Corpus depleted' : `${withdrawalDuration}y horizon`}
              </span>
            </Card>
          </div>

          {/* Balance vs Cumulative Withdrawals Chart */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Corpus Balance vs Cumulative Withdrawals
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWithdrawn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatCompactINR(v)} tick={{ fontSize: 11 }} width={65} />
                  <RechartsTooltip
                    formatter={(val: number, name: string) => [
                      formatINR(val),
                      name === 'Balance' ? 'Remaining Corpus' : 'Total Withdrawn',
                    ]}
                  />
                  <Area type="monotone" dataKey="Balance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                  <Area type="monotone" dataKey="CumulativeWithdrawals" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorWithdrawn)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Year-by-Year Growth & Cash-Flow Projection Schedule */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setIsScheduleOpen(!isScheduleOpen)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Annual SWP Cash-Flow & Balance Schedule
            </span>
            <span className="text-xs text-slate-500 font-mono">({result.yearlySchedule.length} Years Schedule)</span>
          </div>
          {isScheduleOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>

        {isScheduleOpen && (
          <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 font-semibold">Year</th>
                  <th className="py-2.5 font-semibold">Opening Balance</th>
                  <th className="py-2.5 font-semibold">Growth Earned</th>
                  <th className="py-2.5 font-semibold">Annual Withdrawn</th>
                  <th className="py-2.5 font-semibold text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-2 font-medium text-slate-700 dark:text-slate-300">Year {row.year}</td>
                    <td className="py-2 text-slate-600 dark:text-slate-400">{formatINR(row.openingBalance)}</td>
                    <td className="py-2 text-emerald-600 dark:text-emerald-400">+{formatINR(row.growthEarned)}</td>
                    <td className="py-2 text-cyan-600 dark:text-cyan-400">-{formatINR(row.annualWithdrawal)}</td>
                    <td className="py-2 text-right font-semibold text-slate-900 dark:text-white">
                      {row.closingBalance === 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-sans font-medium text-[11px]">Exhausted</span>
                      ) : (
                        formatINR(row.closingBalance)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Download Results Section (PDF and Word .docx exports) */}
      <DownloadResultsSection getData={getExportData} />

      {/* 5. Assumptions Explanation */}
      <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-slate-900/40 border border-blue-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Info size={14} className="text-cyan-500" />
          Withdrawal Timing & Calculation Convention
        </div>
        <p>
          For monthly withdrawals, monthly compound growth is applied followed by end-of-month withdrawals. For yearly withdrawals, annual compound growth is applied followed by end-of-year withdrawals. Withdrawals stop automatically once the remaining corpus reaches zero.
        </p>
      </div>

      {/* 6. Required Financial Disclaimer */}
      <CalculatorDisclaimer />

      {/* 7. VPF vs PPF Educational Comparison Section */}
      <VpfVsPpfComparison calculatorId="swp" />
    </div>
  );
}
