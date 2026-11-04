import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, ShieldCheck, Sparkles, PieChart, 
  CheckCircle2, ChevronRight, Shield, ExternalLink, ChevronDown,
  Repeat, Coins, ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MutualFundCalculator from '@/components/calculator/MutualFundCalculator';
import { MutualFundDisclaimerBanner } from '@/components/mutual-funds/MutualFundDisclaimerBanner';

const fundCategories = [
  {
    title: "Large Cap Funds",
    description: "Invest in India's top 100 bluechip companies for steady, stable capital appreciation with lower volatility.",
    badge: "Low to Moderate Risk",
    icon: ShieldCheck,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Flexi Cap Funds",
    description: "Dynamic allocation across large, mid, and small cap companies to capture growth wherever opportunities arise.",
    badge: "Moderate Risk",
    icon: TrendingUp,
    color: "from-indigo-500 to-purple-600",
  },
  {
    title: "ELSS (Tax Saving) Funds",
    description: "Save up to ₹46,800 under Section 80C with the shortest lock-in period of 3 years and superior wealth generation.",
    badge: "High Growth + Tax Benefit",
    icon: Sparkles,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Mid & Small Cap Funds",
    description: "High-conviction investments in emerging companies with exceptional long-term compound growth potential.",
    badge: "High Risk / High Return",
    icon: PieChart,
    color: "from-purple-500 to-pink-600",
  },
];

const MutualFunds = () => {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleConsultantClick = () => {
    window.open(
      'https://wa.me/917842494981?text=Hi%20Finance%20Brunch%20Team%2C%20I%27m%20interested%20in%20starting%20a%20Mutual%20Fund%20investment.%20Can%20we%20connect%3F',
      '_blank'
    );
  };

  return (
    <main className="flex-grow pt-24 pb-24 bg-transparent min-h-screen">
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 3xl:max-w-[1680px] px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* 1. Hero Section with Growth Visual */}
        <div className="relative w-full min-h-[340px] sm:min-h-[420px] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-slate-200/80 dark:border-slate-800">
          <img 
            src="/lovable-uploads/bf6dd0ac-44d2-4676-a31c-07952b0c5108.png" 
            alt="Mutual Fund Investment Growth" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Deep dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40 pointer-events-none" />
          
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 flex flex-col justify-end h-full min-h-[340px] sm:min-h-[420px]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs sm:text-sm font-semibold tracking-wider uppercase">
                Discover a better way to invest
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Mutual Fund Investments with <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">Finance Brunch</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-2xl leading-relaxed mb-6">
              Build disciplined wealth through automated SIPs, strategic lumpsum deposits, and research-driven fund portfolios tailored to your unique financial milestones.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Button
                onClick={handleConsultantClick}
                size="lg"
                category="investment"
                rightIcon={<TrendingUp className="h-4 w-4" />}
              >
                Start Your SIP with an Advisor
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
              >
                Calculate Returns Below
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Mutual Fund Disclaimer Banner */}
        <MutualFundDisclaimerBanner />

        {/* 2. Core Pillars: Expert Guidance & Top-Tier Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Expert Guidance</h3>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Research-Backed Selection</span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Our team of financial experts continuously analyzes market trends and fund performances 
                to provide personalized investment strategies aligned with your financial goals.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Top-Tier Security</h3>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">SEBI & AMFI Compliant</span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                We prioritize the security of your investments with the highest standards of transparency 
                and protection, ensuring peace of mind as your portfolio grows.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 3. Why Invest With Finance Brunch? */}
        <div className="mb-14">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-cyan-50/40 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200/60 dark:border-slate-800 shadow-md">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Strategic Wealth Philosophy
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 mb-4">
                Why Invest With Finance Brunch?
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                At Finance Brunch, we believe in building long-term wealth through strategic investments in funds with consistent track records and strong growth potential. Our research team meticulously analyzes fund performances, risk factors, and market conditions to identify the top-performing funds.
              </p>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                With our guidance, you'll navigate the complex world of mutual funds with confidence, knowing your investments are optimized for growth and aligned with your financial goals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-2 bg-white/70 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Goal-Based Portfolios</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Customized for retirement, children's education, or home purchases.
                </p>
              </div>
              <div className="space-y-2 bg-white/70 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Periodic Rebalancing</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  We review your asset allocation periodically to lock in gains and manage risk.
                </p>
              </div>
              <div className="space-y-2 bg-white/70 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Certified Advisors</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Direct guidance from licensed AMFI/NISM registered professionals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Our Trusted Investment Partners */}
        <div className="mb-14">
          <div className="text-left sm:text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Institutional Empanelment
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Our Trusted Investment Partners
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              We have empanelment with both platforms below. You can choose either one to open your account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Angel One Card */}
            <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl">
              <div>
                <div className="h-2.5 bg-gradient-to-r from-blue-500 to-purple-600" />
                <CardContent className="p-7 sm:p-8">
                  <div className="flex flex-col items-center">
                    <div className="w-full h-44 mb-5 flex items-center justify-center bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                      <img 
                        src="/images/angel-one-logo.svg" 
                        alt="Angel One" 
                        className="h-14 w-auto max-w-[85%] object-contain"
                      />
                    </div>
                    <h4 className="text-xl font-bold mb-2 text-center text-slate-900 dark:text-white">Angel One</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-center text-sm leading-relaxed">
                      Trade with India's leading stock broking house with cutting-edge technology and research support.
                    </p>
                  </div>
                </CardContent>
              </div>
              <div className="p-7 sm:p-8 pt-0">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-md"
                  onClick={() => window.open('https://angel-one.onelink.me/Wjgr/f6agg88z', '_blank')}
                >
                  Open Account <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>
            
            {/* NJ E-Wealth Card - Top Pick */}
            <Card className="relative overflow-hidden border-2 border-primary/50 dark:border-cyan-500/50 shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300 group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-primary/20">
              <div>
                <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
                <CardContent className="p-7 sm:p-8">
                  <div className="flex flex-col items-center">
                    <div className="relative w-full h-44 mb-5 flex items-center justify-center bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border border-amber-300/60 uppercase">
                          ⭐ Top Pick
                        </span>
                      </div>
                      <img 
                        src="/images/nj-ewealth-logo.png" 
                        alt="NJ E-Wealth" 
                        className="h-24 w-auto max-w-[85%] object-contain"
                      />
                    </div>
                    <div className="inline-flex items-center gap-2 mb-2">
                      <h4 className="text-xl font-bold text-center text-slate-900 dark:text-white">NJ E-Wealth</h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
                        Recommended
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-center text-sm leading-relaxed">
                      Access comprehensive wealth management solutions through NJ E-Wealth's diverse investment products and advisory services.
                    </p>
                  </div>
                </CardContent>
              </div>
              <div className="p-7 sm:p-8 pt-0">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold transition-colors shadow-md"
                  onClick={() => window.open('https://njwealth.in/', '_blank')}
                >
                  Open Account <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* 5. Fund Categories Grid */}
        <div id="fund-categories-section" className="mb-14">
          <div className="text-left sm:text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Asset Allocation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Explore Popular Mutual Fund Categories
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Select the strategy that matches your investment horizon and risk appetite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fundCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card
                  key={cat.title}
                  className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden rounded-2xl"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${cat.color}`} />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                          {cat.title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {cat.badge}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                      {cat.description}
                    </p>
                    <button
                      onClick={handleConsultantClick}
                      className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:underline gap-1"
                    >
                      Explore top funds in this category
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 6. Embedded Interactive Calculator Section */}
        <div id="calculator-section" className="mb-14 pt-4 scroll-mt-24">
          <div className="text-left sm:text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Interactive Planning
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Mutual Fund Returns Calculator
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Forecast how your systematic investments (SIP), step-up allocations, lumpsum deposits, or SWP withdrawals grow over time.
            </p>
          </div>

          {/* Quick-Access 4-Calculator Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {/* 1. SIP Calculator */}
            <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group rounded-2xl">
              <div>
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                <CardContent className="p-5 sm:p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                    <Repeat className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      SIP Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Calculate the future value of your regular monthly investments with power of compounding.
                    </p>
                  </div>
                </CardContent>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                  onClick={() => navigate('/calculator?calc=sip')}
                >
                  Calculate SIP <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>

            {/* 2. Step-Up SIP Calculator */}
            <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group rounded-2xl">
              <div>
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
                <CardContent className="p-5 sm:p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-purple-400 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-purple-400 transition-colors">
                      Step-Up SIP Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Estimate how increasing your monthly SIP contribution annually can help grow your long-term investment corpus.
                    </p>
                  </div>
                </CardContent>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                  onClick={() => navigate('/calculator?calc=step-up-sip')}
                >
                  Calculate Step-Up SIP <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>

            {/* 3. Lumpsum Calculator */}
            <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group rounded-2xl">
              <div>
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
                <CardContent className="p-5 sm:p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Lumpsum Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Calculate returns on one-time mutual fund investments over your preferred investment horizon.
                    </p>
                  </div>
                </CardContent>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                  onClick={() => navigate('/calculator?calc=lumpsum')}
                >
                  Calculate Lumpsum <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>

            {/* 4. SWP Calculator */}
            <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group rounded-2xl">
              <div>
                <div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-600" />
                <CardContent className="p-5 sm:p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <ArrowDownRight className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      SWP Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Plan your systematic withdrawals to generate steady regular cash flow from your mutual fund corpus.
                    </p>
                  </div>
                </CardContent>
              </div>
              <div className="p-5 sm:p-6 pt-0">
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                  onClick={() => navigate('/calculator?calc=swp')}
                >
                  Calculate SWP <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>
          </div>

          <MutualFundCalculator />
        </div>

        {/* 7. Working WhatsApp CTA Banner */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">Ready to start your investment journey?</h3>
                <p className="text-slate-100 text-sm sm:text-base">Our certified wealth specialists are just a message away.</p>
              </div>
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-slate-100 font-bold px-8 shadow-md shrink-0"
                onClick={handleConsultantClick}
              >
                Connect on WhatsApp <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MutualFunds;
