/**
 * Finance Brunch - Systematic Withdrawal Plan (SWP) Calculator Utility
 *
 * Implements deterministic client-side SWP simulation supporting both
 * Monthly and Yearly withdrawal schedules:
 * 
 * 1. Monthly Schedule:
 *    - Nominal monthly rate: i = r / 12  (r = annual rate / 100)
 *      Matching Groww's SWP calculator convention.
 *    - Each month: growth is compounded first, then scheduled monthly withdrawal is deducted.
 *    - Capped at available balance (never allows balance to become negative).
 * 
 * 2. Yearly Schedule:
 *    - Annual compound rate: i = expectedAnnualReturn / 100.
 *    - Each year: annual growth is compounded first on opening balance, then scheduled yearly withdrawal is deducted.
 *    - Capped at available balance (never allows balance to become negative).
 * 
 * 3. Both schedules track year-by-year opening balance, growth earned, actual withdrawals,
 *    closing balance, cumulative withdrawals, and exact exhaustion point.
 */

import { formatINR, formatCompactINR } from './sipCalculator';
import {
  MAX_INVESTMENT_AMOUNT,
  MAX_CALCULATION_SAFETY_LIMIT,
} from './calculatorConstants';
export {
  MAX_INVESTMENT_AMOUNT,
  MIN_SWP_CORPUS,
  MAX_SWP_CORPUS,
  DEFAULT_SWP_CORPUS,
  MIN_SWP_WITHDRAWAL,
  MAX_SWP_WITHDRAWAL,
  DEFAULT_SWP_WITHDRAWAL,
  SWP_CORPUS_QUICK_PRESETS,
  SWP_WITHDRAWAL_QUICK_PRESETS,
} from './calculatorConstants';

export type SWPWithdrawalFrequency = 'monthly' | 'yearly';

export interface SWPCalculatorInputs {
  initialCorpus: number;
  monthlyWithdrawal?: number; // legacy backward compatibility
  withdrawalAmount?: number;  // active amount per period
  withdrawalFrequency?: SWPWithdrawalFrequency;
  expectedAnnualReturn: number;
  withdrawalDurationYears: number;
}

export interface SWPYearlyScheduleItem {
  year: number;
  openingBalance: number;
  growthEarned: number;
  annualWithdrawal: number;
  closingBalance: number;
  cumulativeWithdrawals: number;
}

export interface SWPCalculationResult {
  initialCorpus: number;
  scheduledMonthlyWithdrawal: number;
  scheduledWithdrawalAmount: number;
  withdrawalFrequency: SWPWithdrawalFrequency;
  expectedAnnualReturn: number;
  withdrawalDurationYears: number;
  totalActualWithdrawals: number;
  remainingCorpus: number;
  totalGrowthEarned: number;
  isExhausted: boolean;
  exhaustionMonthNumber: number | null;
  exhaustionYear: number | null;
  yearlySchedule: SWPYearlyScheduleItem[];
  isValid: boolean;
  validationError?: string;
}

export function calculateSWP(inputs: SWPCalculatorInputs): SWPCalculationResult {
  const {
    initialCorpus,
    monthlyWithdrawal,
    withdrawalAmount,
    withdrawalFrequency = 'monthly',
    expectedAnnualReturn,
    withdrawalDurationYears,
  } = inputs;

  const rawWithdrawal = withdrawalAmount !== undefined 
    ? withdrawalAmount 
    : (monthlyWithdrawal !== undefined ? monthlyWithdrawal : 0);

  if (
    typeof initialCorpus !== 'number' ||
    isNaN(initialCorpus) ||
    initialCorpus < 0 ||
    typeof rawWithdrawal !== 'number' ||
    isNaN(rawWithdrawal) ||
    rawWithdrawal < 0 ||
    typeof expectedAnnualReturn !== 'number' ||
    isNaN(expectedAnnualReturn) ||
    expectedAnnualReturn < 0 ||
    typeof withdrawalDurationYears !== 'number' ||
    isNaN(withdrawalDurationYears) ||
    withdrawalDurationYears <= 0
  ) {
    return {
      initialCorpus: Math.max(0, Number(initialCorpus) || 0),
      scheduledMonthlyWithdrawal: Math.max(0, Number(rawWithdrawal) || 0),
      scheduledWithdrawalAmount: Math.max(0, Number(rawWithdrawal) || 0),
      withdrawalFrequency,
      expectedAnnualReturn: Math.max(0, Number(expectedAnnualReturn) || 0),
      withdrawalDurationYears: Math.max(0, Number(withdrawalDurationYears) || 0),
      totalActualWithdrawals: 0,
      remainingCorpus: 0,
      totalGrowthEarned: 0,
      isExhausted: false,
      exhaustionMonthNumber: null,
      exhaustionYear: null,
      yearlySchedule: [],
      isValid: false,
      validationError: 'Please provide valid non-negative numbers for all inputs.',
    };
  }

  // Prevent calculation overflow for unrealistic extremes (strictly capped at ₹100 Crore)
  if (
    initialCorpus > MAX_INVESTMENT_AMOUNT ||
    rawWithdrawal > MAX_INVESTMENT_AMOUNT ||
    withdrawalDurationYears > 60 ||
    expectedAnnualReturn > 100
  ) {
    return {
      initialCorpus,
      scheduledMonthlyWithdrawal: withdrawalFrequency === 'yearly' ? Math.round(rawWithdrawal / 12) : rawWithdrawal,
      scheduledWithdrawalAmount: rawWithdrawal,
      withdrawalFrequency,
      expectedAnnualReturn,
      withdrawalDurationYears,
      totalActualWithdrawals: 0,
      remainingCorpus: 0,
      totalGrowthEarned: 0,
      isExhausted: false,
      exhaustionMonthNumber: null,
      exhaustionYear: null,
      yearlySchedule: [],
      isValid: false,
      validationError: 'Input values exceed maximum supported limits (₹100 Crore).',
    };
  }

  let currentBalance = initialCorpus;
  let totalActualWithdrawals = 0;
  let totalGrowthEarned = 0;
  let exhaustionMonthNumber: number | null = null;
  let exhaustionYear: number | null = null;
  const yearlySchedule: SWPYearlyScheduleItem[] = [];

  // ==========================================
  // 1. YEARLY WITHDRAWAL SCHEDULE SIMULATION
  // ==========================================
  if (withdrawalFrequency === 'yearly') {
    const annualWithdrawal = rawWithdrawal;
    const annualRate = expectedAnnualReturn / 100;

    for (let y = 1; y <= withdrawalDurationYears; y++) {
      const openingBalance = currentBalance;

      if (currentBalance <= 0) {
        yearlySchedule.push({
          year: y,
          openingBalance: 0,
          growthEarned: 0,
          annualWithdrawal: 0,
          closingBalance: 0,
          cumulativeWithdrawals: Math.round(totalActualWithdrawals),
        });
        continue;
      }

      // Apply annual compound growth on opening balance
      const growthEarned = currentBalance * annualRate;
      totalGrowthEarned += growthEarned;
      const balanceBeforeWithdrawal = currentBalance + growthEarned;

      // Deduct scheduled annual withdrawal, capped at available balance
      const actualWithdrawal = Math.min(balanceBeforeWithdrawal, annualWithdrawal);
      const closingBalance = Math.max(0, balanceBeforeWithdrawal - actualWithdrawal);

      totalActualWithdrawals += actualWithdrawal;
      currentBalance = closingBalance;

      if (currentBalance === 0 && exhaustionYear === null) {
        exhaustionYear = y;
        exhaustionMonthNumber = y * 12;
      }

      yearlySchedule.push({
        year: y,
        openingBalance: Math.round(openingBalance),
        growthEarned: Math.round(growthEarned),
        annualWithdrawal: Math.round(actualWithdrawal),
        closingBalance: Math.round(closingBalance),
        cumulativeWithdrawals: Math.round(totalActualWithdrawals),
      });
    }

    const isExhausted = exhaustionYear !== null;

    return {
      initialCorpus: Math.round(initialCorpus),
      scheduledMonthlyWithdrawal: Math.round(annualWithdrawal / 12),
      scheduledWithdrawalAmount: Math.round(annualWithdrawal),
      withdrawalFrequency: 'yearly',
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

  // ==========================================
  // 2. MONTHLY WITHDRAWAL SCHEDULE SIMULATION
  // ==========================================
  const totalMonths = Math.round(withdrawalDurationYears * 12);
  // Nominal monthly rate matching Groww's SWP convention: r / 12
  const monthlyRate = expectedAnnualReturn === 0
    ? 0
    : expectedAnnualReturn / 100 / 12;

  let currentYearOpening = currentBalance;
  let currentYearGrowth = 0;
  let currentYearWithdrawals = 0;

  for (let m = 1; m <= totalMonths; m++) {
    if (m % 12 === 1) {
      currentYearOpening = currentBalance;
      currentYearGrowth = 0;
      currentYearWithdrawals = 0;
    }

    if (currentBalance <= 0) {
      // Corpus is completely exhausted
      if (m % 12 === 0 || m === totalMonths) {
        const yearNumber = Math.ceil(m / 12);
        yearlySchedule.push({
          year: yearNumber,
          openingBalance: Math.round(currentYearOpening),
          growthEarned: Math.round(currentYearGrowth),
          annualWithdrawal: Math.round(currentYearWithdrawals),
          closingBalance: 0,
          cumulativeWithdrawals: Math.round(totalActualWithdrawals),
        });
      }
      continue;
    }

    // Apply monthly return first
    const growthEarned = currentBalance * monthlyRate;
    const balanceBeforeWithdrawal = currentBalance + growthEarned;
    totalGrowthEarned += growthEarned;
    currentYearGrowth += growthEarned;

    // Deduct scheduled monthly withdrawal, capped at available balance
    const actualWithdrawal = Math.min(balanceBeforeWithdrawal, rawWithdrawal);
    const closingBalance = Math.max(0, balanceBeforeWithdrawal - actualWithdrawal);
    totalActualWithdrawals += actualWithdrawal;
    currentYearWithdrawals += actualWithdrawal;

    currentBalance = closingBalance;

    if (currentBalance === 0 && exhaustionMonthNumber === null) {
      exhaustionMonthNumber = m;
    }

    // Year boundary record
    if (m % 12 === 0 || m === totalMonths) {
      const yearNumber = Math.ceil(m / 12);
      yearlySchedule.push({
        year: yearNumber,
        openingBalance: Math.round(currentYearOpening),
        growthEarned: Math.round(currentYearGrowth),
        annualWithdrawal: Math.round(currentYearWithdrawals),
        closingBalance: Math.round(currentBalance),
        cumulativeWithdrawals: Math.round(totalActualWithdrawals),
      });
    }
  }

  const isExhausted = exhaustionMonthNumber !== null;
  exhaustionYear = exhaustionMonthNumber
    ? parseFloat((exhaustionMonthNumber / 12).toFixed(1))
    : null;

  return {
    initialCorpus: Math.round(initialCorpus),
    scheduledMonthlyWithdrawal: Math.round(rawWithdrawal),
    scheduledWithdrawalAmount: Math.round(rawWithdrawal),
    withdrawalFrequency: 'monthly',
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

export { formatINR, formatCompactINR };
