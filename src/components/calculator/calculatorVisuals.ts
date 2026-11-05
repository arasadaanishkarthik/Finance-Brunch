/**
 * Finance Brunch — Calculator Visuals & Card Data Provider
 * 
 * Provides crisp visual previews, categorized tag pills, and metadata
 * for the Collapsed Grid Cards and Expanded Arc Gallery.
 */

import { CalculatorMeta } from '@/utils/calculators/calculatorCatalog';

export interface CalculatorCardData {
  numberStr: string;
  shortTitle: string;
  tags: string[];
  imageUrl: string;
  formulaBadge: string;
  categoryTheme: {
    accent: string;
    glow: string;
    badgeBg: string;
    border: string;
  };
}

const THEME_PALETTES: Record<string, CalculatorCardData['categoryTheme']> = {
  investments: {
    accent: '#38bdf8', // sky-400
    glow: 'rgba(56, 189, 248, 0.25)',
    badgeBg: 'rgba(14, 165, 233, 0.12)',
    border: 'rgba(56, 189, 248, 0.35)',
  },
  government: {
    accent: '#34d399', // emerald-400
    glow: 'rgba(52, 211, 153, 0.25)',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(52, 211, 153, 0.35)',
  },
  'loans-tax-salary': {
    accent: '#a78bfa', // purple-400
    glow: 'rgba(167, 139, 250, 0.25)',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(167, 139, 250, 0.35)',
  },
  default: {
    accent: '#c6ff3d', // lime-green
    glow: 'rgba(198, 255, 61, 0.25)',
    badgeBg: 'rgba(198, 255, 61, 0.12)',
    border: 'rgba(198, 255, 61, 0.35)',
  },
};

const CALCULATOR_TAGS: Record<string, string[]> = {
  sip: ['Mutual Funds', 'Annuity Due', 'Monthly SIP'],
  lumpsum: ['Mutual Funds', 'Compound Growth', 'One-Time Deposit'],
  swp: ['Mutual Funds', 'Periodic Cash Flow', 'Systematic Withdrawal'],
  'step-up-sip': ['Mutual Funds', 'Annual Step-Up', 'Accelerated Corpus'],
  'step-up-swp': ['Mutual Funds', 'Inflation-Adjusted', 'Capital Preservation'],
  roi: ['Investment', 'Absolute Return', 'Annualized Yield'],
  cagr: ['Performance', 'Geometric Mean', 'Multi-Year Horizons'],
  xirr: ['Portfolio', 'Newton-Raphson', 'Irregular Cash Flows'],
  'stock-average': ['Equity Trading', 'Weighted Average', 'Rupee-Cost Averaging'],
  inflation: ['Purchasing Power', 'CPI Erosion', 'Future Value Target'],
  fire: ['Financial Freedom', '25x Rule', 'Safe Withdrawal Rate'],
  retirement: ['Retirement Corpus', 'Growing Annuity', 'Lifelong Pension'],
  ssy: ['Govt. Scheme', '8.2% Guaranteed', 'Girl Child Future'],
  ppf: ['Govt. Scheme', '7.1% Sovereign', 'Section 80C EEE'],
  epf: ['EPFO Statutory', '8.25% Annual Yield', 'Employer + Employee'],
  fd: ['Fixed Income', 'Quarterly Comp.', 'Capital Protection'],
  rd: ['Fixed Income', 'Monthly Deposit', 'Disciplined Savings'],
  nsc: ['Post Office', '7.7% Guaranteed', '5-Year Sovereign'],
  apy: ['PFRDA Scheme', 'Guaranteed Pension', 'Social Security'],
  'po-mis': ['Post Office', '7.4% Monthly', 'Guaranteed Income'],
  scss: ['Senior Citizens', '8.2% Quarterly', 'Retirement Cash Flow'],
  nps: ['Pension System', 'Tier-1 Corpus', '60:40 Annuity Split'],
  'home-loan-emi': ['Loan Planning', 'Reducing Balance', 'Amortization'],
  'car-loan-emi': ['Auto Finance', 'Down Payment', 'Total Interest Cost'],
  hra: ['Income Tax', 'Section 10(13A)', 'Metro vs Non-Metro'],
  salary: ['Employment CTC', 'In-Hand Take Home', 'PF & Tax Deductions'],
};

/**
 * Generates an SVG data URL with modern financial chart and geometry styling
 */
function createCalculatorSvgUrl(id: string, name: string, category: string): string {
  const isInvest = category === 'investments';
  const isGovt = category === 'government';
  const isLoan = category === 'loans-tax-salary';

  const col1 = isInvest ? '#0369a1' : isGovt ? '#047857' : isLoan ? '#6d28d9' : '#0f766e';
  const col2 = isInvest ? '#38bdf8' : isGovt ? '#34d399' : isLoan ? '#c084fc' : '#2dd4bf';
  const accent = isInvest ? '#67e8f9' : isGovt ? '#a7f3d0' : isLoan ? '#e9d5ff' : '#c6ff3d';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#070c18" />
    </linearGradient>
    <linearGradient id="curve" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${col1}" />
      <stop offset="50%" stop-color="${col2}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
    <linearGradient id="area" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${col2}" stop-opacity="0.32" />
      <stop offset="100%" stop-color="${col1}" stop-opacity="0.0" />
    </linearGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
    </pattern>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background and grid -->
  <rect width="640" height="400" fill="url(#bg)" />
  <rect width="640" height="400" fill="url(#grid)" />

  <!-- Ambient glowing spheres -->
  <circle cx="520" cy="80" r="160" fill="${col2}" opacity="0.12" filter="blur(40px)" />
  <circle cx="100" cy="320" r="140" fill="${col1}" opacity="0.10" filter="blur(40px)" />

  <!-- Chart Area fill -->
  <path d="M 60 320 Q 200 300, 320 220 T 580 90 L 580 320 Z" fill="url(#area)" />

  <!-- Dynamic Financial Curve -->
  <path d="M 60 320 Q 200 300, 320 220 T 580 90" fill="none" stroke="url(#curve)" stroke-width="4.5" filter="url(#glow)" stroke-linecap="round" />

  <!-- Data Nodes -->
  <circle cx="200" cy="285" r="5" fill="#ffffff" stroke="${col2}" stroke-width="3" />
  <circle cx="320" cy="220" r="6" fill="#ffffff" stroke="${col2}" stroke-width="3.5" />
  <circle cx="450" cy="145" r="5" fill="#ffffff" stroke="${accent}" stroke-width="3" />
  <circle cx="580" cy="90" r="7.5" fill="#ffffff" stroke="${accent}" stroke-width="4" filter="url(#glow)" />

  <!-- Badge Capsule -->
  <rect x="60" y="44" width="160" height="30" rx="15" fill="rgba(255,255,255,0.06)" stroke="${col2}" stroke-width="1.2" stroke-opacity="0.5" />
  <circle cx="76" cy="59" r="4.5" fill="${accent}" />
  <text x="90" y="64" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="1">FINANCE BRUNCH</text>

  <!-- Watermark Symbol -->
  <text x="560" y="356" fill="rgba(255,255,255,0.06)" font-family="system-ui, sans-serif" font-size="72" font-weight="900" text-anchor="end">FB</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const CALCULATOR_IMAGES: Record<string, string> = {
  // 1. Mutual Funds & Investments
  sip: '/lovable-uploads/bf6dd0ac-44d2-4676-a31c-07952b0c5108.png',
  lumpsum: '/images/service-investment-planning.jpg',
  swp: '/lovable-uploads/39526ab9-be38-46a7-9a10-857828b19686.png',
  'step-up-sip': '/lovable-uploads/57727f9c-2aca-4226-99e9-efa57dc9848f.png',
  'step-up-swp': '/images/service-wealth-management.jpg',
  roi: '/lovable-uploads/06b665ec-50f4-4f68-b7fe-836df10af649.png',
  cagr: '/lovable-uploads/4d13bcab-a123-47b9-bf2e-cd9cc4554217.png',
  xirr: '/lovable-uploads/40e77375-0204-4438-a625-becd00b5c616.png',
  'stock-average': '/lovable-uploads/b7af595c-860c-4bed-8735-64391a005af9.png',
  inflation: '/lovable-uploads/3a5fcbd0-7610-456b-b056-3607bd6b15e2.png',
  fire: '/lovable-uploads/26c5a7e3-fcfa-4500-ae98-4f465f3ac8b1.png',
  retirement: '/images/financial-planning-advisory.jpg',

  // 2. Government Savings & Investment Schemes
  ssy: '/images/service-insurance.jpg',
  ppf: '/lovable-uploads/b10e7df8-0120-4065-9082-e64035550408.png',
  epf: '/images/about-financial-advisory.jpg',
  fd: '/lovable-uploads/b10e7df8-0120-4065-9082-e64035550408.png',
  rd: '/lovable-uploads/a16c9dc0-8a9d-45c9-9911-078f2cae3c73.png',
  nsc: '/images/service-insurance.jpg',
  apy: '/lovable-uploads/75e0d2e9-6d50-49f9-abe9-5236913686da.png',
  'po-mis': '/lovable-uploads/b10e7df8-0120-4065-9082-e64035550408.png',
  scss: '/images/about-executive.jpg',
  nps: '/lovable-uploads/26c5a7e3-fcfa-4500-ae98-4f465f3ac8b1.png',

  // 3. Loans, Tax and Salary
  'home-loan-emi': '/images/service-investment-planning.jpg',
  'car-loan-emi': '/lovable-uploads/0b1e6d57-0924-4e27-b8f1-e5e72dc5b643.png',
  hra: '/lovable-uploads/b80d81b8-1bd9-42ad-9457-5b8f46a67af0.png',
  salary: '/lovable-uploads/b80d81b8-1bd9-42ad-9457-5b8f46a67af0.png',
};

const SHORT_TITLES: Record<string, string> = {
  sip: 'SIP CALCULATOR',
  lumpsum: 'LUMPSUM CALCULATOR',
  swp: 'SWP CALCULATOR',
  'step-up-sip': 'STEP-UP SIP',
  'step-up-swp': 'STEP-UP SWP',
  roi: 'ROI CALCULATOR',
  cagr: 'CAGR CALCULATOR',
  xirr: 'XIRR CALCULATOR',
  'stock-average': 'STOCK AVERAGE',
  inflation: 'INFLATION CALCULATOR',
  fire: 'FIRE CALCULATOR',
  retirement: 'RETIREMENT CORPUS',
  ssy: 'SSY SCHEME',
  ppf: 'PPF SCHEME',
  epf: 'EPF SCHEME',
  fd: 'FD CALCULATOR',
  rd: 'RD CALCULATOR',
  nsc: 'NSC SCHEME',
  apy: 'APY PENSION',
  'po-mis': 'POST OFFICE MIS',
  scss: 'SCSS SCHEME',
  nps: 'NPS PENSION',
  'home-loan-emi': 'HOME LOAN EMI',
  'car-loan-emi': 'CAR & PERSONAL LOAN',
  hra: 'HRA CALCULATOR',
  salary: 'SALARY / CTC IN-HAND',
};

export function getCalculatorCardData(calc: CalculatorMeta, index: number): CalculatorCardData {
  const numberStr = String(index + 1).padStart(2, '0');
  const shortTitle = SHORT_TITLES[calc.id] || calc.name.toUpperCase();
  const tags = CALCULATOR_TAGS[calc.id] ?? [calc.categoryLabel, 'Verified Algorithm', 'Official Formula'];
  const categoryTheme = THEME_PALETTES[calc.category] ?? THEME_PALETTES.default;
  const imageUrl = CALCULATOR_IMAGES[calc.id] || createCalculatorSvgUrl(calc.id, calc.name, calc.category);
  const formulaBadge = calc.formula.split('=')[0]?.trim() || 'Calculation';

  return {
    numberStr,
    shortTitle,
    tags,
    imageUrl,
    formulaBadge,
    categoryTheme,
  };
}

