import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import ScrollToTop from '@/components/ui/ScrollToTop';

import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { GlobalAmbientBackground } from './components/layout/GlobalAmbientBackground';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { ScrollLinkedMotion } from './components/layout/ScrollLinkedMotion';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { Toaster } from './components/ui/sonner';

const Calculator = lazy(() => import('./pages/Calculator'));
const MutualFunds = lazy(() => import('./pages/MutualFunds'));
const IncomeTaxFiling = lazy(() => import('./pages/IncomeTaxFiling'));
const IndianStockAnalysis = lazy(() => import('./pages/IndianStockAnalysis'));
const USAStockAnalysis = lazy(() => import('./pages/USAStockAnalysis'));
const UnlistedShares = lazy(() => import('./pages/UnlistedShares'));
const InvestmentPlanning = lazy(() => import('./pages/InvestmentPlanning'));
const WealthManagement = lazy(() => import('./pages/WealthManagement'));
const InsurancePlanning = lazy(() => import('./pages/InsurancePlanning'));
const FireStrategy = lazy(() => import('./pages/FireStrategy'));
const NRIServices = lazy(() => import('./pages/NRIServices'));
const IPOAnalysis = lazy(() => import('./pages/IPOAnalysis'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Careers = lazy(() => import('./pages/Careers'));
const EarlyRetirement = lazy(() => import('./pages/EarlyRetirement'));
const Contact = lazy(() => import('./pages/Contact'));

import { motion, useReducedMotion } from 'framer-motion';

import { scrollToSection } from '@/lib/scrollUtils';
import { RegulatoryDisclaimerGuard } from '@/components/compliance/RegulatoryDisclaimerGuard';
import { PullCordThemeToggle } from '@/components/theme/PullCordThemeToggle';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Helper component to handle in-page section scrolling when navigating to hash URLs or section routes
function ScrollToHashElement() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const scroll = () => {
        scrollToSection(id, true);
      };
      const t1 = setTimeout(scroll, 100);
      const t2 = setTimeout(scroll, 350);
      const t3 = setTimeout(scroll, 750);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      // Map standalone section route paths to in-page section scrolling on the homepage
      const pathToSectionMap: Record<string, string> = {
        '/services': 'services',
        '/products': 'products',
        '/about': 'about',
        '/global-presence': 'global',
        '/testimonials': 'testimonials',
        '/client-reviews': 'testimonials',
        '/insights': 'insights-youtube',
        '/youtube': 'insights-youtube',
      };
      const targetSection = pathToSectionMap[pathname];
      if (targetSection) {
        const scroll = () => {
          scrollToSection(targetSection, true);
        };
        const t1 = setTimeout(scroll, 100);
        const t2 = setTimeout(scroll, 350);
        const t3 = setTimeout(scroll, 750);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      }
    }
  }, [pathname, hash]);

  return null;
}

// Subtle page transition wrapper preserving scroll restoration and calculator states
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.main
      key={location.pathname}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
      className="flex-grow flex flex-col"
    >
      {children}
    </motion.main>
  );
}

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[40vh] flex-1 items-center justify-center" role="status" aria-live="polite">
      <span className="text-sm text-muted-foreground">Loading page...</span>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="finance-brunch-theme">
        <TooltipProvider>
          <Router basename={import.meta.env.BASE_URL}>
            <ScrollToTop />
            <SmoothScroll />
            <ScrollToHashElement />
            <div className="relative flex flex-col min-h-screen bg-background text-gray-900 dark:text-gray-100 transition-colors duration-300">
              <ScrollProgress />
              <ScrollLinkedMotion />
              <GlobalAmbientBackground />
              <Navbar />
              <PullCordThemeToggle />
              <PageTransition>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Routes>
                  {/* Home & In-Page Sections - Freely accessible without disclaimer */}
                  <Route path="/" element={<Index />} />
                  <Route path="/services" element={<Index />} />
                  <Route path="/products" element={<Index />} />
                  <Route path="/about" element={<Index />} />
                  <Route path="/global-presence" element={<Index />} />
                  <Route path="/testimonials" element={<Index />} />
                  <Route path="/client-reviews" element={<Index />} />
                  <Route path="/insights" element={<Index />} />
                  <Route path="/youtube" element={<Index />} />

                  {/* Financial Calculators - Disclaimer Excluded */}
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/calculators" element={<Calculator />} />
                  <Route path="/calculator/:calculatorSlug" element={<Calculator />} />
                  <Route path="/calculators/:calculatorSlug" element={<Calculator />} />
                  <Route path="/sip-calculator" element={<Calculator />} />
                  <Route path="/step-up-sip-calculator" element={<Calculator />} />
                  <Route path="/lumpsum-calculator" element={<Calculator />} />
                  <Route path="/swp-calculator" element={<Calculator />} />

                  {/* Mutual Funds - Protected Financial Services */}
                  <Route path="/mutual-funds" element={<RegulatoryDisclaimerGuard><MutualFunds /></RegulatoryDisclaimerGuard>} />

                  {/* Insurance Planning & Solutions - Disclaimer Excluded */}
                  <Route path="/insurance-planning" element={<InsurancePlanning />} />
                  <Route path="/insurance-solutions" element={<InsurancePlanning />} />
                  <Route path="/health-insurance" element={<InsurancePlanning />} />
                  <Route path="/term-insurance" element={<InsurancePlanning />} />

                  {/* Retirement & FIRE - Protected Financial Services */}
                  <Route path="/fire-strategy" element={<RegulatoryDisclaimerGuard><FireStrategy /></RegulatoryDisclaimerGuard>} />
                  <Route path="/early-retirement" element={<RegulatoryDisclaimerGuard><EarlyRetirement /></RegulatoryDisclaimerGuard>} />
                  <Route path="/retirement-planning" element={<RegulatoryDisclaimerGuard><EarlyRetirement /></RegulatoryDisclaimerGuard>} />

                  {/* Investment Planning & Capital Markets - Protected Financial Services */}
                  <Route path="/investment-planning" element={<RegulatoryDisclaimerGuard><InvestmentPlanning /></RegulatoryDisclaimerGuard>} />
                  <Route path="/wealth-management" element={<RegulatoryDisclaimerGuard><WealthManagement /></RegulatoryDisclaimerGuard>} />
                  <Route path="/nri-services" element={<RegulatoryDisclaimerGuard><NRIServices /></RegulatoryDisclaimerGuard>} />
                  <Route path="/indian-stock-analysis" element={<RegulatoryDisclaimerGuard><IndianStockAnalysis /></RegulatoryDisclaimerGuard>} />
                  <Route path="/usa-stock-analysis" element={<RegulatoryDisclaimerGuard><USAStockAnalysis /></RegulatoryDisclaimerGuard>} />
                  <Route path="/unlisted-shares" element={<RegulatoryDisclaimerGuard><UnlistedShares /></RegulatoryDisclaimerGuard>} />
                  <Route path="/ipo-analysis" element={<RegulatoryDisclaimerGuard><IPOAnalysis /></RegulatoryDisclaimerGuard>} />

                  {/* Tax Planning & Filing - Disclaimer Excluded */}
                  <Route path="/income-tax-filing" element={<IncomeTaxFiling />} />
                  <Route path="/tax-planning" element={<IncomeTaxFiling />} />
                  <Route path="/tax-filing" element={<IncomeTaxFiling />} />
                  <Route path="/global-tax-file" element={<IncomeTaxFiling />} />

                  {/* Contact & Careers - Freely Accessible Informational */}
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/careers" element={<Careers />} />

                  {/* Legal & Compliance - Freely Accessible Informational */}
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/disclaimer" element={<Disclaimer />} />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </PageTransition>
              <Footer />
              <Toaster />
            </div>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
