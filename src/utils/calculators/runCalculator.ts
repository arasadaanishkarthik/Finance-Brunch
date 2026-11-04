/**
 * Finance Brunch — Universal Calculator Dispatcher & Export Data Formatter
 * 
 * Bridges all 38 mathematical engines to the Universal UI view and
 * prepares formatted metrics, charts, schedules, and export datasets.
 */

import { formatINR, formatCompactINR } from '../sipCalculator';
import {
  calculateSIP,
  calculateLumpsum,
  calculateSWP,
  calculateStepUpSIP,
  calculateStepUpSWP,
  calculateMFReturns,
  calculateROI,
  calculateCAGR,
  calculateXIRR,
  calculateIRR,
  calculateStockAverage,
  calculateInflation,
  calculateFIRE,
  calculateRetirement,
} from './investmentCalculators';

import {
  calculateSSY,
  calculatePPF,
  calculateEPF,
  calculateFD,
  calculateRD,
  calculateNSC,
  calculateAPY,
  calculatePOMIS,
  calculateSCSS,
  calculateNPS,
} from './governmentSchemesCalculators';

import {
  calculateEMI,
  calculateHomeLoan,
  calculateCarLoan,
  calculateSimpleInterest,
  calculateCompoundInterest,
  calculateFlatVsReducing,
} from './loanCalculators';

import {
  calculateIncomeTax,
  calculateHRA,
  calculateGST,
  calculateGratuity,
  calculateTDS,
  calculateSalary,
} from './taxSalaryCalculators';

import {
  calculateBrokerage,
  calculateMargin,
  calculateMTF,
} from './tradingCalculators';

import { CalculatorMeta } from './calculatorCatalog';
import { CalculatorExportData, CalculatorExportRow } from '../calculatorExportGenerator';

export interface CalculatedViewModel {
  metrics: Array<{ label: string; value: string; isHighlight?: boolean; subtext?: string }>;
  chartData: Array<{ name: string; value: number; color: string }>;
  scheduleHeaders?: [string, string, string, string, string];
  scheduleRows?: CalculatorExportRow[];
  extraNotes?: string;
  exportData: CalculatorExportData;
}

export function runCalculator(meta: CalculatorMeta, inputValues: Record<string, number>): CalculatedViewModel {
  const id = meta.id;
  const nowStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Helper to format input list for exports
  const formatInputsList = (): Array<{ label: string; value: string }> => {
    return meta.fields.map((f) => {
      const raw = inputValues[f.id] ?? f.defaultValue;
      const formatted = f.isCurrency ? formatINR(raw) : `${raw.toLocaleString('en-IN')} ${f.unit}`;
      return { label: f.label, value: formatted };
    });
  };

  // 1. SIP
  if (id === 'sip') {
    const res = calculateSIP({
      monthlyInvestment: inputValues.monthlyInvestment ?? 10000,
      expectedAnnualReturn: inputValues.expectedAnnualReturn ?? 12,
      investmentDurationYears: inputValues.investmentDurationYears ?? 10,
    });
    const metrics = [
      { label: 'Total Investment', value: formatINR(res.totalInvested), subtext: 'Amount contributed' },
      { label: 'Est. Returns', value: formatINR(res.estimatedReturns), subtext: 'Wealth gained' },
      { label: 'Total Maturity Value', value: formatINR(res.futureValue), isHighlight: true, subtext: 'Expected corpus' },
    ];
    const chartData = [
      { name: 'Invested Amount', value: res.totalInvested, color: '#3b82f6' },
      { name: 'Est. Returns', value: res.estimatedReturns, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.yearlyBreakdown.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(r.monthlyContribution * 12),
      col3: formatINR(r.cumulativeInvested),
      col4: formatINR(r.estimatedReturns),
      col5: formatINR(r.futureValue),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Period', 'Annual Deposit', 'Cumulative Invested', 'Est. Returns', 'Portfolio Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'sip',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Period', 'Annual Deposit', 'Cumulative Invested', 'Est. Returns', 'Portfolio Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 2. Lumpsum
  if (id === 'lumpsum') {
    const res = calculateLumpsum({
      initialInvestment: inputValues.initialInvestment ?? 100000,
      expectedAnnualReturn: inputValues.expectedAnnualReturn ?? 12,
      investmentDurationYears: inputValues.investmentDurationYears ?? 10,
    });
    const metrics = [
      { label: 'Invested Amount', value: formatINR(res.initialInvestment) },
      { label: 'Est. Returns', value: formatINR(res.estimatedReturns) },
      { label: 'Total Maturity Value', value: formatINR(res.futureValue), isHighlight: true },
    ];
    const chartData = [
      { name: 'Principal Invested', value: res.initialInvestment, color: '#3b82f6' },
      { name: 'Compound Returns', value: res.estimatedReturns, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.yearlyBreakdown.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(r.openingBalance),
      col3: formatINR(r.investedAmount),
      col4: formatINR(r.estimatedReturns),
      col5: formatINR(r.futureValue),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Period', 'Opening Balance', 'Principal', 'Est. Growth', 'Total Value'],
      scheduleRows,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Period', 'Opening Balance', 'Principal', 'Est. Growth', 'Total Value'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 3. SWP
  if (id === 'swp') {
    const res = calculateSWP({
      initialCorpus: inputValues.totalCorpus ?? 5000000,
      monthlyWithdrawal: inputValues.monthlyWithdrawal ?? 35000,
      expectedAnnualReturn: inputValues.expectedAnnualReturn ?? 9,
      withdrawalDurationYears: inputValues.tenureYears ?? 10,
    });
    const metrics = [
      { label: 'Initial Investment', value: formatINR(res.initialCorpus) },
      { label: 'Total Withdrawn', value: formatINR(res.totalActualWithdrawals), subtext: 'Cash received' },
      { label: 'Remaining Corpus', value: formatINR(res.remainingCorpus), isHighlight: true, subtext: res.isExhausted ? 'Corpus Depleted' : 'Safe Balance' },
    ];
    const chartData = [
      { name: 'Total Withdrawn', value: res.totalActualWithdrawals, color: '#f59e0b' },
      { name: 'Remaining Balance', value: Math.max(0, res.remainingCorpus), color: '#3b82f6' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.yearlySchedule.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(r.openingBalance),
      col3: formatINR(r.growthEarned),
      col4: formatINR(r.annualWithdrawal),
      col5: formatINR(r.closingBalance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Period', 'Opening Balance', 'Growth Earned', 'Annual Withdrawal', 'Closing Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'swp',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Period', 'Opening Balance', 'Growth Earned', 'Annual Withdrawal', 'Closing Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // Step-Up SWP
  if (id === 'step-up-swp') {
    const res = calculateStepUpSWP({
      initialCorpus: inputValues.totalCorpus ?? 5000000,
      initialMonthlyWithdrawal: inputValues.monthlyWithdrawal ?? 30000,
      annualStepUpPercentage: inputValues.stepUpPercentage ?? 5,
      expectedAnnualReturn: inputValues.expectedAnnualReturn ?? 9,
      withdrawalDurationYears: inputValues.tenureYears ?? 10,
    });
    const metrics = [
      { label: 'Initial Corpus', value: formatINR(res.initialCorpus) },
      { label: 'Total Withdrawn', value: formatINR(res.totalActualWithdrawals), subtext: 'Cash received over tenure' },
      { label: 'Remaining Corpus', value: formatINR(res.remainingCorpus), isHighlight: true, subtext: res.isExhausted ? `Depleted in Year ${res.exhaustionYear}` : 'Safe Balance' },
    ];
    const chartData = [
      { name: 'Total Withdrawn', value: res.totalActualWithdrawals, color: '#f59e0b' },
      { name: 'Remaining Balance', value: Math.max(0, res.remainingCorpus), color: '#3b82f6' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.yearlySchedule.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(r.openingBalance),
      col3: formatINR(r.growthEarned),
      col4: `${formatINR(r.annualWithdrawal)} (${formatINR(r.monthlyWithdrawal)}/mo)`,
      col5: formatINR(r.closingBalance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Period', 'Opening Balance', 'Growth Earned', 'Annual Withdrawal (Step-Up)', 'Closing Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'swp',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Period', 'Opening Balance', 'Growth Earned', 'Annual Withdrawal (Step-Up)', 'Closing Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 4. Mutual Fund Returns
  if (id === 'mf-returns') {
    const res = calculateMFReturns({
      investmentType: 'lumpsum',
      amount: inputValues.amount ?? 200000,
      expectedReturnRate: inputValues.expectedReturnRate ?? 14,
      durationYears: inputValues.durationYears ?? 5,
    });
    const metrics = [
      { label: 'Invested Amount', value: formatINR(res.investedAmount) },
      { label: 'Estimated Returns', value: formatINR(res.estimatedReturns) },
      { label: 'Maturity Value', value: formatINR(res.totalMaturityValue), isHighlight: true },
      { label: 'Absolute Return', value: `${res.absoluteReturnPercent}%` },
    ];
    const chartData = [
      { name: 'Invested', value: res.investedAmount, color: '#3b82f6' },
      { name: 'Returns', value: res.estimatedReturns, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.schedule.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(r.invested),
      col3: formatINR(r.returns),
      col4: `${res.annualizedReturnPercent}%`,
      col5: formatINR(r.balance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Period', 'Invested', 'Est. Returns', 'Annualized Rate', 'Portfolio Value'],
      scheduleRows,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Period', 'Invested', 'Est. Returns', 'Annualized Rate', 'Portfolio Value'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 5. Step-Up SIP
  if (id === 'step-up-sip') {
    const res = calculateStepUpSIP({
      initialMonthlyInvestment: inputValues.monthlyInvestment ?? 10000,
      annualStepUpPercentage: inputValues.stepUpPercentage ?? 10,
      expectedAnnualReturn: inputValues.expectedAnnualReturn ?? 12,
      investmentDurationYears: inputValues.investmentDurationYears ?? 10,
    });
    const metrics = [
      { label: 'Total Invested', value: formatINR(res.totalInvested) },
      { label: 'Estimated Returns', value: formatINR(res.estimatedReturns) },
      { label: 'Total Value', value: formatINR(res.futureValue), isHighlight: true },
    ];
    const chartData = [
      { name: 'Total Invested', value: res.totalInvested, color: '#3b82f6' },
      { name: 'Estimated Returns', value: res.estimatedReturns, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.annualSchedule.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(r.monthlyContribution),
      col3: formatINR(r.cumulativeInvested),
      col4: formatINR(r.estimatedReturns),
      col5: formatINR(r.futureValue),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Period', 'Monthly SIP', 'Cumulative Invested', 'Est. Returns', 'Portfolio Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'stepup',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Period', 'Monthly SIP', 'Cumulative Invested', 'Est. Returns', 'Portfolio Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 6. ROI
  if (id === 'roi') {
    const res = calculateROI({
      initialInvestment: inputValues.initialInvestment ?? 200000,
      finalValue: inputValues.finalValue ?? 350000,
      durationYears: inputValues.durationYears ?? 3,
    });
    const metrics = [
      { label: 'Net Profit', value: formatINR(res.netProfit) },
      { label: 'Total ROI', value: `${res.roiPercent}%`, isHighlight: true },
      { label: 'Annualized ROI', value: res.annualizedRoiPercent !== null ? `${res.annualizedRoiPercent}%` : 'N/A' },
    ];
    const chartData = [
      { name: 'Initial Capital', value: inputValues.initialInvestment ?? 200000, color: '#3b82f6' },
      { name: 'Net Gain', value: Math.max(0, res.netProfit), color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Period', 'Investment', 'Gain', 'ROI %', 'Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 7. CAGR
  if (id === 'cagr') {
    const res = calculateCAGR({
      initialValue: inputValues.initialValue ?? 50000,
      finalValue: inputValues.finalValue ?? 150000,
      durationYears: inputValues.durationYears ?? 5,
    });
    const metrics = [
      { label: 'CAGR (Annualized)', value: `${res.cagrPercent}%`, isHighlight: true },
      { label: 'Absolute Return', value: `${res.absoluteReturnPercent}%` },
      { label: 'Total Gains', value: formatINR(res.totalGains) },
    ];
    const chartData = [
      { name: 'Initial Value', value: inputValues.initialValue ?? 50000, color: '#3b82f6' },
      { name: 'Capital Growth', value: Math.max(0, res.totalGains), color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Period', 'Initial', 'Gains', 'CAGR %', 'Final'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 8. XIRR
  if (id === 'xirr') {
    const cf: Array<{ date: string; amount: number }> = [];
    const inst1 = inputValues.installment1 ?? 25000;
    if (inst1 > 0) {
      cf.push({ date: '2024-01-01', amount: -inst1 });
    }
    const inst2 = inputValues.installment2 ?? 0;
    if (inst2 > 0) {
      cf.push({ date: '2024-04-01', amount: -inst2 });
    }
    const inst3 = inputValues.installment3 ?? 0;
    if (inst3 > 0) {
      cf.push({ date: '2024-07-01', amount: -inst3 });
    }
    const currentVal = inputValues.currentValuation ?? (inst2 > 0 || inst3 > 0 ? 88000 : 30000);
    if (currentVal > 0) {
      cf.push({ date: '2025-01-01', amount: currentVal });
    }

    const res = calculateXIRR(cf);
    const metrics = [
      { label: 'XIRR (Annualized Return)', value: `${res.xirrPercent}%`, isHighlight: true },
      { label: 'Total Invested', value: formatINR(res.totalInvested) },
      { label: 'Current Valuation', value: formatINR(res.currentValue) },
      { label: 'Total Gain', value: formatINR(res.totalGain) },
    ];
    const chartData = [
      { name: 'Total Invested', value: res.totalInvested, color: '#3b82f6' },
      { name: 'Capital Gain', value: Math.max(0, res.totalGain), color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = cf.map((c, idx) => ({
      col1: idx === cf.length - 1 ? 'Maturity (Day 365)' : `Installment ${idx + 1} (${c.date})`,
      col2: c.amount < 0 ? formatINR(Math.abs(c.amount)) : '-',
      col3: c.amount > 0 ? formatINR(c.amount) : '-',
      col4: c.date,
      col5: c.amount > 0 ? `${res.xirrPercent}% XIRR` : 'Invested Outflow',
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Period', 'Outflow', 'Inflow', 'Date', 'Status'],
      scheduleRows,
      exportData: {
        calculatorType: 'sip',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Period', 'Outflow', 'Inflow', 'Date', 'Status'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 9. IRR
  if (id === 'irr') {
    const cfs = [
      -(inputValues.initialOutflow ?? 100000),
      inputValues.cashFlow1 ?? 30000,
      inputValues.cashFlow2 ?? 40000,
      inputValues.cashFlow3 ?? 55000,
    ];
    const res = calculateIRR(cfs);
    const metrics = [
      { label: 'Internal Rate of Return (IRR)', value: `${res.irrPercent}%`, isHighlight: true },
      { label: 'Total Outflows', value: formatINR(res.totalOutflow) },
      { label: 'Total Inflows', value: formatINR(res.totalInflow) },
      { label: 'Net Cash Flow', value: formatINR(res.netCashFlow) },
    ];
    const chartData = [
      { name: 'Initial Outflow', value: res.totalOutflow, color: '#ef4444' },
      { name: 'Total Inflows', value: res.totalInflow, color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Period', 'Cash Flow', 'Cumulative', 'IRR %', 'NPV'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 10. Stock Average
  if (id === 'stock-average') {
    const lots = [
      { quantity: inputValues.qty1 ?? 50, buyPrice: inputValues.price1 ?? 400 },
      { quantity: inputValues.qty2 ?? 100, buyPrice: inputValues.price2 ?? 340 },
    ];
    const res = calculateStockAverage({
      lots,
      currentMarketPrice: inputValues.cmp ?? 380,
    });
    const metrics = [
      { label: 'Total Quantity', value: `${res.totalQuantity} Shares` },
      { label: 'Average Price / Share', value: `₹${res.averagePricePerShare.toFixed(2)}`, isHighlight: true },
      { label: 'Total Capital Invested', value: formatINR(res.totalInvestedAmount) },
      { label: 'Unrealized P&L', value: res.unrealizedPnL !== null ? `${res.unrealizedPnL >= 0 ? '+' : ''}${formatINR(res.unrealizedPnL)} (${res.unrealizedPnLPercent}%)` : 'N/A' },
    ];
    const chartData = [
      { name: 'Total Cost', value: res.totalInvestedAmount, color: '#3b82f6' },
      { name: 'Portfolio Value', value: res.currentPortfolioValue ?? res.totalInvestedAmount, color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Lot', 'Quantity', 'Price', 'Invested', 'Weight %'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 11. Inflation
  if (id === 'inflation') {
    const res = calculateInflation({
      currentAmount: inputValues.currentAmount ?? 50000,
      annualInflationRate: inputValues.annualInflationRate ?? 6,
      timeHorizonYears: inputValues.timeHorizonYears ?? 15,
    });
    const metrics = [
      { label: 'Today’s Cost', value: formatINR(res.currentAmount) },
      { label: 'Future Cost (Inflated)', value: formatINR(res.futureCostEquivalent), isHighlight: true },
      { label: 'Purchasing Power of Today’s ₹', value: formatINR(res.purchasingPowerEquivalent) },
      { label: 'Cost Multiplier', value: `${res.costIncreaseMultiplier}x` },
    ];
    const chartData = [
      { name: 'Current Cost', value: res.currentAmount, color: '#3b82f6' },
      { name: 'Inflation Added Cost', value: res.futureCostEquivalent - res.currentAmount, color: '#ef4444' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.schedule.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(res.currentAmount),
      col3: `${res.annualInflationRate}%`,
      col4: formatINR(r.purchasingPower),
      col5: formatINR(r.futureCost),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Period', 'Base Cost', 'Inflation Rate', 'Purchasing Power', 'Estimated Future Cost'],
      scheduleRows,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Period', 'Base Cost', 'Inflation Rate', 'Purchasing Power', 'Estimated Future Cost'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 12. FIRE
  if (id === 'fire') {
    const res = calculateFIRE({
      currentAge: inputValues.currentAge ?? 30,
      targetFireAge: inputValues.targetFireAge ?? 45,
      currentMonthlyExpenses: inputValues.currentMonthlyExpenses ?? 60000,
      expectedInflationRate: inputValues.expectedInflationRate ?? 6,
      safeWithdrawalRate: inputValues.safeWithdrawalRate ?? 4,
      currentSavings: inputValues.currentSavings ?? 1000000,
    });
    const metrics = [
      { label: 'Target FIRE Corpus', value: formatINR(res.targetFIRECorpus), isHighlight: true, subtext: `${res.multiplierRule}x Annual Expenses` },
      { label: 'Annual Expenses at FIRE', value: formatINR(res.annualExpensesAtFIRE) },
      { label: 'Monthly SIP Needed', value: formatINR(res.monthlySavingsRequired) },
      { label: 'Corpus Shortfall', value: formatINR(res.corpusShortfall) },
    ];
    const chartData = [
      { name: 'Existing Savings Growth', value: res.projectedCurrentSavingsAtFIRE, color: '#3b82f6' },
      { name: 'SIP Capital Needed', value: Math.max(0, res.corpusShortfall), color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'sip',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Year', 'Age', 'Annual Expense', 'Corpus Target', 'Savings Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 13. Retirement
  if (id === 'retirement') {
    const res = calculateRetirement({
      currentAge: inputValues.currentAge ?? 30,
      retirementAge: inputValues.retirementAge ?? 60,
      lifeExpectancy: inputValues.lifeExpectancy ?? 80,
      currentMonthlyExpenses: inputValues.currentMonthlyExpenses ?? 40000,
      expectedInflationRate: inputValues.expectedInflationRate ?? 6,
      preRetirementReturnRate: inputValues.preRetirementReturnRate ?? 12,
      postRetirementReturnRate: inputValues.postRetirementReturnRate ?? 8,
    });
    const metrics = [
      { label: 'Required Retirement Corpus', value: formatINR(res.requiredRetirementCorpus), isHighlight: true },
      { label: 'Monthly Expense at 60', value: formatINR(res.monthlyExpenseAtRetirement) },
      { label: 'Monthly SIP Required', value: formatINR(res.monthlySIPRequired) },
      { label: 'Corpus Duration', value: `${res.retirementDurationYears} Years` },
    ];
    const chartData = [
      { name: 'Corpus Required', value: res.requiredRetirementCorpus, color: '#3b82f6' },
      { name: 'Monthly SIP Needed', value: res.monthlySIPRequired * 12, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.schedule.map((r) => ({
      col1: `Age ${r.age}`,
      col2: formatINR(r.yearlyExpense),
      col3: formatINR(res.requiredRetirementCorpus),
      col4: formatINR(r.yearlyExpense),
      col5: formatINR(r.corpusBalance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Age', 'Yearly Expense', 'Total Corpus', 'Withdrawal', 'Remaining Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'swp',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Age', 'Yearly Expense', 'Total Corpus', 'Withdrawal', 'Remaining Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 14. SSY
  if (id === 'ssy') {
    const res = calculateSSY({
      yearlyDeposit: inputValues.yearlyDeposit ?? 150000,
      girlChildAge: inputValues.girlChildAge ?? 3,
      interestRate: inputValues.interestRate ?? 8.2,
    });
    const metrics = [
      { label: 'Total Deposited (15 Yrs)', value: formatINR(res.totalAmountDeposited) },
      { label: 'Total Interest Earned', value: formatINR(res.totalInterestEarned) },
      { label: 'Maturity Amount (21 Yrs)', value: formatINR(res.maturityValue), isHighlight: true },
    ];
    const chartData = [
      { name: 'Total Deposited', value: res.totalAmountDeposited, color: '#3b82f6' },
      { name: 'Guaranteed Interest', value: res.totalInterestEarned, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.schedule.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(r.openingBalance),
      col3: formatINR(r.deposit),
      col4: formatINR(r.interestEarned),
      col5: formatINR(r.closingBalance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Year', 'Opening Balance', 'Annual Deposit', 'Interest (8.2%)', 'Closing Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'sip',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Year', 'Opening Balance', 'Annual Deposit', 'Interest (8.2%)', 'Closing Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 15. PPF
  if (id === 'ppf') {
    const res = calculatePPF({
      yearlyDeposit: inputValues.yearlyDeposit ?? 150000,
      durationYears: inputValues.durationYears ?? 15,
      interestRate: inputValues.interestRate ?? 7.1,
    });
    const metrics = [
      { label: 'Total Deposited', value: formatINR(res.totalAmountDeposited) },
      { label: 'Total Interest Earned', value: formatINR(res.totalInterestEarned) },
      { label: 'Maturity Value', value: formatINR(res.maturityValue), isHighlight: true },
    ];
    const chartData = [
      { name: 'Total Invested', value: res.totalAmountDeposited, color: '#3b82f6' },
      { name: 'Tax-Free Interest', value: res.totalInterestEarned, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.schedule.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(r.openingBalance),
      col3: formatINR(r.deposit),
      col4: formatINR(r.interestEarned),
      col5: formatINR(r.closingBalance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Year', 'Opening Balance', 'Annual Deposit', 'Interest (7.1%)', 'Closing Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'sip',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Year', 'Opening Balance', 'Annual Deposit', 'Interest (7.1%)', 'Closing Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 16. EPF
  if (id === 'epf') {
    const res = calculateEPF({
      monthlyBasicPlusDA: inputValues.monthlyBasicPlusDA ?? 40000,
      currentAge: inputValues.currentAge ?? 28,
      retirementAge: inputValues.retirementAge ?? 58,
      annualSalaryIncrementRate: inputValues.annualSalaryIncrementRate ?? 5,
      existingEpfBalance: inputValues.existingEpfBalance ?? 100000,
    });
    const metrics = [
      { label: 'Total EPF Corpus', value: formatINR(res.totalMaturityCorpus), isHighlight: true },
      { label: 'Employee Contribution', value: formatINR(res.employeeTotalContribution) },
      { label: 'Employer Contribution', value: formatINR(res.employerTotalContributionToEPF) },
      { label: 'Interest Earned', value: formatINR(res.totalInterestEarned) },
    ];
    const chartData = [
      { name: 'Employee Share', value: res.employeeTotalContribution, color: '#3b82f6' },
      { name: 'Employer Share', value: res.employerTotalContributionToEPF, color: '#60a5fa' },
      { name: 'Interest (8.25%)', value: res.totalInterestEarned, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.schedule.map((r) => ({
      col1: `Age ${r.age}`,
      col2: formatINR(r.basicSalary),
      col3: formatINR(r.employeeShare + r.employerShare),
      col4: formatINR(r.interestEarned),
      col5: formatINR(r.closingBalance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Age', 'Monthly Basic', 'Total Contributions', 'Interest Earned', 'EPF Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'sip',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Age', 'Monthly Basic', 'Total Contributions', 'Interest Earned', 'EPF Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 17. FD
  if (id === 'fd') {
    const res = calculateFD({
      depositAmount: inputValues.depositAmount ?? 500000,
      annualInterestRate: inputValues.annualInterestRate ?? 7.25,
      tenureYears: inputValues.tenureYears ?? 5,
    });
    const metrics = [
      { label: 'Principal Deposit', value: formatINR(res.depositAmount) },
      { label: 'Total Interest Earned', value: formatINR(res.totalInterestEarned) },
      { label: 'Maturity Amount', value: formatINR(res.maturityAmount), isHighlight: true },
    ];
    const chartData = [
      { name: 'Principal Deposit', value: res.depositAmount, color: '#3b82f6' },
      { name: 'Compound Interest', value: res.totalInterestEarned, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.schedule.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(res.depositAmount),
      col3: `${res.effectiveInterestRate}%`,
      col4: formatINR(r.interestEarned),
      col5: formatINR(r.balance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Year', 'Principal', 'Interest Rate', 'Interest Earned', 'FD Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Year', 'Principal', 'Interest Rate', 'Interest Earned', 'FD Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 18. RD
  if (id === 'rd') {
    const res = calculateRD({
      monthlyDeposit: inputValues.monthlyDeposit ?? 5000,
      annualInterestRate: inputValues.annualInterestRate ?? 6.7,
      tenureMonths: inputValues.tenureMonths ?? 60,
    });
    const metrics = [
      { label: 'Total Amount Deposited', value: formatINR(res.totalInvestedAmount) },
      { label: 'Total Interest Earned', value: formatINR(res.totalInterestEarned) },
      { label: 'Maturity Amount', value: formatINR(res.maturityAmount), isHighlight: true },
    ];
    const chartData = [
      { name: 'Deposited', value: res.totalInvestedAmount, color: '#3b82f6' },
      { name: 'Interest', value: res.totalInterestEarned, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.schedule.map((r) => ({
      col1: `Year ${r.monthQuarter}`,
      col2: formatINR(res.monthlyDeposit * 12),
      col3: formatINR(r.deposited),
      col4: formatINR(r.interestEarned),
      col5: formatINR(r.balance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Period', 'Annual Deposit', 'Cumulative Invested', 'Interest Earned', 'Maturity Value'],
      scheduleRows,
      exportData: {
        calculatorType: 'sip',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Period', 'Annual Deposit', 'Cumulative Invested', 'Interest Earned', 'Maturity Value'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 19. NSC
  if (id === 'nsc') {
    const res = calculateNSC({
      investmentAmount: inputValues.investmentAmount ?? 100000,
      interestRate: inputValues.interestRate ?? 7.7,
    });
    const metrics = [
      { label: 'Initial Investment', value: formatINR(res.investmentAmount) },
      { label: 'Total Interest (5 Yrs)', value: formatINR(res.totalInterestEarned) },
      { label: 'Maturity Value', value: formatINR(res.maturityAmount), isHighlight: true },
    ];
    const chartData = [
      { name: 'Principal Invested', value: res.investmentAmount, color: '#3b82f6' },
      { name: 'Guaranteed Interest', value: res.totalInterestEarned, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.schedule.map((r) => ({
      col1: `Year ${r.year}`,
      col2: formatINR(r.openingBalance),
      col3: `${res.interestRate}%`,
      col4: formatINR(r.interestEarned),
      col5: formatINR(r.closingBalance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Year', 'Opening Balance', 'Interest Rate', 'Reinvested Interest', 'Closing Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Year', 'Opening Balance', 'Interest Rate', 'Reinvested Interest', 'Closing Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 20. APY
  if (id === 'apy') {
    const res = calculateAPY({
      currentAge: inputValues.currentAge ?? 25,
      desiredMonthlyPension: (inputValues.desiredMonthlyPension ?? 5000) as any,
    });
    const metrics = [
      { label: 'Monthly Contribution', value: formatINR(res.monthlyContribution), isHighlight: true },
      { label: 'Guaranteed Monthly Pension', value: formatINR(res.desiredMonthlyPension) },
      { label: 'Total Contribution', value: formatINR(res.totalContributionAmount) },
      { label: 'Corpus to Nominee', value: formatINR(res.totalCorpusToNominee) },
    ];
    const chartData = [
      { name: 'Your Contribution', value: res.totalContributionAmount, color: '#3b82f6' },
      { name: 'Nominee Corpus Value', value: res.totalCorpusToNominee, color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'sip',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Age', 'Monthly', 'Quarterly', 'Half-Yearly', 'Pension'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 21. PO-MIS
  if (id === 'po-mis') {
    const res = calculatePOMIS({
      depositAmount: inputValues.depositAmount ?? 900000,
      interestRate: inputValues.interestRate ?? 7.4,
    });
    const metrics = [
      { label: 'Monthly Guaranteed Income', value: formatINR(res.monthlyIncome), isHighlight: true },
      { label: 'Annual Income', value: formatINR(res.annualIncome) },
      { label: 'Total Income (5 Yrs)', value: formatINR(res.totalIncomeEarned) },
      { label: 'Maturity Principal Return', value: formatINR(res.maturityValue) },
    ];
    const chartData = [
      { name: 'Deposit Principal', value: res.depositAmount, color: '#3b82f6' },
      { name: '5-Yr Total Interest Paid', value: res.totalIncomeEarned, color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'swp',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Year', 'Principal', 'Monthly Income', 'Annual Payout', 'Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 22. SCSS
  if (id === 'scss') {
    const res = calculateSCSS({
      depositAmount: inputValues.depositAmount ?? 1500000,
      interestRate: inputValues.interestRate ?? 8.2,
    });
    const metrics = [
      { label: 'Quarterly Payout', value: formatINR(res.quarterlyPayout), isHighlight: true },
      { label: 'Annual Income', value: formatINR(res.annualIncome) },
      { label: 'Total Income (5 Yrs)', value: formatINR(res.totalIncomeEarned) },
      { label: 'Principal Returned', value: formatINR(res.maturityValue) },
    ];
    const chartData = [
      { name: 'Deposit Capital', value: res.depositAmount, color: '#3b82f6' },
      { name: 'Total Quarterly Interest', value: res.totalIncomeEarned, color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'swp',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Year', 'Deposit', 'Quarterly Payout', 'Annual Payout', 'Principal'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 23. NPS
  if (id === 'nps') {
    const res = calculateNPS({
      monthlyContribution: inputValues.monthlyContribution ?? 10000,
      currentAge: inputValues.currentAge ?? 30,
      expectedAnnualReturnRate: inputValues.expectedAnnualReturnRate ?? 10,
      annuityPercentage: inputValues.annuityPercentage ?? 40,
      expectedAnnuityReturnRate: inputValues.expectedAnnuityReturnRate ?? 6,
    });
    const metrics = [
      { label: 'Total NPS Corpus at 60', value: formatINR(res.totalMaturityCorpus), isHighlight: true },
      { label: 'Tax-Free Lumpsum (60%)', value: formatINR(res.lumpsumWithdrawalAmount) },
      { label: 'Annuity Value (40%)', value: formatINR(res.annuityReinvestedAmount) },
      { label: 'Monthly Pension', value: formatINR(res.estimatedMonthlyPension) },
    ];
    const chartData = [
      { name: 'Tax-Free Lumpsum', value: res.lumpsumWithdrawalAmount, color: '#3b82f6' },
      { name: 'Annuity Pension Fund', value: res.annuityReinvestedAmount, color: '#10b981' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.schedule.map((r) => ({
      col1: `Age ${r.age}`,
      col2: formatINR(inputValues.monthlyContribution * 12),
      col3: formatINR(r.invested),
      col4: formatINR(r.interestEarned),
      col5: formatINR(r.balance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Age', 'Annual Deposit', 'Cumulative Invested', 'Interest Earned', 'NPS Corpus'],
      scheduleRows,
      exportData: {
        calculatorType: 'sip',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Age', 'Annual Deposit', 'Cumulative Invested', 'Interest Earned', 'NPS Corpus'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 24. Standard EMI
  if (id === 'emi') {
    const res = calculateEMI({
      loanAmount: inputValues.loanAmount ?? 1000000,
      annualInterestRate: inputValues.annualInterestRate ?? 10.5,
      tenureYears: inputValues.tenureYears ?? 5,
    });
    const metrics = [
      { label: 'Monthly Loan EMI', value: formatINR(res.monthlyEMI), isHighlight: true },
      { label: 'Principal Loan Amount', value: formatINR(res.loanAmount) },
      { label: 'Total Interest Payable', value: formatINR(res.totalInterestPayable) },
      { label: 'Total Payment (P + I)', value: formatINR(res.totalPayment) },
    ];
    const chartData = [
      { name: 'Principal Loan', value: res.loanAmount, color: '#3b82f6' },
      { name: 'Total Interest', value: res.totalInterestPayable, color: '#f59e0b' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.yearlySchedule.map((r) => ({
      col1: `Year ${r.period}`,
      col2: formatINR(r.openingBalance),
      col3: formatINR(r.emiPaid),
      col4: formatINR(r.interestComponent),
      col5: formatINR(r.closingBalance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Period', 'Opening Principal', 'Total EMI Paid', 'Interest Paid', 'Remaining Loan'],
      scheduleRows,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Period', 'Opening Principal', 'Total EMI Paid', 'Interest Paid', 'Remaining Loan'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 25. Home Loan EMI
  if (id === 'home-loan-emi') {
    const res = calculateHomeLoan({
      loanAmount: inputValues.loanAmount ?? 4000000,
      annualInterestRate: inputValues.annualInterestRate ?? 8.5,
      tenureYears: inputValues.tenureYears ?? 20,
      annualPrepayment: inputValues.annualPrepayment ?? 50000,
    });
    const metrics = [
      { label: 'Monthly Home Loan EMI', value: formatINR(res.monthlyEMI), isHighlight: true },
      { label: 'Total Interest Payable', value: formatINR(res.totalInterestPayable) },
      { label: 'Total Amount Payable', value: formatINR(res.totalPayment) },
      { label: 'Prepayment Interest Saved', value: formatINR(res.prepaymentTotalInterestSaved), subtext: `Shortens tenure by ${Math.round(res.tenureReducedMonths / 12)} years` },
    ];
    const chartData = [
      { name: 'Principal Amount', value: res.loanAmount, color: '#3b82f6' },
      { name: 'Total Interest', value: res.totalInterestPayable, color: '#f59e0b' },
    ];
    const scheduleRows: CalculatorExportRow[] = res.yearlySchedule.map((r) => ({
      col1: `Year ${r.period}`,
      col2: formatINR(r.openingBalance),
      col3: formatINR(r.principalComponent),
      col4: formatINR(r.interestComponent),
      col5: formatINR(r.closingBalance),
    }));

    return {
      metrics,
      chartData,
      scheduleHeaders: ['Year', 'Opening Balance', 'Principal Paid', 'Interest Paid', 'Loan Balance'],
      scheduleRows,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: scheduleRows,
        scheduleHeaders: ['Year', 'Opening Balance', 'Principal Paid', 'Interest Paid', 'Loan Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 26. Car Loan EMI
  if (id === 'car-loan-emi') {
    const res = calculateCarLoan({
      vehicleOnRoadPrice: inputValues.vehicleOnRoadPrice ?? 1200000,
      downPayment: inputValues.downPayment ?? 300000,
      annualInterestRate: inputValues.annualInterestRate ?? 9.0,
      tenureYears: inputValues.tenureYears ?? 5,
    });
    const metrics = [
      { label: 'Monthly Car EMI', value: formatINR(res.monthlyEMI), isHighlight: true },
      { label: 'Net Loan Amount', value: formatINR(res.loanAmount) },
      { label: 'Total Interest Payable', value: formatINR(res.totalInterestPayable) },
      { label: 'Total Cost of Ownership', value: formatINR(res.totalCostOfCar) },
    ];
    const chartData = [
      { name: 'Down Payment', value: res.downPayment, color: '#10b981' },
      { name: 'Car Loan Principal', value: res.loanAmount, color: '#3b82f6' },
      { name: 'Financing Interest', value: res.totalInterestPayable, color: '#f59e0b' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Year', 'Principal', 'Interest Paid', 'EMI Paid', 'Balance'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 27. Simple Interest
  if (id === 'simple-interest') {
    const res = calculateSimpleInterest({
      principalAmount: inputValues.principalAmount ?? 100000,
      annualInterestRate: inputValues.annualInterestRate ?? 8,
      timePeriodYears: inputValues.timePeriodYears ?? 4,
    });
    const metrics = [
      { label: 'Principal Amount', value: formatINR(res.principalAmount) },
      { label: 'Total Simple Interest', value: formatINR(res.totalInterest) },
      { label: 'Total Maturity Amount', value: formatINR(res.totalAmount), isHighlight: true },
    ];
    const chartData = [
      { name: 'Principal Amount', value: res.principalAmount, color: '#3b82f6' },
      { name: 'Simple Interest', value: res.totalInterest, color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Year', 'Principal', 'Rate', 'Simple Interest', 'Total Value'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 28. Compound Interest
  if (id === 'compound-interest') {
    const res = calculateCompoundInterest({
      principalAmount: inputValues.principalAmount ?? 100000,
      annualInterestRate: inputValues.annualInterestRate ?? 10,
      timePeriodYears: inputValues.timePeriodYears ?? 5,
      compoundingFrequency: 'quarterly',
    });
    const metrics = [
      { label: 'Principal Amount', value: formatINR(res.principalAmount) },
      { label: 'Compound Interest', value: formatINR(res.compoundInterestEarned) },
      { label: 'Total Maturity Amount', value: formatINR(res.totalMaturityAmount), isHighlight: true },
    ];
    const chartData = [
      { name: 'Principal', value: res.principalAmount, color: '#3b82f6' },
      { name: 'Compound Growth', value: res.compoundInterestEarned, color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Year', 'Opening', 'Compounding Rate', 'Interest Added', 'Closing'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 29. Flat vs Reducing
  if (id === 'flat-vs-reducing') {
    const res = calculateFlatVsReducing({
      loanAmount: inputValues.loanAmount ?? 500000,
      interestRate: inputValues.interestRate ?? 8,
      tenureYears: inputValues.tenureYears ?? 5,
    });
    const metrics = [
      { label: 'Flat Rate Interest', value: formatINR(res.flat.totalInterest), subtext: `₹${res.flat.monthlyEMI}/mo (True: ${res.flat.effectiveReducingRatePercent}%)` },
      { label: 'Reducing Rate Interest', value: formatINR(res.reducing.totalInterest), isHighlight: true, subtext: `₹${res.reducing.monthlyEMI}/mo (Stated: ${res.statedRate}%)` },
      { label: 'Extra Interest on Flat Rate', value: formatINR(res.interestDifference), subtext: 'Amount you overpay' },
    ];
    const chartData = [
      { name: 'Reducing Rate Total', value: res.reducing.totalInterest, color: '#10b981' },
      { name: 'Flat Rate Extra Cost', value: res.interestDifference, color: '#ef4444' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Method', 'Stated Rate', 'Monthly EMI', 'Total Interest', 'Total Repayment'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 30. Income Tax
  if (id === 'income-tax') {
    const res = calculateIncomeTax({
      annualGrossIncome: inputValues.annualGrossIncome ?? 1000000,
      section80C: inputValues.section80C ?? 150000,
      section80D: inputValues.section80D ?? 25000,
      hraExemption: inputValues.hraExemption ?? 60000,
    });
    const metrics = [
      { label: 'New Regime Tax Payable', value: formatINR(res.newRegime.totalTaxPayable), isHighlight: res.recommendedRegime === 'new', subtext: `Effective Rate: ${res.newRegime.effectiveTaxRatePercent}%` },
      { label: 'Old Regime Tax Payable', value: formatINR(res.oldRegime.totalTaxPayable), isHighlight: res.recommendedRegime === 'old', subtext: `Effective Rate: ${res.oldRegime.effectiveTaxRatePercent}%` },
      { label: 'Recommended Regime', value: res.recommendedRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime', subtext: `Saves ${formatINR(res.taxSavingsAmount)}` },
    ];
    const chartData = [
      { name: 'New Regime Tax', value: res.newRegime.totalTaxPayable, color: '#3b82f6' },
      { name: 'Old Regime Tax', value: res.oldRegime.totalTaxPayable, color: '#6366f1' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Regime', 'Gross Income', 'Deductions', 'Taxable Income', 'Total Tax'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 31. HRA
  if (id === 'hra') {
    const res = calculateHRA({
      monthlyBasicSalary: inputValues.monthlyBasicSalary ?? 40000,
      monthlyHRAReceived: inputValues.monthlyHRAReceived ?? 20000,
      monthlyActualRentPaid: inputValues.monthlyActualRentPaid ?? 18000,
      isMetroCity: true,
    });
    const metrics = [
      { label: 'Exempt HRA (Annual)', value: formatINR(res.exemptHRAAmount), isHighlight: true, subtext: 'Completely tax-free' },
      { label: 'Taxable HRA (Annual)', value: formatINR(res.taxableHRAAmount) },
      { label: 'Total HRA Received', value: formatINR(res.annualHRAReceived) },
    ];
    const chartData = [
      { name: 'Exempt HRA', value: res.exemptHRAAmount, color: '#10b981' },
      { name: 'Taxable HRA', value: res.taxableHRAAmount, color: '#ef4444' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Component', 'Actual HRA', 'Rent - 10%', 'Metro Factor', 'Exempt Amount'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 32. GST
  if (id === 'gst') {
    const res = calculateGST({
      amount: inputValues.amount ?? 10000,
      gstRate: inputValues.gstRate ?? 18,
      mode: 'exclusive',
    });
    const metrics = [
      { label: 'Net Base Amount', value: formatINR(res.netBaseAmount) },
      { label: 'Total GST Amount', value: formatINR(res.totalGSTAmount), subtext: `CGST ${formatINR(res.cgstAmount)} + SGST ${formatINR(res.sgstAmount)}` },
      { label: 'Gross Total Amount', value: formatINR(res.grossTotalAmount), isHighlight: true },
    ];
    const chartData = [
      { name: 'Base Price', value: res.netBaseAmount, color: '#3b82f6' },
      { name: 'CGST (9%)', value: res.cgstAmount, color: '#f59e0b' },
      { name: 'SGST (9%)', value: res.sgstAmount, color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Component', 'Rate %', 'CGST', 'SGST', 'Gross Amount'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 33. Gratuity
  if (id === 'gratuity') {
    const res = calculateGratuity({
      lastDrawnMonthlyBasicPlusDA: inputValues.lastDrawnMonthlyBasicPlusDA ?? 65000,
      yearsOfContinuousService: inputValues.yearsOfContinuousService ?? 12,
    });
    const metrics = [
      { label: 'Total Payable Gratuity', value: formatINR(res.payableGratuity), isHighlight: true, subtext: 'Tax-free under Section 10(10)' },
      { label: 'Calculated Gratuity', value: formatINR(res.calculatedGratuity) },
      { label: 'Statutory Max Cap', value: formatINR(res.statutoryMaxCap) },
    ];
    const chartData = [
      { name: 'Payable Gratuity', value: res.payableGratuity, color: '#10b981' },
      { name: 'Remaining Statutory Cap', value: Math.max(0, res.statutoryMaxCap - res.payableGratuity), color: '#94a3b8' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Metric', 'Basic Salary', 'Tenure Years', 'Statutory Cap', 'Payable Gratuity'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 34. TDS
  if (id === 'tds') {
    const res = calculateTDS({
      paymentCategory: '194J_professional',
      paymentAmount: inputValues.paymentAmount ?? 75000,
    });
    const metrics = [
      { label: 'TDS Deducted (10%)', value: formatINR(res.tdsAmount), isHighlight: true, subtext: `Threshold: ${formatINR(res.thresholdLimit)}` },
      { label: 'Net Payable to Vendor', value: formatINR(res.netPayableAmount) },
      { label: 'Gross Invoice Value', value: formatINR(inputValues.paymentAmount ?? 75000) },
    ];
    const chartData = [
      { name: 'Net Vendor Payment', value: res.netPayableAmount, color: '#3b82f6' },
      { name: 'TDS Withholding', value: res.tdsAmount, color: '#ef4444' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Section', 'Threshold', 'Rate %', 'TDS Amount', 'Net Payable'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 35. Salary / CTC
  if (id === 'salary') {
    const res = calculateSalary({
      annualCTC: inputValues.annualCTC ?? 1200000,
      bonusOrVariablePay: inputValues.bonusOrVariablePay ?? 0,
    });
    const metrics = [
      { label: 'Monthly Take-Home Pay', value: formatINR(res.monthlyInHandSalary), isHighlight: true, subtext: 'In-Hand bank credit' },
      { label: 'Monthly Gross Salary', value: formatINR(res.monthlyGrossSalary) },
      { label: 'Monthly Employee PF (12%)', value: formatINR(res.monthlyDeductions.employeePF) },
      { label: 'Monthly Estimated Tax', value: formatINR(res.monthlyDeductions.estimatedTDS) },
    ];
    const chartData = [
      { name: 'In-Hand Pay', value: res.monthlyInHandSalary, color: '#10b981' },
      { name: 'Provident Fund', value: res.monthlyDeductions.employeePF, color: '#3b82f6' },
      { name: 'Estimated Tax / PT', value: res.monthlyDeductions.estimatedTDS + res.monthlyDeductions.professionalTax, color: '#f59e0b' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Component', 'Monthly Amount', 'Annual Amount', 'Deduction Type', 'Net Take-Home'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 36. Brokerage
  if (id === 'brokerage') {
    const res = calculateBrokerage({
      segment: 'equity_intraday',
      buyPrice: inputValues.buyPrice ?? 500,
      sellPrice: inputValues.sellPrice ?? 510,
      quantity: inputValues.quantity ?? 400,
    });
    const metrics = [
      { label: 'Net Profit / Loss', value: `${res.netProfitLoss >= 0 ? '+' : ''}${formatINR(res.netProfitLoss)}`, isHighlight: true, subtext: `Gross: +${formatINR(res.grossProfitLoss)}` },
      { label: 'Total Statutory Charges', value: formatINR(res.charges.totalChargesAndTaxes), subtext: `STT, SEBI, GST, Stamp` },
      { label: 'Breakeven Points', value: `₹${res.breakevenPoints.toFixed(2)} / share` },
      { label: 'Total Trade Turnover', value: formatINR(res.totalTurnover) },
    ];
    const chartData = [
      { name: 'Net Profit', value: Math.max(0, res.netProfitLoss), color: '#10b981' },
      { name: 'Taxes & Charges', value: res.charges.totalChargesAndTaxes, color: '#ef4444' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Charge', 'STT', 'Exchange', 'SEBI', 'Stamp & GST'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 37. Margin
  if (id === 'margin') {
    const res = calculateMargin({
      productType: 'mis_intraday',
      stockPrice: inputValues.stockPrice ?? 1000,
      quantity: inputValues.quantity ?? 200,
      customLeverageMultiplier: inputValues.customLeverageMultiplier ?? 5,
    });
    const metrics = [
      { label: 'Margin Capital Required', value: formatINR(res.marginRequired), isHighlight: true, subtext: 'Your account balance' },
      { label: 'Total Order Value', value: formatINR(res.totalOrderValue) },
      { label: 'Leverage Multiplier', value: `${res.leverageMultiplier}x Exposure` },
      { label: 'Extra Buying Power', value: formatINR(res.exposureBenefit) },
    ];
    const chartData = [
      { name: 'Margin Required', value: res.marginRequired, color: '#3b82f6' },
      { name: 'Broker Leverage Provided', value: res.exposureBenefit, color: '#10b981' },
    ];
    return {
      metrics,
      chartData,
      exportData: {
        calculatorType: 'lumpsum',
        calculatorTitle: meta.name,
        generatedDateStr: nowStr,
        inputs: formatInputsList(),
        summaryMetrics: metrics,
        growthSchedule: [],
        scheduleHeaders: ['Product', 'Order Value', 'Margin Req.', 'Leverage', 'Exposure'],
        disclaimer: meta.disclaimer,
      },
    };
  }

  // 38. MTF
  const res = calculateMTF({
    totalStockPurchaseValue: inputValues.totalStockPurchaseValue ?? 500000,
    investorMarginPercent: inputValues.investorMarginPercent ?? 25,
    annualInterestRatePercent: inputValues.annualInterestRatePercent ?? 14,
    holdingPeriodDays: inputValues.holdingPeriodDays ?? 60,
  });
  const metrics = [
    { label: 'Your Margin Capital', value: formatINR(res.investorMarginAmount) },
    { label: 'Broker Funded Amount', value: formatINR(res.brokerFundedAmount) },
    { label: 'Total MTF Interest Cost', value: formatINR(res.totalMTFInterestCost), isHighlight: true, subtext: `Daily Cost: ₹${res.dailyInterestCost.toFixed(2)}/day` },
    { label: 'Breakeven Return', value: `+${res.breakevenStockReturnPercent}%` },
  ];
  const chartData = [
    { name: 'Your Margin', value: res.investorMarginAmount, color: '#3b82f6' },
    { name: 'Broker Funded', value: res.brokerFundedAmount, color: '#6366f1' },
    { name: 'Interest Cost', value: res.totalMTFInterestCost, color: '#f59e0b' },
  ];

  return {
    metrics,
    chartData,
    exportData: {
      calculatorType: 'lumpsum',
      calculatorTitle: meta.name,
      generatedDateStr: nowStr,
      inputs: formatInputsList(),
      summaryMetrics: metrics,
      growthSchedule: [],
      scheduleHeaders: ['Component', 'Purchase Value', 'Funded Amount', 'Holding Days', 'Total Interest'],
      disclaimer: meta.disclaimer,
    },
  };
}
