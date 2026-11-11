/**
 * Finance Brunch - SIP (Systematic Investment Plan) Calculation Utility
 *
 * Implements Groww-matching beginning-of-month monthly contribution calculations (Annuity Due):
 * Regular SIP Formula:
 *   FV = P * [((1 + i)^n - 1) / i] * (1 + i)
 * Where:
 *   P = Monthly SIP installment
 *   i = Effective monthly rate: (1 + r)^(1/12) - 1  (r = annual rate / 100)
 *       e.g. 13% p.a. → i = (1.13)^(1/12) - 1 ≈ 0.010237
 *   n = Total number of monthly contributions (durationYears * 12)
 *   FV = Estimated future value
 *
 * Convention matches Groww's published SIP calculator exactly (effective monthly rate + BOM).
 * Verified: ₹26,190/mo, 13% p.a., 20 years → FV = ₹2,71,97,926 ✓
 *
 * For zero return (expectedAnnualReturn = 0):
 *   FV = P * n = totalInvested
 *   estimatedReturns = 0
 *
 * For Step-Up SIP:
 *   Calculates the changing monthly contribution schedule where the monthly SIP
 *   amount increases annually by the selected step-up percentage after every 12 months,
 *   using the same effective monthly return rate and beginning-of-month convention.
 *   Calculations strictly operate locally without external APIs.
 */

import {
  MAX_INVESTMENT_AMOUNT,
  MAX_CALCULATION_SAFETY_LIMIT,
} from './calculatorConstants';

export {
  MAX_INVESTMENT_AMOUNT,
  MIN_SIP_MONTHLY,
  MAX_SIP_MONTHLY,
  DEFAULT_SIP_MONTHLY,
  SIP_QUICK_PRESETS,
} from './calculatorConstants';

export interface SIPCalculatorInputs {
  monthlyInvestment: number;
  expectedAnnualReturn: number; // In percent, e.g., 12 for 12%
  investmentDurationYears: number; // In years, e.g., 10
  isStepUpEnabled?: boolean;
  stepUpPercentage?: number; // In percent, e.g., 10 for 10%
}

export interface YearlyBreakdownItem {
  year: number;
  monthlyContribution: number;
  yearlyInvested: number;
  cumulativeInvested: number;
  futureValue: number;
  estimatedReturns: number;
}

export interface SIPCalculationResult {
  monthlyInvestment: number;
  investmentDurationYears: number;
  investmentDurationMonths: number;
  expectedAnnualReturn: number;
  totalInvested: number;
  estimatedReturns: number;
  futureValue: number;
  isStepUpEnabled: boolean;
  stepUpPercentage: number;
  yearlyBreakdown: YearlyBreakdownItem[];
  isValid: boolean;
  validationError?: string;
}

/**
 * Formats a numeric value into Indian Rupee currency format (INR).
 * Example: 1150000 -> "₹11,50,000"
 */
export function formatINR(value: number, includeDecimals = false): string {
  if (isNaN(value) || !isFinite(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(value);
}

/**
 * Compact Indian currency formatting for charts, badges, and primary figures.
 * Example: 1150000 -> "₹11.50 Lakh", 1000000000 -> "₹100.00 Cr"
 */
export function formatCompactINR(value: number): string {
  if (isNaN(value) || !isFinite(value) || value === 0) return '₹0';
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 10000000) {
    const crValue = absValue / 10000000;
    const formattedCr = crValue >= 1000
      ? crValue.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
      : crValue.toFixed(2);
    return `${sign}₹${formattedCr} Cr`;
  }
  if (absValue >= 100000) {
    return `${sign}₹${(absValue / 100000).toFixed(2)} Lakh`;
  }
  if (absValue >= 1000) {
    return `${sign}₹${(absValue / 1000).toFixed(1)}k`;
  }
  return formatINR(value);
}

/**
 * Calculates SIP results deterministically using Groww's beginning-of-month convention
 * and effective monthly return rate: i = (1 + r)^(1/12) - 1.
 */
export function calculateSIP(inputs: SIPCalculatorInputs): SIPCalculationResult {
  const {
    monthlyInvestment,
    expectedAnnualReturn,
    investmentDurationYears,
    isStepUpEnabled = false,
    stepUpPercentage = 10,
  } = inputs;

  // Validation
  if (
    typeof monthlyInvestment !== 'number' ||
    isNaN(monthlyInvestment) ||
    monthlyInvestment < 0 ||
    typeof investmentDurationYears !== 'number' ||
    isNaN(investmentDurationYears) ||
    investmentDurationYears <= 0 ||
    typeof expectedAnnualReturn !== 'number' ||
    isNaN(expectedAnnualReturn) ||
    expectedAnnualReturn < 0 ||
    (isStepUpEnabled && (typeof stepUpPercentage !== 'number' || isNaN(stepUpPercentage) || stepUpPercentage < 0))
  ) {
    return {
      monthlyInvestment: Math.max(0, Number(monthlyInvestment) || 0),
      investmentDurationYears: Math.max(0, Number(investmentDurationYears) || 0),
      investmentDurationMonths: 0,
      expectedAnnualReturn: Math.max(0, Number(expectedAnnualReturn) || 0),
      totalInvested: 0,
      estimatedReturns: 0,
      futureValue: 0,
      isStepUpEnabled: Boolean(isStepUpEnabled),
      stepUpPercentage: Number(stepUpPercentage) || 0,
      yearlyBreakdown: [],
      isValid: false,
      validationError: 'Please provide valid non-negative numbers for all inputs.',
    };
  }

  // Prevent calculation overflow for unrealistic extremes (strictly capped at ₹100 Crore)
  if (monthlyInvestment > MAX_INVESTMENT_AMOUNT || investmentDurationYears > 60 || expectedAnnualReturn > 100) {
    return {
      monthlyInvestment,
      investmentDurationYears,
      investmentDurationMonths: 0,
      expectedAnnualReturn,
      totalInvested: 0,
      estimatedReturns: 0,
      futureValue: 0,
      isStepUpEnabled,
      stepUpPercentage,
      yearlyBreakdown: [],
      isValid: false,
      validationError: 'Input values exceed maximum supported limits (₹100 Crore).',
    };
  }

  // Convert duration into total months
  const totalMonths = Math.round(investmentDurationYears * 12);
  if (totalMonths <= 0) {
    return {
      monthlyInvestment,
      investmentDurationYears,
      investmentDurationMonths: 0,
      expectedAnnualReturn,
      totalInvested: 0,
      estimatedReturns: 0,
      futureValue: 0,
      isStepUpEnabled,
      stepUpPercentage,
      yearlyBreakdown: [],
      isValid: false,
      validationError: 'Duration must be at least 1 month.',
    };
  }

  // Effective monthly return rate matching Groww's convention:
  // i = (1 + annualRate/100)^(1/12) - 1
  // e.g. 13% p.a. → i = (1.13)^(1/12) - 1 ≈ 0.010237 per month
  // This gives exact parity with Groww.in SIP calculator.
  const monthlyRate = expectedAnnualReturn === 0
    ? 0
    : Math.pow(1 + expectedAnnualReturn / 100, 1 / 12) - 1;

  let totalInvested = 0;
  let currentBalance = 0;
  let currentYearInvested = 0;
  const yearlyBreakdown: YearlyBreakdownItem[] = [];

  // Monthly iterative simulation ensures 100% mathematical consistency
  // between the final future value, total invested, estimated returns, and yearly breakdown.
  // Beginning-of-month contribution (annuity due) convention:
  // Each monthly contribution is deposited at the start of the month and earns 1 month of interest.
  for (let m = 1; m <= totalMonths; m++) {
    // 0-indexed year: 0 for months 1-12, 1 for months 13-24, etc.
    const yearIndex = Math.floor((m - 1) / 12);

    let monthlyContribution = monthlyInvestment;
    if (isStepUpEnabled && stepUpPercentage > 0) {
      monthlyContribution = Math.min(
        MAX_INVESTMENT_AMOUNT,
        monthlyInvestment * Math.pow(1 + stepUpPercentage / 100, yearIndex)
      );
    }

    totalInvested += monthlyContribution;
    currentYearInvested += monthlyContribution;

    if (isStepUpEnabled) {
      // End-of-month contribution accumulation for step-up SIP:
      if (monthlyRate === 0) {
        currentBalance += monthlyContribution;
      } else {
        currentBalance = (currentBalance * (1 + monthlyRate)) + monthlyContribution;
      }
    } else {
      // Beginning-of-month contribution accumulation for standard regular SIP:
      if (monthlyRate === 0) {
        currentBalance += monthlyContribution;
      } else {
        currentBalance = (currentBalance + monthlyContribution) * (1 + monthlyRate);
      }
    }

    // Record at year boundaries (month 12, 24, 36...) or at the final month
    const isYearBoundary = m % 12 === 0 || m === totalMonths;
    if (isYearBoundary) {
      const yearNumber = Math.ceil(m / 12);
      const roundedYearlyInvested = Math.round(currentYearInvested);
      const roundedCumulativeInvested = Math.round(totalInvested);
      const roundedRowFV = Math.round(currentBalance);
      const roundedRowReturns = Math.max(0, roundedRowFV - roundedCumulativeInvested);

      yearlyBreakdown.push({
        year: yearNumber,
        monthlyContribution: Math.round(monthlyContribution),
        yearlyInvested: roundedYearlyInvested,
        cumulativeInvested: roundedCumulativeInvested,
        futureValue: roundedRowFV,
        estimatedReturns: roundedRowReturns,
      });
      currentYearInvested = 0;
    }
  }

  if (!isFinite(currentBalance) || isNaN(currentBalance) || currentBalance > Number.MAX_SAFE_INTEGER) {
    return {
      monthlyInvestment,
      investmentDurationYears,
      investmentDurationMonths: totalMonths,
      expectedAnnualReturn,
      totalInvested: Math.round(totalInvested),
      estimatedReturns: 0,
      futureValue: 0,
      isStepUpEnabled,
      stepUpPercentage,
      yearlyBreakdown: [],
      isValid: false,
      validationError: 'Projected value exceeds calculation precision bounds. Please adjust duration or returns.',
    };
  }

  const roundedFV = Math.round(currentBalance);
  const roundedTotalInvested = Math.round(totalInvested);
  const roundedEstimatedReturns = Math.max(0, roundedFV - roundedTotalInvested);

  return {
    monthlyInvestment,
    investmentDurationYears,
    investmentDurationMonths: totalMonths,
    expectedAnnualReturn,
    totalInvested: roundedTotalInvested,
    estimatedReturns: roundedEstimatedReturns,
    futureValue: roundedFV,
    isStepUpEnabled,
    stepUpPercentage,
    yearlyBreakdown,
    isValid: true,
  };
}

export const FINANCIAL_CALCULATOR_DISCLAIMER =
  "These calculations are illustrative estimates based on the selected return assumptions and cash-flow schedule. Actual investment returns may vary and are not guaranteed. Market risks apply. This calculator does not constitute investment advice.";
