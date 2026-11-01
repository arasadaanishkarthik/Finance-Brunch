import { useEffect, useRef, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, Minus, RotateCcw, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OfficeLocation {
  city: string;
  country: string;
  description: string;
  px: number;
  py: number;
  isHQ?: boolean;
  isMain?: boolean;
  labelPos?: 'top' | 'bottom' | 'left' | 'right';
  lat?: number;
  lng?: number;
}

export const officeLocations: OfficeLocation[] = [
  { city: "Vizag", country: "India", description: "Global Headquarters", px: 69.5, py: 48, isHQ: true, isMain: true, labelPos: "right" },
  { city: "Hyderabad", country: "India", description: "Technology Hub", px: 67.8, py: 49.5, labelPos: "bottom" },
  { city: "Mumbai", country: "India", description: "Financial Center", px: 65.5, py: 47, labelPos: "left" },
  { city: "Dubai", country: "UAE", description: "Middle East Office", px: 59.5, py: 42, labelPos: "top" },
  { city: "New York", country: "USA", description: "Americas Office", px: 22.5, py: 33, labelPos: "top" },
  { city: "Toronto", country: "Canada", description: "Canadian Office", px: 21, py: 27, labelPos: "left" },
  { city: "London", country: "UK", description: "European Headquarters", px: 46.5, py: 26, labelPos: "top" },
  { city: "Madrid", country: "Spain", description: "Southern Europe Office", px: 45, py: 33, labelPos: "bottom" }
];

function getArcD(x1: number, y1: number, x2: number, y2: number): string {
  const midX = (x1 + x2) / 2;
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const midY = Math.min(y1, y2) - dist * 0.3;
  return `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`;
}

interface MapComponentProps {
  selectedCity?: string | null;
  onSelectCity?: (city: string | null) => void;
  className?: string;
}

export default function MapComponent({ selectedCity, onSelectCity, className }: MapComponentProps = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const [hoveredOffice, setHoveredOffice] = useState<OfficeLocation | null>(null);
  const [showPaths, setShowPaths] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingState, setIsDraggingState] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const minZoom = 1;
  const maxZoom = 4;
  const zoomStep = 0.5;

  useEffect(() => {
    if (inView) {
      setIsLoaded(true);
      const timerPins = setTimeout(() => setShowPins(true), 400);
      const timerPaths = setTimeout(() => setShowPaths(true), 900);
      return () => {
        clearTimeout(timerPins);
        clearTimeout(timerPaths);
      };
    }
  }, [inView]);

  const clampPan = useCallback((x: number, y: number, currentZoom: number) => {
    const container = containerRef.current;
    if (!container) return { x, y };
    const width = container.clientWidth;
    const height = container.clientHeight;
    const maxPanX = (width * (currentZoom - 1)) / 2;
    const maxPanY = (height * (currentZoom - 1)) / 2;
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y)),
    };
  }, []);

  const handleZoomIn = () => {
    const next = Math.min(zoomLevel + zoomStep, maxZoom);
    setZoomLevel(next);
    setPanOffset((prev) => clampPan(prev.x, prev.y, next));
  };

  const handleZoomOut = () => {
    const next = Math.max(zoomLevel - zoomStep, minZoom);
    setZoomLevel(next);
    setPanOffset((prev) => clampPan(prev.x, prev.y, next));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.3 : 0.3;
      const next = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));
      setZoomLevel(next);
      setPanOffset((prev) => clampPan(prev.x, prev.y, next));
    },
    [zoomLevel, clampPan]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoomLevel <= 1) return;
      setIsDraggingState(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panOffset.x,
        panY: panOffset.y,
      };
    },
    [zoomLevel, panOffset]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingState) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanOffset(clampPan(dragStartRef.current.panX + dx, dragStartRef.current.panY + dy, zoomLevel));
    },
    [isDraggingState, zoomLevel, clampPan]
  );

  const handleMouseUp = useCallback(() => setIsDraggingState(false), []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (zoomLevel <= 1 || e.touches.length !== 1) return;
      setIsDraggingState(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: panOffset.x,
        panY: panOffset.y,
      };
    },
    [zoomLevel, panOffset]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDraggingState || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPanOffset(clampPan(dragStartRef.current.panX + dx, dragStartRef.current.panY + dy, zoomLevel));
    },
    [isDraggingState, zoomLevel, clampPan]
  );

  const hqOffice = officeLocations.find((loc) => loc.isHQ) || officeLocations[0];

  const getLabelStyle = useCallback((loc: OfficeLocation) => {
    const base: React.CSSProperties = { position: 'absolute' };
    switch (loc.labelPos) {
      case 'right':
        return { ...base, left: `calc(${loc.px}% + 18px)`, top: `${loc.py}%`, transform: 'translateY(-50%)' };
      case 'left':
        return { ...base, right: `calc(${100 - loc.px}% + 18px)`, top: `${loc.py}%`, transform: 'translateY(-50%)' };
      case 'bottom':
        return { ...base, left: `${loc.px}%`, top: `calc(${loc.py}% + 20px)`, transform: 'translateX(-50%)' };
      case 'top':
      default:
        return { ...base, left: `${loc.px}%`, bottom: `calc(${100 - loc.py}% + 20px)`, transform: 'translateX(-50%)' };
    }
  }, []);

  const activeLoc = selectedCity
    ? officeLocations.find((l) => l.city.toLowerCase() === selectedCity.toLowerCase()) || hoveredOffice
    : hoveredOffice;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl overflow-hidden border border-border shadow-2xl transition-all duration-1000 bg-card",
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {/* Top Header Bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-card dark:bg-slate-900 border-b border-border dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Finance Brunch</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">Global Offices</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary/70" />
            <span>{officeLocations.length} locations</span>
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full overflow-hidden select-none bg-slate-50 dark:bg-slate-950",
          zoomLevel > 1 ? (isDraggingState ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
        )}
        style={{ aspectRatio: "1400/800" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDraggingState(false)}
      >
        {/* Transformable Canvas */}
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          {/* Base World Map Image */}
          <img
            src="/images/world-map.png"
            alt="Finance Brunch World Map"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
              isLoaded ? "opacity-100 dark:opacity-35 dark:invert dark:hue-rotate-180" : "opacity-0"
            )}
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 pointer-events-none" />

          {/* SVG Connecting Arcs */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            <defs>
              <filter id="fbPathShadow">
                <feGaussianBlur stdDeviation="0.3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="fbFlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {officeLocations
              .filter((loc) => !loc.isHQ)
              .map((loc, idx) => {
                const arcD = getArcD(hqOffice.px, hqOffice.py, loc.px, loc.py);
                return (
                  <g key={`flight-${loc.city}`}>
                    {/* Subtle Background Guide Track */}
                    <path
                      d={arcD}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeOpacity={0.12}
                      strokeWidth={0.4}
                      className={cn("transition-opacity duration-1000", showPaths ? "opacity-100" : "opacity-0")}
                    />

                    {/* Animated Pulsing Dashed Arc */}
                    <path
                      d={arcD}
                      fill="none"
                      stroke="url(#fbFlightGradient)"
                      strokeWidth={0.25}
                      strokeDasharray="1 0.8"
                      filter="url(#fbPathShadow)"
                      className={cn("transition-opacity duration-700", showPaths ? "opacity-100" : "opacity-0")}
                      style={{ transitionDelay: `${idx * 150}ms` }}
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="20"
                        to="0"
                        dur={`${3 + idx * 0.4}s`}
                        repeatCount="indefinite"
                      />
                    </path>

                    {/* Moving Glowing Particle along Arc */}
                    {showPaths && (
                      <circle r="0.38" fill="hsl(var(--primary))" filter="url(#fbPathShadow)">
                        <animateMotion
                          dur={`${4 + idx * 0.6}s`}
                          repeatCount="indefinite"
                          path={arcD}
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
          </svg>

          {/* Location Pins & Labels */}
          {officeLocations.map((loc, idx) => {
            const isHQ = Boolean(loc.isHQ);
            const isSelected = selectedCity
              ? selectedCity.toLowerCase() === loc.city.toLowerCase()
              : hoveredOffice?.city === loc.city;

            return (
              <div key={loc.city}>
                {/* Pin Icon */}
                <motion.div
                  className="absolute z-10 cursor-pointer"
                  style={{
                    left: `${loc.px}%`,
                    top: `${loc.py}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                  initial={{ opacity: 0, y: -30, scale: 0 }}
                  animate={showPins ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: idx * 0.08,
                  }}
                  onMouseEnter={() => {
                    setHoveredOffice(loc);
                    onSelectCity?.(loc.city);
                  }}
                  onMouseLeave={() => {
                    setHoveredOffice(null);
                    onSelectCity?.(null);
                  }}
                  onClick={() => {
                    onSelectCity?.(selectedCity === loc.city ? null : loc.city);
                  }}
                >
                  <div
                    className={cn(
                      "relative transition-transform duration-200",
                      isSelected && "scale-125 -translate-y-1"
                    )}
                  >
                    <svg
                      width={isHQ ? 36 : 28}
                      height={isHQ ? 46 : 36}
                      viewBox="0 0 28 36"
                      fill="none"
                      className="drop-shadow-lg"
                    >
                      <path
                        d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z"
                        fill={isHQ || isSelected ? "hsl(var(--primary))" : "#3b82f6"}
                        className="transition-colors duration-200"
                      />
                      <circle cx="14" cy="13" r="5.5" fill="white" />
                      {isHQ && (
                        <text
                          x="14"
                          y="16"
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="bold"
                          fill="hsl(var(--primary))"
                        >
                          ★
                        </text>
                      )}
                    </svg>
                    {/* Radar Pulse Circle */}
                    <div
                      className={cn(
                        "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full",
                        isHQ ? "w-4 h-4" : "w-3 h-3"
                      )}
                    >
                      <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                      <div className="absolute inset-0 bg-primary/20 rounded-full" />
                    </div>
                  </div>
                </motion.div>

                {/* City Label Badge */}
                <motion.div
                  className="absolute z-20 pointer-events-none"
                  style={getLabelStyle(loc)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={showPins ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 + idx * 0.08, duration: 0.3 }}
                >
                  <div
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap shadow-md backdrop-blur-xs transition-all duration-200 border select-none",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xl scale-110"
                        : isHQ
                        ? "bg-primary text-primary-foreground border-primary shadow-lg"
                        : "bg-card/95 dark:bg-slate-900/95 text-foreground border-border dark:border-slate-800 shadow-xs"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {isHQ && <span className="text-[9px]">📍</span>}
                      <span>{loc.city}</span>
                      {isHQ && (
                        <span className="text-[9px] font-normal opacity-90 ml-0.5">
                          HQ
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Zoom Controls Buttons */}
        <div className="absolute right-3 bottom-8 sm:bottom-10 z-30 flex flex-col gap-0.5">
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= maxZoom}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 bg-card/95 dark:bg-slate-900/95 border border-border dark:border-slate-800 rounded-t-lg flex items-center justify-center shadow-lg hover:bg-muted dark:hover:bg-slate-800 transition-colors",
              zoomLevel >= maxZoom && "opacity-40 cursor-not-allowed"
            )}
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= minZoom}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 bg-card/95 dark:bg-slate-900/95 border border-border dark:border-slate-800 flex items-center justify-center shadow-lg hover:bg-muted dark:hover:bg-slate-800 transition-colors",
              zoomLevel <= minZoom && "opacity-40 cursor-not-allowed"
            )}
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          </button>
          <button
            onClick={handleReset}
            disabled={zoomLevel === 1}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 bg-card/95 dark:bg-slate-900/95 border border-border dark:border-slate-800 rounded-b-lg flex items-center justify-center shadow-lg hover:bg-muted dark:hover:bg-slate-800 transition-colors",
              zoomLevel === 1 && "opacity-40 cursor-not-allowed"
            )}
            aria-label="Reset view"
          >
            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground" />
          </button>
        </div>

        {/* Zoom Level Indicator */}
        <AnimatePresence>
          {zoomLevel > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute left-3 bottom-8 sm:bottom-10 z-30 bg-card/90 dark:bg-slate-900/90 border border-border dark:border-slate-800 rounded-lg px-2.5 py-1 shadow-lg backdrop-blur-xs"
            >
              <span className="text-xs font-semibold text-foreground">
                {Math.round(zoomLevel * 100)}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Active Office Information Card */}
        <AnimatePresence>
          {activeLoc && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-card/95 dark:bg-slate-900/95 backdrop-blur-xs border border-border dark:border-slate-800 rounded-xl shadow-2xl z-30 overflow-hidden"
              style={{ minWidth: 220 }}
            >
              <div className="h-1 bg-primary" />
              <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground leading-tight">
                    {activeLoc.city}, {activeLoc.country}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {activeLoc.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Attribution / Branding */}
        <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-card/80 to-transparent flex items-end justify-end px-3 pb-1 z-20 pointer-events-none">
          <span className="text-[9px] text-muted-foreground/60 select-none">
            Finance Brunch Global Network © 2025
          </span>
        </div>
      </div>
    </div>
  );
}
