import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  TrendingUp, Globe, FileText, DollarSign, CandlestickChart, 
  Users, ExternalLink, ChevronRight, MessageSquare, ArrowRight,
  Shield, Sparkles, CheckCircle2, CornerDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * EXACT CONSTANTS EXPOSED AS SPECIFIED IN REQUIREMENT
 */
export const INVESTMENT_ARC_CONSTANTS = {
  LOOP_THRESHOLD: 8,
  ARC_RADIUS_MULTIPLIER_DESKTOP: 1.05,
  ARC_RADIUS_MULTIPLIER_MOBILE: 1.5,
  TITLE_GAP_RATIO: 0.07,
  CARD_SCALE_STEP: 0.14,
  MIN_CARD_SCALE: 0.5,
  PIN_LENGTH_PER_PROJECT_DESKTOP: 0.55,
  PIN_LENGTH_PER_PROJECT_MOBILE: 0.40,
  SCRUB: 0.6,
  CARD_HEIGHT_RATIO: 0.52,
  CARD_ASPECT_RATIO_EXPANDED: 0.62,
  MAX_CARD_HEIGHT: 600,
  MOBILE_BREAKPOINT: 769,
};

export interface InvestmentArcItem {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  category: 'Institutional' | 'Global' | 'Alternative';
  tags: string[];
  description: string;
  imageUrl: string;
  liveLinkText?: string;
  liveLinkUrl?: string;
  githubLinkText?: string;
  githubLinkUrl?: string;
}

export const INVESTMENT_ARC_DATA: InvestmentArcItem[] = [
  {
    id: 'data-driven',
    number: '01',
    title: 'Data-Driven Approach',
    shortTitle: 'DATA-DRIVEN RESEARCH',
    category: 'Institutional',
    tags: ['SEBI-Accredited', 'Algorithmic Alpha', 'Fundamental Data'],
    description: 'Our recommendations are backed by thorough research, quantitative modeling, and seasoned SEBI-accredited market expertise.',
    imageUrl: '/lovable-uploads/06b665ec-50f4-4f68-b7fe-836df10af649.png',
    liveLinkText: 'Research Methodology',
    liveLinkUrl: 'https://financebrunch.in',
    githubLinkText: 'Alpha Strategy',
    githubLinkUrl: '#',
  },
  {
    id: 'global-diversification',
    number: '02',
    title: 'Global Diversification',
    shortTitle: 'GLOBAL DIVERSIFICATION',
    category: 'Global',
    tags: ['US Equities', 'LRS Remittances', 'Tech Leaders'],
    description: 'Strategic allocation across high-growth Indian equities and US tech leaders delivers seamless geographical diversification and USD compounding.',
    imageUrl: '/lovable-uploads/39526ab9-be38-46a7-9a10-857828b19686.png',
    liveLinkText: 'US Equities Desk',
    liveLinkUrl: '/usa-stock-analysis',
    githubLinkText: 'LRS Framework',
    githubLinkUrl: '#',
  },
  {
    id: 'exclusive-opportunities',
    number: '03',
    title: 'Exclusive Opportunities',
    shortTitle: 'PRE-IPO & UNLISTED',
    category: 'Alternative',
    tags: ['Pre-IPO Equity', 'Private Shares', 'Late-Stage Ventures'],
    description: 'Curated access to vetted pre-IPO opportunities and high-conviction unlisted shares prior to formal public exchange listings.',
    imageUrl: '/lovable-uploads/57727f9c-2aca-4226-99e9-efa57dc9848f.png',
    liveLinkText: 'Unlisted Portfolio',
    liveLinkUrl: '/investment-planning',
    githubLinkText: 'Valuation Audit',
    githubLinkUrl: '#',
  },
  {
    id: 'alternative-investments',
    number: '04',
    title: 'Alternative Investments',
    shortTitle: 'ALTERNATIVE ASSETS',
    category: 'Alternative',
    tags: ['Digital Gold', 'Inflation Hedge', 'Commodity Alpha'],
    description: 'Innovative investment solutions including 99.9% 24K pure Digital Gold serving as reliable inflation hedges and portfolio stabilizers.',
    imageUrl: '/lovable-uploads/75e0d2e9-6d50-49f9-abe9-5236913686da.png',
    liveLinkText: 'Digital Gold Desk',
    liveLinkUrl: '/investment-planning',
    githubLinkText: 'Vault Custody',
    githubLinkUrl: '#',
  },
  {
    id: 'technical-expertise',
    number: '05',
    title: 'Technical Expertise',
    shortTitle: 'TECHNICAL STRATEGY',
    category: 'Institutional',
    tags: ['Trailing Stops', 'Risk Management', 'Breakout Structures'],
    description: 'Multi-timeframe structural chart analysis and trailing stop-loss strategies to identify high-probability entries while guarding capital.',
    imageUrl: '/lovable-uploads/b7af595c-860c-4bed-8735-64391a005af9.png',
    liveLinkText: 'Technical Engine',
    liveLinkUrl: '/investment-planning',
    githubLinkText: 'Risk Rules',
    githubLinkUrl: '#',
  },
  {
    id: 'strong-client-network',
    number: '06',
    title: 'Strong Client Network',
    shortTitle: 'ADVISORY COMMUNITY',
    category: 'Global',
    tags: ['1-on-1 Reviews', 'High-Net-Worth', 'Direct Advisory'],
    description: 'Join 1,000+ informed wealth creators with personalized 1-on-1 advisor reviews, direct WhatsApp access, and proactive allocation updates.',
    imageUrl: '/lovable-uploads/26c5a7e3-fcfa-4500-ae98-4f465f3ac8b1.png',
    liveLinkText: 'Meet Your Advisor',
    liveLinkUrl: 'https://wa.me/917842494981',
    githubLinkText: 'Client Reviews',
    githubLinkUrl: '/about',
  },
];

const FILTER_TABS = [
  { id: 'all', label: 'All Projects' },
  { id: 'institutional', label: 'Institutional' },
  { id: 'global', label: 'Global Wealth' },
  { id: 'alternative', label: 'Alternative Assets' },
];

export const InvestmentArcGallery: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [metaOpacity, setMetaOpacity] = useState(1);
  const [imageLoadedState, setImageLoadedState] = useState<Record<string, boolean>>({});
  const [imageErrorState, setImageErrorState] = useState<Record<string, boolean>>({});

  // Filter projects dynamically - N is read from the data array
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return INVESTMENT_ARC_DATA;
    return INVESTMENT_ARC_DATA.filter(
      (item) => item.category.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [activeFilter]);

  const count = filteredProjects.length;
  const isLooping = count >= INVESTMENT_ARC_CONSTANTS.LOOP_THRESHOLD;

  const handleImageLoad = (id: string) => {
    setImageLoadedState((prev) => ({ ...prev, [id]: true }));
  };

  const handleImageError = (id: string) => {
    setImageErrorState((prev) => ({ ...prev, [id]: true }));
  };

  // Dimensions & layout metrics ref
  const metricsRef = useRef({
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,
    arcRadius: 1200,
    cardWidth: 260,
    cardHeight: 420,
    pinDistance: 2500,
  });

  const titleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const overlayRefs = useRef<Array<HTMLDivElement | null>>([]);

  const measureLayout = useCallback(() => {
    if (typeof window === 'undefined') return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < INVESTMENT_ARC_CONSTANTS.MOBILE_BREAKPOINT;

    const arcRadius = isMobile
      ? vw * INVESTMENT_ARC_CONSTANTS.ARC_RADIUS_MULTIPLIER_MOBILE
      : vw * INVESTMENT_ARC_CONSTANTS.ARC_RADIUS_MULTIPLIER_DESKTOP;

    const cardHeight = isMobile
      ? Math.min(vh * 0.44, vw * 0.68)
      : Math.min(
          vh * INVESTMENT_ARC_CONSTANTS.CARD_HEIGHT_RATIO,
          INVESTMENT_ARC_CONSTANTS.MAX_CARD_HEIGHT
        );

    const cardWidth = cardHeight * INVESTMENT_ARC_CONSTANTS.CARD_ASPECT_RATIO_EXPANDED;

    const pinPerProject = isMobile
      ? INVESTMENT_ARC_CONSTANTS.PIN_LENGTH_PER_PROJECT_MOBILE
      : INVESTMENT_ARC_CONSTANTS.PIN_LENGTH_PER_PROJECT_DESKTOP;

    // Pin length scales with N
    const pinDistance = Math.max(vh * 1.5, count * pinPerProject * vh);

    metricsRef.current = {
      viewportWidth: vw,
      viewportHeight: vh,
      isMobile,
      arcRadius,
      cardWidth,
      cardHeight,
      pinDistance,
    };
  }, [count]);

  // Motion update driven by ScrollTrigger progress [0, 1]
  const updateGalleryMotion = useCallback((progress: number) => {
    if (!count) return;

    const {
      viewportWidth: vw,
      viewportHeight: vh,
      arcRadius,
      cardWidth,
      isMobile,
    } = metricsRef.current;

    const centerX = vw / 2;
    const titleApexY = vh * 0.22; // ~22% from the top
    const cardBottomY = vh * 0.88; // Anchor portrait cards at bottom center

    // Virtual continuous cursor position [0, count]
    const continuousIndex = isLooping ? progress * count : progress * (count - 1);

    // Nearest centered item
    const nearestIndex = isLooping
      ? Math.round(continuousIndex) % count
      : Math.min(count - 1, Math.max(0, Math.round(continuousIndex)));

    setActiveIndex(nearestIndex);

    // Meta row visibility (visible only for active item, fades out quickly off-center)
    let activeDelta = nearestIndex - continuousIndex;
    if (isLooping) {
      if (activeDelta > count / 2) activeDelta -= count;
      if (activeDelta < -count / 2) activeDelta += count;
    }
    const metaFade = Math.max(0, 1 - Math.abs(activeDelta) / 0.28);
    setMetaOpacity(metaFade);

    // Spacing between titles on circular arc
    const angularStep = isMobile ? 0.68 : 0.54;

    for (let i = 0; i < count; i++) {
      let delta = i - continuousIndex;
      if (isLooping) {
        if (delta > count / 2) delta -= count;
        if (delta < -count / 2) delta += count;
      }

      const absDelta = Math.abs(delta);

      // -------------------------------------------------------------
      // 1. GIANT TITLE LAYER: Circular arc trajectory
      // -------------------------------------------------------------
      const titleEl = titleRefs.current[i];
      if (titleEl) {
        const theta = delta * angularStep;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        const titleX = centerX + arcRadius * sinT;
        const titleY = titleApexY + arcRadius * (1 - cosT);
        const titleRotation = theta * (180 / Math.PI) * 0.75;

        // Opacity gating to prevent title collision
        let titleOpacity = 0;
        if (absDelta < 0.25) {
          titleOpacity = 1;
        } else if (absDelta < 0.65) {
          titleOpacity = (0.65 - absDelta) / 0.40;
        }

        titleEl.style.transform = `translate3d(-50%, -50%, 0) translate3d(${titleX}px, ${titleY}px, 0) rotate(${titleRotation}deg)`;
        titleEl.style.opacity = String(Math.max(0, Math.min(1, titleOpacity)));
        titleEl.style.display = absDelta > 0.65 ? 'none' : 'block';
      }

      // -------------------------------------------------------------
      // 2. IMAGE CARD LAYER: Horizontal row with scale and dark overlay
      // -------------------------------------------------------------
      const cardEl = cardRefs.current[i];
      const overlayEl = overlayRefs.current[i];

      if (cardEl) {
        // Centered is full size (1.0), each neighbor shrinks by 14% (down to 0.5)
        const scale = Math.max(
          INVESTMENT_ARC_CONSTANTS.MIN_CARD_SCALE,
          1 - absDelta * INVESTMENT_ARC_CONSTANTS.CARD_SCALE_STEP
        );

        // Cards sit flush, overlapping slightly with near compression
        const sign = Math.sign(delta);
        const offsetCompress =
          absDelta <= 1
            ? absDelta * (cardWidth * 0.78)
            : cardWidth * 0.78 + (absDelta - 1) * (cardWidth * 0.55);

        const cardX = centerX + sign * offsetCompress;
        const cardY = cardBottomY;

        // Centered card has highest stacking order
        const zIndex = 40 - Math.min(30, Math.round(absDelta * 4));

        cardEl.style.transform = `translate3d(-50%, -100%, 0) translate3d(${cardX}px, ${cardY}px, 0) scale(${scale})`;
        cardEl.style.zIndex = String(zIndex);
        cardEl.style.opacity = absDelta > 4.5 ? '0' : '1';
        cardEl.style.display = absDelta > 5 ? 'none' : 'block';

        if (overlayEl) {
          // Dark overlay grows with distance up to 80% black so center pops
          const overlayAlpha = Math.min(0.80, Math.max(0, absDelta * 0.38));
          overlayEl.style.opacity = String(overlayAlpha);
        }
      }
    }
  }, [count, isLooping]);

  // Click non-centered card scrolls to center it; click centered activates
  const handleCardClick = (idx: number) => {
    if (!triggerRef.current || !count) return;

    if (idx === activeIndex) {
      const activeProj = filteredProjects[idx];
      if (activeProj?.liveLinkUrl) {
        window.open(activeProj.liveLinkUrl, '_blank');
      }
      return;
    }

    let targetProgress = isLooping ? idx / count : idx / (count - 1);
    const trigger = triggerRef.current;
    const targetScrollY = trigger.start + targetProgress * (trigger.end - trigger.start);

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });
  };

  // Keyboard navigation support
  const handleCardKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(idx);
    }
  };

  // Setup GSAP and ScrollTrigger pinned gallery
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !galleryRef.current || !sectionRef.current) return;

    measureLayout();
    const { pinDistance } = metricsRef.current;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: galleryRef.current,
        start: 'top top',
        end: `+=${pinDistance}`,
        pin: true,
        scrub: INVESTMENT_ARC_CONSTANTS.SCRUB,
        anticipatePin: 1,
        onUpdate: (self) => {
          updateGalleryMotion(self.progress);
        },
      });

      triggerRef.current = trigger;
      updateGalleryMotion(0);
    }, sectionRef);

    const handleResize = () => {
      measureLayout();
      ScrollTrigger.refresh();
      if (triggerRef.current) {
        updateGalleryMotion(triggerRef.current.progress);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ctx.revert();
      if (triggerRef.current) {
        triggerRef.current.kill();
        triggerRef.current = null;
      }
    };
  }, [count, activeFilter, measureLayout, updateGalleryMotion]);

  const activeProject = filteredProjects[activeIndex] || filteredProjects[0];

  return (
    <div
      ref={sectionRef}
      className="relative w-full bg-[#181818] text-[#f5f5f5] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl"
    >
      {/* Pinned Cinematic Gallery Container */}
      <div
        ref={galleryRef}
        className="w-full h-screen overflow-hidden relative select-none bg-[#181818]"
        tabIndex={0}
        aria-label="Why Choose Our Investment Services - Pinned Scroll Gallery"
      >
        {/* Ambient Top Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(198,255,61,0.06),transparent_60%)]" />

        {/* Top Header Bar & Category Tabs */}
        <div className="absolute top-5 left-0 right-0 z-40 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c6ff3d] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Why Choose Finance Brunch &bull; {count} Core Pillars
            </span>
          </div>

          {/* Filter Tabs - Rebuilds gallery dynamically */}
          <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10 backdrop-blur-md">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id);
                  setActiveIndex(0);
                }}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                  activeFilter === tab.id
                    ? 'bg-[#c6ff3d] text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. GIANT TITLE LAYER (Curved on huge arc wheel, ~22% from top) */}
        {/* ------------------------------------------------------------- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {filteredProjects.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => {
                titleRefs.current[idx] = el;
              }}
              className="absolute left-0 top-0 whitespace-nowrap will-change-transform"
              style={{
                fontFamily:
                  'Impact, "Arial Black", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              <span className="text-[6.5vw] sm:text-[5.5rem] lg:text-[7rem] font-black uppercase text-white/95 drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
                {item.shortTitle}
              </span>
            </div>
          ))}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. META LAYER (~30% from top, centered, visible for active)    */}
        {/* ------------------------------------------------------------- */}
        <div
          className="absolute top-[28%] sm:top-[30%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-center w-full max-w-2xl px-4 pointer-events-auto transition-opacity duration-150"
          style={{
            opacity: metaOpacity,
            pointerEvents: metaOpacity > 0.3 ? 'auto' : 'none',
          }}
        >
          {activeProject && (
            <div className="space-y-3">
              {/* Number and Category Pill */}
              <div className="flex items-center justify-center gap-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-[#c6ff3d]/15 border border-[#c6ff3d]/30 font-bold text-[#c6ff3d]">
                  {activeProject.number}
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-300 tracking-wider font-semibold">
                  {activeProject.title}
                </span>
              </div>

              {/* Up to 3 Lime-Green Outline Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {activeProject.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1 rounded-full text-xs font-mono border border-[#c6ff3d] text-[#c6ff3d] bg-[#c6ff3d]/5 backdrop-blur-sm shadow-[0_0_12px_rgba(198,255,61,0.12)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description preview */}
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto line-clamp-2 leading-relaxed">
                {activeProject.description}
              </p>

              {/* Action Links */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href="https://wa.me/917842494981?text=Hi%20Finance%20Brunch,%20I'm%20interested%20in%20your%20investment%20advisory%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#c6ff3d] text-slate-950 hover:bg-[#d4ff66] transition-all cursor-pointer shadow-lg font-mono"
                >
                  <span>Connect on WhatsApp</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {activeProject.liveLinkUrl && (
                  <a
                    href={activeProject.liveLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 border border-slate-700 bg-white/5 hover:bg-white/10 transition-all cursor-pointer font-mono"
                  >
                    <span>{activeProject.liveLinkText || 'Learn More'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. IMAGE CARD LAYER (Anchored at bottom center)               */}
        {/* ------------------------------------------------------------- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {filteredProjects.map((item, idx) => {
            const isLoaded = !!imageLoadedState[item.id];
            const hasError = !!imageErrorState[item.id];
            const isCurrent = idx === activeIndex;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => handleCardClick(idx)}
                onKeyDown={(e) => handleCardKeyDown(e, idx)}
                tabIndex={0}
                role="button"
                aria-current={isCurrent ? 'true' : 'false'}
                aria-label={`Pillar ${item.number}: ${item.title}`}
                className="absolute left-0 top-0 cursor-pointer pointer-events-auto rounded-3xl will-change-transform focus:outline-none focus:ring-2 focus:ring-[#c6ff3d]"
                style={{
                  width: `${metricsRef.current.cardWidth}px`,
                  height: `${metricsRef.current.cardHeight}px`,
                }}
              >
                {/* Active Bracket Marker Framing Center Card */}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[calc(100%+14px)] pointer-events-none z-30 flex items-center justify-between">
                    <span className="w-3 h-3 border-t-2 border-l-2 border-[#c6ff3d]" />
                    <div className="h-[2px] bg-[#c6ff3d]/50 flex-1 mx-2" />
                    <span className="w-3 h-3 border-t-2 border-r-2 border-[#c6ff3d]" />
                  </div>
                )}

                {/* Card Container Frame */}
                <div className="relative w-full h-full bg-[#121622] border border-white/15 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
                  {/* Shimmering Skeleton Placeholder */}
                  {!isLoaded && !hasError && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
                  )}

                  {/* Fallback Display if Image Fails */}
                  {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-slate-900">
                      <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
                        {item.title}
                      </span>
                    </div>
                  )}

                  {/* Card Background Visual */}
                  {!hasError && (
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src="/images/calculator-card-bg.jpg"
                        alt={item.title}
                        onLoad={() => handleImageLoad(item.id)}
                        onError={() => handleImageError(item.id)}
                        className={`w-full h-full object-cover object-center transition-all duration-500 ${
                          isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      {/* Photographic depth overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 pointer-events-none" />
                    </div>
                  )}

                  {/* Top Header Pill */}
                  <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white border border-white/10 backdrop-blur-md">
                      {item.number}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#c6ff3d]/15 text-[#c6ff3d] border border-[#c6ff3d]/30 backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Bottom Title Card Strip */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 pt-10 bg-gradient-to-t from-black via-black/90 to-transparent z-10 space-y-1">
                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-mono text-[#c6ff3d] truncate">
                      {item.tags[0]}
                    </p>
                  </div>

                  {/* Dark Dimming Overlay for Non-Centered Cards */}
                  <div
                    ref={(el) => {
                      overlayRefs.current[idx] = el;
                    }}
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150"
                    style={{ opacity: 0 }}
                  />

                  {/* Screen-reader description */}
                  <span className="sr-only">
                    {item.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll Hint at Bottom Center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
          <span>Scroll down to navigate through investment pillars</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#c6ff3d] animate-ping" />
        </div>
      </div>
    </div>
  );
};

export default InvestmentArcGallery;
