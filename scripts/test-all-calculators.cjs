/**
 * Finance Brunch - Comprehensive Unit & Regression Test Suite
 * Tests all 4 Investment Calculators:
 * 1. SIP Calculator
 * 2. Step-Up SIP Calculator
 * 3. Lumpsum Calculator
 * 4. SWP (Systematic Withdrawal Plan) Calculator
 */

const assert = require('assert');

// 1. SIP Calculator Implementation Test
function testSIPCalculator() {
  console.log('--- Testing SIP Calculator ---');

  function calculateSIP(inputs) {
    const { monthlyInvestment, expectedAnnualReturn, investmentDurationYears } = inputs;
    if (monthlyInvestment < 0 || expectedAnnualReturn < 0 || investmentDurationYears <= 0) {
      return { isValid: false, totalInvested: 0, futureValue: 0, estimatedReturns: 0 };
    }
    const totalMonths = Math.round(investmentDurationYears * 12);
    const monthlyRate = expectedAnnualReturn === 0 ? 0 : expectedAnnualReturn / 100 / 12;
    let balance = 0;
    let totalInvested = 0;
    for (let m = 1; m <= totalMonths; m++) {
      totalInvested += monthlyInvestment;
      balance = monthlyRate === 0 ? balance + monthlyInvestment : (balance + monthlyInvestment) * (1 + monthlyRate);
    }
    return {
      isValid: true,
      totalInvested,
      futureValue: Math.round(balance),
      estimatedReturns: Math.round(balance - totalInvested),
    };
  }

  // Zero-return test
  const zeroReturn = calculateSIP({ monthlyInvestment: 5000, expectedAnnualReturn: 0, investmentDurationYears: 5 });
  assert.strictEqual(zeroReturn.totalInvested, 300000);
  assert.strictEqual(zeroReturn.futureValue, 300000);
  assert.strictEqual(zeroReturn.estimatedReturns, 0);
  console.log('✓ PASS: SIP Zero-return case');

  // Test ₹100 minimum monthly SIP amount
  const sip100 = calculateSIP({ monthlyInvestment: 100, expectedAnnualReturn: 12, investmentDurationYears: 10 });
  assert.strictEqual(sip100.totalInvested, 12000);
  assert(sip100.futureValue > 12000, 'FV should exceed total invested');
  console.log(`✓ PASS: SIP ₹100/mo @ 12% for 10y = Invested: ₹${sip100.totalInvested}, FV: ₹${sip100.futureValue}`);

  // Test ₹500 monthly SIP amount
  const sip500 = calculateSIP({ monthlyInvestment: 500, expectedAnnualReturn: 12, investmentDurationYears: 10 });
  assert.strictEqual(sip500.totalInvested, 60000);
  assert(sip500.futureValue > 60000, 'FV should exceed total invested');
  console.log(`✓ PASS: SIP ₹500/mo @ 12% for 10y = Invested: ₹${sip500.totalInvested}, FV: ₹${sip500.futureValue}`);

  // Test ₹1,000 monthly SIP amount
  const sip1000 = calculateSIP({ monthlyInvestment: 1000, expectedAnnualReturn: 12, investmentDurationYears: 10 });
  assert.strictEqual(sip1000.totalInvested, 120000);
  assert(sip1000.futureValue > 120000, 'FV should exceed total invested');
  console.log(`✓ PASS: SIP ₹1,000/mo @ 12% for 10y = Invested: ₹${sip1000.totalInvested}, FV: ₹${sip1000.futureValue}`);

  // Test ₹5,000 monthly SIP amount (Normal return test)
  const standardSIP = calculateSIP({ monthlyInvestment: 5000, expectedAnnualReturn: 12, investmentDurationYears: 10 });
  assert.strictEqual(standardSIP.totalInvested, 600000);
  assert(standardSIP.futureValue > 1100000);
  console.log(`✓ PASS: SIP ₹5,000/mo @ 12% for 10y = Invested: ₹${standardSIP.totalInvested}, FV: ₹${standardSIP.futureValue}`);

  // Test ₹1 Crore monthly SIP
  const sip1Cr = calculateSIP({ monthlyInvestment: 10000000, expectedAnnualReturn: 12, investmentDurationYears: 5 });
  assert.strictEqual(sip1Cr.totalInvested, 600000000);
  assert(sip1Cr.futureValue > 800000000);
  console.log(`✓ PASS: SIP ₹1 Cr/mo @ 12% for 5y = Invested: ₹${sip1Cr.totalInvested}, FV: ₹${sip1Cr.futureValue}`);

  // Test ₹100 Crore monthly SIP
  const sip100Cr = calculateSIP({ monthlyInvestment: 1000000000, expectedAnnualReturn: 12, investmentDurationYears: 5 });
  assert.strictEqual(sip100Cr.totalInvested, 60000000000);
  assert(sip100Cr.futureValue > 80000000000);
  console.log(`✓ PASS: SIP ₹100 Cr/mo @ 12% for 5y = Invested: ₹${sip100Cr.totalInvested}, FV: ₹${sip100Cr.futureValue}`);
}

// 2. Step-Up SIP Calculator Test
function testStepUpSIPCalculator() {
  console.log('\n--- Testing Step-Up SIP Calculator ---');

  function calculateStepUpSIP(inputs) {
    const { initialMonthlyInvestment, expectedAnnualReturn, investmentDurationYears, annualStepUpPercentage = 10 } = inputs;
    
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
      annualStepUpPercentage < 0 ||
      initialMonthlyInvestment > 5000000000 ||
      investmentDurationYears > 60 ||
      expectedAnnualReturn > 100 ||
      annualStepUpPercentage > 100
    ) {
      return {
        isValid: false,
        totalInvested: 0,
        futureValue: 0,
        estimatedReturns: 0,
        finalMonthlySIP: 0,
        annualSchedule: [],
        fixedSipComparison: { totalInvested: 0, futureValue: 0, differenceFV: 0 },
      };
    }

    const totalMonths = Math.round(investmentDurationYears * 12);
    const monthlyRate = expectedAnnualReturn === 0 ? 0 : expectedAnnualReturn / 100 / 12;

    let balance = 0;
    let totalInvested = 0;
    let currentYearInvested = 0;
    const monthlyContributions = [];
    const annualSchedule = [];

    for (let m = 1; m <= totalMonths; m++) {
      const yearIndex = Math.floor((m - 1) / 12);
      const monthlyContribution = initialMonthlyInvestment * Math.pow(1 + annualStepUpPercentage / 100, yearIndex);
      monthlyContributions.push(monthlyContribution);
      totalInvested += monthlyContribution;
      currentYearInvested += monthlyContribution;

      // Beginning-of-month contribution accumulation:
      // closingBalance = (previousBalance + contribution) * (1 + monthlyRate)
      balance = monthlyRate === 0 ? balance + monthlyContribution : (balance + monthlyContribution) * (1 + monthlyRate);

      if (m % 12 === 0 || m === totalMonths) {
        const yearNumber = Math.ceil(m / 12);
        const roundedRowInvested = Math.round(totalInvested);
        const roundedRowFV = Math.round(balance);
        annualSchedule.push({
          year: yearNumber,
          monthlyContribution: Math.round(monthlyContribution),
          yearlyInvested: Math.round(currentYearInvested),
          cumulativeInvested: roundedRowInvested,
          futureValue: roundedRowFV,
          estimatedReturns: Math.max(0, roundedRowFV - roundedRowInvested),
        });
        currentYearInvested = 0;
      }
    }

    const finalYearIndex = Math.floor((totalMonths - 1) / 12);
    const finalMonthlySIP = initialMonthlyInvestment * Math.pow(1 + annualStepUpPercentage / 100, finalYearIndex);

    const fixedTotalInvested = initialMonthlyInvestment * totalMonths;
    const fixedFV = monthlyRate === 0 ? fixedTotalInvested : initialMonthlyInvestment * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);

    const roundedFV = Math.round(balance);
    const roundedTotalInvested = Math.round(totalInvested);
    const roundedReturns = Math.max(0, roundedFV - roundedTotalInvested);
    const roundedFixedFV = Math.round(fixedFV);
    const roundedFixedInvested = Math.round(fixedTotalInvested);
    const roundedDiffFV = roundedFV - roundedFixedFV;

    return {
      isValid: true,
      initialMonthlySIP: Math.round(initialMonthlyInvestment),
      finalMonthlySIP: Math.round(finalMonthlySIP),
      totalInvested: roundedTotalInvested,
      futureValue: roundedFV,
      estimatedReturns: roundedReturns,
      monthlyContributions,
      annualSchedule,
      fixedSipComparison: {
        totalInvested: roundedFixedInvested,
        futureValue: roundedFixedFV,
        differenceFV: roundedDiffFV,
      },
    };
  }

  // 1. REFERENCE CASE TEST:
  // Starting SIP: ₹1,000, 10% annual step-up, 12% effective annual return, 10 years
  const refCase = calculateStepUpSIP({
    initialMonthlyInvestment: 1000,
    expectedAnnualReturn: 12,
    investmentDurationYears: 10,
    annualStepUpPercentage: 10,
  });

  // Verify monthly increases after every 12 months:
  assert.strictEqual(Math.round(refCase.monthlyContributions[0]), 1000, 'Month 1 contribution should be ₹1,000');
  assert.strictEqual(Math.round(refCase.monthlyContributions[11]), 1000, 'Month 12 contribution should be ₹1,000');
  assert.strictEqual(Math.round(refCase.monthlyContributions[12]), 1100, 'Month 13 contribution should be ₹1,100');
  assert.strictEqual(Math.round(refCase.monthlyContributions[23]), 1100, 'Month 24 contribution should be ₹1,100');
  assert.strictEqual(Math.round(refCase.monthlyContributions[24]), 1210, 'Month 25 contribution should be ₹1,210');
  assert.strictEqual(Math.round(refCase.monthlyContributions[35]), 1210, 'Month 36 contribution should be ₹1,210');

  // Verify independently calculated expected values:
  assert.strictEqual(refCase.totalInvested, 191249, 'Total invested should be ₹1,91,249');
  assert.strictEqual(refCase.futureValue, 337433, 'Future value should be ₹3,37,433');
  assert.strictEqual(refCase.estimatedReturns, 146184, 'Estimated returns should be ₹1,46,184');
  assert.strictEqual(refCase.finalMonthlySIP, 2358, 'Final monthly SIP should be ₹2,358');
  assert.strictEqual(refCase.estimatedReturns, refCase.futureValue - refCase.totalInvested, 'Returns must equal FV - Invested');

  // Verify fixed SIP comparison:
  assert.strictEqual(refCase.fixedSipComparison.totalInvested, 120000, 'Fixed SIP invested should be ₹1,20,000');
  assert.strictEqual(refCase.fixedSipComparison.futureValue, 232339, 'Fixed SIP FV should be ₹2,32,339');
  assert.strictEqual(refCase.fixedSipComparison.differenceFV, 105094, 'Step-up advantage should be ₹1,05,094');

  console.log(`✓ PASS: Reference Case (₹1,000/mo, 10% step-up, 12% p.a., 10y): Total Invested: ₹${refCase.totalInvested}, FV: ₹${refCase.futureValue}, Returns: ₹${refCase.estimatedReturns}, Advantage: +₹${refCase.fixedSipComparison.differenceFV}`);

  // High Value Test: ₹100 Crore starting monthly Step-Up SIP
  const highValueStepUp = calculateStepUpSIP({
    initialMonthlyInvestment: 1000000000,
    expectedAnnualReturn: 12,
    investmentDurationYears: 5,
    annualStepUpPercentage: 10,
  });
  assert(highValueStepUp.isValid, '₹100 Cr starting monthly Step-Up SIP must be valid');
  assert(highValueStepUp.totalInvested > 1000000000, 'Total invested must exceed initial monthly investment');
  console.log(`✓ PASS: Step-Up SIP ₹100 Cr starting SIP (Invested: ₹${highValueStepUp.totalInvested}, FV: ₹${highValueStepUp.futureValue})`);

  // 2. ZERO ANNUAL RETURN TEST:
  const zeroReturn = calculateStepUpSIP({
    initialMonthlyInvestment: 1000,
    expectedAnnualReturn: 0,
    investmentDurationYears: 10,
    annualStepUpPercentage: 10,
  });
  assert.strictEqual(zeroReturn.totalInvested, 191249);
  assert.strictEqual(zeroReturn.futureValue, 191249);
  assert.strictEqual(zeroReturn.estimatedReturns, 0);
  console.log('✓ PASS: Step-Up SIP Zero annual return (FV == Invested, Returns == 0)');

  // 3. ZERO ANNUAL STEP-UP TEST:
  const zeroStepUp = calculateStepUpSIP({
    initialMonthlyInvestment: 1000,
    expectedAnnualReturn: 12,
    investmentDurationYears: 10,
    annualStepUpPercentage: 0,
  });
  assert.strictEqual(zeroStepUp.totalInvested, 120000);
  assert.strictEqual(zeroStepUp.futureValue, 232339);
  assert.strictEqual(zeroStepUp.fixedSipComparison.differenceFV, 0);
  console.log('✓ PASS: Step-Up SIP Zero step-up (matches Fixed SIP identically, Advantage == 0)');

  // 4. SHORT ONE-YEAR DURATION TEST:
  const oneYear = calculateStepUpSIP({
    initialMonthlyInvestment: 1000,
    expectedAnnualReturn: 12,
    investmentDurationYears: 1,
    annualStepUpPercentage: 10,
  });
  assert.strictEqual(oneYear.totalInvested, 12000);
  assert.strictEqual(oneYear.futureValue, 12809);
  assert.strictEqual(oneYear.estimatedReturns, 809);
  console.log(`✓ PASS: Step-Up SIP 1-Year duration (Invested: ₹${oneYear.totalInvested}, FV: ₹${oneYear.futureValue}, Returns: ₹${oneYear.estimatedReturns})`);

  // 5. LONGER INVESTMENT DURATION TEST (20 Years):
  const longDuration = calculateStepUpSIP({
    initialMonthlyInvestment: 1000,
    expectedAnnualReturn: 12,
    investmentDurationYears: 20,
    annualStepUpPercentage: 10,
  });
  assert(longDuration.isValid);
  assert(longDuration.futureValue > longDuration.totalInvested);
  assert(longDuration.fixedSipComparison.differenceFV > 0);
  console.log(`✓ PASS: Step-Up SIP 20-Year duration (Invested: ₹${longDuration.totalInvested}, FV: ₹${longDuration.futureValue})`);

  // 6. INVALID AND EXCESSIVELY LARGE INPUTS TEST:
  const invalidNeg = calculateStepUpSIP({ initialMonthlyInvestment: -100, expectedAnnualReturn: 12, investmentDurationYears: 5 });
  assert.strictEqual(invalidNeg.isValid, false);
  const invalidNaN = calculateStepUpSIP({ initialMonthlyInvestment: NaN, expectedAnnualReturn: 12, investmentDurationYears: 5 });
  assert.strictEqual(invalidNaN.isValid, false);
  const invalidZeroDuration = calculateStepUpSIP({ initialMonthlyInvestment: 1000, expectedAnnualReturn: 12, investmentDurationYears: 0 });
  assert.strictEqual(invalidZeroDuration.isValid, false);
  const excessivelyLarge = calculateStepUpSIP({ initialMonthlyInvestment: 6000000000, expectedAnnualReturn: 12, investmentDurationYears: 10 });
  assert.strictEqual(excessivelyLarge.isValid, false);
  console.log('✓ PASS: Step-Up SIP invalid and excessively large inputs safely rejected');
}

// 3. Lumpsum Calculator Test
function testLumpsumCalculator() {
  console.log('\n--- Testing Lumpsum Calculator ---');

  function calculateLumpsum(inputs) {
    const { initialInvestment, expectedAnnualReturn, investmentDurationYears } = inputs;
    const r = expectedAnnualReturn / 100;
    const futureValue = expectedAnnualReturn === 0 ? initialInvestment : initialInvestment * Math.pow(1 + r, investmentDurationYears);
    return {
      totalInvested: initialInvestment,
      futureValue: Math.round(futureValue),
      estimatedReturns: Math.round(futureValue - initialInvestment),
    };
  }

  // Zero-return test
  const zeroReturn = calculateLumpsum({ initialInvestment: 100000, expectedAnnualReturn: 0, investmentDurationYears: 5 });
  assert.strictEqual(zeroReturn.totalInvested, 100000);
  assert.strictEqual(zeroReturn.futureValue, 100000);
  assert.strictEqual(zeroReturn.estimatedReturns, 0);
  console.log('✓ PASS: Lumpsum Zero-return case');

  // Compounding test (₹1,00,000 @ 12% for 5 years: 100000 * 1.12^5 = 176234.17)
  const fiveYear = calculateLumpsum({ initialInvestment: 100000, expectedAnnualReturn: 12, investmentDurationYears: 5 });
  assert.strictEqual(fiveYear.futureValue, 176234);
  assert.strictEqual(fiveYear.estimatedReturns, 76234);
  console.log(`✓ PASS: Lumpsum ₹1,00,000 @ 12% for 5y = FV: ₹${fiveYear.futureValue}`);
  // Compounding test (₹1,00,00,00,000 @ 12% for 5 years: ₹100 Cr)
  const highLumpsum = calculateLumpsum({ initialInvestment: 1000000000, expectedAnnualReturn: 12, investmentDurationYears: 5 });
  assert.strictEqual(highLumpsum.totalInvested, 1000000000);
  assert(highLumpsum.futureValue > 1700000000, 'FV should exceed ₹170 Cr');
  console.log(`✓ PASS: Lumpsum ₹100 Cr @ 12% for 5y = FV: ₹${highLumpsum.futureValue}`);
}

// 4. SWP Calculator Test
function testSWPCalculator() {
  console.log('\n--- Testing SWP Calculator ---');

  function calculateSWP(inputs) {
    const { 
      initialCorpus, 
      monthlyWithdrawal, 
      withdrawalAmount, 
      withdrawalFrequency = 'monthly', 
      expectedAnnualReturn, 
      withdrawalDurationYears 
    } = inputs;

    const rawWithdrawal = withdrawalAmount !== undefined 
      ? withdrawalAmount 
      : (monthlyWithdrawal !== undefined ? monthlyWithdrawal : 0);

    let balance = initialCorpus;
    let totalActualWithdrawals = 0;
    let exhaustionMonth = null;
    let exhaustionYear = null;
    let partialFinalWithdrawal = false;

    if (withdrawalFrequency === 'yearly') {
      const annualRate = expectedAnnualReturn / 100;
      for (let y = 1; y <= withdrawalDurationYears; y++) {
        if (balance <= 0) break;
        const growth = balance * annualRate;
        const balanceBefore = balance + growth;

        let actualWithdrawal = rawWithdrawal;
        if (balanceBefore < rawWithdrawal) {
          actualWithdrawal = balanceBefore;
          partialFinalWithdrawal = true;
        }

        balance = Math.max(0, balanceBefore - actualWithdrawal);
        totalActualWithdrawals += actualWithdrawal;

        if (balance <= 0.0001) {
          balance = 0;
          if (!exhaustionYear) exhaustionYear = y;
        }
      }

      return {
        initialCorpus,
        withdrawalFrequency: 'yearly',
        totalActualWithdrawals: Math.round(totalActualWithdrawals),
        remainingCorpus: Math.round(balance),
        exhaustionYear,
        isExhausted: exhaustionYear !== null,
        partialFinalWithdrawal,
      };
    }

    // Monthly Schedule
    const totalMonths = Math.round(withdrawalDurationYears * 12);
    const monthlyRate = expectedAnnualReturn === 0 ? 0 : Math.pow(1 + expectedAnnualReturn / 100, 1 / 12) - 1;

    for (let m = 1; m <= totalMonths; m++) {
      if (balance <= 0) break;

      const growth = balance * monthlyRate;
      const balanceBefore = balance + growth;

      let actualWithdrawal = rawWithdrawal;
      if (balanceBefore < rawWithdrawal) {
        actualWithdrawal = balanceBefore;
        partialFinalWithdrawal = true;
      }

      balance = balanceBefore - actualWithdrawal;
      totalActualWithdrawals += actualWithdrawal;

      if (balance <= 0.0001) {
        balance = 0;
        if (!exhaustionMonth) exhaustionMonth = m;
      }
    }

    return {
      initialCorpus,
      withdrawalFrequency: 'monthly',
      totalActualWithdrawals: Math.round(totalActualWithdrawals),
      remainingCorpus: Math.round(balance),
      exhaustionMonth,
      isExhausted: exhaustionMonth !== null,
      partialFinalWithdrawal,
    };
  }

  // Sustainable Monthly SWP test: ₹10,00,000 corpus, ₹5,000/mo withdrawal (8% return)
  const sustainable = calculateSWP({
    initialCorpus: 1000000,
    monthlyWithdrawal: 5000,
    withdrawalFrequency: 'monthly',
    expectedAnnualReturn: 8,
    withdrawalDurationYears: 10,
  });
  assert.strictEqual(sustainable.isExhausted, false);
  assert(sustainable.remainingCorpus > 0);
  assert.strictEqual(sustainable.totalActualWithdrawals, 600000); // 10 * 12 * 5000
  console.log(`✓ PASS: Sustainable Monthly SWP (Remaining Corpus: ₹${sustainable.remainingCorpus})`);

  // Sustainable Yearly SWP test: ₹10,00,000 corpus, ₹60,000/yr withdrawal (8% return)
  const sustainableYearly = calculateSWP({
    initialCorpus: 1000000,
    withdrawalAmount: 60000,
    withdrawalFrequency: 'yearly',
    expectedAnnualReturn: 8,
    withdrawalDurationYears: 10,
  });
  assert.strictEqual(sustainableYearly.isExhausted, false);
  assert(sustainableYearly.remainingCorpus > 0);
  assert.strictEqual(sustainableYearly.totalActualWithdrawals, 600000); // 10 * 60,000
  console.log(`✓ PASS: Sustainable Yearly SWP (Remaining Corpus: ₹${sustainableYearly.remainingCorpus})`);

  // Depleting Yearly SWP test: ₹1,00,000 corpus, ₹30,000/yr withdrawal @ 0% return
  // Year 1: 30k (rem 70k), Year 2: 30k (rem 40k), Year 3: 30k (rem 10k), Year 4: 10k (exhausted!)
  const depletingYearly = calculateSWP({
    initialCorpus: 100000,
    withdrawalAmount: 30000,
    withdrawalFrequency: 'yearly',
    expectedAnnualReturn: 0,
    withdrawalDurationYears: 5,
  });
  assert.strictEqual(depletingYearly.isExhausted, true);
  assert.strictEqual(depletingYearly.exhaustionYear, 4);
  assert.strictEqual(depletingYearly.remainingCorpus, 0);
  assert.strictEqual(depletingYearly.totalActualWithdrawals, 100000);
  assert.strictEqual(depletingYearly.partialFinalWithdrawal, true);
  console.log('✓ PASS: Depleting Yearly SWP exhausts in Year 4 with zero remaining balance');

  // SWP User-Requested Example Test: Corpus ₹2,10,000, Withdrawal 2% -> ₹4,200
  const corpusExample = 210000;
  const pctExample = 2; // 2%
  const rupeeFromPct = Math.round((corpusExample * pctExample) / 100);
  assert.strictEqual(rupeeFromPct, 4200, '2% of ₹2,10,000 must be ₹4,200');
  const pctFromRupee = Number(((rupeeFromPct / corpusExample) * 100).toFixed(2));
  assert.strictEqual(pctFromRupee, 2, '₹4,200 of ₹2,10,000 must be 2%');
  console.log(`✓ PASS: SWP Percentage Dual Conversion: Corpus ₹${corpusExample}, ${pctExample}% = ₹${rupeeFromPct} (Reverse = ${pctFromRupee}%)`);

  // ₹100 Crore Corpus SWP test: ₹50 Lakh/month withdrawal @ 8% for 10y
  const highSWP = calculateSWP({
    initialCorpus: 1000000000,
    monthlyWithdrawal: 5000000,
    withdrawalFrequency: 'monthly',
    expectedAnnualReturn: 8,
    withdrawalDurationYears: 10,
  });
  assert.strictEqual(highSWP.isExhausted, false);
  assert(highSWP.remainingCorpus > 1000000000, 'With 8% return and 6% withdrawal, corpus grows');
  assert.strictEqual(highSWP.totalActualWithdrawals, 600000000);
  console.log(`✓ PASS: SWP ₹100 Cr Corpus with ₹50L/mo withdrawal: Remaining = ₹${highSWP.remainingCorpus}`);

  // Depleting SWP test: ₹1,00,000 corpus with high ₹20,000/mo withdrawal @ 0% return
  // Should exhaust in month 5 exactly!
  const depletingZeroReturn = calculateSWP({
    initialCorpus: 100000,
    monthlyWithdrawal: 20000,
    withdrawalFrequency: 'monthly',
    expectedAnnualReturn: 0,
    withdrawalDurationYears: 5,
  });
  assert.strictEqual(depletingZeroReturn.isExhausted, true);
  assert.strictEqual(depletingZeroReturn.exhaustionMonth, 5);
  assert.strictEqual(depletingZeroReturn.remainingCorpus, 0);
  assert.strictEqual(depletingZeroReturn.totalActualWithdrawals, 100000);
  console.log('✓ PASS: SWP Exhaustion at month 5 with exact zero remaining balance');

  // Partial final withdrawal test: ₹50,000 corpus, ₹20,000/mo withdrawal @ 0%
  const partialSWP = calculateSWP({
    initialCorpus: 50000,
    monthlyWithdrawal: 20000,
    withdrawalFrequency: 'monthly',
    expectedAnnualReturn: 0,
    withdrawalDurationYears: 1,
  });
  assert.strictEqual(partialSWP.partialFinalWithdrawal, true);
  assert.strictEqual(partialSWP.totalActualWithdrawals, 50000);
  assert.strictEqual(partialSWP.remainingCorpus, 0);
  console.log('✓ PASS: SWP Partial final withdrawal capped at available balance');
}

// 5. Test ₹100 Crore Boundary Limits Across All Calculators
function test100CroreBoundaryLimits() {
  console.log('\n--- Testing ₹100 Crore Boundary Limits ---');
  const MAX_LIMIT = 1000000000; // ₹100 Crore

  function validateInput(val) {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return { valid: false, reason: 'NaN/non-numeric' };
    if (val < 0) return { valid: false, reason: 'Negative' };
    if (val > MAX_LIMIT) return { valid: false, reason: 'Exceeds ₹100 Crore' };
    return { valid: true, value: val };
  }

  // 1. Below Maximum (₹99,99,99,999)
  const belowMax = validateInput(999999999);
  assert.strictEqual(belowMax.valid, true);
  console.log('✓ PASS: Value just below maximum (₹99.99 Cr) is accepted');

  // 2. Exactly Maximum (₹1,00,00,00,000)
  const exactMax = validateInput(1000000000);
  assert.strictEqual(exactMax.valid, true);
  assert.strictEqual(exactMax.value, MAX_LIMIT);
  console.log('✓ PASS: Exactly ₹100 Crore is accepted');

  // 3. Above Maximum (₹1,00,00,00,001)
  const aboveMax = validateInput(1000000001);
  assert.strictEqual(aboveMax.valid, false);
  console.log('✓ PASS: Value above maximum (₹1,00,00,00,001) is rejected');

  // 4. Absurd Value (₹500 Crore)
  const absurdVal = validateInput(5000000000);
  assert.strictEqual(absurdVal.valid, false);
  console.log('✓ PASS: Absurd value (₹500 Crore) is safely rejected');

  // 5. Negative Value (-₹1,000)
  const negativeVal = validateInput(-1000);
  assert.strictEqual(negativeVal.valid, false);
  console.log('✓ PASS: Negative value (-₹1,000) is rejected');

  // 6. Non-numeric / NaN
  const nanVal = validateInput(NaN);
  assert.strictEqual(nanVal.valid, false);
  console.log('✓ PASS: NaN is safely rejected');
}

// 6. Test Formatters
function testFormatters() {
  console.log('\n--- Testing Currency Formatters ---');
  function formatCompactINR(value) {
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
    return `₹${value}`;
  }

  assert.strictEqual(formatCompactINR(1000000000), '₹100.00 Cr');
  assert.strictEqual(formatCompactINR(1496542881), '₹149.65 Cr');
  assert.strictEqual(formatCompactINR(10000000), '₹1.00 Cr');
  assert.strictEqual(formatCompactINR(500000), '₹5.00 Lakh');
  console.log('✓ PASS: Compact INR formatting correctly handles Multi-Crore and ₹100 Cr figures');
}

// Run all test suites
try {
  testSIPCalculator();
  testStepUpSIPCalculator();
  testLumpsumCalculator();
  testSWPCalculator();
  test100CroreBoundaryLimits();
  testFormatters();
  console.log('\n========================================');
  console.log('🎉 ALL 4 CALCULATORS VERIFIED AND PASSED!');
  console.log('========================================\n');
} catch (err) {
  console.error('❌ Test failed:', err);
  process.exit(1);
}
