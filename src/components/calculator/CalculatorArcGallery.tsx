import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CalculatorMeta } from '@/utils/calculators/calculatorCatalog';
import { ARC_GALLERY_CONSTANTS } from './arcGalleryConstants';
import { getCalculatorCardData, CalculatorCardData } from './calculatorVisuals';
import { scrollWindowTo } from '@/lib/smoothScroll';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CalculatorArcGalleryProps {
  calculators: CalculatorMeta[];
  onSelectCalculator: (slug: string) => void;
  onCollapse?: () => void;
}

export const CalculatorArcGallery: React.FC<CalculatorArcGalleryProps> = ({
  calculators,
  onSelectCalculator,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [metaOpacity, setMetaOpacity] = useState(1);
  const [imageLoadedState, setImageLoadedState] = useState<Record<string, boolean>>({});
  const [imageErrorState, setImageErrorState] = useState<Record<string, boolean>>({});

  const count = calculators.length;
  const isLooping = count >= ARC_GALLERY_CONSTANTS.LOOP_THRESHOLD;

  // Pre-compute card metadata for each calculator
  const cardDataList = useMemo<Array<{ calc: CalculatorMeta; data: CalculatorCardData }>>(() => {
    return calculators.map((calc, idx) => ({
      calc,
      data: getCalculatorCardData(calc, idx),
    }));
  }, [calculators]);

  // Handle image load / error events
  const handleImageLoad = (id: string) => {
    setImageLoadedState((prev) => ({ ...prev, [id]: true }));
  };

  const handleImageError = (id: string) => {
    setImageErrorState((prev) => ({ ...prev, [id]: true }));
  };

  // Dimensions & responsive metrics ref
  const metricsRef = useRef({
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,
    arcRadius: 1200,
    cardWidth: 260,
    cardHeight: 420,
    pinDistance: 3000,
  });

  const titleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const overlayRefs = useRef<Array<HTMLDivElement | null>>([]);

  const measureLayout = useCallback(() => {
    if (typeof window === 'undefined') return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < ARC_GALLERY_CONSTANTS.MOBILE_BREAKPOINT;

    const arcRadius = isMobile
      ? vw * ARC_GALLERY_CONSTANTS.ARC_RADIUS_MULTIPLIER_MOBILE
      : vw * ARC_GALLERY_CONSTANTS.ARC_RADIUS_MULTIPLIER_DESKTOP;

    const cardHeight = isMobile
      ? Math.min(vh * 0.44, vw * 0.68)
      : Math.min(vh * ARC_GALLERY_CONSTANTS.CARD_HEIGHT_RATIO, ARC_GALLERY_CONSTANTS.MAX_CARD_HEIGHT);

    const cardWidth = cardHeight * ARC_GALLERY_CONSTANTS.CARD_ASPECT_RATIO_EXPANDED;

    const pinPerProject = isMobile
      ? ARC_GALLERY_CONSTANTS.PIN_LENGTH_PER_PROJECT_MOBILE
      : ARC_GALLERY_CONSTANTS.PIN_LENGTH_PER_PROJECT_DESKTOP;

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

  // Main motion update function driven by ScrollTrigger progress [0, 1]
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
    const titleApexY = vh * 0.20; // Position title near upper part (20% from top)
    const cardBottomY = vh * 0.88; // Anchor cards near bottom center

    // Virtual continuous cursor position [0, count]
    const continuousIndex = isLooping
      ? progress * count
      : progress * (count - 1);

    // Active centered card index
    const nearestIndex = isLooping
      ? Math.round(continuousIndex) % count
      : Math.min(count - 1, Math.max(0, Math.round(continuousIndex)));

    setActiveIndex(nearestIndex);

    // Meta row visibility (visible only when active project is centered)
    let activeDelta = nearestIndex - continuousIndex;
    if (isLooping) {
      if (activeDelta > count / 2) activeDelta -= count;
      if (activeDelta < -count / 2) activeDelta += count;
    }
    const metaFade = Math.max(0, 1 - Math.abs(activeDelta) / 0.28);
    setMetaOpacity(metaFade);

    // Angular distance step between titles along circular arc (generously spaced to prevent any overlap)
    const angularStep = isMobile ? 0.65 : 0.52;

    // Position each title and card
    for (let i = 0; i < count; i++) {
      let delta = i - continuousIndex;
      if (isLooping) {
        if (delta > count / 2) delta -= count;
        if (delta < -count / 2) delta += count;
      }

      const absDelta = Math.abs(delta);

      // -----------------------------------------------------------
      // 1. GIANT TITLE LAYER: Fixed separation to eliminate mixing
      // -----------------------------------------------------------
      const titleEl = titleRefs.current[i];
      if (titleEl) {
        const angleRad = delta * angularStep;
        const angleDeg = (angleRad * 180) / Math.PI;

        const titleX = centerX + arcRadius * Math.sin(angleRad);
        const titleY = titleApexY + arcRadius * (1 - Math.cos(angleRad));

        // Strict opacity gate: ONLY the title near the center is visible!
        // Prevents titles from overlapping or colliding with each other.
        let titleOpacity = 0;
        if (absDelta < 0.25) {
          titleOpacity = 1;
        } else if (absDelta < 0.65) {
          titleOpacity = (0.65 - absDelta) / 0.40;
        }

        if (titleOpacity > 0.01) {
          titleEl.style.display = 'block';
          titleEl.style.opacity = titleOpacity.toFixed(3);
          titleEl.style.transform = `translate3d(${titleX}px, ${titleY}px, 0) translate(-50%, -50%) rotate(${angleDeg.toFixed(2)}deg)`;
        } else {
          titleEl.style.display = 'none';
        }
      }

      // -----------------------------------------------------------
      // 2. PORTRAIT CARD LAYER: Scale, Overlap, Z-Index & Dark Overlay
      // -----------------------------------------------------------
      const cardEl = cardRefs.current[i];
      const overlayEl = overlayRefs.current[i];

      if (cardEl) {
        // Center card is 1.0; each step shrinks by 14% (minimum 50%)
        const scale = Math.max(
          ARC_GALLERY_CONSTANTS.MIN_CARD_SCALE,
          1 - absDelta * ARC_GALLERY_CONSTANTS.CARD_SCALE_STEP
        );

        // Near cards compress; far cards space out smoothly
        const direction = Math.sign(delta);
        let cardOffsetX = 0;
        if (absDelta < 1) {
          cardOffsetX = delta * cardWidth * 0.78;
        } else {
          cardOffsetX = direction * (cardWidth * 0.78 + (absDelta - 1) * cardWidth * 0.58);
        }

        const cardX = centerX + cardOffsetX;
        const cardY = cardBottomY;

        // Centered card has highest stacking order
        const zIndex = Math.round(60 - Math.min(50, absDelta * 8));

        // Visibility culling for performance
        if (absDelta < 5.5) {
          cardEl.style.display = 'block';
          cardEl.style.zIndex = String(zIndex);
          cardEl.style.transform = `translate3d(${cardX}px, ${cardY}px, 0) translate(-50%, -100%) scale(${scale.toFixed(3)})`;
          cardEl.setAttribute('aria-current', absDelta < 0.4 ? 'true' : 'false');

          // Dark overlay grows with distance up to 75% black so active pops
          if (overlayEl) {
            const overlayOpacity = Math.min(0.75, absDelta * 0.38);
            overlayEl.style.opacity = overlayOpacity.toFixed(2);
          }
        } else {
          cardEl.style.display = 'none';
        }
      }
    }
  }, [count, isLooping]);

  // Initialize ScrollTrigger pin and synchronization
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current || !galleryRef.current) {
      return;
    }

    measureLayout();

    const trigger = ScrollTrigger.create({
      id: 'fb-arc-gallery-pin',
      trigger: sectionRef.current,
      pin: galleryRef.current,
      pinSpacing: true,
      start: 'top top',
      end: () => `+=${metricsRef.current.pinDistance}`,
      scrub: ARC_GALLERY_CONSTANTS.SCRUB,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefreshInit: measureLayout,
      onUpdate: (self) => updateGalleryMotion(self.progress),
      onRefresh: (self) => updateGalleryMotion(self.progress),
    });

    triggerRef.current = trigger;

    const handleResize = () => {
      measureLayout();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);
    document.fonts?.ready?.then(() => {
      measureLayout();
      ScrollTrigger.refresh();
    });

    // Initial render
    updateGalleryMotion(0);

    return () => {
      window.removeEventListener('resize', handleResize);
      trigger.kill(true);
      triggerRef.current = null;
    };
  }, [measureLayout, updateGalleryMotion]);

  // Navigate directly to a specific card when clicked
  const navigateToCard = (targetIndex: number) => {
    if (targetIndex === activeIndex) {
      // Centered card opens calculator
      onSelectCalculator(calculators[targetIndex].slug);
      return;
    }

    // Non-centered card glides smoothly to center
    const trigger = triggerRef.current;
    if (!trigger) {
      setActiveIndex(targetIndex);
      return;
    }

    const targetProgress = isLooping
      ? targetIndex / count
      : targetIndex / (count - 1);

    const targetScrollY = trigger.start + targetProgress * (trigger.end - trigger.start);
    scrollWindowTo(targetScrollY, true);
  };

  const activeItem = cardDataList[activeIndex] ?? cardDataList[0];

  return (
    <div
      ref={sectionRef}
      className="relative w-full bg-[#181818] text-[#f5f5f5] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl"
      style={{
        // Extra scroll buffer created by pin distance
        minHeight: `calc(100vh + ${metricsRef.current.pinDistance}px)`,
      }}
    >
      {/* Pinned Cinematic Panel */}
      <div
        ref={galleryRef}
        className="w-full h-screen overflow-hidden relative select-none bg-[#181818]"
        style={{
          backgroundColor: '#181818',
          background: 'radial-gradient(ellipse at 50% 25%, rgba(24,24,30,0.98), rgba(11,11,13,0.96))',
        }}
      >
        {/* Subtle Ambient Grain & Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(198,255,61,0.06),transparent_60%)]" />

        {/* Top Controls Bar: Counter and Active Scheme Badge */}
        <div className="absolute top-6 left-0 right-0 z-50 px-6 sm:px-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-black/50 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#c6ff3d] animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#c6ff3d]">
              Interactive Arc • {activeIndex + 1} of {count}
            </span>
          </div>

          {activeItem && (
            <div className="hidden sm:flex items-center gap-2 bg-black/50 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md text-xs font-mono text-slate-300">
              <span className="text-slate-400">Category:</span>
              <span className="text-white font-semibold">{activeItem.calc.categoryLabel}</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* LAYER 1: GIANT TITLE LAYER (~20% from Top, Non-Overlapping)  */}
        {/* ------------------------------------------------------------- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {cardDataList.map(({ calc, data }, idx) => (
            <div
              key={calc.id}
              ref={(el) => {
                titleRefs.current[idx] = el;
              }}
              className="absolute left-0 top-0 text-center will-change-transform max-w-[85vw]"
              style={{
                display: 'none',
              }}
            >
              <h2 className="text-[clamp(1.75rem,4.2vw,4.25rem)] font-black uppercase tracking-tight text-[#f5f5f5] whitespace-nowrap leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
                {data.shortTitle}
              </h2>
            </div>
          ))}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* LAYER 2: META LAYER (~30% from Top, Centered)                */}
        {/* ------------------------------------------------------------- */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2.5 transition-opacity duration-150 text-center px-4 max-w-2xl"
          style={{
            top: '30%',
            opacity: metaOpacity,
            pointerEvents: metaOpacity > 0.4 ? 'auto' : 'none',
          }}
        >
          {activeItem && (
            <>
              {/* Official Complete Calculator Name & Number */}
              <div className="flex items-center gap-2 text-xs font-mono text-[#c6ff3d]">
                <span className="px-2 py-0.5 rounded bg-[#c6ff3d]/15 border border-[#c6ff3d]/30 font-bold">
                  {activeItem.data.numberStr}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-white font-bold text-xs sm:text-sm tracking-wide">
                  {activeItem.calc.name}
                </span>
              </div>

              {/* Tag Pills in Lime-Green Outlined Capsules */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
                {activeItem.data.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1 rounded-full text-xs font-mono border border-[#c6ff3d] text-[#c6ff3d] bg-[#c6ff3d]/5 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons: Open Calculator & Formula Details */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectCalculator(activeItem.calc.slug)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#c6ff3d] text-slate-950 hover:bg-[#d4ff66] transition-all cursor-pointer shadow-lg font-mono"
                >
                  <span>Open Calculator</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCalculator(activeItem.calc.slug)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 border border-slate-700 bg-white/5 hover:bg-white/10 transition-all cursor-pointer font-mono"
                >
                  <span>Formula: {activeItem.data.formulaBadge}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* LAYER 3: PORTRAIT CARD LAYER (Anchored at Bottom Center)     */}
        {/* ------------------------------------------------------------- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {cardDataList.map(({ calc, data }, idx) => {
            const isCenter = idx === activeIndex;
            const isLoaded = !!imageLoadedState[calc.id];
            const hasError = !!imageErrorState[calc.id];

            return (
              <div
                key={calc.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => navigateToCard(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigateToCard(idx);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${calc.name}. Click to view calculator.`}
                className="absolute left-0 top-0 cursor-pointer will-change-transform pointer-events-auto rounded-3xl overflow-hidden shadow-2xl transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#c6ff3d]"
                style={{
                  width: `${metricsRef.current.cardWidth}px`,
                  height: `${metricsRef.current.cardHeight}px`,
                  display: 'none',
                }}
              >
                {/* Active Card Marker: Lime-Green Bracket Framing Active Card */}
                {isCenter && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[calc(100%+14px)] pointer-events-none z-30 flex items-center justify-between">
                    <span className="w-3 h-3 border-t-2 border-l-2 border-[#c6ff3d]" />
                    <div className="h-[2px] bg-[#c6ff3d]/50 flex-1 mx-2" />
                    <span className="w-3 h-3 border-t-2 border-r-2 border-[#c6ff3d]" />
                  </div>
                )}

                {/* Card Container Frame */}
                <div className="relative w-full h-full bg-[#121622] border border-white/15 rounded-3xl overflow-hidden flex flex-col justify-between">
                  {/* Shimmering Skeleton Placeholder */}
                  {!isLoaded && !hasError && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
                  )}

                  {/* Fallback Display if Image Fails */}
                  {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-slate-900">
                      <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
                        {calc.name}
                      </span>
                    </div>
                  )}

                  {/* Main Portrait Visual */}
                  {!hasError && (
                    <img
                      src={data.imageUrl}
                      alt={calc.name}
                      onLoad={() => handleImageLoad(calc.id)}
                      onError={() => handleImageError(calc.id)}
                      className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}

                  {/* Subtle Inner Glass Card Header */}
                  <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white border border-white/10 backdrop-blur-md">
                      {data.numberStr}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#c6ff3d]/15 text-[#c6ff3d] border border-[#c6ff3d]/30 backdrop-blur-md">
                      {calc.category === 'investments' ? 'Mutual Funds' : calc.category === 'government' ? 'Govt. Scheme' : 'Loan & Tax'}
                    </span>
                  </div>

                  {/* Bottom Title Card Strip */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/85 to-transparent z-10 space-y-1">
                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                      {calc.name}
                    </h3>
                    <p className="text-[11px] font-mono text-[#c6ff3d] truncate">
                      {data.formulaBadge}
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

                  {/* Visually Hidden Description for Screen Readers */}
                  <span className="sr-only">
                    {calc.shortDescription}. Formula: {calc.formula}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll Hint at Bottom Center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
          <span>Scroll down to rotate through calculators</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#c6ff3d] animate-ping" />
        </div>
      </div>
    </div>
  );
};

export default CalculatorArcGallery;
