import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  LineChart, ChevronRight, ExternalLink, 
  Info, Clock, HomeIcon, Phone,
  ArrowRight, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { useIsMobile } from '@/hooks/use-mobile';
import { USAStockPopup } from '@/components/investment/USAStockPopup';
import { AppleScrollShowcase } from '@/components/investment/AppleScrollShowcase';
import { InvestmentArcGallery } from '@/components/investment/InvestmentArcGallery';

const InvestmentPlanning = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();
  const [usaStockPopupOpen, setUsaStockPopupOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDigitalGoldClick = () => {
    toast({
      title: "Coming Soon!",
      description: "We're getting our Digital Gold platform ready. Thank you for your interest! We'll inform you when we launch.",
      duration: 5000,
    });
  };
  
  const handleCryptoClick = () => {
    toast({
      title: "Coming Soon!",
      description: "We are waiting for Empannelment. Soon we will come up with Good news regarding Crypto Currency Investments!",
      duration: 5000,
    });
  };
  
  const handleContactAdvisor = () => {
    const phoneNumber = '8801313321';
    const whatsAppMessage = encodeURIComponent('Hi Finance Brunch Team, I\'m interested in your investment services. Can we connect?');
    
    if (isMobile) {
      window.location.href = `tel:+${phoneNumber}`;
    } else {
      window.open(`https://wa.me/${phoneNumber}?text=${whatsAppMessage}`, '_blank');
    }
  };

  // Apple-inspired smooth deceleration bezier
  const appleEase = [0.16, 1, 0.3, 1] as const;

  // Cinematic dropping headline animation variants
  const badgeVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : -22, 
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(8px)' 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.65, ease: appleEase, delay: 0.08 } 
    }
  };

  const headlineContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.22,
        staggerChildren: 0.08,
      }
    }
  };

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : -32, 
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(10px)' 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.75, ease: appleEase }
    }
  };

  const descVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : -18, 
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(6px)' 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: appleEase, delay: 0.58 }
    }
  };

  const ctaVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : -14, 
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(4px)' 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.65, ease: appleEase, delay: 0.76 }
    }
  };

  // Staggered card container for Comprehensive Services
  const sectionGridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      }
    }
  };

  const serviceCardVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 20,
      scale: shouldReduceMotion ? 1 : 0.98,
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(4px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: shouldReduceMotion ? 0 : 0.55, ease: appleEase }
    }
  };

  const getAssetUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const clean = path.startsWith('/') ? path.slice(1) : path;
    return `${import.meta.env.BASE_URL}${clean}`;
  };

  const handleStillBuildingClick = (serviceName: string) => {
    toast.info(`${serviceName} — We are still building`, {
      description: "Our investment research and engineering team is actively building this service to institutional standards. It will be launched shortly.",
      duration: 5000,
    });
  };

  interface InvestmentCardItem {
    id: string;
    title: string;
    image: string;
    imageAlt: string;
    description: string;
    buttonText: string;
    icon: React.ReactNode;
    linkTo?: string;
    onClick?: () => void;
    badge?: string;
    isBuilding?: boolean;
  }

  const investmentCards: InvestmentCardItem[] = [
    {
      id: "indian-stock-analysis",
      title: "Indian Stock Analysis",
      image: "/lovable-uploads/06b665ec-50f4-4f68-b7fe-836df10af649.png",
      imageAlt: "Indian Stock Analysis - BSE Building",
      description: "Expert analysis of Indian equity markets with actionable insights on stocks across various sectors and market capitalizations.",
      buttonText: "We are still building",
      badge: "We are still building",
      isBuilding: true,
      icon: <Clock className="ml-2 h-4 w-4" />,
      onClick: () => handleStillBuildingClick("Indian Stock Analysis"),
    },
    {
      id: "usa-stock-analysis",
      title: "USA Stock Analysis",
      image: "/lovable-uploads/39526ab9-be38-46a7-9a10-857828b19686.png",
      imageAlt: "USA Stock Analysis - Wall Street",
      description: "In-depth research on US equities, focusing on growth stocks, tech companies, and dividend-yielding investments across NASDAQ and NYSE.",
      buttonText: "Explore USA Markets",
      icon: <ChevronRight className="ml-2 h-4 w-4" />,
      linkTo: "/usa-stock-analysis",
    },
    {
      id: "ipo-analysis",
      title: "IPO Analysis",
      image: "/lovable-uploads/57727f9c-2aca-4226-99e9-efa57dc9848f.png",
      imageAlt: "IPO Analysis",
      description: "Detailed evaluation of upcoming IPOs, including business models, financial health, valuation, and potential for long-term growth.",
      buttonText: "View IPO Insights",
      icon: <ChevronRight className="ml-2 h-4 w-4" />,
      linkTo: "/ipo-analysis",
    },
    {
      id: "unlisted-shares",
      title: "Unlisted Shares",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      imageAlt: "Unlisted Shares",
      description: "Access to private equity opportunities in promising companies before they go public, offering potential for significant returns.",
      buttonText: "We are still building",
      badge: "We are still building",
      isBuilding: true,
      icon: <Clock className="ml-2 h-4 w-4" />,
      onClick: () => handleStillBuildingClick("Unlisted Shares"),
    },
    {
      id: "digital-gold",
      title: "Digital Gold",
      image: "/lovable-uploads/75e0d2e9-6d50-49f9-abe9-5236913686da.png",
      imageAlt: "Digital Gold",
      description: "Invest in 99.9% pure gold electronically without worrying about storage, security, or authenticity issues.",
      buttonText: "We are still building",
      badge: "We are still building",
      isBuilding: true,
      icon: <Clock className="ml-2 h-4 w-4" />,
      onClick: () => handleStillBuildingClick("Digital Gold"),
    },
    {
      id: "crypto-currency",
      title: "Crypto Currency Investments",
      image: "/lovable-uploads/b7af595c-860c-4bed-8735-64391a005af9.png",
      imageAlt: "Crypto Currency",
      description: "Strategic guidance on blockchain assets and cryptocurrencies, helping you navigate this emerging investment class with confidence.",
      buttonText: "We are still building",
      badge: "We are still building",
      isBuilding: true,
      icon: <Clock className="ml-2 h-4 w-4" />,
      onClick: handleStillBuildingClick("Crypto Currency Investments"),
    },
  ];

  const headlineWords = ["Maximize", "Your", "Investment", "Potential"];

  return (
    <div className="flex flex-col min-h-screen selection:bg-cyan-500/20 selection:text-cyan-600">
      <ScrollToTop />
      <USAStockPopup open={usaStockPopupOpen} onOpenChange={setUsaStockPopupOpen} />

      {/* Main Container with reduced top spacing */}
      <main className="flex-grow pt-16 sm:pt-20">
        
        {/* Compact Back-to-Home utility row */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1">
          <Link to="/">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-full px-3 py-1.5 transition-all shadow-sm hover:shadow"
            >
              <HomeIcon className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
        
        {/* 1. COMPACT HERO SECTION WITH DROPPING ANIMATION */}
        <section className="relative pt-4 sm:pt-6 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-blue-50/40 via-transparent to-transparent dark:from-blue-950/20 dark:via-transparent">
          
          {/* Centered Translucent FB Watermark complementing the headline */}
          <div 
            aria-hidden="true" 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 opacity-[0.055] dark:opacity-[0.075] transition-opacity duration-500"
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/fb-watermark.png`} 
              alt="" 
              className="w-[280px] sm:w-[380px] md:w-[460px] lg:w-[540px] h-auto object-contain filter contrast-105 dark:brightness-110" 
              loading="eager"
            />
          </div>

          {/* Ambient Lighting Blooms */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-25 dark:opacity-15 pointer-events-none">
            <div className="absolute top-[10%] right-[10%] w-64 h-64 rounded-full bg-blue-400/25 filter blur-3xl" />
            <div className="absolute bottom-[20%] right-[20%] w-48 h-48 rounded-full bg-purple-400/25 filter blur-2xl" />
          </div>
          <div className="absolute top-0 left-0 w-1/3 h-full opacity-25 dark:opacity-15 pointer-events-none">
            <div className="absolute top-[30%] left-[10%] w-56 h-56 rounded-full bg-indigo-400/25 filter blur-3xl" />
            <div className="absolute bottom-[10%] left-[20%] w-48 h-48 rounded-full bg-cyan-400/25 filter blur-2xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              
              {/* 1. Category Badge dropping from above */}
              <motion.div 
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full py-1.5 px-4 mb-4 sm:mb-5 border border-blue-200/70 dark:border-blue-900/60 shadow-sm"
              >
                <LineChart size={15} className="text-blue-600 dark:text-cyan-400" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-blue-700 dark:text-cyan-300">
                  Strategic Investment Solutions
                </span>
              </motion.div>
              
              {/* 2. Headline dropping into place with word-by-word stagger */}
              <motion.h1 
                variants={headlineContainerVariants}
                initial="hidden"
                animate="visible"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-5 tracking-tight flex flex-wrap justify-center gap-x-3 gap-y-1"
              >
                {headlineWords.map((word, index) => (
                  <motion.span 
                    key={index} 
                    variants={wordVariants}
                    className="inline-block bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
              
              {/* 3. Description dropping into position */}
              <motion.p 
                variants={descVariants}
                initial="hidden"
                animate="visible"
                className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed font-normal"
              >
                Our expert investment planning services help you navigate financial markets with confidence and build wealth for your future, whether you're in India or abroad.
              </motion.p>

              {/* 4. Action button entering last */}
              <motion.div 
                variants={ctaVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-center pt-2"
              >
                <a 
                  href="#comprehensive-investment-services"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-lg hover:scale-105 active:scale-100"
                >
                  <span>Explore Services</span>
                  <ChevronRight size={15} className="ml-1.5" />
                </a>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* 2. WHY CHOOSE OUR INVESTMENT SERVICES CAROUSEL */}
        <section className="py-8 bg-transparent" id="why-choose-investment-services">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <InvestmentArcGallery />
          </div>
        </section>
        
        {/* 3. COMPREHENSIVE INVESTMENT SERVICES SECTION */}
        <section 
          className="py-16 sm:py-20 bg-transparent scroll-mt-20"
          id="comprehensive-investment-services"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
              <span className="inline-block px-3.5 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-900/60 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                Investment Solutions
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">
                Comprehensive Investment Services
              </h2>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Choose from our range of specialized investment services tailored to meet your financial objectives and risk tolerance.
              </p>
            </div>
            
            {/* 6 Comprehensive Services Cards with Staggered Entrance - 3 columns on desktop, 2 on tablet, 1 on mobile */}
            <motion.div 
              variants={sectionGridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch"
            >
              {investmentCards.map((card) => (
                <motion.div 
                  key={card.id} 
                  variants={serviceCardVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group flex flex-col h-full"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={getAssetUrl(card.image)} 
                      alt={card.imageAlt} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                    {card.badge && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-slate-950 shadow-md backdrop-blur-md border border-amber-300 font-mono">
                          {card.badge}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-xl font-bold text-white tracking-tight">{card.title}</h3>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow leading-relaxed text-sm sm:text-base">
                      {card.description}
                    </p>
                    <div className="flex justify-center mt-auto">
                      {card.linkTo ? (
                        <Link to={card.linkTo} className="w-full">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors">
                            <span>{card.buttonText}</span>
                            {card.icon}
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          className={`w-full font-medium shadow-sm transition-all ${
                            card.isBuilding
                              ? 'bg-amber-600/90 hover:bg-amber-600 text-white border border-amber-400/30 font-semibold'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                          onClick={card.onClick}
                        >
                          <span>{card.buttonText}</span>
                          {card.icon}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 4. CALL TO ACTION SECTION */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-100 mb-4">
                <Shield className="w-3.5 h-3.5 text-cyan-300" />
                <span>Personalized Wealth Advisory</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight text-white leading-tight">
                Ready to Elevate Your Investment Strategy?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-blue-100/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Our team of expert advisors is ready to guide you toward financial success with personalized investment solutions.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-slate-950 hover:bg-blue-50 font-bold rounded-full px-8 py-3 text-sm sm:text-base shadow-xl shadow-blue-950/20 hover:scale-105 active:scale-100 transition-all duration-300"
                onClick={handleContactAdvisor}
              >
                {isMobile ? (
                  <>
                    <span>Call an Advisor</span>
                    <Phone className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Connect with an Advisor</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
        
        {/* Bottom Back-to-Home button */}
        <div className="container mx-auto px-4 py-10 flex justify-center">
          <Link to="/">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm hover:shadow"
            >
              <HomeIcon className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default InvestmentPlanning;
