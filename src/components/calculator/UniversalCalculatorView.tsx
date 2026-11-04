import React, { useState, useMemo, useEffect } from 'react';
import { CalculatorMeta, CalculatorFieldConfig } from '@/utils/calculators/calculatorCatalog';
import { runCalculator } from '@/utils/calculators/runCalculator';
import { formatINR } from '@/utils/sipCalculator';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DownloadResultsSection,
} from './DownloadResultsSection';
import {
  CalculatorCTAButtons,
} from './CalculatorCTAButtons';
import {
  ArrowLeft,
  Info,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface UniversalCalculatorViewProps {
  calculator: CalculatorMeta;
  onBackToDirectory: () => void;
}

export const UniversalCalculatorView: React.FC<UniversalCalculatorViewProps> = ({
  calculator,
  onBackToDirectory,
}) => {
  // rawInputs holds the displayed string value for each field (can be "" for empty or optional)
  const [rawInputs, setRawInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    calculator.fields.forEach((f) => {
      if (f.isOptional && f.defaultValue === 0) {
        initial[f.id] = '';
      } else {
        initial[f.id] = f.isCurrency
          ? f.defaultValue.toLocaleString('en-IN')
          : String(f.defaultValue);
      }
    });
    return initial;
  });

  // inputs holds numeric values passed to calculation engine
  const [inputs, setInputs] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    calculator.fields.forEach((f) => {
      initial[f.id] = f.defaultValue;
    });
    return initial;
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  // Sync state whenever active calculator changes
  useEffect(() => {
    const initialRaw: Record<string, string> = {};
    const initialNum: Record<string, number> = {};
    calculator.fields.forEach((f) => {
      if (f.isOptional && f.defaultValue === 0) {
        initialRaw[f.id] = '';
        initialNum[f.id] = 0;
      } else {
        initialRaw[f.id] = f.isCurrency
          ? f.defaultValue.toLocaleString('en-IN')
          : String(f.defaultValue);
        initialNum[f.id] = f.defaultValue;
      }
    });
    setRawInputs(initialRaw);
    setInputs(initialNum);
    setValidationErrors({});
    setShowFullSchedule(false);
  }, [calculator.id]);

  const handleTextChange = (field: CalculatorFieldConfig, rawValue: string) => {
    // If user cleared the input completely
    if (rawValue.trim() === '') {
      setRawInputs((prev) => ({ ...prev, [field.id]: '' }));
      setInputs((prev) => ({ ...prev, [field.id]: 0 }));
      if (!field.isOptional) {
        setValidationErrors((prev) => ({
          ...prev,
          [field.id]: `${field.label} is required`,
        }));
      } else {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[field.id];
          return next;
        });
      }
      return;
    }

    // Keep raw string in text box
    setRawInputs((prev) => ({ ...prev, [field.id]: rawValue }));

    const cleanVal = rawValue.replace(/,/g, '').trim();
    if (cleanVal === '-' || cleanVal === '.' || cleanVal === '-.') {
      return;
    }

    const num = parseFloat(cleanVal);
    if (isNaN(num)) {
      setValidationErrors((prev) => ({
        ...prev,
        [field.id]: 'Please enter a valid number',
      }));
      return;
    }

    // Range validation
    if (num < field.min && !field.isOptional) {
      setValidationErrors((prev) => ({
        ...prev,
        [field.id]: `Minimum is ${field.isCurrency ? formatINR(field.min) : `${field.min} ${field.unit}`}`,
      }));
    } else if (num > field.max) {
      setValidationErrors((prev) => ({
        ...prev,
        [field.id]: `Maximum is ${field.isCurrency ? formatINR(field.max) : `${field.max} ${field.unit}`}`,
      }));
    } else {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field.id];
        return next;
      });
    }

    setInputs((prev) => ({
      ...prev,
      [field.id]: num,
    }));
  };

  const handleBlur = (field: CalculatorFieldConfig) => {
    const raw = rawInputs[field.id] ?? '';
    if (raw.trim() === '') {
      if (field.isOptional) {
        // Keep completely blank!
        setRawInputs((prev) => ({ ...prev, [field.id]: '' }));
        setInputs((prev) => ({ ...prev, [field.id]: 0 }));
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[field.id];
          return next;
        });
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          [field.id]: `${field.label} is required`,
        }));
      }
      return;
    }

    const cleanVal = raw.replace(/,/g, '').trim();
    const num = parseFloat(cleanVal);
    if (isNaN(num)) {
      if (field.isOptional) {
        setRawInputs((prev) => ({ ...prev, [field.id]: '' }));
        setInputs((prev) => ({ ...prev, [field.id]: 0 }));
      } else {
        const fallback = field.defaultValue;
        setRawInputs((prev) => ({
          ...prev,
          [field.id]: field.isCurrency ? fallback.toLocaleString('en-IN') : String(fallback),
        }));
        setInputs((prev) => ({ ...prev, [field.id]: fallback }));
      }
      return;
    }

    // Clamp within min and max
    const clamped = Math.max(field.min, Math.min(field.max, num));
    setInputs((prev) => ({ ...prev, [field.id]: clamped }));
    setRawInputs((prev) => ({
      ...prev,
      [field.id]: field.isCurrency ? clamped.toLocaleString('en-IN') : String(clamped),
    }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[field.id];
      return next;
    });
  };

  const handleSliderChange = (field: CalculatorFieldConfig, value: number) => {
    setInputs((prev) => ({ ...prev, [field.id]: value }));
    setRawInputs((prev) => ({
      ...prev,
      [field.id]: field.isCurrency ? value.toLocaleString('en-IN') : String(value),
    }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[field.id];
      return next;
    });
  };

  // Run calculation reactively
  const calculation = useMemo(() => {
    return runCalculator(calculator, inputs);
  }, [calculator, inputs]);

  const schedulePreviewCount = 5;
  const displayedScheduleRows = useMemo(() => {
    if (!calculation.scheduleRows) return [];
    if (showFullSchedule) return calculation.scheduleRows;
    return calculation.scheduleRows.slice(0, schedulePreviewCount);
  }, [calculation.scheduleRows, showFullSchedule]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Calculators</span>
        </button>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-fit">
          {calculator.categoryLabel}
        </span>
      </div>

      {/* Main Interactive Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Sliders and Inputs Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-7">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {calculator.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {calculator.shortDescription}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6 pt-2">
            {calculator.fields.map((field) => {
              const rawVal = rawInputs[field.id] ?? '';
              const currentNumVal = inputs[field.id];
              const isBlank = rawVal.trim() === '';
              const sliderPos = isBlank && field.isOptional
                ? field.min
                : Math.min(field.max, Math.max(field.min, currentNumVal ?? field.min));
              const hasError = !!validationErrors[field.id];

              return (
                <div key={field.id} className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <label
                        htmlFor={`input-${field.id}`}
                        className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {field.label}
                      </label>
                      {field.isOptional && (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-md">
                          Optional
                        </span>
                      )}
                    </div>

                    {/* Numeric Input Box */}
                    <div className="relative w-36 sm:w-44 shrink-0">
                      {field.isCurrency && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none select-none">
                          ₹
                        </span>
                      )}
                      <input
                        id={`input-${field.id}`}
                        type="text"
                        inputMode="decimal"
                        value={rawVal}
                        placeholder={field.isOptional ? 'Optional' : '0'}
                        onChange={(e) => handleTextChange(field, e.target.value)}
                        onBlur={() => handleBlur(field)}
                        className={`w-full py-1.5 ${field.isCurrency ? 'pl-7' : 'pl-3'} ${!field.isCurrency ? 'pr-8' : 'pr-3'} rounded-xl border ${
                          hasError
                            ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500 dark:focus:ring-cyan-400'
                        } bg-slate-50/70 dark:bg-slate-800/80 font-mono text-sm font-bold text-right text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all`}
                      />
                      {!field.isCurrency && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 pointer-events-none select-none">
                          {field.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slider Control */}
                  <Slider
                    value={[sliderPos]}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    onValueChange={(val) => handleSliderChange(field, val[0])}
                    className="cursor-pointer py-1"
                  />

                  {/* Slider min/max markers */}
                  <div className="flex justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    <span>
                      {field.isCurrency ? formatINR(field.min) : `${field.min.toLocaleString('en-IN')} ${field.unit}`}
                    </span>
                    <span>
                      {field.isCurrency ? formatINR(field.max) : `${field.max.toLocaleString('en-IN')} ${field.unit}`}
                    </span>
                  </div>

                  {/* Validation Error Message */}
                  {hasError && (
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{validationErrors[field.id]}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Consultation CTA Strip */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <CalculatorCTAButtons />
          </div>
        </div>

        {/* Right Column: Results Dashboard & Visual Chart (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-[#0B132B] to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Calculated Results</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Live Simulation</span>
            </div>

            {/* Visual Donut Chart */}
            {calculation.chartData && calculation.chartData.length >= 2 && (
              <div className="relative flex flex-col items-center justify-center">
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calculation.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={76}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {calculation.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val: number) => [formatINR(val), 'Amount']}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Chart Legend */}
                <div className="flex flex-wrap justify-center gap-4 text-xs font-medium mt-1">
                  {calculation.chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Metrics Cards */}
            <div className="space-y-3 pt-2">
              {calculation.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className={`p-4 rounded-2xl border transition-all ${
                    metric.isHighlight
                      ? 'bg-gradient-to-r from-blue-950/70 to-cyan-950/70 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-800/60 border-slate-750 text-slate-200'
                  }`}
                >
                  <div className="text-xs font-medium text-slate-400">{metric.label}</div>
                  <div className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-white">
                    {metric.value}
                  </div>
                  {metric.subtext && (
                    <div className="text-[11px] font-medium text-slate-400 mt-1">
                      {metric.subtext}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Download Official PDF / Word Report with Watermark */}
          <DownloadResultsSection
            exportData={calculation.exportData}
            calculatorTitle={calculator.name}
          />
        </div>
      </div>

      {/* Projection Schedule Table (if available) */}
      {calculation.scheduleRows && calculation.scheduleRows.length > 0 && calculation.scheduleHeaders && (
        <Card className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <CardHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <span>Year-by-Year Schedule & Amortization</span>
            </CardTitle>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {calculation.scheduleRows.length} Periods Projected
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {calculation.scheduleHeaders.map((head, idx) => (
                      <th
                        key={idx}
                        className={`py-3 px-4 font-bold ${idx === 0 ? 'text-left' : 'text-right'}`}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedScheduleRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors font-mono text-[13px]"
                    >
                      <td className="py-2.5 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">
                        {row.col1}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {row.col2}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {row.col3}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {row.col4}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {row.col5}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {calculation.scheduleRows.length > schedulePreviewCount && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullSchedule(!showFullSchedule)}
                  className="text-xs font-semibold text-blue-600 dark:text-cyan-400"
                >
                  {showFullSchedule ? (
                    <>
                      <span>Show Less</span>
                      <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <span>Show Full {calculation.scheduleRows.length}-Year Schedule</span>
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Explanatory, Mathematical & Assumptions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mathematical Formula Card */}
        <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Mathematical Formula & Methodology</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 font-mono text-sm font-bold text-slate-900 dark:text-cyan-300">
            {calculator.formula}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {calculator.formulaExplanation}
          </p>
          {calculator.officialSource && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Official Benchmark Source: </span>
              {calculator.officialSource}
            </div>
          )}
        </Card>

        {/* Assumptions & Worked Example Card */}
        <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Assumptions & Worked Example</span>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Assumptions:</div>
            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
              {calculator.assumptions.map((assump, idx) => (
                <li key={idx}>{assump}</li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <div className="font-bold text-emerald-800 dark:text-emerald-300">
              Example: {calculator.workedExample.inputSummary}
            </div>
            <div className="font-semibold">{calculator.workedExample.expectedResult}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{calculator.workedExample.explanation}</div>
          </div>
        </Card>
      </div>

      {/* Financial Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Regulatory Disclaimer: </span>
          {calculator.disclaimer}
        </div>
      </div>
    </div>
  );
};

export default UniversalCalculatorView;

