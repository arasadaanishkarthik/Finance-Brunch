/**
 * Finance Brunch - Step-Up SIP Calculator Utility
 *
 * Implements deterministic client-side Step-Up SIP calculations:
 * - The monthly contribution increases after every 12 monthly installments by annualStepUpPercentage.
 * - Nominal monthly rate: i = r / 12  (r = annual rate / 100)
 *   Matching Groww's Step-Up SIP calculator convention.
 * - Beginning-of-month contribution timing: balance = (balance + contribution) * (1 + i)
 * - Includes fixed SIP comparison with identical starting contribution and return assumptions.
 */

import { formatINR, formatCompactINR } from './sipCalculator';
import {
  MAX_INVESTMENT_AMOUNT,
  MAX_CALCULATION_SAFETY_LIMIT,
} from './calculatorConstants';
export {
  MAX_INVESTMENT_AMOUNT,
  MIN_STEPUP_MONTHLY,
  MAX_STEPUP_MONTHLY,
  DEFAULT_STEPUP_MONTHLY,
  STEPUP_QUICK_PRESETS,
} from './calculatorConstants';

export interface StepUpSIPCalculatorInputs {
  initialMonthlyInvestment: number;
  expectedAnnualReturn: number;
  investmentDurationYears: number;
  annualStepUpPercentage?: number;
}

export interface StepUpYearlyScheduleItem {
  year: number;
  monthlyContribution: number;
  yearlyInvested: number;
  cumulativeInvested: number;
  futureValue: number;
  estimatedReturns: number;
}

export interface StepUpSIPCalculationResult {
  initialMonthlySIP: number;
  finalMonthlySIP: number;
  investmentDurationYears: number;
  expectedAnnualReturn: number;
  annualStepUpPercentage: number;
  totalInvested: number;
  estimatedReturns: number;
  futureValue: number;
  annualSchedule: StepUpYearlyScheduleItem[];
  fixedSipComparison: {
    totalInvested: number;
    estimatedReturns: number;
    futureValue: number;
    differenceFV: number;
  };
  stepUpAdvantage: number;
  isValid: boolean;
  validationError?: string;
}

export function calculateStepUpSIP(inputs: StepUpSIPCalculatorInputs): StepUpSIPCalculationResult {
  const {
    initialMonthlyInvestment,
    expectedAnnualReturn,
    investmentDurationYears,
    annualStepUpPercentage = 10,
  } = inputs;

  if (
    typeof initialMonthlyInvestment !== 'number' ||
    isNaN(initialMonthlyInvestment) ||
    initialMonthlyInvestment < 0 ||
    typeof expectedAnnualReturn !== 'number' ||
    isNaN(expectedAnnualReturn) ||
    expectedAnnualReturn < 0 ||
    typeof investmentDurationYears !== 'number' ||
    isNaN(investmentDurationYears) ||
    investmentDurationYears <= 0 ||
    typeof annualStepUpPercentage !== 'number' ||
    isNaN(annualStepUpPercentage) ||
    annualStepUpPercentage < 0
  ) {
    return {
      initialMonthlySIP: Math.max(0, Number(initialMonthlyInvestment) || 0),
      finalMonthlySIP: Math.max(0, Number(initialMonthlyInvestment) || 0),
      investmentDurationYears: Math.max(0, Number(investmentDurationYears) || 0),
      expectedAnnualReturn: Math.max(0, Number(expectedAnnualReturn) || 0),
      annualStepUpPercentage: Math.max(0, Number(annualStepUpPercentage) || 0),
      totalInvested: 0,
      estimatedReturns: 0,
      futureValue: 0,
      annualSchedule: [],
      fixedSipComparison: {
        totalInvested: 0,
        estimatedReturns: 0,
        futureValue: 0,
        differenceFV: 0,
      },
      stepUpAdvantage: 0,
      isValid: false,
      validationError: 'Please provide valid non-negative numbers for all inputs.',
    };
  }

  // Prevent calculation overflow for unrealistic extremes (strictly capped at ₹100 Crore)
  if (initialMonthlyInvestment > MAX_INVESTMENT_AMOUNT || investmentDurationYears > 60 || expectedAnnualReturn > 100 || annualStepUpPercentage > 100) {
    return {
      initialMonthlySIP: initialMonthlyInvestment,
      finalMonthlySIP: initialMonthlyInvestment,
      investmentDurationYears,
      expectedAnnualReturn,
      annualStepUpPercentage,
      totalInvested: 0,
      estimatedReturns: 0,
      futureValue: 0,
      annualSchedule: [],
      fixedSipComparison: {
        totalInvested: 0,
        estimatedReturns: 0,
        futureValue: 0,
        differenceFV: 0,
      },
      stepUpAdvantage: 0,
      isValid: false,
      validationError: 'Input values exceed maximum supported limits (₹100 Crore).',
    };
  }

  const totalMonths = Math.round(investmentDurationYears * 12);
  // Nominal monthly rate matching Groww's convention: r / 12
  const monthlyRate = expectedAnnualReturn === 0
    ? 0
    : expectedAnnualReturn / 100 / 12;

  let stepUpBalance = 0;
  let stepUpTotalInvested = 0;
  let currentYearInvested = 0;
  const annualSchedule: StepUpYearlyScheduleItem[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    // Cap monthly contribution at ₹100 Crore to prevent absurd compounding overflow
    const calculatedMonthly = initialMonthlyInvestment * Math.pow(1 + annualStepUpPercentage / 100, yearIndex);
    const monthlyContribution = Math.min(MAX_INVESTMENT_AMOUNT, calculatedMonthly);

    stepUpTotalInvested += monthlyContribution;
    currentYearInvested += monthlyContribution;

    // Beginning-of-month contribution accumulation matching Groww:
    // balance = (balance + contribution) * (1 + monthlyRate)
    if (monthlyRate === 0) {
      stepUpBalance += monthlyContribution;
    } else {
      stepUpBalance = (stepUpBalance + monthlyContribution) * (1 + monthlyRate);
    }

    if (m % 12 === 0 || m === totalMonths) {
      const yearNumber = Math.ceil(m / 12);
      const roundedYearlyInvested = Math.round(currentYearInvested);
      const roundedCumulativeInvested = Math.round(stepUpTotalInvested);
      const roundedFV = Math.round(stepUpBalance);
      const roundedReturns = Math.max(0, roundedFV - roundedCumulativeInvested);

      annualSchedule.push({
        year: yearNumber,
        monthlyContribution: Math.round(monthlyContribution),
        yearlyInvested: roundedYearlyInvested,
        cumulativeInvested: roundedCumulativeInvested,
        futureValue: roundedFV,
        estimatedReturns: roundedReturns,
      });
      currentYearInvested = 0;
    }
  }

  // Final scheduled monthly SIP (last month's contribution capped at ₹100 Cr):
  const finalYearIndex = Math.floor((totalMonths - 1) / 12);
  const finalMonthlySIP = Math.min(
    MAX_INVESTMENT_AMOUNT,
    initialMonthlyInvestment * Math.pow(1 + annualStepUpPercentage / 100, finalYearIndex)
  );

  // Fixed SIP calculation for identical starting parameters (beginning-of-month, Groww convention):
  const fixedTotalInvested = initialMonthlyInvestment * totalMonths;
  let fixedFutureValue = 0;
  if (monthlyRate === 0) {
    fixedFutureValue = fixedTotalInvested;
  } else {
    fixedFutureValue = initialMonthlyInvestment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
  }
  const fixedReturns = Math.max(0, fixedFutureValue - fixedTotalInvested);

  if (!isFinite(stepUpBalance) || isNaN(stepUpBalance) || stepUpBalance > Number.MAX_SAFE_INTEGER) {
    return {
      initialMonthlySIP: Math.round(initialMonthlyInvestment),
      finalMonthlySIP: Math.round(finalMonthlySIP),
      investmentDurationYears,
      expectedAnnualReturn,
      annualStepUpPercentage,
      totalInvested: Math.round(stepUpTotalInvested),
      estimatedReturns: 0,
      futureValue: 0,
      annualSchedule: [],
      fixedSipComparison: {
        totalInvested: 0,
        estimatedReturns: 0,
        futureValue: 0,
        differenceFV: 0,
      },
      stepUpAdvantage: 0,
      isValid: false,
      validationError: 'Projected value exceeds calculation precision bounds. Please adjust duration or returns.',
    };
  }

  const roundedFV = Math.round(stepUpBalance);
  const roundedTotalInvested = Math.round(stepUpTotalInvested);
  const roundedEstimatedReturns = Math.max(0, roundedFV - roundedTotalInvested);

  const roundedFixedFV = Math.round(fixedFutureValue);
  const roundedFixedInvested = Math.round(fixedTotalInvested);
  const roundedFixedReturns = Math.max(0, roundedFixedFV - roundedFixedInvested);
  const roundedDifferenceFV = roundedFV - roundedFixedFV;

  return {
    initialMonthlySIP: Math.round(initialMonthlyInvestment),
    finalMonthlySIP: Math.round(finalMonthlySIP),
    investmentDurationYears,
    expectedAnnualReturn,
    annualStepUpPercentage,
    totalInvested: roundedTotalInvested,
    estimatedReturns: roundedEstimatedReturns,
    futureValue: roundedFV,
    annualSchedule,
    fixedSipComparison: {
      totalInvested: roundedFixedInvested,
      estimatedReturns: roundedFixedReturns,
      futureValue: roundedFixedFV,
      differenceFV: roundedDifferenceFV,
    },
    stepUpAdvantage: roundedDifferenceFV,
    isValid: true,
  };
}

export { formatINR, formatCompactINR };
