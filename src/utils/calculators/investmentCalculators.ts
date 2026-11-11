/**
 * Finance Brunch — Investment & Mutual Fund Mathematical Engines
 * 
 * Implements mathematically verified financial calculations:
 * 1. SIP (Systematic Investment Plan)
 * 2. Lumpsum Investment
 * 3. SWP (Systematic Withdrawal Plan)
 * 4. Step-Up SIP
 * 5. Mutual Fund Returns (Absolute & Annualized)
 * 6. ROI (Return on Investment)
 * 7. CAGR (Compound Annual Growth Rate)
 * 8. XIRR (Extended Internal Rate of Return - Newton Raphson + Bisection solver)
 * 9. IRR (Internal Rate of Return for periodic cash flows)
 * 10. Stock Average (Weighted average purchase price)
 * 11. Inflation (Future cost & purchasing power)
 * 12. FIRE (Financial Independence, Retire Early)
 * 13. Retirement Planning & Corpus Gap
 */

import { calculateSIP, SIPCalculationResult } from '../sipCalculator';
import { calculateStepUpSIP, StepUpSIPCalculationResult } from '../stepUpSipCalculator';
import { calculateLumpsum, LumpsumCalculationResult } from '../lumpsumCalculator';
import { calculateSWP, SWPCalculationResult } from '../swpCalculator';

export { calculateSIP, calculateStepUpSIP, calculateLumpsum, calculateSWP };
export type { SIPCalculationResult, StepUpSIPCalculationResult, LumpsumCalculationResult, SWPCalculationResult };

// --- Step-Up SWP (Systematic Withdrawal Plan with Annual Step-Up) ---
export interface StepUpSWPInputs {
  initialCorpus: number;
  initialMonthlyWithdrawal: number;
  annualStepUpPercentage: number;
  expectedAnnualReturn: number;
  withdrawalDurationYears: number;
}

export interface StepUpSWPYearlyScheduleItem {
  year: number;
  openingBalance: number;
  growthEarned: number;
  annualWithdrawal: number;
  closingBalance: number;
  monthlyWithdrawal: number;
  cumulativeWithdrawals: number;
}

export interface StepUpSWPResult {
  initialCorpus: number;
  initialMonthlyWithdrawal: number;
  annualStepUpPercentage: number;
  expectedAnnualReturn: number;
  withdrawalDurationYears: number;
  totalActualWithdrawals: number;
  remainingCorpus: number;
  totalGrowthEarned: number;
  isExhausted: boolean;
  exhaustionMonthNumber: number | null;
  exhaustionYear: number | null;
  yearlySchedule: StepUpSWPYearlyScheduleItem[];
  isValid: boolean;
  validationError?: string;
}

export function calculateStepUpSWP(inputs: StepUpSWPInputs): StepUpSWPResult {
  const {
    initialCorpus,
    initialMonthlyWithdrawal,
    annualStepUpPercentage,
    expectedAnnualReturn,
    withdrawalDurationYears,
  } = inputs;

  if (
    typeof initialCorpus !== 'number' ||
    isNaN(initialCorpus) ||
    initialCorpus <= 0 ||
    typeof initialMonthlyWithdrawal !== 'number' ||
    isNaN(initialMonthlyWithdrawal) ||
    initialMonthlyWithdrawal <= 0 ||
    typeof withdrawalDurationYears !== 'number' ||
    isNaN(withdrawalDurationYears) ||
    withdrawalDurationYears <= 0
  ) {
    return {
      initialCorpus: Math.max(0, Number(initialCorpus) || 0),
      initialMonthlyWithdrawal: Math.max(0, Number(initialMonthlyWithdrawal) || 0),
      annualStepUpPercentage: Math.max(0, Number(annualStepUpPercentage) || 0),
      expectedAnnualReturn: Math.max(0, Number(expectedAnnualReturn) || 0),
      withdrawalDurationYears: Math.max(0, Number(withdrawalDurationYears) || 0),
      totalActualWithdrawals: 0,
      remainingCorpus: Math.max(0, Number(initialCorpus) || 0),
      totalGrowthEarned: 0,
      isExhausted: false,
      exhaustionMonthNumber: null,
      exhaustionYear: null,
      yearlySchedule: [],
      isValid: false,
      validationError: 'Please provide valid positive numbers for corpus, withdrawal, and duration.',
    };
  }

  const monthlyRate = expectedAnnualReturn === 0
    ? 0
    : Math.pow(1 + Math.max(0, expectedAnnualReturn) / 100, 1 / 12) - 1;
  let currentBalance = initialCorpus;
  let totalActualWithdrawals = 0;
  let totalGrowthEarned = 0;
  let isExhausted = false;
  let exhaustionMonthNumber: number | null = null;
  let exhaustionYear: number | null = null;
  const yearlySchedule: StepUpSWPYearlyScheduleItem[] = [];

  for (let y = 1; y <= withdrawalDurationYears; y++) {
    const openingBalance = currentBalance;
    const currentMonthlyWithdrawal = initialMonthlyWithdrawal * Math.pow(1 + Math.max(0, annualStepUpPercentage) / 100, y - 1);
    let yearGrowth = 0;
    let yearWithdrawals = 0;

    for (let m = 1; m <= 12; m++) {
      const monthIdx = (y - 1) * 12 + m;
      if (currentBalance <= 0) {
        if (!isExhausted) {
          isExhausted = true;
          exhaustionMonthNumber = monthIdx;
          exhaustionYear = y;
        }
        break;
      }

      // Monthly interest compounding
      const monthGrowth = currentBalance * monthlyRate;
      currentBalance += monthGrowth;
      yearGrowth += monthGrowth;
      totalGrowthEarned += monthGrowth;

      // Deduct monthly withdrawal
      const actualWithdrawal = Math.min(currentBalance, currentMonthlyWithdrawal);
      currentBalance -= actualWithdrawal;
      yearWithdrawals += actualWithdrawal;
      totalActualWithdrawals += actualWithdrawal;

      if (currentBalance <= 0.001) {
        currentBalance = 0;
        if (!isExhausted) {
          isExhausted = true;
          exhaustionMonthNumber = monthIdx;
          exhaustionYear = y;
        }
      }
    }

    yearlySchedule.push({
      year: y,
      openingBalance: Math.round(openingBalance),
      growthEarned: Math.round(yearGrowth),
      annualWithdrawal: Math.round(yearWithdrawals),
      closingBalance: Math.round(currentBalance),
      monthlyWithdrawal: Math.round(currentMonthlyWithdrawal),
      cumulativeWithdrawals: Math.round(totalActualWithdrawals),
    });
  }

  return {
    initialCorpus,
    initialMonthlyWithdrawal,
    annualStepUpPercentage,
    expectedAnnualReturn,
    withdrawalDurationYears,
    totalActualWithdrawals: Math.round(totalActualWithdrawals),
    remainingCorpus: Math.round(currentBalance),
    totalGrowthEarned: Math.round(totalGrowthEarned),
    isExhausted,
    exhaustionMonthNumber,
    exhaustionYear,
    yearlySchedule,
    isValid: true,
  };
}


// --- 5. Mutual Fund Returns Calculator ---
export interface MFReturnsInputs {
  investmentType: 'sip' | 'lumpsum';
  amount: number; // monthly installment for SIP or total initial for lumpsum
  durationYears: number;
  expectedReturnRate: number; // in %
}

export interface MFReturnsResult {
  investedAmount: number;
  estimatedReturns: number;
  totalMaturityValue: number;
  absoluteReturnPercent: number;
  annualizedReturnPercent: number;
  schedule: Array<{ year: number; invested: number; returns: number; balance: number }>;
}

export function calculateMFReturns(inputs: MFReturnsInputs): MFReturnsResult {
  const { investmentType, amount, durationYears, expectedReturnRate } = inputs;
  const years = Math.max(1, durationYears);

  if (investmentType === 'sip') {
    const sipRes = calculateSIP({
      monthlyInvestment: amount,
      expectedAnnualReturn: expectedReturnRate,
      investmentDurationYears: years,
    });
    const absoluteReturn = sipRes.totalInvested > 0 
      ? ((sipRes.futureValue - sipRes.totalInvested) / sipRes.totalInvested) * 100 
      : 0;

    return {
      investedAmount: sipRes.totalInvested,
      estimatedReturns: sipRes.estimatedReturns,
      totalMaturityValue: sipRes.futureValue,
      absoluteReturnPercent: Math.round(absoluteReturn * 100) / 100,
      annualizedReturnPercent: expectedReturnRate,
      schedule: sipRes.yearlyBreakdown.map((item) => ({
        year: item.year,
        invested: item.cumulativeInvested,
        returns: item.estimatedReturns,
        balance: item.futureValue,
      })),
    };
  } else {
    const lumpsumRes = calculateLumpsum({
      initialInvestment: amount,
      expectedAnnualReturn: expectedReturnRate,
      investmentDurationYears: years,
    });
    const absoluteReturn = lumpsumRes.initialInvestment > 0 
      ? ((lumpsumRes.futureValue - lumpsumRes.initialInvestment) / lumpsumRes.initialInvestment) * 100 
      : 0;

    return {
      investedAmount: lumpsumRes.initialInvestment,
      estimatedReturns: lumpsumRes.estimatedReturns,
      totalMaturityValue: lumpsumRes.futureValue,
      absoluteReturnPercent: Math.round(absoluteReturn * 100) / 100,
      annualizedReturnPercent: expectedReturnRate,
      schedule: lumpsumRes.yearlyBreakdown.map((item) => ({
        year: item.year,
        invested: item.investedAmount,
        returns: item.estimatedReturns,
        balance: item.futureValue,
      })),
    };
  }
}

// --- 6. ROI (Return on Investment) ---
export interface ROIInputs {
  initialInvestment: number;
  finalValue: number;
  durationYears?: number;
}

export interface ROIResult {
  netProfit: number;
  roiPercent: number;
  annualizedRoiPercent: number | null;
}

export function calculateROI(inputs: ROIInputs): ROIResult {
  const { initialInvestment, finalValue, durationYears } = inputs;
  if (initialInvestment <= 0) {
    return { netProfit: 0, roiPercent: 0, annualizedRoiPercent: null };
  }
  const netProfit = finalValue - initialInvestment;
  const roiPercent = (netProfit / initialInvestment) * 100;
  
  let annualizedRoiPercent: number | null = null;
  if (durationYears && durationYears > 0 && finalValue > 0) {
    annualizedRoiPercent = ((Math.pow(finalValue / initialInvestment, 1 / durationYears) - 1) * 100);
    annualizedRoiPercent = Math.round(annualizedRoiPercent * 100) / 100;
  }

  return {
    netProfit: Math.round(netProfit * 100) / 100,
    roiPercent: Math.round(roiPercent * 100) / 100,
    annualizedRoiPercent,
  };
}

// --- 7. CAGR (Compound Annual Growth Rate) ---
export interface CAGRInputs {
  initialValue: number;
  finalValue: number;
  durationYears: number;
}

export interface CAGRResult {
  cagrPercent: number;
  absoluteReturnPercent: number;
  totalGains: number;
  isValid: boolean;
  error?: string;
}

export function calculateCAGR(inputs: CAGRInputs): CAGRResult {
  const { initialValue, finalValue, durationYears } = inputs;
  if (initialValue <= 0 || durationYears <= 0) {
    return {
      cagrPercent: 0,
      absoluteReturnPercent: 0,
      totalGains: 0,
      isValid: false,
      error: 'Initial value and duration must be greater than zero.',
    };
  }
  if (finalValue <= 0) {
    return {
      cagrPercent: -100,
      absoluteReturnPercent: -100,
      totalGains: finalValue - initialValue,
      isValid: true,
    };
  }

  // Formula: CAGR = (Final Value / Initial Value)^(1 / Years) - 1
  const cagr = (Math.pow(finalValue / initialValue, 1 / durationYears) - 1) * 100;
  const absolute = ((finalValue - initialValue) / initialValue) * 100;

  return {
    cagrPercent: Math.round(cagr * 100) / 100,
    absoluteReturnPercent: Math.round(absolute * 100) / 100,
    totalGains: Math.round((finalValue - initialValue) * 100) / 100,
    isValid: true,
  };
}

// --- 8. XIRR (Extended Internal Rate of Return) ---
export interface CashFlowDateItem {
  date: string; // YYYY-MM-DD
  amount: number; // Negative for outflows/investments, Positive for inflows/redemption
}

export interface XIRRResult {
  xirrPercent: number;
  totalInvested: number;
  currentValue: number;
  totalGain: number;
  isConverged: boolean;
  iterations: number;
  error?: string;
}

/**
 * High-precision XIRR solver using Newton-Raphson with bounded Bisection fallback.
 * Solves: sum( amount_i / (1 + r)^((date_i - date_0) / 365) ) = 0
 */
export function calculateXIRR(cashFlows: CashFlowDateItem[]): XIRRResult {
  if (!cashFlows || cashFlows.length < 2) {
    return {
      xirrPercent: 0,
      totalInvested: 0,
      currentValue: 0,
      totalGain: 0,
      isConverged: false,
      iterations: 0,
      error: 'At least two cash flows (an investment and a return/current value) are required.',
    };
  }

  // Check that there is at least one positive and one negative cash flow
  let hasNegative = false;
  let hasPositive = false;
  let totalInvested = 0;
  let currentValue = 0;

  const parsed = cashFlows.map((cf) => {
    const t = new Date(cf.date).getTime();
    if (cf.amount < 0) {
      hasNegative = true;
      totalInvested += Math.abs(cf.amount);
    } else {
      hasPositive = true;
      currentValue += cf.amount;
    }
    return { time: t, amount: cf.amount };
  }).sort((a, b) => a.time - b.time);

  if (!hasNegative || !hasPositive) {
    return {
      xirrPercent: 0,
      totalInvested,
      currentValue,
      totalGain: currentValue - totalInvested,
      isConverged: false,
      iterations: 0,
      error: 'Cash flows must contain both outflow investments (negative) and positive inflows or final valuation.',
    };
  }

  const t0 = parsed[0].time;
  const msInYear = 365 * 24 * 60 * 60 * 1000;
  const flows = parsed.map((p) => ({
    years: (p.time - t0) / msInYear,
    amount: p.amount,
  }));

  const npv = (rate: number): number => {
    if (rate <= -1) return Infinity;
    return flows.reduce((acc, f) => acc + f.amount / Math.pow(1 + rate, f.years), 0);
  };

  const dnpv = (rate: number): number => {
    if (rate <= -1) return -Infinity;
    return flows.reduce((acc, f) => {
      if (f.years === 0) return acc;
      return acc - (f.years * f.amount) / Math.pow(1 + rate, f.years + 1);
    }, 0);
  };

  // Newton-Raphson method
  let rate = 0.1; // initial guess 10%
  const maxIterations = 100;
  const tolerance = 1e-6;
  let converged = false;
  let iter = 0;

  for (iter = 0; iter < maxIterations; iter++) {
    const fVal = npv(rate);
    const dfVal = dnpv(rate);
    if (Math.abs(fVal) < tolerance) {
      converged = true;
      break;
    }
    if (Math.abs(dfVal) < 1e-12) break; // derivative too flat, switch to bisection
    const nextRate = rate - fVal / dfVal;
    if (nextRate <= -0.9999 || nextRate > 100) break; // divergence guard
    if (Math.abs(nextRate - rate) < tolerance) {
      rate = nextRate;
      converged = true;
      break;
    }
    rate = nextRate;
  }

  // Fallback: Bisection method between -0.99 and 10 (i.e. -99% to 1000%)
  if (!converged) {
    let low = -0.99;
    let high = 10.0;
    let fLow = npv(low);
    let fHigh = npv(high);

    if (fLow * fHigh < 0) {
      for (let b = 0; b < 100; b++) {
        const mid = (low + high) / 2;
        const fMid = npv(mid);
        if (Math.abs(fMid) < tolerance || (high - low) / 2 < tolerance) {
          rate = mid;
          converged = true;
          iter += b;
          break;
        }
        if (fLow * fMid < 0) {
          high = mid;
          fHigh = fMid;
        } else {
          low = mid;
          fLow = fMid;
        }
      }
    }
  }

  const xirrPercent = converged ? Math.round(rate * 10000) / 100 : 0;

  return {
    xirrPercent,
    totalInvested: Math.round(totalInvested),
    currentValue: Math.round(currentValue),
    totalGain: Math.round(currentValue - totalInvested),
    isConverged: converged,
    iterations: iter,
    error: converged ? undefined : 'Could not find a unique mathematical solution for the provided cash flows.',
  };
}

// --- 9. IRR (Internal Rate of Return for Periodic Cash Flows) ---
export interface IRRInputs {
  cashFlows: number[]; // First entry typically negative initial investment, followed by period returns
}

export interface IRRResult {
  irrPercent: number;
  totalOutflow: number;
  totalInflow: number;
  netCashFlow: number;
  isConverged: boolean;
}

export function calculateIRR(cashFlows: number[]): IRRResult {
  const outflows = cashFlows.filter((c) => c < 0).reduce((acc, c) => acc + Math.abs(c), 0);
  const inflows = cashFlows.filter((c) => c > 0).reduce((acc, c) => acc + c, 0);

  if (cashFlows.length < 2 || outflows === 0 || inflows === 0) {
    return {
      irrPercent: 0,
      totalOutflow: outflows,
      totalInflow: inflows,
      netCashFlow: inflows - outflows,
      isConverged: false,
    };
  }

  // NPV function for periodic flows: sum( CF_t / (1 + r)^t )
  const npv = (r: number) => {
    return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + r, t), 0);
  };
  const dnpv = (r: number) => {
    return cashFlows.reduce((acc, cf, t) => acc - (t * cf) / Math.pow(1 + r, t + 1), 0);
  };

  let rate = 0.1;
  let converged = false;
  for (let i = 0; i < 80; i++) {
    const y = npv(rate);
    const dy = dnpv(rate);
    if (Math.abs(y) < 1e-7) {
      converged = true;
      break;
    }
    if (Math.abs(dy) < 1e-12) break;
    const nextRate = rate - y / dy;
    if (nextRate <= -0.999) break;
    if (Math.abs(nextRate - rate) < 1e-7) {
      rate = nextRate;
      converged = true;
      break;
    }
    rate = nextRate;
  }

  return {
    irrPercent: converged ? Math.round(rate * 10000) / 100 : 0,
    totalOutflow: Math.round(outflows),
    totalInflow: Math.round(inflows),
    netCashFlow: Math.round(inflows - outflows),
    isConverged: converged,
  };
}

// --- 10. Stock Average Calculator ---
export interface StockPurchaseLot {
  quantity: number;
  buyPrice: number;
}

export interface StockAverageInputs {
  lots: StockPurchaseLot[];
  currentMarketPrice?: number;
}

export interface StockAverageResult {
  totalQuantity: number;
  totalInvestedAmount: number;
  averagePricePerShare: number;
  currentPortfolioValue: number | null;
  unrealizedPnL: number | null;
  unrealizedPnLPercent: number | null;
}

export function calculateStockAverage(inputs: StockAverageInputs): StockAverageResult {
  const validLots = inputs.lots.filter((lot) => lot.quantity > 0 && lot.buyPrice > 0);
  const totalQuantity = validLots.reduce((acc, lot) => acc + lot.quantity, 0);
  const totalInvestedAmount = validLots.reduce((acc, lot) => acc + lot.quantity * lot.buyPrice, 0);

  const averagePricePerShare = totalQuantity > 0 
    ? Math.round((totalInvestedAmount / totalQuantity) * 100) / 100 
    : 0;

  let currentPortfolioValue: number | null = null;
  let unrealizedPnL: number | null = null;
  let unrealizedPnLPercent: number | null = null;

  if (inputs.currentMarketPrice && inputs.currentMarketPrice > 0 && totalQuantity > 0) {
    currentPortfolioValue = Math.round(totalQuantity * inputs.currentMarketPrice * 100) / 100;
    unrealizedPnL = Math.round((currentPortfolioValue - totalInvestedAmount) * 100) / 100;
    unrealizedPnLPercent = Math.round((unrealizedPnL / totalInvestedAmount) * 10000) / 100;
  }

  return {
    totalQuantity,
    totalInvestedAmount: Math.round(totalInvestedAmount * 100) / 100,
    averagePricePerShare,
    currentPortfolioValue,
    unrealizedPnL,
    unrealizedPnLPercent,
  };
}

// --- 11. Inflation Calculator ---
export interface InflationInputs {
  currentAmount: number; // e.g. Current expense or money value
  annualInflationRate: number; // e.g. 6%
  timeHorizonYears: number; // e.g. 10 years
}

export interface InflationResult {
  currentAmount: number;
  annualInflationRate: number;
  timeHorizonYears: number;
  futureCostEquivalent: number; // What will cost this much in future
  purchasingPowerEquivalent: number; // What today's money will feel like in future
  costIncreaseMultiplier: number;
  schedule: Array<{ year: number; futureCost: number; purchasingPower: number }>;
}

export function calculateInflation(inputs: InflationInputs): InflationResult {
  const { currentAmount, annualInflationRate, timeHorizonYears } = inputs;
  const rate = Math.max(0, annualInflationRate) / 100;
  const years = Math.max(1, timeHorizonYears);

  // Future Cost: FV = PV * (1 + r)^t
  const futureCostEquivalent = currentAmount * Math.pow(1 + rate, years);
  // Purchasing Power: PV / (1 + r)^t
  const purchasingPowerEquivalent = currentAmount / Math.pow(1 + rate, years);

  const schedule: Array<{ year: number; futureCost: number; purchasingPower: number }> = [];
  for (let y = 1; y <= years; y++) {
    schedule.push({
      year: y,
      futureCost: Math.round(currentAmount * Math.pow(1 + rate, y)),
      purchasingPower: Math.round(currentAmount / Math.pow(1 + rate, y)),
    });
  }

  return {
    currentAmount,
    annualInflationRate,
    timeHorizonYears,
    futureCostEquivalent: Math.round(futureCostEquivalent),
    purchasingPowerEquivalent: Math.round(purchasingPowerEquivalent),
    costIncreaseMultiplier: Math.round(Math.pow(1 + rate, years) * 100) / 100,
    schedule,
  };
}

// --- 12. FIRE (Financial Independence, Retire Early) Calculator ---
export interface FIREInputs {
  currentAge: number;
  targetFireAge: number;
  currentMonthlyExpenses: number;
  expectedInflationRate: number; // e.g. 6%
  safeWithdrawalRate: number; // e.g. 4% (25x rule) or 3.3% (30x rule)
  currentSavings?: number;
  preRetirementReturnRate?: number; // e.g. 12%
}

export interface FIREResult {
  yearsToFIRE: number;
  annualExpensesToday: number;
  annualExpensesAtFIRE: number;
  targetFIRECorpus: number;
  multiplierRule: number; // 100 / safeWithdrawalRate, e.g. 25x or 30x
  monthlySavingsRequired: number;
  projectedCurrentSavingsAtFIRE: number;
  corpusShortfall: number;
}

export function calculateFIRE(inputs: FIREInputs): FIREResult {
  const {
    currentAge,
    targetFireAge,
    currentMonthlyExpenses,
    expectedInflationRate,
    safeWithdrawalRate,
    currentSavings = 0,
    preRetirementReturnRate = 12,
  } = inputs;

  const yearsToFIRE = Math.max(1, targetFireAge - currentAge);
  const annualExpensesToday = currentMonthlyExpenses * 12;
  const inflationDecimal = expectedInflationRate / 100;

  // Annual expense inflated to the FIRE year
  const annualExpensesAtFIRE = annualExpensesToday * Math.pow(1 + inflationDecimal, yearsToFIRE);

  // Target FIRE Corpus based on Safe Withdrawal Rate (e.g., 4% SWR -> 25x annual expenses)
  const swrDecimal = Math.max(0.5, safeWithdrawalRate) / 100;
  const targetFIRECorpus = annualExpensesAtFIRE / swrDecimal;
  const multiplierRule = Math.round(100 / safeWithdrawalRate);

  // Growth of current savings till FIRE age
  const returnDecimal = preRetirementReturnRate / 100;
  const projectedCurrentSavingsAtFIRE = currentSavings * Math.pow(1 + returnDecimal, yearsToFIRE);

  const corpusShortfall = Math.max(0, targetFIRECorpus - projectedCurrentSavingsAtFIRE);

  // Monthly SIP needed to bridge the shortfall
  // FV = P * [((1+i)^n - 1) / i] * (1+i)
  const monthlyRate = Math.pow(1 + returnDecimal, 1 / 12) - 1;
  const totalMonths = yearsToFIRE * 12;
  let monthlySavingsRequired = 0;
  if (corpusShortfall > 0 && monthlyRate > 0) {
    const fvFactor = ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    monthlySavingsRequired = corpusShortfall / fvFactor;
  }

  return {
    yearsToFIRE,
    annualExpensesToday: Math.round(annualExpensesToday),
    annualExpensesAtFIRE: Math.round(annualExpensesAtFIRE),
    targetFIRECorpus: Math.round(targetFIRECorpus),
    multiplierRule,
    monthlySavingsRequired: Math.round(monthlySavingsRequired),
    projectedCurrentSavingsAtFIRE: Math.round(projectedCurrentSavingsAtFIRE),
    corpusShortfall: Math.round(corpusShortfall),
  };
}

// --- 13. Comprehensive Retirement Calculator ---
export interface RetirementInputs {
  currentAge: number;
  retirementAge: number; // typically 58 or 60
  lifeExpectancy: number; // typically 80 or 85
  currentMonthlyExpenses: number;
  expectedInflationRate: number; // e.g. 6%
  preRetirementReturnRate: number; // e.g. 12%
  postRetirementReturnRate: number; // e.g. 7-8% conservative debt/hybrid
  existingRetirementSavings?: number;
}

export interface RetirementResult {
  yearsToRetirement: number;
  retirementDurationYears: number;
  monthlyExpenseAtRetirement: number;
  annualExpenseAtRetirement: number;
  requiredRetirementCorpus: number;
  existingSavingsAtRetirement: number;
  shortfallAmount: number;
  monthlySIPRequired: number;
  schedule: Array<{ age: number; corpusBalance: number; yearlyExpense: number }>;
}

export function calculateRetirement(inputs: RetirementInputs): RetirementResult {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentMonthlyExpenses,
    expectedInflationRate,
    preRetirementReturnRate,
    postRetirementReturnRate,
    existingRetirementSavings = 0,
  } = inputs;

  const yearsToRetirement = Math.max(1, retirementAge - currentAge);
  const retirementDurationYears = Math.max(1, lifeExpectancy - retirementAge);
  const inflationDecimal = expectedInflationRate / 100;

  // Monthly expense at beginning of retirement
  const monthlyExpenseAtRetirement = currentMonthlyExpenses * Math.pow(1 + inflationDecimal, yearsToRetirement);
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  // Real Rate of return post-retirement: r_real = (1 + r_post) / (1 + i) - 1
  const rPost = postRetirementReturnRate / 100;
  const realRate = (1 + rPost) / (1 + inflationDecimal) - 1;

  // Present value of growing annuity during retirement:
  // If realRate is close to zero, Corpus = annualExpense * retirementDurationYears
  let requiredRetirementCorpus: number;
  if (Math.abs(realRate) < 0.0001) {
    requiredRetirementCorpus = annualExpenseAtRetirement * retirementDurationYears;
  } else {
    requiredRetirementCorpus = annualExpenseAtRetirement * ((1 - Math.pow(1 + realRate, -retirementDurationYears)) / realRate);
  }

  // Growth of current savings till retirement
  const rPre = preRetirementReturnRate / 100;
  const existingSavingsAtRetirement = existingRetirementSavings * Math.pow(1 + rPre, yearsToRetirement);
  const shortfallAmount = Math.max(0, requiredRetirementCorpus - existingSavingsAtRetirement);

  // Monthly SIP needed to bridge shortfall
  const monthlyRatePre = Math.pow(1 + rPre, 1 / 12) - 1;
  const totalMonths = yearsToRetirement * 12;
  let monthlySIPRequired = 0;
  if (shortfallAmount > 0 && monthlyRatePre > 0) {
    const factor = ((Math.pow(1 + monthlyRatePre, totalMonths) - 1) / monthlyRatePre) * (1 + monthlyRatePre);
    monthlySIPRequired = shortfallAmount / factor;
  }

  // Generate Year-by-year post-retirement exhaustion schedule
  const schedule: Array<{ age: number; corpusBalance: number; yearlyExpense: number }> = [];
  let balance = requiredRetirementCorpus;
  let currentYearExpense = annualExpenseAtRetirement;

  for (let y = 1; y <= retirementDurationYears; y++) {
    const age = retirementAge + y;
    // Withdraw at start of year, remaining grows at rPost
    const openingBalance = balance;
    const withdraw = Math.min(openingBalance, currentYearExpense);
    const postWithdrawal = Math.max(0, openingBalance - withdraw);
    balance = postWithdrawal * (1 + rPost);
    schedule.push({
      age,
      corpusBalance: Math.round(balance),
      yearlyExpense: Math.round(withdraw),
    });
    currentYearExpense *= (1 + inflationDecimal);
  }

  return {
    yearsToRetirement,
    retirementDurationYears,
    monthlyExpenseAtRetirement: Math.round(monthlyExpenseAtRetirement),
    annualExpenseAtRetirement: Math.round(annualExpenseAtRetirement),
    requiredRetirementCorpus: Math.round(requiredRetirementCorpus),
    existingSavingsAtRetirement: Math.round(existingSavingsAtRetirement),
    shortfallAmount: Math.round(shortfallAmount),
    monthlySIPRequired: Math.round(monthlySIPRequired),
    schedule,
  };
}

