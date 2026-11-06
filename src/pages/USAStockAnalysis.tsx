import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, DollarSign, Globe, ExternalLink,
  ChevronRight, ArrowLeft, Search, Shield, Info, Building2,
  Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface USStockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  sector: string;
  analystRating: 'Strong Buy' | 'Buy' | 'Hold';
  targetPrice: number;
  description: string;
}

const US_INDICES = [
  {
    name: 'S&P 500',
    ticker: 'INDEXSP: .INX',
    value: '5,864.67',
    change: '+28.15',
    changePercent: '+0.48%',
    isPositive: true,
    range52W: '4,682 - 5,980',
    pe: '27.4x',
    description: 'Leading benchmark for 500 largest US public corporations',
  },
  {
    name: 'NASDAQ 100',
    ticker: 'INDEXNASDAQ: NDX',
    value: '18,518.61',
    change: '+119.34',
    changePercent: '+0.65%',
    isPositive: true,
    range52W: '14,058 - 18,800',
    pe: '34.2x',
    description: 'Global tech giants, innovators, and semiconductor leaders',
  },
  {
    name: 'Dow Jones',
    ticker: 'INDEXDJX: .DJI',
    value: '43,729.93',
    change: '+108.20',
    changePercent: '+0.25%',
    isPositive: true,
    range52W: '34,500 - 44,000',
    pe: '21.8x',
    description: '30 blue-chip American industrial and commercial leaders',
  },
  {
    name: 'Russell 2000',
    ticker: 'INDEXRUSSELL: RUT',
    value: '2,218.40',
    change: '-5.12',
    changePercent: '-0.23%',
    isPositive: false,
    range52W: '1,720 - 2,280',
    pe: '28.1x',
    description: 'High-growth US small-cap market performance barometer',
  },
];

const PREDEFINED_US_STOCKS: USStockItem[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 138.25,
    change: 3.24,
    changePercent: 2.40,
    marketCap: '$3.39T',
    peRatio: 38.5,
    fiftyTwoWeekHigh: 140.76,
    fiftyTwoWeekLow: 45.43,
    sector: 'Semiconductors & AI',
    analystRating: 'Strong Buy',
    targetPrice: 165.00,
    description: 'World leader in accelerated computing hardware, GPU microarchitectures, and enterprise AI data center supercomputing platforms.',
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 224.23,
    change: 2.44,
    changePercent: 1.10,
    marketCap: '$3.42T',
    peRatio: 30.1,
    fiftyTwoWeekHigh: 237.23,
    fiftyTwoWeekLow: 164.08,
    sector: 'Consumer Electronics & Services',
    analystRating: 'Buy',
    targetPrice: 245.00,
    description: 'Premier consumer hardware, operating ecosystems, wearable devices, Apple Intelligence, and high-margin recurring services.',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 415.80,
    change: 3.30,
    changePercent: 0.80,
    marketCap: '$3.09T',
    peRatio: 29.8,
    fiftyTwoWeekHigh: 468.35,
    fiftyTwoWeekLow: 366.50,
    sector: 'Cloud Computing & Enterprise AI',
    analystRating: 'Strong Buy',
    targetPrice: 490.00,
    description: 'Global enterprise software, Microsoft Cloud (Azure), OpenAI infrastructure partnership, GitHub, LinkedIn, and productivity suites.',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 198.60,
    change: 2.74,
    changePercent: 1.40,
    marketCap: '$2.08T',
    peRatio: 33.0,
    fiftyTwoWeekHigh: 201.20,
    fiftyTwoWeekLow: 118.35,
    sector: 'Cloud & E-Commerce',
    analystRating: 'Strong Buy',
    targetPrice: 230.00,
    description: 'Global e-commerce marketplace leader, AWS cloud infrastructure provider, advertising network, and digital logistics pioneer.',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 172.50,
    change: 1.54,
    changePercent: 0.90,
    marketCap: '$2.14T',
    peRatio: 20.2,
    fiftyTwoWeekHigh: 191.75,
    fiftyTwoWeekLow: 120.21,
    sector: 'Digital Advertising & AI Platforms',
    analystRating: 'Buy',
    targetPrice: 205.00,
    description: 'Dominant global search engine, YouTube streaming platform, Google Cloud Infrastructure, Android ecosystem, and DeepMind AI research.',
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 572.40,
    change: 6.80,
    changePercent: 1.20,
    marketCap: '$1.45T',
    peRatio: 23.5,
    fiftyTwoWeekHigh: 602.95,
    fiftyTwoWeekLow: 279.40,
    sector: 'Social Networks & Generative AI',
    analystRating: 'Buy',
    targetPrice: 630.00,
    description: 'World-leading social ecosystem connecting over 3.2 billion daily active users across Instagram, WhatsApp, Facebook, and Llama open models.',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 251.44,
    change: 9.20,
    changePercent: 3.80,
    marketCap: '$805B',
    peRatio: 65.0,
    fiftyTwoWeekHigh: 271.00,
    fiftyTwoWeekLow: 138.80,
    sector: 'Autonomous Vehicles & Clean Energy',
    analystRating: 'Hold',
    targetPrice: 260.00,
    description: 'Electric mobility manufacturer, autonomous Full Self-Driving (FSD) software developer, Megapack grid storage, and humanoid robotics pioneer.',
  },
  {
    symbol: 'BRK.B',
    name: 'Berkshire Hathaway Inc.',
    price: 452.10,
    change: 1.35,
    changePercent: 0.30,
    marketCap: '$980B',
    peRatio: 19.5,
    fiftyTwoWeekHigh: 484.82,
    fiftyTwoWeekLow: 341.25,
    sector: 'Diversified Financials & Insurance',
    analystRating: 'Buy',
    targetPrice: 495.00,
    description: 'Warren Buffett-led diversified conglomerate spanning GEICO insurance, BNSF Railway, Berkshire Hathaway Energy, and public equity holdings.',
  },
];

const SECTORS = ['All', 'Technology', 'Semiconductors', 'Cloud & AI', 'Consumer', 'Finance'];

export const USAStockAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredStocks = useMemo(() => {
    return PREDEFINED_US_STOCKS.filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector =
        selectedSector === 'All' ||
        stock.sector.toLowerCase().includes(selectedSector.toLowerCase());

      return matchesSearch && matchesSector;
    });
  }, [searchQuery, selectedSector]);

  const handleConsultantContact = () => {
    const phoneNumber = '917842494981';
    const message = encodeURIComponent(
      "Hi Finance Brunch Team, I'm interested in investing in U.S. Stocks and learning about LRS remittances. Can we discuss advisory?"
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-24 text-slate-900 dark:text-slate-100">
      <ScrollToTop />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link
              to="/investment-planning"
              className="hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Investment Planning</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              USA Stock Analysis
            </span>
          </div>

          <Badge
            variant="outline"
            className="border-blue-500/30 text-blue-600 dark:text-cyan-400 bg-blue-50/50 dark:bg-blue-950/40 text-xs font-mono"
          >
            NYSE &bull; NASDAQ &bull; S&P 500
          </Badge>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-10 lg:p-12 text-white border border-slate-700/60 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Research &bull; Global Market Access</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              U.S. Equity Markets & Global Research
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Access in-depth fundamental data, valuation multiples, and growth metrics for premier American corporations. 
              Diversify your portfolio internationally with market leaders across technology, cloud computing, and consumer innovation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                onClick={handleConsultantContact}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg transition-all"
              >
                Schedule US Advisory Session <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Link to="/calculator?calc=cagr">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-200 hover:bg-white/10 rounded-xl"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  CAGR Return Calculator
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Major U.S. Market Indices Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Major U.S. Market Indices
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Performance indicators across Wall Street exchanges
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>EST: 9:30 AM – 4:00 PM (IST: 7:00 PM – 1:30 AM)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {US_INDICES.map((idx) => (
              <Card
                key={idx.name}
                className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{idx.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">{idx.ticker}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                      idx.isPositive
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                        : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50'
                    }`}
                  >
                    {idx.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {idx.changePercent}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold tracking-tight font-mono">{idx.value}</span>
                  <span className="text-xs font-mono text-slate-500">{idx.change}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>52W: {idx.range52W}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">P/E: {idx.pe}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Search, Filter & Stock Directory */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Featured U.S. Blue-Chip & Tech Equities
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Institutional-grade fundamentals and consensus targets for Indian global investors
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search symbol, company..."
                  className="pl-9 h-9 text-xs sm:text-sm rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Sector Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SECTORS.map((sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSector === sector
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>

          {/* Stock Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredStocks.map((stock) => (
              <Card
                key={stock.symbol}
                className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                            {stock.symbol}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800"
                          >
                            {stock.sector}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {stock.name}
                        </h4>
                      </div>

                      <Badge
                        className={`text-[10px] font-bold ${
                          stock.analystRating === 'Strong Buy'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : stock.analystRating === 'Buy'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                        variant="outline"
                      >
                        {stock.analystRating}
                      </Badge>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                        ${stock.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-bold font-mono inline-flex items-center gap-0.5 ${
                          stock.change >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {stock.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400 block">Market Cap</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{stock.marketCap}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Forward P/E</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{stock.peRatio}x</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">52W Range</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">${stock.fiftyTwoWeekLow.toFixed(0)} - ${stock.fiftyTwoWeekHigh.toFixed(0)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">1Y Target</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">${stock.targetPrice.toFixed(0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    onClick={() => {
                      toast.info(`Analysis for ${stock.name} (${stock.symbol})`, {
                        description: `Consensus Target: $${stock.targetPrice} (${stock.analystRating}). Connect with an advisor to structure direct LRS access.`,
                      });
                    }}
                    variant="outline"
                    className="w-full text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-600 dark:text-cyan-400"
                  >
                    View Valuation Insights
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredStocks.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No U.S. stocks matched your search query.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSector('All');
                }}
                className="text-xs text-blue-600 mt-1"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Regulatory & Indian Investor LRS Framework */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                RBI & SEBI Guidelines for Indian Investors
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Key regulatory compliances under the Reserve Bank of India Liberalised Remittance Scheme (LRS)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xs font-bold font-mono text-blue-600 dark:text-cyan-400 uppercase">
                1. LRS Limit
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                $250,000 Annual Quota
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Resident Indian individuals can remit up to USD $250,000 per financial year for international equity and asset purchases via authorized dealer banks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase">
                2. TCS Regulations
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Tax Collected at Source (TCS)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Remittances under LRS are subject to 20% TCS for amounts exceeding ₹7 Lakhs annually, which is fully creditable against your annual income tax liability.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase">
                3. Currency Tailwinds
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                USD/INR Compounding
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Historical depreciation of INR vs USD by ~3-4% p.a. acts as an organic return enhancer, compounding total rupee returns over long holding horizons.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Expand Your Portfolio into U.S. Equities?
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Connect with Finance Brunch certified wealth advisors for compliant cross-border asset structuring, brokerage onboarding, and tailored research.
            </p>
          </div>

          <Button
            onClick={handleConsultantContact}
            size="lg"
            className="bg-white text-blue-700 hover:bg-slate-100 font-bold px-8 py-3 rounded-xl shadow-lg shrink-0"
          >
            Connect on WhatsApp <ExternalLink className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default USAStockAnalysis;

