/**
 * Finance Brunch — Complete Calculator Directory Catalogue
 * 
 * Central registry of calculators with structured metadata:
 * - Identification & SEO routing
 * - Mathematical formulas & assumptions
 * - Worked examples with verified benchmarks
 * - Category groupings & popular tags
 */

export type CalculatorCategory = 
  | 'all'
  | 'investments'
  | 'government'
  | 'loans-tax-salary'
  | 'loans'
  | 'tax'
  | 'trading';

export interface CalculatorFieldConfig {
  id: string;
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit: '₹' | '%' | 'Years' | 'Months' | 'Days' | 'Qty' | 'Number';
  tooltip?: string;
  isCurrency?: boolean;
  isOptional?: boolean;
}

export interface CalculatorMeta {
  id: string;
  slug: string;
  name: string;
  category: CalculatorCategory;
  categoryLabel: string;
  shortDescription: string;
  isPopular?: boolean;
  isPublicDirectory?: boolean;
  formula: string;
  formulaExplanation: string;
  assumptions: string[];
  workedExample: {
    inputSummary: string;
    expectedResult: string;
    explanation: string;
  };
  officialSource?: string;
  disclaimer: string;
  fields: CalculatorFieldConfig[];
}

export const CALCULATOR_CATEGORIES: Array<{ id: CalculatorCategory; label: string; count: number }> = [
  { id: 'all', label: 'All 26 Calculators', count: 26 },
  { id: 'investments', label: 'Mutual Funds & Investments', count: 12 },
  { id: 'government', label: 'Govt. Savings & Investment Schemes', count: 10 },
  { id: 'loans-tax-salary', label: 'Loans, Tax & Salary', count: 4 },
];

export const CALCULATOR_CATALOG: CalculatorMeta[] = [
  // =========================================================================
  // 1. MUTUAL FUNDS AND INVESTMENTS (12 Public, 2 Preserved)
  // =========================================================================
  {
    id: 'sip',
    slug: 'sip-calculator',
    name: 'SIP Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Calculate expected returns on monthly Systematic Investment Plans with rupee-cost averaging.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'FV = P × [((1 + i)ⁿ - 1) / i] × (1 + i)',
    formulaExplanation: 'P = Monthly installment, i = Effective monthly return rate ((1 + r)^(1/12) - 1), n = Total months. Beginning-of-month convention (Annuity Due).',
    assumptions: [
      'Contributions occur at the beginning of each calendar month.',
      'Returns are compounded on a monthly effective basis.',
      'Taxes and fund expense ratios are not deducted.',
    ],
    workedExample: {
      inputSummary: 'Monthly: ₹10,00,000 | Expected Return: 12% p.a. | Tenure: 10 Years',
      expectedResult: 'Invested: ₹12,00,000 | Est. Returns: ₹11,23,391 | Total Value: ₹23,23,391',
      explanation: 'Over 120 months, compounding builds wealth exceeding the principal invested.',
    },
    disclaimer: 'Mutual fund investments are subject to market risks. Read all scheme related documents carefully before investing.',
    fields: [
      { id: 'monthlyInvestment', label: 'Monthly Investment', defaultValue: 10000, min: 500, max: 1000000, step: 500, unit: '₹', isCurrency: true },
      { id: 'expectedAnnualReturn', label: 'Expected Return Rate (p.a.)', defaultValue: 12, min: 1, max: 30, step: 0.5, unit: '%' },
      { id: 'investmentDurationYears', label: 'Time Period', defaultValue: 10, min: 1, max: 40, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'lumpsum',
    slug: 'lumpsum-calculator',
    name: 'Lumpsum Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Calculate the future growth of a one-time lumpsum mutual fund or equity investment.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'FV = P × (1 + r)ⁿ',
    formulaExplanation: 'P = Initial one-time investment, r = Annual return rate in decimal, n = Duration in years.',
    assumptions: [
      'Entire capital is deployed on day 1 with annual compounding.',
      'No intermittent additions or withdrawals.',
    ],
    workedExample: {
      inputSummary: 'Investment: ₹1,00,000 | Expected Return: 12% p.a. | Tenure: 10 Years',
      expectedResult: 'Invested: ₹1,00,000 | Est. Returns: ₹2,10,585 | Total Value: ₹3,10,585',
      explanation: 'Compound interest more than triples the initial capital over 10 years at 12%.',
    },
    disclaimer: 'Equity and mutual fund returns are volatile and cannot be guaranteed.',
    fields: [
      { id: 'initialInvestment', label: 'Total Investment', defaultValue: 100000, min: 1000, max: 10000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'expectedAnnualReturn', label: 'Expected Return Rate (p.a.)', defaultValue: 12, min: 1, max: 30, step: 0.5, unit: '%' },
      { id: 'investmentDurationYears', label: 'Time Period', defaultValue: 10, min: 1, max: 40, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'swp',
    slug: 'swp-calculator',
    name: 'SWP Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Plan periodic systematic cash withdrawals from your mutual fund corpus without rapid depletion.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Balance_t = (Balance_{t-1} - Withdrawal) × (1 + i)',
    formulaExplanation: 'Withdrawal occurs at the beginning of each month, and remaining balance continues to compound.',
    assumptions: [
      'Fixed monthly withdrawal amount.',
      'Remaining balance continues earning expected annual return.',
      'Withdrawals halt if corpus is depleted.',
    ],
    workedExample: {
      inputSummary: 'Corpus: ₹50,00,000 | Monthly Withdrawal: ₹35,000 | Return: 9% | Tenure: 10 Years',
      expectedResult: 'Total Withdrawn: ₹42,00,000 | Remaining Corpus: ₹64,28,479',
      explanation: 'Since the 9% return exceeds the withdrawal rate (~8.4%), the corpus continues to grow.',
    },
    disclaimer: 'Past returns do not guarantee future performance. SWP withdrawals may attract capital gains tax.',
    fields: [
      { id: 'totalCorpus', label: 'Initial Corpus Amount', defaultValue: 5000000, min: 100000, max: 50000000, step: 50000, unit: '₹', isCurrency: true },
      { id: 'monthlyWithdrawal', label: 'Monthly Withdrawal', defaultValue: 35000, min: 1000, max: 500000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'expectedAnnualReturn', label: 'Expected Return Rate (p.a.)', defaultValue: 9, min: 1, max: 20, step: 0.5, unit: '%' },
      { id: 'tenureYears', label: 'Withdrawal Period', defaultValue: 10, min: 1, max: 35, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'mf-returns',
    slug: 'mutual-fund-returns-calculator',
    name: 'Mutual Fund Returns Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Forecast absolute and annualized mutual fund returns across SIP and Lumpsum modes.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'Absolute Return = [(FV - Invested) / Invested] × 100',
    formulaExplanation: 'Differentiates between total percentage gain (Absolute) and compound annual rate (CAGR / Annualized).',
    assumptions: [
      'Compounding continues without entry or exit load deductions.',
    ],
    workedExample: {
      inputSummary: 'Lumpsum: ₹2,00,000 | Expected Return: 14% | Tenure: 5 Years',
      expectedResult: 'Total Value: ₹3,85,082 | Absolute Return: 92.54% | Annualized: 14.00%',
      explanation: 'A 14% annualized return results in a 92.5% absolute gain over 5 years.',
    },
    disclaimer: 'Mutual fund returns vary depending on market conditions and fund manager allocation.',
    fields: [
      { id: 'amount', label: 'Investment Amount', defaultValue: 200000, min: 1000, max: 10000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'expectedReturnRate', label: 'Expected Return Rate (p.a.)', defaultValue: 14, min: 1, max: 30, step: 0.5, unit: '%' },
      { id: 'durationYears', label: 'Time Horizon', defaultValue: 5, min: 1, max: 30, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'step-up-sip',
    slug: 'step-up-sip-calculator',
    name: 'Step-Up SIP Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Calculate accelerated wealth creation by stepping up your monthly SIP with annual salary hikes.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Monthly SIP increases annually: P_{y} = P_{1} × (1 + stepUpPercent)^{y-1}',
    formulaExplanation: 'Models annual step-ups at 12-month boundaries while compounding monthly.',
    assumptions: [
      'Contribution steps up automatically after every 12 months.',
      'Beginning-of-month contribution timing.',
    ],
    workedExample: {
      inputSummary: 'Initial SIP: ₹10,000 | Step-Up: 10% Yearly | Return: 12% | Tenure: 10 Years',
      expectedResult: 'Invested: ₹19,12,491 | Est. Returns: ₹16,21,120 | Total Value: ₹35,33,611',
      explanation: 'A 10% annual step-up boosts the final corpus by over ₹12 Lakhs compared to a flat SIP.',
    },
    disclaimer: 'Higher contributions accelerate wealth creation, but returns depend on market cycles.',
    fields: [
      { id: 'monthlyInvestment', label: 'Initial Monthly Investment', defaultValue: 10000, min: 500, max: 1000000, step: 500, unit: '₹', isCurrency: true },
      { id: 'stepUpPercentage', label: 'Annual Step-Up', defaultValue: 10, min: 1, max: 50, step: 1, unit: '%' },
      { id: 'expectedAnnualReturn', label: 'Expected Return Rate (p.a.)', defaultValue: 12, min: 1, max: 30, step: 0.5, unit: '%' },
      { id: 'investmentDurationYears', label: 'Time Period', defaultValue: 10, min: 1, max: 40, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'step-up-swp',
    slug: 'step-up-swp-calculator',
    name: 'Step-Up SWP Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Plan inflation-adjusted systematic withdrawals with annual percentage increases in payout.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'W_{y} = W_{1} × (1 + stepUpPercent)^{y-1} | Balance_t = (Balance_{t-1} + Interest) - W_y',
    formulaExplanation: 'Increases monthly withdrawal rate annually to protect retirement purchasing power against inflation.',
    assumptions: [
      'Monthly withdrawal steps up automatically after each 12-month period.',
      'Remaining balance earns expected annual compound return.',
      'Withdrawals cease if corpus is exhausted.',
    ],
    workedExample: {
      inputSummary: 'Corpus: ₹50,00,000 | Initial Withdrawal: ₹30,000/mo | Step-Up: 5% Yearly | Return: 9% | Tenure: 10 Yrs',
      expectedResult: 'Total Withdrawn: ₹45,28,348 | Remaining Balance: ~₹55.7 Lakh',
      explanation: 'A 5% step-up counters inflation while the corpus remains well-funded at 9% returns.',
    },
    disclaimer: 'Past performance does not guarantee future results. SWP withdrawals may attract capital gains tax.',
    fields: [
      { id: 'totalCorpus', label: 'Initial Corpus Amount', defaultValue: 5000000, min: 100000, max: 50000000, step: 50000, unit: '₹', isCurrency: true },
      { id: 'monthlyWithdrawal', label: 'Initial Monthly Withdrawal', defaultValue: 30000, min: 1000, max: 500000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'stepUpPercentage', label: 'Annual Step-Up in Withdrawal', defaultValue: 5, min: 1, max: 25, step: 1, unit: '%' },
      { id: 'expectedAnnualReturn', label: 'Expected Return Rate (p.a.)', defaultValue: 9, min: 1, max: 20, step: 0.5, unit: '%' },
      { id: 'tenureYears', label: 'Withdrawal Period', defaultValue: 10, min: 1, max: 35, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'roi',
    slug: 'roi-calculator',
    name: 'ROI Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Measure the exact efficiency and percentage return on an investment or business initiative.',
    isPopular: false,
    isPublicDirectory: true,
    formula: 'ROI = [(Final Value - Initial Investment) / Initial Investment] × 100',
    formulaExplanation: 'Calculates net percentage gain and optional annualized ROI when duration is provided.',
    assumptions: ['Does not include taxes, transaction costs, or inflation adjustments.'],
    workedExample: {
      inputSummary: 'Initial: ₹2,00,000 | Final Value: ₹3,50,000 | Tenure: 3 Years',
      expectedResult: 'Net Profit: ₹1,50,000 | ROI: 75.00% | Annualized ROI: 20.51%',
      explanation: 'A 75% gain over 3 years translates to a 20.51% compound annual rate of return.',
    },
    disclaimer: 'ROI does not account for risk levels or the cost of capital.',
    fields: [
      { id: 'initialInvestment', label: 'Initial Investment', defaultValue: 200000, min: 1000, max: 10000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'finalValue', label: 'Final Value / Returns', defaultValue: 350000, min: 1000, max: 50000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'durationYears', label: 'Holding Period (Optional)', defaultValue: 3, min: 1, max: 30, step: 1, unit: 'Years', isOptional: true },
    ],
  },
  {
    id: 'cagr',
    slug: 'cagr-calculator',
    name: 'CAGR Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Calculate the smooth Compound Annual Growth Rate of investments over multi-year horizons.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'CAGR = (Ending Value / Beginning Value)^(1 / Years) - 1',
    formulaExplanation: 'Smoothens out intermediate annual volatility to reveal the geometric annualized growth rate.',
    assumptions: ['Investments remain invested without intermediate withdrawals.'],
    workedExample: {
      inputSummary: 'Initial: ₹50,000 | Final: ₹1,50,000 | Tenure: 5 Years',
      expectedResult: 'CAGR: 24.57% | Absolute Return: 200.00% | Total Gain: ₹1,00,000',
      explanation: 'Tripling your money over 5 years represents an exceptional 24.57% annual growth rate.',
    },
    disclaimer: 'CAGR does not indicate whether returns were steady or earned mostly in a single volatile year.',
    fields: [
      { id: 'initialValue', label: 'Initial Investment Value', defaultValue: 50000, min: 1000, max: 10000000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'finalValue', label: 'Final Maturity Value', defaultValue: 150000, min: 1000, max: 50000000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'durationYears', label: 'Number of Years', defaultValue: 5, min: 1, max: 30, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'xirr',
    slug: 'xirr-calculator',
    name: 'XIRR Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Determine the accurate annualized return for irregular cash inflows, outflows, and SIPs.',
    isPopular: false,
    isPublicDirectory: true,
    formula: '∑ [ CF_i / (1 + Rate)^((Date_i - Date_0) / 365) ] = 0',
    formulaExplanation: 'High-precision numerical root finder (Newton-Raphson + Bisection) for irregular date cash flows.',
    assumptions: ['All cash flows occurred on the specified calendar dates.'],
    workedExample: {
      inputSummary: 'Inst. 1: -₹10,000 (Day 0) | Inst. 2: -₹10,000 (Month 3) | Redemption: +₹24,000 (Month 12)',
      expectedResult: 'XIRR: ~31.8% | Invested: ₹20,000 | Current: ₹24,000',
      explanation: 'XIRR accounts for the exact number of days each rupee remained invested.',
    },
    disclaimer: 'XIRR requires at least one outflow (negative) and one inflow/current value (positive).',
    fields: [
      { id: 'installment1', label: 'First Investment (Day 0)', defaultValue: 25000, min: 1000, max: 5000000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'installment2', label: 'Second Investment (Day 90)', defaultValue: 0, min: 0, max: 5000000, step: 1000, unit: '₹', isCurrency: true, isOptional: true },
      { id: 'installment3', label: 'Third Investment (Day 180)', defaultValue: 0, min: 0, max: 5000000, step: 1000, unit: '₹', isCurrency: true, isOptional: true },
      { id: 'currentValuation', label: 'Current Valuation (Day 365)', defaultValue: 30000, min: 1000, max: 20000000, step: 1000, unit: '₹', isCurrency: true },
    ],
  },
  {
    id: 'irr',
    slug: 'irr-calculator',
    name: 'IRR Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Calculate the Internal Rate of Return for periodic equal-interval business and investment projects.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'NPV = ∑ [ CF_t / (1 + IRR)ᵗ ] = 0',
    formulaExplanation: 'Finds the discount rate that makes the Net Present Value of all periodic cash flows equal zero.',
    assumptions: ['Cash flows occur at regular periodic intervals (annual or quarterly).'],
    workedExample: {
      inputSummary: 'Initial Outflow: -₹1,00,000 | Year 1: ₹30,000 | Year 2: ₹40,000 | Year 3: ₹55,000',
      expectedResult: 'IRR: 11.65% | Total Inflows: ₹1,25,000 | Net Gain: ₹25,000',
      explanation: 'The internal rate of return equates future cash flows to the initial investment.',
    },
    disclaimer: 'IRR assumes all interim cash flows are reinvested at the same rate of return.',
    fields: [
      { id: 'initialOutflow', label: 'Initial Outflow / Investment', defaultValue: 100000, min: 1000, max: 10000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'cashFlow1', label: 'Year 1 Inflow', defaultValue: 30000, min: 0, max: 10000000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'cashFlow2', label: 'Year 2 Inflow', defaultValue: 40000, min: 0, max: 10000000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'cashFlow3', label: 'Year 3 Inflow', defaultValue: 55000, min: 0, max: 10000000, step: 1000, unit: '₹', isCurrency: true },
    ],
  },
  {
    id: 'stock-average',
    slug: 'stock-average-calculator',
    name: 'Stock Average Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Calculate weighted average price per share across multiple buy orders and compute unrealized P&L.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Avg Price = (∑ Qty_i × Price_i) / (∑ Qty_i)',
    formulaExplanation: 'Weights each purchase price by its respective quantity to derive the break-even holding price.',
    assumptions: ['Does not include statutory exchange charges or brokerage fees.'],
    workedExample: {
      inputSummary: 'Lot 1: 50 shares @ ₹400 | Lot 2: 100 shares @ ₹340 | CMP: ₹380',
      expectedResult: 'Total Shares: 150 | Avg Price: ₹360.00 | Total Invested: ₹54,000 | Unrealized Profit: +₹3,000',
      explanation: 'Averaging down reduced the break-even price from ₹400 to ₹360.',
    },
    disclaimer: 'Averaging down on fundamentally weak stocks increases capital risk.',
    fields: [
      { id: 'qty1', label: 'Lot 1 Quantity', defaultValue: 50, min: 1, max: 100000, step: 1, unit: 'Qty' },
      { id: 'price1', label: 'Lot 1 Buy Price', defaultValue: 400, min: 1, max: 500000, step: 1, unit: '₹', isCurrency: true },
      { id: 'qty2', label: 'Lot 2 Quantity', defaultValue: 100, min: 1, max: 100000, step: 1, unit: 'Qty' },
      { id: 'price2', label: 'Lot 2 Buy Price', defaultValue: 340, min: 1, max: 500000, step: 1, unit: '₹', isCurrency: true },
      { id: 'cmp', label: 'Current Market Price (CMP)', defaultValue: 380, min: 1, max: 500000, step: 1, unit: '₹', isCurrency: true },
    ],
  },
  {
    id: 'inflation',
    slug: 'inflation-calculator',
    name: 'Inflation Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Discover the future cost of living and the eroding purchasing power of money over time.',
    isPopular: false,
    isPublicDirectory: true,
    formula: 'Future Cost = PV × (1 + r)ⁿ | Purchasing Power = PV / (1 + r)ⁿ',
    formulaExplanation: 'Computes future expense escalation and what future funds would be equivalent to today.',
    assumptions: ['Inflation rate remains constant over the chosen time horizon.'],
    workedExample: {
      inputSummary: 'Current Cost: ₹50,000/mo | Inflation: 6% p.a. | Tenure: 15 Years',
      expectedResult: 'Future Cost: ₹1,19,828/mo | Cost Multiplier: 2.40x | Purchasing Power of ₹50k: ₹20,863',
      explanation: 'At 6% inflation, living expenses more than double in 15 years.',
    },
    disclaimer: 'Actual CPI and lifestyle inflation rates vary widely across categories (education, healthcare).',
    fields: [
      { id: 'currentAmount', label: 'Current Expense / Amount', defaultValue: 50000, min: 1000, max: 10000000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'annualInflationRate', label: 'Expected Inflation Rate (p.a.)', defaultValue: 6, min: 1, max: 20, step: 0.5, unit: '%' },
      { id: 'timeHorizonYears', label: 'Time Horizon', defaultValue: 15, min: 1, max: 40, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'fire',
    slug: 'fire-calculator',
    name: 'FIRE Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Calculate the target net worth needed for Financial Independence and Early Retirement.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Target Corpus = Annual Expenses at FIRE / Safe Withdrawal Rate (e.g. 25x rule at 4%)',
    formulaExplanation: 'Inflates current expenses to the target FIRE age, then computes corpus using SWR.',
    assumptions: [
      'Lifestyle expenses inflate annually at the entered rate.',
      'Corpus maintains sustained returns post-retirement.',
    ],
    workedExample: {
      inputSummary: 'Age: 30 | FIRE Age: 45 | Expenses: ₹60,000/mo | Inflation: 6% | SWR: 4% (25x rule)',
      expectedResult: 'Target Corpus: ₹3.59 Cr | Annual Expense at 45: ₹14.38 Lakh | Monthly SIP Needed: ₹71,280',
      explanation: 'Retiring at 45 requires ₹3.59 Cr to safely withdraw ₹14.4 Lakh per year indefinitely.',
    },
    disclaimer: 'Safe withdrawal rates should be reviewed periodically based on sequence-of-returns risk.',
    fields: [
      { id: 'currentAge', label: 'Current Age', defaultValue: 30, min: 18, max: 60, step: 1, unit: 'Years' },
      { id: 'targetFireAge', label: 'Target FIRE Age', defaultValue: 45, min: 25, max: 65, step: 1, unit: 'Years' },
      { id: 'currentMonthlyExpenses', label: 'Current Monthly Expenses', defaultValue: 60000, min: 10000, max: 1000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'expectedInflationRate', label: 'Expected Inflation Rate (p.a.)', defaultValue: 6, min: 3, max: 15, step: 0.5, unit: '%' },
      { id: 'safeWithdrawalRate', label: 'Safe Withdrawal Rate', defaultValue: 4, min: 2.5, max: 6, step: 0.25, unit: '%' },
      { id: 'currentSavings', label: 'Current Investments / Savings', defaultValue: 0, min: 0, max: 50000000, step: 50000, unit: '₹', isCurrency: true, isOptional: true },
    ],
  },
  {
    id: 'retirement',
    slug: 'retirement-calculator',
    name: 'Retirement Corpus Calculator',
    category: 'investments',
    categoryLabel: 'Mutual Funds & Investments',
    shortDescription: 'Plan your retirement corpus, shortfall, and required monthly savings to live comfortably.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Corpus = Annual Expense × [(1 - (1 + RealRate)⁻ⁿ) / RealRate]',
    formulaExplanation: 'Computes growing annuity present value accounting for inflation and post-retirement yield.',
    assumptions: [
      'Retirement lasts until the entered life expectancy age.',
      'Post-retirement portfolio earns conservative return above inflation.',
    ],
    workedExample: {
      inputSummary: 'Age: 30 | Retire: 60 | Life Exp: 80 | Expenses: ₹40,000/mo | Inflation: 6% | Return: 12% Pre / 8% Post',
      expectedResult: 'Required Corpus: ₹4.14 Cr | Monthly Expense at 60: ₹2,29,740 | Monthly SIP Needed: ₹11,745',
      explanation: 'Starting early at age 30 allows you to reach a ₹4.14 Cr retirement goal with just ₹11,745/month.',
    },
    disclaimer: 'Healthcare costs typically increase faster than general CPI in post-retirement years.',
    fields: [
      { id: 'currentAge', label: 'Current Age', defaultValue: 30, min: 18, max: 60, step: 1, unit: 'Years' },
      { id: 'retirementAge', label: 'Retirement Age', defaultValue: 60, min: 45, max: 70, step: 1, unit: 'Years' },
      { id: 'lifeExpectancy', label: 'Life Expectancy', defaultValue: 80, min: 65, max: 100, step: 1, unit: 'Years' },
      { id: 'currentMonthlyExpenses', label: 'Current Monthly Expenses', defaultValue: 40000, min: 5000, max: 1000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'expectedInflationRate', label: 'Expected Inflation Rate', defaultValue: 6, min: 3, max: 12, step: 0.5, unit: '%' },
      { id: 'preRetirementReturnRate', label: 'Pre-Retirement Return (p.a.)', defaultValue: 12, min: 6, max: 20, step: 0.5, unit: '%' },
      { id: 'postRetirementReturnRate', label: 'Post-Retirement Return (p.a.)', defaultValue: 8, min: 4, max: 14, step: 0.5, unit: '%' },
    ],
  },

  // =========================================================================
  // 2. GOVERNMENT SAVINGS AND INVESTMENT SCHEMES (10)
  // =========================================================================
  {
    id: 'ssy',
    slug: 'ssy-calculator',
    name: 'Sukanya Samriddhi Yojana (SSY) Calculator',
    category: 'government',
    categoryLabel: 'Govt. Savings & Investment Schemes',
    shortDescription: 'Calculate maturity corpus under the government girl child scheme with guaranteed 8.2% p.a. interest.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Compounded Annually over 21 Years (Deposits for first 15 years)',
    formulaExplanation: 'Official rate 8.2% p.a. compounded annually. Contributions mandatory for first 15 years; matures after 21 years.',
    assumptions: [
      'Annual deposit occurs at the beginning of each financial year (by April 5th).',
      'Interest rate of 8.2% p.a. remains constant over the tenure.',
      'Maximum ₹1,50,000 per financial year per girl child.',
    ],
    workedExample: {
      inputSummary: 'Annual Deposit: ₹1,50,000 | Tenure: 21 Years | Rate: 8.2% p.a.',
      expectedResult: 'Total Deposited: ₹22,50,000 | Interest Earned: ₹46,77,578 | Maturity Value: ₹69,27,578',
      explanation: 'Over 21 years, the government scheme yields triple the deposited capital under full EEE tax exemption.',
    },
    officialSource: 'Ministry of Finance Notification F.No.1/4/2019-NS (Effective 1 Jan 2024)',
    disclaimer: 'Government small savings rates are reviewed quarterly by the Ministry of Finance.',
    fields: [
      { id: 'yearlyDeposit', label: 'Yearly Deposit Amount', defaultValue: 150000, min: 250, max: 150000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'girlChildAge', label: 'Girl Child Age', defaultValue: 3, min: 0, max: 10, step: 1, unit: 'Years' },
      { id: 'interestRate', label: 'Official Interest Rate', defaultValue: 8.2, min: 7, max: 10, step: 0.1, unit: '%' },
    ],
  },
  {
    id: 'ppf',
    slug: 'ppf-calculator',
    name: 'PPF Calculator',
    category: 'government',
    categoryLabel: 'Govt. Savings & Investment Schemes',
    shortDescription: 'Calculate guaranteed tax-free returns under Public Provident Fund (7.1% p.a.) with Section 80C benefits.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'A = P × [((1 + r)ⁿ - 1) / r] × (1 + r)',
    formulaExplanation: 'Official 7.1% p.a. interest compounded annually at year end on minimum balance between 5th and last day of month.',
    assumptions: [
      'Deposits made on or before 5th of April each year to maximize full-year interest.',
      'Standard 15-year lock-in period.',
      'Annual contribution cap of ₹1,50,000.',
    ],
    workedExample: {
      inputSummary: 'Yearly Deposit: ₹1,50,000 | Tenure: 15 Years | Rate: 7.1% p.a.',
      expectedResult: 'Total Deposited: ₹22,50,000 | Interest Earned: ₹18,18,209 | Maturity Value: ₹40,68,209',
      explanation: 'Generates ₹40.68 Lakhs completely tax-free under EEE status.',
    },
    officialSource: 'Ministry of Finance Notification F.No.1/4/2019-NS',
    disclaimer: 'PPF interest rates are notified quarterly by the Government of India.',
    fields: [
      { id: 'yearlyDeposit', label: 'Yearly Deposit Amount', defaultValue: 150000, min: 500, max: 150000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'durationYears', label: 'Duration', defaultValue: 15, min: 15, max: 30, step: 5, unit: 'Years' },
      { id: 'interestRate', label: 'Official Interest Rate', defaultValue: 7.1, min: 6, max: 9, step: 0.1, unit: '%' },
    ],
  },
  {
    id: 'epf',
    slug: 'epf-calculator',
    name: 'EPF Calculator',
    category: 'government',
    categoryLabel: 'Govt. Savings & Investment Schemes',
    shortDescription: 'Calculate your Employee Provident Fund retirement corpus with 8.25% interest and employer share.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Employee: 12% of Basic+DA | Employer: 3.67% to EPF (8.33% to EPS capped at ₹1,250)',
    formulaExplanation: 'Compounded annually at 8.25% p.a. based on CBT EPFO notification.',
    assumptions: [
      'Employee contributes 12% of Basic + DA.',
      'Employer contributes 3.67% to EPF and 8.33% to EPS (capped at ₹15,000 wage ceiling).',
      'Salary steps up annually with increment rate.',
    ],
    workedExample: {
      inputSummary: 'Basic+DA: ₹40,000/mo | Current Age: 28 | Retires at: 58 | Hike: 5% | EPF Rate: 8.25%',
      expectedResult: 'Total Corpus: ₹1.46 Cr | Employee Share: ₹36.8 Lakh | Employer Share: ₹11.2 Lakh | Interest: ₹98.0 Lakh',
      explanation: 'EPF compounding over a 30-year career generates a significant ₹1.46 Cr tax-exempt retirement fund.',
    },
    officialSource: 'Employees Provident Fund Organisation (EPFO), Ministry of Labour',
    disclaimer: 'Contributions beyond ₹2.5 Lakh per year by the employee attract tax on interest u/s Finance Act 2021.',
    fields: [
      { id: 'monthlyBasicPlusDA', label: 'Monthly Basic Salary + DA', defaultValue: 40000, min: 15000, max: 1000000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'currentAge', label: 'Current Age', defaultValue: 28, min: 18, max: 55, step: 1, unit: 'Years' },
      { id: 'retirementAge', label: 'Retirement Age', defaultValue: 58, min: 55, max: 65, step: 1, unit: 'Years' },
      { id: 'annualSalaryIncrementRate', label: 'Annual Salary Hike', defaultValue: 5, min: 0, max: 20, step: 0.5, unit: '%' },
      { id: 'existingEpfBalance', label: 'Current EPF Balance (if any)', defaultValue: 0, min: 0, max: 50000000, step: 10000, unit: '₹', isCurrency: true, isOptional: true },
    ],
  },
  {
    id: 'fd',
    slug: 'fd-calculator',
    name: 'FD Calculator',
    category: 'government',
    categoryLabel: 'Govt. Savings & Investment Schemes',
    shortDescription: 'Calculate maturity value and interest payout for bank fixed deposits with quarterly compounding.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Cumulative: A = P × (1 + r/4)^(4×t) | Non-Cumulative: Interest = P × r × t',
    formulaExplanation: 'Quarterly compounding is the standard Indian banking norm for cumulative FDs.',
    assumptions: [
      'Quarterly compounding convention followed by all Indian Scheduled Commercial Banks.',
      'Senior citizens typically receive an additional 0.50% interest rate.',
    ],
    workedExample: {
      inputSummary: 'Deposit: ₹5,00,000 | Rate: 7.25% p.a. | Tenure: 5 Years | Cumulative',
      expectedResult: 'Invested: ₹5,00,000 | Interest Earned: ₹2,15,417 | Maturity Amount: ₹7,15,417',
      explanation: 'Quarterly compounding yields an effective annual return of 7.45%.',
    },
    officialSource: 'Reserve Bank of India (RBI) Bank Regulations',
    disclaimer: 'Bank deposits are insured up to ₹5,00,000 per depositor per bank by DICGC.',
    fields: [
      { id: 'depositAmount', label: 'Deposit Amount', defaultValue: 500000, min: 5000, max: 50000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'annualInterestRate', label: 'Annual Interest Rate', defaultValue: 7.25, min: 3, max: 12, step: 0.05, unit: '%' },
      { id: 'tenureYears', label: 'Tenure', defaultValue: 5, min: 1, max: 10, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'rd',
    slug: 'rd-calculator',
    name: 'Recurring Deposit (RD) Calculator',
    category: 'government',
    categoryLabel: 'Govt. Savings & Investment Schemes',
    shortDescription: 'Calculate total maturity amount for monthly recurring deposits with quarterly compounding.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'M = ∑ [ P × (1 + r/4)^(4 × (n - i + 1) / 12) ]',
    formulaExplanation: 'Post office and bank quarterly compounding convention applied to each monthly installment.',
    assumptions: [
      'Installments are paid regularly on the designated monthly due date.',
      'Interest is compounded quarterly in line with Indian banking practice.',
    ],
    workedExample: {
      inputSummary: 'Monthly: ₹5,000 | Rate: 6.7% p.a. | Tenure: 60 Months (5 Years)',
      expectedResult: 'Total Deposited: ₹3,00,000 | Interest Earned: ₹56,830 | Maturity Amount: ₹3,56,830',
      explanation: 'Small regular savings of ₹5,000 accumulate to over ₹3.56 Lakhs with assured returns.',
    },
    officialSource: 'India Post 5-Year National Savings Recurring Deposit Account Rules',
    disclaimer: 'TDS applies on RD interest if total interest across bank branches exceeds ₹40,000 in a FY.',
    fields: [
      { id: 'monthlyDeposit', label: 'Monthly Deposit Amount', defaultValue: 5000, min: 500, max: 500000, step: 500, unit: '₹', isCurrency: true },
      { id: 'annualInterestRate', label: 'Interest Rate (p.a.)', defaultValue: 6.7, min: 3, max: 12, step: 0.1, unit: '%' },
      { id: 'tenureMonths', label: 'Tenure (Months)', defaultValue: 60, min: 6, max: 120, step: 6, unit: 'Months' },
    ],
  },
  {
    id: 'nsc',
    slug: 'nsc-calculator',
    name: 'NSC Calculator',
    category: 'government',
    categoryLabel: 'Govt. Savings & Investment Schemes',
    shortDescription: 'Calculate guaranteed 5-year post office NSC returns at 7.7% interest with Section 80C tax deduction.',
    isPopular: false,
    isPublicDirectory: true,
    formula: 'A = P × (1 + r)⁵',
    formulaExplanation: 'Interest compounded annually at 7.7% p.a. and paid at maturity after 5 years.',
    assumptions: [
      'Fixed 5-year lock-in period.',
      'Interest for years 1-4 is deemed reinvested and eligible for Section 80C deduction.',
    ],
    workedExample: {
      inputSummary: 'Investment: ₹1,00,000 | Rate: 7.7% p.a. | Tenure: 5 Years',
      expectedResult: 'Invested: ₹1,00,000 | Interest: ₹44,903 | Maturity Amount: ₹1,44,903',
      explanation: 'A ₹1,00,000 certificate matures to ₹1,44,903 backed by sovereign government guarantee.',
    },
    officialSource: 'Ministry of Finance Notification F.No.1/4/2019-NS',
    disclaimer: 'Interest in the final 5th year is taxable as income from other sources.',
    fields: [
      { id: 'investmentAmount', label: 'Investment Amount', defaultValue: 100000, min: 1000, max: 10000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'interestRate', label: 'Official Interest Rate', defaultValue: 7.7, min: 6, max: 10, step: 0.1, unit: '%' },
    ],
  },
  {
    id: 'apy',
    slug: 'apy-calculator',
    name: 'Atal Pension Yojana (APY) Calculator',
    category: 'government',
    categoryLabel: 'Govt. Savings & Investment Schemes',
    shortDescription: 'Calculate required monthly contributions for guaranteed lifetime pensions of ₹1,000 to ₹5,000/mo.',
    isPopular: false,
    isPublicDirectory: true,
    formula: 'PFRDA Statutory Age Matrix Contribution Schedule',
    formulaExplanation: 'Determines monthly contribution based on subscriber entry age (18-40) and selected pension slab.',
    assumptions: [
      'Guaranteed monthly pension starts after completing 60 years of age.',
      'Same pension continues to spouse upon death; nominee receives statutory accumulated corpus.',
    ],
    workedExample: {
      inputSummary: 'Entry Age: 25 | Desired Pension: ₹5,000/month',
      expectedResult: 'Monthly Contribution: ₹376 | Total Contributed: ₹1.58 Lakh | Nominee Corpus: ₹8.50 Lakh',
      explanation: 'Investing just ₹376/month guarantees a lifetime pension of ₹5,000/month after age 60.',
    },
    officialSource: 'PFRDA / Ministry of Finance Atal Pension Yojana Schedule',
    disclaimer: 'Income tax payers joining after 1 October 2022 are not eligible to enroll in APY.',
    fields: [
      { id: 'currentAge', label: 'Subscriber Entry Age', defaultValue: 25, min: 18, max: 40, step: 1, unit: 'Years' },
      { id: 'desiredMonthlyPension', label: 'Desired Monthly Pension', defaultValue: 5000, min: 1000, max: 5000, step: 1000, unit: '₹', isCurrency: true },
    ],
  },
  {
    id: 'po-mis',
    slug: 'post-office-mis-calculator',
    name: 'Post Office Monthly Income Scheme (MIS) Calculator',
    category: 'government',
    categoryLabel: 'Govt. Savings & Investment Schemes',
    shortDescription: 'Calculate monthly guaranteed passive income from Post Office Monthly Income Scheme (7.4% p.a.).',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Monthly Income = (Deposit Amount × 7.4%) / 12',
    formulaExplanation: 'Guaranteed monthly interest payout for 5 years with principal returned 100% intact at maturity.',
    assumptions: [
      'Maximum deposit limit: ₹9,00,000 for single account, ₹15,00,000 for joint account.',
      '5-year fixed maturity.',
    ],
    workedExample: {
      inputSummary: 'Deposit: ₹9,00,000 (Max Single) | Rate: 7.4% p.a. | Tenure: 5 Years',
      expectedResult: 'Monthly Income: ₹5,550 | Annual Income: ₹66,600 | Total Payout (5 Yrs): ₹3,33,000',
      explanation: 'Yields a dependable ₹5,550 monthly income directly credited to your savings account.',
    },
    officialSource: 'Department of Posts, Ministry of Communications',
    disclaimer: 'Premature closure allowed after 1 year with statutory discount deduction (1% or 2%).',
    fields: [
      { id: 'depositAmount', label: 'Deposit Amount', defaultValue: 900000, min: 1000, max: 1500000, step: 10000, unit: '₹', isCurrency: true },
      { id: 'interestRate', label: 'Official Interest Rate', defaultValue: 7.4, min: 6, max: 9, step: 0.1, unit: '%' },
    ],
  },
  {
    id: 'scss',
    slug: 'scss-calculator',
    name: 'Senior Citizens Savings Scheme (SCSS) Calculator',
    category: 'government',
    categoryLabel: 'Govt. Savings & Investment Schemes',
    shortDescription: 'Calculate quarterly interest income for seniors (age 60+) with guaranteed 8.2% p.a. return.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Quarterly Payout = (Deposit Amount × 8.2%) / 4',
    formulaExplanation: 'Statutory government interest paid on the 1st of April, July, October, and January.',
    assumptions: [
      'For individuals aged 60+ (or 55+ for retired under VRS).',
      'Enhanced maximum deposit cap of ₹30,00,000.',
      'Tenure is 5 years, extendable by 3 years.',
    ],
    workedExample: {
      inputSummary: 'Deposit: ₹15,00,000 | Rate: 8.2% p.a. | Tenure: 5 Years',
      expectedResult: 'Quarterly Payout: ₹30,750 | Annual Income: ₹1,23,000 | Total 5-Yr Income: ₹6,15,000',
      explanation: 'Provides quarterly income of ₹30,750 while preserving the ₹15 Lakh principal intact.',
    },
    officialSource: 'Ministry of Finance Notification F.No.1/4/2019-NS',
    disclaimer: 'SCSS interest is fully taxable. TDS applies if annual interest exceeds ₹50,000 for senior citizens.',
    fields: [
      { id: 'depositAmount', label: 'Deposit Amount', defaultValue: 1500000, min: 10000, max: 3000000, step: 25000, unit: '₹', isCurrency: true },
      { id: 'interestRate', label: 'Official Interest Rate', defaultValue: 8.2, min: 7, max: 10, step: 0.1, unit: '%' },
    ],
  },
  {
    id: 'nps',
    slug: 'nps-calculator',
    name: 'National Pension System (NPS) Calculator',
    category: 'government',
    categoryLabel: 'Govt. Savings & Investment Schemes',
    shortDescription: 'Forecast your National Pension System corpus, tax-free lumpsum withdrawal, and monthly annuity.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Corpus = Monthly SIP compounded; Min 40% utilized for Annuity pension, up to 60% Lumpsum',
    formulaExplanation: 'Models asset allocation growth till age 60, followed by statutory annuity conversion.',
    assumptions: [
      'Compounding continues until retirement at age 60.',
      'Minimum 40% of maturity corpus must be converted into life annuity.',
      'Up to 60% corpus can be withdrawn tax-free as lumpsum.',
    ],
    workedExample: {
      inputSummary: 'Monthly: ₹10,000 | Age: 30 to 60 (30 Yrs) | Return: 10% | Annuity: 40% @ 6%',
      expectedResult: 'Total Corpus: ₹2.28 Cr | Lumpsum (60%): ₹1.37 Cr | Monthly Pension: ₹45,590',
      explanation: 'A ₹10k monthly contribution yields ₹1.37 Cr tax-free lumpsum plus a ₹45.5k monthly pension for life.',
    },
    officialSource: 'PFRDA / National Pension System Trust Benchmark Guidelines',
    disclaimer: 'NPS returns are market-linked across equity (E), corporate debt (C), and government bonds (G).',
    fields: [
      { id: 'monthlyContribution', label: 'Monthly Contribution', defaultValue: 10000, min: 500, max: 500000, step: 500, unit: '₹', isCurrency: true },
      { id: 'currentAge', label: 'Current Age', defaultValue: 30, min: 18, max: 55, step: 1, unit: 'Years' },
      { id: 'expectedAnnualReturnRate', label: 'Expected Return Rate (p.a.)', defaultValue: 10, min: 6, max: 16, step: 0.5, unit: '%' },
      { id: 'annuityPercentage', label: 'Annuity Purchase Share', defaultValue: 40, min: 40, max: 100, step: 5, unit: '%' },
      { id: 'expectedAnnuityReturnRate', label: 'Expected Annuity Rate', defaultValue: 6, min: 4, max: 9, step: 0.25, unit: '%' },
    ],
  },

  // =========================================================================
  // 3. LOANS, TAX AND SALARY (4 Public) & PRESERVED LOANS
  // =========================================================================
  {
    id: 'home-loan-emi',
    slug: 'home-loan-emi-calculator',
    name: 'Home Loan EMI Calculator',
    category: 'loans-tax-salary',
    categoryLabel: 'Loans, Tax & Salary',
    shortDescription: 'Plan your home loan EMI, view multi-year amortization, and see interest savings with prepayments.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ - 1)',
    formulaExplanation: 'Standard reducing balance EMI with optional annual prepayment simulation.',
    assumptions: [
      'Floating rates are assumed steady over the tenure.',
      'Prepayments directly reduce the principal balance.',
    ],
    workedExample: {
      inputSummary: 'Loan: ₹40,00,000 | Rate: 8.5% p.a. | Tenure: 20 Years | Annual Prepay: ₹50,000',
      expectedResult: 'Monthly EMI: ₹34,713 | Total Interest: ₹43.3 Lakh | Prepayment Saves: ~₹8.4 Lakh & 38 Months',
      explanation: 'An extra ₹50,000 paid once a year cuts more than 3 years off your loan.',
    },
    disclaimer: 'Home loan interest is eligible for tax deduction u/s 24(b) up to ₹2,00,000/yr for self-occupied property.',
    fields: [
      { id: 'loanAmount', label: 'Home Loan Amount', defaultValue: 4000000, min: 100000, max: 100000000, step: 100000, unit: '₹', isCurrency: true },
      { id: 'annualInterestRate', label: 'Interest Rate (p.a.)', defaultValue: 8.5, min: 6.5, max: 15, step: 0.1, unit: '%' },
      { id: 'tenureYears', label: 'Tenure', defaultValue: 20, min: 1, max: 30, step: 1, unit: 'Years' },
      { id: 'annualPrepayment', label: 'Annual Prepayment (Optional)', defaultValue: 0, min: 0, max: 1000000, step: 10000, unit: '₹', isCurrency: true, isOptional: true },
    ],
  },
  {
    id: 'car-loan-emi',
    slug: 'car-loan-emi-calculator',
    name: 'Car and Personal Loan Calculator',
    category: 'loans-tax-salary',
    categoryLabel: 'Loans, Tax & Salary',
    shortDescription: 'Calculate vehicle and personal loan monthly payments, down payment impact, and total financing costs.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Loan = On-Road Price - Down Payment; EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)',
    formulaExplanation: 'Calculates net finance required after down payment and computes exact monthly installment.',
    assumptions: ['Tenure typically ranges between 1 and 7 years.'],
    workedExample: {
      inputSummary: 'Car Price: ₹12,00,000 | Down Payment: ₹3,00,000 | Loan: ₹9,00,000 @ 9.0% for 5 Years',
      expectedResult: 'Monthly EMI: ₹18,682 | Total Interest: ₹2,20,909 | Total Car Cost: ₹14,29,909',
      explanation: 'Financing ₹9 Lakhs for 5 years at 9% incurs ₹2.21 Lakh in total interest.',
    },
    disclaimer: 'Insurance, road tax, and extended warranties are included in on-road price estimates.',
    fields: [
      { id: 'vehicleOnRoadPrice', label: 'On-Road Vehicle Price', defaultValue: 1200000, min: 200000, max: 20000000, step: 25000, unit: '₹', isCurrency: true },
      { id: 'downPayment', label: 'Down Payment Amount (Optional)', defaultValue: 0, min: 0, max: 15000000, step: 25000, unit: '₹', isCurrency: true, isOptional: true },
      { id: 'annualInterestRate', label: 'Interest Rate (p.a.)', defaultValue: 9.0, min: 6.5, max: 18, step: 0.25, unit: '%' },
      { id: 'tenureYears', label: 'Loan Tenure', defaultValue: 5, min: 1, max: 7, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'emi',
    slug: 'emi-calculator',
    name: 'EMI Calculator',
    category: 'loans',
    categoryLabel: 'Loans & Interest',
    shortDescription: 'Calculate exact Equated Monthly Installments (EMI), interest breakdown, and amortization schedule.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ - 1)',
    formulaExplanation: 'P = Principal loan amount, r = Monthly interest rate (Annual / 12 / 100), n = Tenure in months.',
    assumptions: [
      'Interest is calculated on reducing balance method.',
      'Installment amount is paid monthly without missing payments.',
    ],
    workedExample: {
      inputSummary: 'Loan: ₹10,00,000 | Interest Rate: 10.5% p.a. | Tenure: 5 Years (60 Months)',
      expectedResult: 'Monthly EMI: ₹21,494 | Total Interest: ₹2,89,634 | Total Payment: ₹12,89,634',
      explanation: 'Total interest represents ~29% of the principal borrowed over 5 years.',
    },
    disclaimer: 'Bank processing fees, documentation charges, and GST are not included in basic EMI.',
    fields: [
      { id: 'loanAmount', label: 'Loan Amount', defaultValue: 1000000, min: 10000, max: 50000000, step: 25000, unit: '₹', isCurrency: true },
      { id: 'annualInterestRate', label: 'Interest Rate (p.a.)', defaultValue: 10.5, min: 1, max: 36, step: 0.25, unit: '%' },
      { id: 'tenureYears', label: 'Loan Tenure', defaultValue: 5, min: 1, max: 30, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'simple-interest',
    slug: 'simple-interest-calculator',
    name: 'Simple Interest Calculator',
    category: 'loans',
    categoryLabel: 'Loans & Interest',
    shortDescription: 'Calculate simple non-compounding interest on principal loans and deposits effortlessly.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'SI = (P × R × T) / 100',
    formulaExplanation: 'P = Principal amount, R = Annual interest rate in %, T = Time period in years.',
    assumptions: ['Interest does not earn interest; calculated strictly on initial principal.'],
    workedExample: {
      inputSummary: 'Principal: ₹1,00,000 | Rate: 8% p.a. | Time: 4 Years',
      expectedResult: 'Simple Interest: ₹32,000 | Total Amount: ₹1,32,000',
      explanation: 'Each year yields an identical ₹8,000 interest payout.',
    },
    disclaimer: 'Simple interest is generally used for short-term personal and informal financing.',
    fields: [
      { id: 'principalAmount', label: 'Principal Amount', defaultValue: 100000, min: 1000, max: 10000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'annualInterestRate', label: 'Annual Interest Rate', defaultValue: 8, min: 0.5, max: 30, step: 0.25, unit: '%' },
      { id: 'timePeriodYears', label: 'Time Period', defaultValue: 4, min: 1, max: 30, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'compound-interest',
    slug: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    category: 'loans',
    categoryLabel: 'Loans & Interest',
    shortDescription: 'Calculate compound interest across Annually, Half-Yearly, Quarterly, Monthly and Daily frequencies.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'A = P × (1 + r/n)^(n×t)',
    formulaExplanation: 'P = Principal, r = Annual rate, n = Compounding frequency per year, t = Time in years.',
    assumptions: ['Interest earned is reinvested automatically at each compounding period.'],
    workedExample: {
      inputSummary: 'Principal: ₹1,00,000 | Rate: 10% | Time: 5 Years | Frequency: Quarterly (n=4)',
      expectedResult: 'Maturity Amount: ₹1,63,862 | Compound Interest: ₹63,862',
      explanation: 'Quarterly compounding produces ₹63,862 vs ₹50,000 under simple interest.',
    },
    disclaimer: 'Higher compounding frequencies generate marginally higher effective yields.',
    fields: [
      { id: 'principalAmount', label: 'Principal Amount', defaultValue: 100000, min: 1000, max: 10000000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'annualInterestRate', label: 'Annual Interest Rate', defaultValue: 10, min: 0.5, max: 30, step: 0.25, unit: '%' },
      { id: 'timePeriodYears', label: 'Time Period', defaultValue: 5, min: 1, max: 30, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'flat-vs-reducing',
    slug: 'flat-vs-reducing-rate-calculator',
    name: 'Flat vs Reducing Interest Rate Calculator',
    category: 'loans',
    categoryLabel: 'Loans & Interest',
    shortDescription: 'Expose the true effective cost difference between misleading flat interest rates and reducing rates.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'Flat: Interest = P × R × T | Reducing: EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)',
    formulaExplanation: 'Reveals that a stated 8% flat rate is actually equivalent to nearly ~14.7% on reducing balance.',
    assumptions: ['Compares identical principal and loan tenure.'],
    workedExample: {
      inputSummary: 'Loan: ₹5,00,000 | Stated Rate: 8% | Tenure: 5 Years',
      expectedResult: 'Flat Total Interest: ₹2,00,000 | Reducing Total Interest: ₹1,08,292 | Difference Paid: ₹91,708',
      explanation: 'Borrowers pay ₹91,708 more under flat rate because interest continues on paid-off balance.',
    },
    disclaimer: 'Always ask lenders for the Annual Percentage Rate (APR) or reducing balance equivalent rate.',
    fields: [
      { id: 'loanAmount', label: 'Loan Amount', defaultValue: 500000, min: 25000, max: 10000000, step: 25000, unit: '₹', isCurrency: true },
      { id: 'interestRate', label: 'Stated Interest Rate', defaultValue: 8, min: 2, max: 25, step: 0.25, unit: '%' },
      { id: 'tenureYears', label: 'Loan Tenure', defaultValue: 5, min: 1, max: 10, step: 1, unit: 'Years' },
    ],
  },

  // =========================================================================
  // 4. TAX, SALARY AND EMPLOYMENT (PRESERVED & PUBLIC)
  // =========================================================================
  {
    id: 'hra',
    slug: 'hra-calculator',
    name: 'HRA Calculator',
    category: 'loans-tax-salary',
    categoryLabel: 'Loans, Tax & Salary',
    shortDescription: 'Calculate your tax-exempt House Rent Allowance u/s 10(13A) of the Income Tax Act.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'Exempt HRA = Min(Actual HRA, Rent - 10% Basic, 50%/40% Basic)',
    formulaExplanation: 'Statutory exemption under Rule 2A: Minimum of actual HRA received, rent minus 10% basic, and metro/non-metro cap.',
    assumptions: [
      'Basic salary includes dearness allowance (if forming part of retirement benefits).',
      'Metros: Delhi, Mumbai, Kolkata, Chennai (50% of Basic); all other cities (40% of Basic).',
      'Only applicable under the Old Tax Regime.',
    ],
    workedExample: {
      inputSummary: 'Basic: ₹40,000/mo | HRA Received: ₹20,000/mo | Rent Paid: ₹18,000/mo | Metro City',
      expectedResult: 'Exempt HRA: ₹1,68,000/yr | Taxable HRA: ₹72,000/yr',
      explanation: 'Rent excess over 10% basic (₹14,000/mo × 12 = ₹1,68,000) is exempt from income tax.',
    },
    officialSource: 'Income Tax Department Rule 2A / Section 10(13A)',
    disclaimer: 'Rent receipts and landlord PAN are required if annual rent exceeds ₹1,00,000.',
    fields: [
      { id: 'monthlyBasicSalary', label: 'Monthly Basic Salary', defaultValue: 40000, min: 10000, max: 1000000, step: 2000, unit: '₹', isCurrency: true },
      { id: 'monthlyHRAReceived', label: 'Monthly HRA Received', defaultValue: 20000, min: 2000, max: 500000, step: 1000, unit: '₹', isCurrency: true },
      { id: 'monthlyActualRentPaid', label: 'Actual Monthly Rent Paid', defaultValue: 18000, min: 0, max: 500000, step: 1000, unit: '₹', isCurrency: true },
    ],
  },
  {
    id: 'salary',
    slug: 'salary-calculator',
    name: 'Salary / CTC In-Hand Calculator',
    category: 'loans-tax-salary',
    categoryLabel: 'Loans, Tax & Salary',
    shortDescription: 'Calculate your real monthly take-home salary from your annual Cost to Company (CTC) after PF, PT, and TDS.',
    isPopular: true,
    isPublicDirectory: true,
    formula: 'In-Hand = Gross Monthly Salary - Employee PF (12%) - Professional Tax - Estimated TDS',
    formulaExplanation: 'Translates annual CTC package into actual bank-credited monthly disposable income.',
    assumptions: [
      'Basic salary is structured at 40% of fixed pay.',
      'Employee PF at 12% of basic and standard Professional Tax of ₹200/mo.',
      'Income tax estimated under the New Regime.',
    ],
    workedExample: {
      inputSummary: 'Annual CTC: ₹12,00,000 | Variable: ₹0',
      expectedResult: 'Monthly Gross: ₹1,00,000 | Employee PF: ₹4,000 | TDS: ~₹5,580 | Monthly Take-Home: ~₹90,220',
      explanation: 'A ₹12 Lakh CTC translates to approximately ₹90,220 take-home pay per month.',
    },
    disclaimer: 'Actual take-home pay varies with company flexi-benefits, medical insurance, and meal allowances.',
    fields: [
      { id: 'annualCTC', label: 'Annual Cost to Company (CTC)', defaultValue: 1200000, min: 100000, max: 10000000, step: 25000, unit: '₹', isCurrency: true },
      { id: 'bonusOrVariablePay', label: 'Annual Bonus / Variable Pay (Optional)', defaultValue: 0, min: 0, max: 3000000, step: 10000, unit: '₹', isCurrency: true, isOptional: true },
    ],
  },
  {
    id: 'income-tax',
    slug: 'income-tax-calculator',
    name: 'Income Tax Calculator',
    category: 'tax',
    categoryLabel: 'Tax, Salary & Employment',
    shortDescription: 'Compare your exact tax liability under New Regime (Budget 2024 revised) vs Old Regime.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'Tax = Slab Rate × Taxable Income - Section 87A Rebate + 4% Health & Education Cess',
    formulaExplanation: 'Incorporates FY 2024-25 revisions: ₹75,000 standard deduction and ₹7 Lakh rebate under New Regime.',
    assumptions: [
      'Applicable for individual tax residents for Assessment Year 2025-26.',
      'Surcharge applies if total income exceeds ₹50 Lakhs.',
    ],
    workedExample: {
      inputSummary: 'Gross Income: ₹10,00,000 | New Regime',
      expectedResult: 'Taxable Income: ₹9,25,000 | Tax Before Cess: ₹42,500 | Cess (4%): ₹1,700 | Total Tax: ₹44,200',
      explanation: 'Under the revised New Regime, a ₹10 Lakh salary incurs just ₹44,200 in total tax.',
    },
    officialSource: 'Income Tax Department, Ministry of Finance (Union Budget 2024-25)',
    disclaimer: 'Tax laws are subject to amendments. Consult a chartered accountant for complex capital gains and foreign assets.',
    fields: [
      { id: 'annualGrossIncome', label: 'Annual Gross Income', defaultValue: 1000000, min: 100000, max: 20000000, step: 25000, unit: '₹', isCurrency: true },
      { id: 'section80C', label: 'Section 80C Deductions (Old Regime)', defaultValue: 150000, min: 0, max: 150000, step: 5000, unit: '₹', isCurrency: true },
      { id: 'section80D', label: 'Section 80D Health Insurance (Old)', defaultValue: 25000, min: 0, max: 100000, step: 2500, unit: '₹', isCurrency: true },
      { id: 'hraExemption', label: 'HRA Exemption (Old Regime)', defaultValue: 60000, min: 0, max: 500000, step: 5000, unit: '₹', isCurrency: true },
    ],
  },
  {
    id: 'gst',
    slug: 'gst-calculator',
    name: 'GST Calculator',
    category: 'tax',
    categoryLabel: 'Tax, Salary & Employment',
    shortDescription: 'Calculate Goods & Services Tax in Exclusive (Add GST) or Inclusive (Remove GST) mode with CGST/SGST/IGST.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'Exclusive: GST = P × Rate | Inclusive: Net = P / (1 + Rate)',
    formulaExplanation: 'Determines statutory GST tax liability and splits into CGST & SGST (intrastate) or IGST (interstate).',
    assumptions: ['Standard slab rates of 0%, 5%, 12%, 18%, and 28%.'],
    workedExample: {
      inputSummary: 'Amount: ₹10,000 | GST Rate: 18% | Exclusive Mode',
      expectedResult: 'Net Base: ₹10,000 | CGST: ₹900 (9%) | SGST: ₹900 (9%) | Gross Total: ₹11,800',
      explanation: 'Adds 18% statutory GST, split equally between Central and State governments.',
    },
    officialSource: 'Goods and Services Tax Council (CBIC)',
    disclaimer: 'Input Tax Credit (ITC) eligibility depends on business GST compliance and GSTR-2B reflection.',
    fields: [
      { id: 'amount', label: 'Amount', defaultValue: 10000, min: 100, max: 10000000, step: 500, unit: '₹', isCurrency: true },
      { id: 'gstRate', label: 'GST Rate', defaultValue: 18, min: 0, max: 28, step: 1, unit: '%' },
    ],
  },
  {
    id: 'gratuity',
    slug: 'gratuity-calculator',
    name: 'Gratuity Calculator',
    category: 'tax',
    categoryLabel: 'Tax, Salary & Employment',
    shortDescription: 'Calculate statutory gratuity payout under the Payment of Gratuity Act, 1972 after 5 years of service.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'Gratuity = (15 × Last Monthly Basic+DA × Completed Years) / 26',
    formulaExplanation: 'Based on 26 working days in a month. Capped at the statutory maximum limit of ₹20,00,000.',
    assumptions: [
      'Minimum 5 years of continuous service required for entitlement.',
      'Six months or more is rounded up to the next full year.',
    ],
    workedExample: {
      inputSummary: 'Last Basic: ₹65,000/mo | Service: 12 Years | Covered under Act',
      expectedResult: 'Payable Gratuity: ₹4,50,000 | Formula: (15 × 65,000 × 12) / 26',
      explanation: 'Full ₹4,50,000 is tax-free under Section 10(10) of the Income Tax Act.',
    },
    officialSource: 'Ministry of Labour & Employment / Payment of Gratuity Act 1972',
    disclaimer: 'Gratuity up to ₹20 Lakh is exempt from income tax for non-government employees.',
    fields: [
      { id: 'lastDrawnMonthlyBasicPlusDA', label: 'Last Drawn Monthly Basic + DA', defaultValue: 65000, min: 10000, max: 1000000, step: 2500, unit: '₹', isCurrency: true },
      { id: 'yearsOfContinuousService', label: 'Completed Years of Service', defaultValue: 12, min: 5, max: 45, step: 1, unit: 'Years' },
    ],
  },
  {
    id: 'tds',
    slug: 'tds-calculator',
    name: 'TDS Calculator',
    category: 'tax',
    categoryLabel: 'Tax, Salary & Employment',
    shortDescription: 'Calculate Tax Deducted at Source across standard sections (194A interest, 194C contractor, 194J professional).',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'TDS Amount = Payment Amount × TDS Rate (if Payment > Statutory Threshold)',
    formulaExplanation: 'Applies statutory withholding rate if transaction exceeds section threshold. 20% applies if PAN not furnished.',
    assumptions: ['PAN is furnished by the deductee.'],
    workedExample: {
      inputSummary: 'Section 194J (Professional Fees) | Payment: ₹75,000 | Threshold: ₹30,000 | Rate: 10%',
      expectedResult: 'TDS Deducted: ₹7,500 | Net Payable to Vendor: ₹67,500',
      explanation: 'Since ₹75,000 exceeds the ₹30,000 threshold, 10% TDS is deducted.',
    },
    officialSource: 'Income Tax Act 1961 (TDS Provisions Chapter XVII-B)',
    disclaimer: 'TDS certificates (Form 16A) must be issued quarterly by the deductor.',
    fields: [
      { id: 'paymentAmount', label: 'Payment Amount', defaultValue: 75000, min: 1000, max: 10000000, step: 5000, unit: '₹', isCurrency: true },
    ],
  },

  // =========================================================================
  // 5. STOCK TRADING AND BROKERAGE (3)
  // =========================================================================
  {
    id: 'brokerage',
    slug: 'brokerage-calculator',
    name: 'Brokerage & Statutory Charges Calculator',
    category: 'trading',
    categoryLabel: 'Stock Trading & Brokerage',
    shortDescription: 'Calculate total brokerage, STT, Exchange transaction fees, SEBI charges, Stamp Duty, GST, and net profit.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'Net P&L = Gross P&L - (Brokerage + STT + Exchange + SEBI + Stamp Duty + 18% GST)',
    formulaExplanation: 'Models full statutory charge breakdown for Delivery, Intraday, Futures, and Options.',
    assumptions: [
      'Zero delivery brokerage; ₹20 or 0.05% for intraday/F&O.',
      'STT: 0.1% for Delivery, 0.025% for Intraday sell.',
      'GST at 18% on (Brokerage + Exchange + SEBI charges).',
    ],
    workedExample: {
      inputSummary: 'Equity Intraday | Buy: ₹500 | Sell: ₹510 | Qty: 400 Shares (Turnover: ₹4.04 Lakh)',
      expectedResult: 'Gross Profit: +₹4,000 | Total Charges: ₹121.36 | Net Profit: +₹3,878.64 | Breakeven: ₹0.30/share',
      explanation: 'Net profit accounts for all taxes and regulatory charges; break-even is just 30 paise per share.',
    },
    officialSource: 'SEBI (Stock Brokers and Sub-Brokers) Regulations & Exchange Circulars',
    disclaimer: 'Stamp duty is levied under the Indian Stamp Act, 1899 as amended.',
    fields: [
      { id: 'buyPrice', label: 'Buy Price', defaultValue: 500, min: 1, max: 100000, step: 0.5, unit: '₹', isCurrency: true },
      { id: 'sellPrice', label: 'Sell Price', defaultValue: 510, min: 1, max: 100000, step: 0.5, unit: '₹', isCurrency: true },
      { id: 'quantity', label: 'Quantity', defaultValue: 400, min: 1, max: 100000, step: 10, unit: 'Qty' },
    ],
  },
  {
    id: 'margin',
    slug: 'margin-calculator',
    name: 'Margin Calculator',
    category: 'trading',
    categoryLabel: 'Stock Trading & Brokerage',
    shortDescription: 'Calculate required margin capital and maximum buying power exposure under SEBI Peak Margin Norms.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'Margin Required = Total Order Value / Leverage Multiplier',
    formulaExplanation: 'Under SEBI rules, maximum intraday equity leverage is capped at 5x (20% upfront margin).',
    assumptions: [
      'Delivery (CNC) requires 100% upfront margin.',
      'Intraday (MIS) leverage capped at 5x under SEBI peak margin rules.',
    ],
    workedExample: {
      inputSummary: 'Stock Price: ₹1,000 | Quantity: 200 | Intraday (MIS 5x Leverage)',
      expectedResult: 'Total Order Value: ₹2,00,000 | Margin Needed: ₹40,000 | Extra Exposure: ₹1,60,000',
      explanation: 'You can execute a ₹2,00,000 trade with just ₹40,000 in account margin.',
    },
    officialSource: 'SEBI Circular on Peak Margin Norms & VAR+ELM Margin Framework',
    disclaimer: 'Leverage magnifies both potential profits and potential losses. Trade responsibly with stop-loss.',
    fields: [
      { id: 'stockPrice', label: 'Stock Price', defaultValue: 1000, min: 1, max: 100000, step: 1, unit: '₹', isCurrency: true },
      { id: 'quantity', label: 'Quantity', defaultValue: 200, min: 1, max: 100000, step: 10, unit: 'Qty' },
      { id: 'customLeverageMultiplier', label: 'Leverage Multiplier', defaultValue: 5, min: 1, max: 5, step: 1, unit: 'Number' },
    ],
  },
  {
    id: 'mtf',
    slug: 'mtf-calculator',
    name: 'MTF (Margin Trading Facility) Calculator',
    category: 'trading',
    categoryLabel: 'Stock Trading & Brokerage',
    shortDescription: 'Calculate funding costs, daily interest, and holding break-even return for Margin Trading Facility.',
    isPopular: false,
    isPublicDirectory: false,
    formula: 'Funded = Value - Margin | Daily Interest = (Funded × Annual Rate) / 365',
    formulaExplanation: 'Computes daily and total interest cost charged by brokers for leverage delivery holding.',
    assumptions: [
      'Broker funding interest rate typically ranges between 12% and 18% p.a.',
      'Holding period measured in calendar days.',
    ],
    workedExample: {
      inputSummary: 'Stock Purchase: ₹5,00,000 | Your Margin: 25% (₹1.25L) | Rate: 14% p.a. | Holding: 60 Days',
      expectedResult: 'Broker Funded: ₹3,75,000 | Daily Interest: ₹143.84 | Total Interest Cost: ₹8,630 | Breakeven: +1.73%',
      explanation: 'Stock must rise by at least 1.73% over 60 days to break even on MTF interest costs.',
    },
    officialSource: 'SEBI Master Circular on Margin Trading Facility (MTF)',
    disclaimer: 'MTF positions face risk of margin calls and liquidation if stock price drops significantly.',
    fields: [
      { id: 'totalStockPurchaseValue', label: 'Total Stock Purchase Value', defaultValue: 500000, min: 10000, max: 50000000, step: 25000, unit: '₹', isCurrency: true },
      { id: 'investorMarginPercent', label: 'Your Margin Share', defaultValue: 25, min: 15, max: 75, step: 5, unit: '%' },
      { id: 'annualInterestRatePercent', label: 'Broker Interest Rate (p.a.)', defaultValue: 14, min: 9, max: 24, step: 0.5, unit: '%' },
      { id: 'holdingPeriodDays', label: 'Holding Period (Days)', defaultValue: 60, min: 1, max: 365, step: 5, unit: 'Days' },
    ],
  },
];

/**
 * Fast search index and filter utility for calculators
 */
export function searchCalculators(
  query: string,
  category: CalculatorCategory = 'all',
  includeHidden: boolean = false
): CalculatorMeta[] {
  const q = query.trim().toLowerCase();
  return CALCULATOR_CATALOG.filter((item) => {
    if (!includeHidden && item.isPublicDirectory === false) return false;
    const matchesCategory = category === 'all' || item.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;

    return (
      item.name.toLowerCase().includes(q) ||
      item.shortDescription.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q)
    );
  });
}

export function getCalculatorBySlugOrId(identifier: string): CalculatorMeta | undefined {
  const clean = identifier.toLowerCase().replace(/^\//, '');
  return CALCULATOR_CATALOG.find(
    (c) => c.slug.toLowerCase() === clean || c.id.toLowerCase() === clean || c.slug.replace('-calculator', '') === clean
  );
}

