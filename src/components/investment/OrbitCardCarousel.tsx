import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronRight, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

// Register ScrollTrigger plugin safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * EXPOSED CONSTANTS AS EXPLICITLY REQUIRED IN SPECIFICATION
 */
export const ORBIT_CAROUSEL_CONSTANTS = {
  horizontalRadiusRatio: 0.30,      // ~30% of viewport width
  horizontalRadiusMax: 560,         // Capped at 560px
  verticalRadiusRatio: 0.34,        // ~34% of viewport height
  laps: 1,                          // One full 360° lap
  pinLength: '320%',                // Three screens' worth of scrolling
  scrubSmoothing: 0.5,              // Scrub smoothing
  backScale: 0.6,                   // ~60% of front card size at back
  maxBlur: 10,                      // Up to 10px blur at back of ellipse
  minOpacity: 0.18,                 // ~18% opacity at back of ellipse
  entranceSlideDistanceVh: 40,      // Rise from 40% viewport height below
  minCardCount: 3,                  // Minimum card count for 3D orbit
  desktopBreakpoint: 1080,          // Breakpoint for 3D orbit vs fallback grid (1080px)
} as const;

export interface OrbitCardItem {
  id?: string;
  number?: string | number;
  title: string;
  meta?: string;
  description: string;
  icon?: ReactNode;
  linkText?: string;
  linkUrl?: string;
  onClick?: () => void;
  badge?: string;
}

export interface OrbitThemeItem {
  bg: string;
  text: string;
  mutedText: string;
  button: string;
  topBorder: string;
  shadow: string;
  accentColor?: string;
}

export interface OrbitCardCarouselProps {
  label?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  actionButton?: ReactNode;
  items: OrbitCardItem[];
  theme?: OrbitThemeItem[];
  className?: string;
  id?: string;
}

/**
 * Default color palette derived from Finance Brunch brand identity (royal blue, cyan, indigo, purple, emerald, amber)
 */
export const DEFAULT_ORBIT_THEMES: OrbitThemeItem[] = [
  {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    text: 'text-slate-900 dark:text-white',
    mutedText: 'text-slate-600 dark:text-slate-300',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    topBorder: '#2563eb', // Blue 600
    shadow: 'rgba(37, 99, 235, 0.28)',
    accentColor: '#2563eb',
  },
  {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    text: 'text-slate-900 dark:text-white',
    mutedText: 'text-slate-600 dark:text-slate-300',
    button: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    topBorder: '#06b6d4', // Cyan 500
    shadow: 'rgba(6, 182, 212, 0.28)',
    accentColor: '#06b6d4',
  },
  {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    text: 'text-slate-900 dark:text-white',
    mutedText: 'text-slate-600 dark:text-slate-300',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    topBorder: '#4f46e5', // Indigo 600
    shadow: 'rgba(79, 70, 229, 0.28)',
    accentColor: '#4f46e5',
  },
  {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    text: 'text-slate-900 dark:text-white',
    mutedText: 'text-slate-600 dark:text-slate-300',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    topBorder: '#9333ea', // Purple 600
    shadow: 'rgba(147, 51, 234, 0.28)',
    accentColor: '#9333ea',
  },
  {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    text: 'text-slate-900 dark:text-white',
    mutedText: 'text-slate-600 dark:text-slate-300',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    topBorder: '#10b981', // Emerald 500
    shadow: 'rgba(16, 185, 129, 0.28)',
    accentColor: '#10b981',
  },
  {
    bg: 'bg-white/95 dark:bg-slate-900/95',
    text: 'text-slate-900 dark:text-white',
    mutedText: 'text-slate-600 dark:text-slate-300',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    topBorder: '#f59e0b', // Amber 500
    shadow: 'rgba(245, 158, 11, 0.28)',
    accentColor: '#f59e0b',
  },
];

export const OrbitCardCarousel: React.FC<OrbitCardCarouselProps> = ({
  label,
  title,
  subtitle,
  actionButton,
  items,
  theme = DEFAULT_ORBIT_THEMES,
  className,
  id = 'orbit-showcase-section',
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isDesktopOrbit, setIsDesktopOrbit] = useState(false);

  const N = items.length;

  // Track progress variables without triggering React re-renders at 60fps
  const progressState = useRef({
    entrance: 0,
    rotation: 0,
  });

  // Assign theme cyclically
  const getCardTheme = useCallback((index: number): OrbitThemeItem => {
    if (!theme || theme.length === 0) return DEFAULT_ORBIT_THEMES[index % DEFAULT_ORBIT_THEMES.length];
    return theme[index % theme.length];
  }, [theme]);

  // Main render computation function that directly updates DOM node styles
  const updateOrbitTransforms = useCallback(() => {
    if (N < ORBIT_CAROUSEL_CONSTANTS.minCardCount) return;
    const container = containerRef.current;
    if (!container) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Calculate dynamic radii based on viewport
    let rx = Math.min(
      vw * ORBIT_CAROUSEL_CONSTANTS.horizontalRadiusRatio,
      ORBIT_CAROUSEL_CONSTANTS.horizontalRadiusMax
    );
    let ry = vh * ORBIT_CAROUSEL_CONSTANTS.verticalRadiusRatio;

    // With more than 8 cards, enlarge the orbit radius slightly so cards don't collide
    if (N > 8) {
      rx = Math.min(vw * 0.35, 620);
      ry = vh * 0.37;
    }

    const { entrance, rotation } = progressState.current;

    // Ease-out curve for entrance phase
    const easeEntrance = 1 - Math.pow(1 - entrance, 2);
    const entranceOffsetY = (1 - easeEntrance) * (vh * (ORBIT_CAROUSEL_CONSTANTS.entranceSlideDistanceVh / 100));

    // Initial angle offset (approx 20°) so no card sits dead-center behind the title initially
    const initialOffset = (20 * Math.PI) / 180;
    const twoPi = Math.PI * 2;

    for (let i = 0; i < N; i++) {
      const cardEl = cardRefs.current[i];
      if (!cardEl) continue;

      // Spaced evenly around orbit: 360° / N + rotation from scroll
      const angle = initialOffset + (i / N) * twoPi + rotation * twoPi * ORBIT_CAROUSEL_CONSTANTS.laps;

      // Elliptical coordinate calculation (viewing carousel from above)
      // sin for horizontal travel, cos for front-to-back depth
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      const x = rx * sinA;
      const y = ry * cosA;

      // Normalized depth value: 1.0 at front (cosA = 1), 0.0 at back (cosA = -1)
      const depth = (cosA + 1) / 2;

      // Scale: 0.6 at back, 1.0 at front
      const scale = ORBIT_CAROUSEL_CONSTANTS.backScale + (1.0 - ORBIT_CAROUSEL_CONSTANTS.backScale) * depth;

      // Blur: 10px at back, 0px at front
      const blur = ORBIT_CAROUSEL_CONSTANTS.maxBlur * (1.0 - depth);

      // Opacity: 0.18 at back, 1.0 at front, modulated by entrance progress
      const baseOpacity = ORBIT_CAROUSEL_CONSTANTS.minOpacity + (1.0 - ORBIT_CAROUSEL_CONSTANTS.minOpacity) * depth;
      const finalOpacity = baseOpacity * easeEntrance;

      // Stacking order: title is z-20. Cards behind title have z < 20, cards in front have z > 20
      const zIndex = Math.round(1 + 40 * depth);

      // Only cards near the front (roughly front 20% of depth, depth >= 0.80) accept clicks
      const isClickable = depth >= 0.80 && easeEntrance > 0.6;

      // Direct DOM update for silky 60fps performance without React state re-rendering
      cardEl.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${(y + entranceOffsetY).toFixed(2)}px), 0px) scale(${scale.toFixed(3)})`;
      cardEl.style.filter = blur > 0.25 ? `blur(${blur.toFixed(1)}px)` : 'none';
      cardEl.style.opacity = finalOpacity.toFixed(3);
      cardEl.style.zIndex = String(zIndex);
      cardEl.style.pointerEvents = isClickable ? 'auto' : 'none';
    }
  }, [N]);

  // Set up GSAP MatchMedia and ScrollTriggers
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // If card count < 3, skip animation as required
    if (N < ORBIT_CAROUSEL_CONSTANTS.minCardCount) {
      setIsDesktopOrbit(false);
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        `(min-width: ${ORBIT_CAROUSEL_CONSTANTS.desktopBreakpoint}px)`,
        () => {
          // Check for prefers-reduced-motion
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (prefersReducedMotion) {
            setIsDesktopOrbit(false);
            return;
          }

          setIsDesktopOrbit(true);

          // Calculate pin length based on card count so each card gets enough viewing time
          const dynamicPinLength = N > 6 
            ? `${Math.max(320, 240 + N * 22)}%`
            : ORBIT_CAROUSEL_CONSTANTS.pinLength;

          // 1. Entrance ScrollTrigger (section top at 95% down to top of screen, scrubbed)
          const entranceTrigger = ScrollTrigger.create({
            trigger: section,
            start: 'top 95%',
            end: 'top top',
            scrub: true,
            onUpdate: (self) => {
              progressState.current.entrance = self.progress;
              updateOrbitTransforms();
            },
          });

          // 2. Pinned Rotation ScrollTrigger (pin for 320% scroll, scrub 0.5)
          const rotationTrigger = ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: `+=${dynamicPinLength}`,
            pin: true,
            scrub: ORBIT_CAROUSEL_CONSTANTS.scrubSmoothing,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progressState.current.rotation = self.progress;
              updateOrbitTransforms();
            },
          });

          // Resize handler
          const handleResize = () => {
            updateOrbitTransforms();
            ScrollTrigger.refresh();
          };
          window.addEventListener('resize', handleResize);

          // Initial render tick
          requestAnimationFrame(() => {
            progressState.current.entrance = entranceTrigger.progress || 0;
            progressState.current.rotation = rotationTrigger.progress || 0;
            updateOrbitTransforms();
          });

          return () => {
            window.removeEventListener('resize', handleResize);
            entranceTrigger.kill();
            rotationTrigger.kill();
          };
        }
      );

      mm.add(
        `(max-width: ${ORBIT_CAROUSEL_CONSTANTS.desktopBreakpoint - 1}px)`,
        () => {
          setIsDesktopOrbit(false);
          // Reset styles for fallback mode
          cardRefs.current.forEach((cardEl) => {
            if (cardEl) {
              cardEl.style.transform = '';
              cardEl.style.filter = '';
              cardEl.style.opacity = '';
              cardEl.style.zIndex = '';
              cardEl.style.pointerEvents = '';
            }
          });
        }
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [N, updateOrbitTransforms]);

  // Render Card Content
  const renderCardInner = (item: OrbitCardItem, idx: number, cardTheme: OrbitThemeItem) => {
    const cardNumber = item.number !== undefined ? String(item.number).padStart(2, '0') : String(idx + 1).padStart(2, '0');

    return (
      <div 
        className={cn(
          'relative w-full h-full flex flex-col p-4 sm:p-4.5 rounded-[20px] border backdrop-blur-xl transition-all',
          cardTheme.bg,
          'border-slate-200/90 dark:border-slate-800/90',
          'group select-none'
        )}
        style={{
          borderTopColor: cardTheme.topBorder,
          borderTopWidth: '4px',
          boxShadow: `0 14px 30px -10px ${cardTheme.shadow}, 0 0 14px 0 ${cardTheme.shadow}`,
        }}
      >
        {/* Header Row: Index Number on Left, Icon or Badge on Right */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 tracking-wider">
            {cardNumber}
          </span>
          <div className="flex items-center gap-1.5">
            {item.badge && (
              <span className="font-mono text-[9.5px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                {item.badge}
              </span>
            )}
            {item.icon && (
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: cardTheme.topBorder }}
              >
                {item.icon}
              </div>
            )}
          </div>
        </div>

        {/* Small Monospace Meta Line */}
        {item.meta && (
          <div 
            className="font-mono text-[9.5px] sm:text-[10px] uppercase tracking-wider font-semibold mb-1"
            style={{ color: cardTheme.topBorder }}
          >
            {item.meta}
          </div>
        )}

        {/* Bold Title */}
        <h3 className={cn('text-base sm:text-lg font-bold tracking-tight mb-1 line-clamp-1', cardTheme.text)}>
          {item.title}
        </h3>

        {/* Short Description */}
        <p className={cn('text-[11.5px] sm:text-xs leading-relaxed mb-2.5 flex-grow line-clamp-2', cardTheme.mutedText)}>
          {item.description}
        </p>

        {/* Optional Link Button that nudges right on hover */}
        <div className="mt-auto pt-1">
          {item.linkUrl ? (
            <Link
              to={item.linkUrl}
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 group/btn shadow-md hover:shadow-lg',
                cardTheme.button
              )}
            >
              <span>{item.linkText || 'Learn More'}</span>
              <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          ) : item.onClick ? (
            <button
              type="button"
              onClick={item.onClick}
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 group/btn shadow-md hover:shadow-lg',
                cardTheme.button
              )}
            >
              <span>{item.linkText || 'Learn More'}</span>
              <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
          ) : (
            <div 
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md opacity-70',
                cardTheme.text
              )}
            >
              <span>Featured Service</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      id={id}
      className={cn(
        'relative overflow-hidden w-full select-none',
        // Desktop pinned orbit is full viewport height
        isDesktopOrbit ? 'h-screen min-h-[720px] flex items-center justify-center' : 'py-16 sm:py-24',
        className
      )}
    >
      {/* Soft Radial Glow in the Site's Accent Color, Centered Behind the Title */}
      <div 
        aria-hidden="true" 
        className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] md:w-[900px] md:h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.14) 0%, rgba(6, 182, 212, 0.08) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Subtle Translucent Brand Watermark */}
      <div 
        aria-hidden="true" 
        className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 opacity-[0.04] dark:opacity-[0.05]"
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/fb-watermark.png`} 
          alt="" 
          className="w-[300px] sm:w-[420px] md:w-[540px] h-auto object-contain" 
          loading="eager"
        />
      </div>

      {/* DESKTOP 3D ORBIT MODE */}
      {isDesktopOrbit && (
        <div 
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden z-10"
        >
          {/* Header block (Title, Label, Subtitle, Button) situated at the TOP of the section */}
          <div className="absolute left-1/2 top-3 sm:top-5 lg:top-6 -translate-x-1/2 z-30 text-center max-w-3xl px-6 pointer-events-auto select-text">
            {/* Label (small text above the title) */}
            {label && (
              <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full py-1 px-3.5 mb-2.5 border border-blue-200/70 dark:border-blue-900/60 shadow-sm">
                <Compass className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400 animate-spin-slow" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-blue-700 dark:text-cyan-300">
                  {label}
                </span>
              </div>
            )}

            {/* Title (section heading) */}
            {typeof title === 'string' ? (
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                {title}
              </h2>
            ) : (
              title
            )}

            {/* Subtitle / Description */}
            {subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300 mb-3.5 max-w-2xl mx-auto leading-relaxed font-normal">
                {subtitle}
              </p>
            )}

            {/* Action button & Scroll Hint */}
            <div className="flex items-center justify-center gap-4">
              {actionButton}
              <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                <span>Scroll down to rotate orbit</span>
              </div>
            </div>
          </div>

          {/* 3D Orbit Cards Stage: placed strictly DOWN below the header at top-[65%] */}
          {items.map((item, idx) => {
            const cardTheme = getCardTheme(idx);
            return (
              <div
                key={item.id || idx}
                ref={(el) => { cardRefs.current[idx] = el; }}
                className="absolute top-[58%] left-1/2 w-[280px] sm:w-[300px] md:w-[320px] h-[215px] sm:h-[225px] will-change-transform pointer-events-none"
                style={{
                  transformOrigin: 'center center',
                }}
              >
                {renderCardInner(item, idx, cardTheme)}
              </div>
            );
          })}
        </div>
      )}

      {/* FALLBACK MODE (Mobile, Tablet < 1080px, Reduced Motion, or N < 3) */}
      {!isDesktopOrbit && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Centered Heading for Fallback Grid */}
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14">
            {label && (
              <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full py-1.5 px-4 mb-4 border border-blue-200/70 dark:border-blue-900/60 shadow-sm">
                <Compass className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-blue-700 dark:text-cyan-300">
                  {label}
                </span>
              </div>
            )}

            {typeof title === 'string' ? (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                {title}
              </h2>
            ) : (
              title
            )}

            {subtitle && (
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}

            {actionButton && (
              <div className="flex items-center justify-center">
                {actionButton}
              </div>
            )}
          </div>

          {/* If N < 3, normal centered row; otherwise responsive grid with hover focus on real mouse */}
          {N < ORBIT_CAROUSEL_CONSTANTS.minCardCount ? (
            <div className="flex flex-wrap items-center justify-center gap-6 max-w-4xl mx-auto">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="w-full sm:w-[340px] h-[280px]">
                  {renderCardInner(item, idx, getCardTheme(idx))}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto group/fallback">
              {items.map((item, idx) => {
                const cardTheme = getCardTheme(idx);
                return (
                  <div
                    key={item.id || idx}
                    className="w-full min-h-[270px] transition-all duration-300 hover:scale-[1.03] hover:z-20 group-hover/fallback:opacity-70 hover:!opacity-100 group-hover/fallback:blur-[0.5px] hover:!blur-none"
                  >
                    {renderCardInner(item, idx, cardTheme)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default OrbitCardCarousel;

