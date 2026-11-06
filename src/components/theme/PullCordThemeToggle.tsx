import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, PanInfo, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/components/theme/theme-provider';

interface Point {
  x: number;
  y: number;
  ox: number;
  oy: number;
  fixed: boolean;
}

// 12 segments of 10px = 120px resting length
const TOTAL_SEGMENTS = 12;
const SEGMENT_LEN = 10;
const RESTING_Y = TOTAL_SEGMENTS * SEGMENT_LEN; // 120px

const DEFAULT_CONFIG = {
  gravity: 1250,
  damping: 0.975,
  iterations: 24,
  stretchMax: 32,
  stretchToggle: 22,
  maxVelocity: 22,
  sleepVelocity: 0.15,
};

// Generate SVG smooth quadratic bezier path through Verlet points
function pointsToSvgPath(pts: Point[]): string {
  if (!pts || pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
  }
  const last = pts.length - 1;
  d += ` L ${pts[last].x.toFixed(2)} ${pts[last].y.toFixed(2)}`;
  return d;
}

// Initialize Verlet rope points
function createInitialPoints(): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= TOTAL_SEGMENTS; i++) {
    const y = SEGMENT_LEN * i;
    pts.push({
      x: 32,
      y,
      ox: 32,
      oy: y,
      fixed: i === 0,
    });
  }
  return pts;
}

// Crisp mechanical switch click using Web Audio API
function playTactileClick() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // AudioContext blocked or not supported; gracefully ignore
  }
}

export function PullCordThemeToggle() {
  const { theme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const [isDropping, setIsDropping] = useState(!shouldReduceMotion);
  const [hintVisible, setHintVisible] = useState(true);
  const [anchorRight, setAnchorRight] = useState<number | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const anchors = [
        document.getElementById('pullcord-anchor'),
        document.getElementById('pullcord-anchor-mobile'),
      ];
      for (const anchor of anchors) {
        if (anchor) {
          const rect = anchor.getBoundingClientRect();
          if (rect.width > 0 && rect.right > 0) {
            const anchorCenterFromRight = window.innerWidth - (rect.left + rect.width / 2);
            setAnchorRight(Math.round(anchorCenterFromRight - 32));
            return;
          }
        }
      }
      setAnchorRight(null);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('orientationchange', updatePosition);
    const timer1 = setTimeout(updatePosition, 50);
    const timer2 = setTimeout(updatePosition, 300);
    const timer3 = setTimeout(updatePosition, 1000);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('orientationchange', updatePosition);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  useEffect(() => {
    if (anchorRight !== null) {
      document.documentElement.style.setProperty('--pullcord-right', `${anchorRight}px`);
    } else {
      document.documentElement.style.removeProperty('--pullcord-right');
    }
  }, [anchorRight]);

  const pointsRef = useRef<Point[]>(createInitialPoints());
  const pathRef = useRef<SVGPathElement>(null);
  const shadowPathRef = useRef<SVGPathElement>(null);
  const texturePathRef = useRef<SVGPathElement>(null);
  const knobRef = useRef<SVGGElement>(null);

  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const hasToggledRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const lastToggleTimeRef = useRef(0);
  const panDistanceRef = useRef(0);

  const targetPosRef = useRef({ x: 32, y: RESTING_Y });
  const wakePhysicsRef = useRef<() => void>(() => {});
  const configRef = useRef(DEFAULT_CONFIG);

  // Toggle theme helper
  const handleToggleTheme = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 350) return;
    lastToggleTimeRef.current = now;

    playTactileClick();
    const isDark = document.documentElement.classList.contains('dark') || theme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);

    // Fade out hint after first interaction
    setHintVisible(false);
    try {
      localStorage.setItem('finance-brunch-cord-pulled', 'true');
    } catch {
      // ignore
    }
  }, [theme, setTheme]);

  // Click trigger (gives downward velocity impulse to swing)
  const triggerClick = useCallback(() => {
    handleToggleTheme();
    if (shouldReduceMotion) return;
    const pts = pointsRef.current;
    if (pts && pts.length > 0) {
      pts[pts.length - 1].oy -= 22;
      wakePhysicsRef.current();
    }
  }, [handleToggleTheme, shouldReduceMotion]);

  // Gentle wiggle after entrance
  const entranceWiggle = useCallback(() => {
    if (hasEnteredRef.current) return;
    hasEnteredRef.current = true;
    setIsDropping(false);
    if (shouldReduceMotion) return;
    const pts = pointsRef.current;
    if (pts && pts.length > 0) {
      pts[pts.length - 1].oy -= 14;
      pts[pts.length - 1].ox -= 7;
      wakePhysicsRef.current();
    }
  }, [shouldReduceMotion]);

  // Listen to external pull-cord trigger event (e.g. from navbar button)
  useEffect(() => {
    const handleCustomPull = () => {
      triggerClick();
    };
    window.addEventListener('financebrunch:pull-cord', handleCustomPull);
    return () => {
      window.removeEventListener('financebrunch:pull-cord', handleCustomPull);
    };
  }, [triggerClick]);

  // Initial check if user has previously pulled cord
  useEffect(() => {
    try {
      if (localStorage.getItem('finance-brunch-cord-pulled') === 'true') {
        setHintVisible(false);
      }
    } catch {
      // ignore
    }
  }, []);

  // Entrance wiggle timer
  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = window.setTimeout(entranceWiggle, 1700);
    return () => window.clearTimeout(timer);
  }, [entranceWiggle, shouldReduceMotion]);

  // Physics animation engine using Verlet integration
  useEffect(() => {
    const pts = pointsRef.current;
    const lastIdx = pts.length - 1;
    let animFrame = 0;
    let isRunning = false;
    let lastTime = 0;
    let wakeTimestamp = 0;

    const renderSvg = () => {
      const pathD = pointsToSvgPath(pts);
      if (pathRef.current) {
        pathRef.current.setAttribute('d', pathD);
      }
      if (shadowPathRef.current) {
        shadowPathRef.current.setAttribute('d', pathD);
      }
      if (texturePathRef.current) {
        texturePathRef.current.setAttribute('d', pathD);
      }
      if (knobRef.current) {
        const dx = (pts[lastIdx].x - 32).toFixed(2);
        const dy = (pts[lastIdx].y - RESTING_Y).toFixed(2);
        knobRef.current.setAttribute('transform', `translate(${dx} ${dy})`);
      }
    };

    const step = (time: number) => {
      const { gravity, damping, iterations } = configRef.current;
      const dt = lastTime ? Math.min(0.025, Math.max(0.008, (time - lastTime) / 1000)) : 1 / 60;
      lastTime = time;

      const drag = Math.pow(damping, 60 * dt);
      const dtSq = dt * dt;

      pts[lastIdx].fixed = isDraggingRef.current;

      // 1. Verlet integration
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        if (p.fixed) continue;
        const vx = p.x - p.ox;
        const vy = p.y - p.oy;
        p.ox = p.x;
        p.oy = p.y;
        p.x += vx * drag;
        p.y += vy * drag + gravity * dtSq;
      }

      // Root point is fixed
      pts[0].x = 32;
      pts[0].y = 0;

      // Trailing point follows user pointer while dragging
      if (isDraggingRef.current) {
        wakeTimestamp = time;
        pts[lastIdx].ox = pts[lastIdx].x;
        pts[lastIdx].oy = pts[lastIdx].y;
        pts[lastIdx].x = targetPosRef.current.x;
        pts[lastIdx].y = targetPosRef.current.y;
      }

      // 2. Relaxation constraints (segment distance = SEGMENT_LEN)
      for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < lastIdx; i++) {
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const diff = ((SEGMENT_LEN - dist) / dist) * 0.5;
          const ox = dx * diff;
          const oy = dy * diff;

          if (!p1.fixed) {
            p1.x -= ox;
            p1.y -= oy;
          }
          if (!p2.fixed) {
            p2.x += ox;
            p2.y += oy;
          }
        }
      }

      renderSvg();

      // 3. Kinetic energy & settle sleep detection
      let maxHorizontalDev = 0;
      let totalSpeed = 0;
      for (let i = 1; i < pts.length; i++) {
        maxHorizontalDev = Math.max(maxHorizontalDev, Math.abs(pts[i].x - 32));
        totalSpeed += Math.abs(pts[i].x - pts[i].ox) + Math.abs(pts[i].y - pts[i].oy);
      }

      const elapsed = time - wakeTimestamp;
      const isSettled =
        (elapsed > 500 && maxHorizontalDev < 0.25 && totalSpeed < 0.6) ||
        elapsed > 2000;

      if (!isDraggingRef.current && isSettled) {
        // Snap cleanly to rest alignment and sleep
        for (let i = 0; i < pts.length; i++) {
          pts[i].x = 32;
          pts[i].ox = 32;
          pts[i].y = i * SEGMENT_LEN;
          pts[i].oy = i * SEGMENT_LEN;
        }
        renderSvg();
        isRunning = false;
        return;
      }

      animFrame = requestAnimationFrame(step);
    };

    wakePhysicsRef.current = () => {
      wakeTimestamp = performance.now();
      if (!isRunning) {
        isRunning = true;
        lastTime = 0;
        animFrame = requestAnimationFrame(step);
      }
    };

    renderSvg();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, []);

  const isDark = theme === 'dark';

  return (
    <>
      <div
        className="pullcord"
        style={{
          position: 'fixed',
          top: 'var(--pullcord-top, 0px)',
          right: anchorRight !== null ? `${anchorRight}px` : 'var(--pullcord-right, 2.5rem)',
          zIndex: 'var(--pullcord-z, 70)',
          width: 64,
          height: 220,
          pointerEvents: 'none',
        }}
      >
        <div
          className={isDropping ? 'pullcord-inner pullcord-inner--drop' : 'pullcord-inner'}
          onAnimationEnd={(e) => {
            if (e.animationName === 'pullcord-drop') {
              entranceWiggle();
            }
          }}
        >
          <svg
            viewBox="0 0 64 220"
            width={64}
            height={220}
            aria-hidden="true"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Rope Braided Gradient */}
              <linearGradient id="fb-rope-grad" x1="0" y1="0" x2="1" y2="0">
                {isDark ? (
                  <>
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#64748b" />
                  </>
                )}
              </linearGradient>

              {/* Metallic Ring / Accents Gradient */}
              <linearGradient id="fb-knob-ring-grad" x1="0" y1="0" x2="1" y2="1">
                {isDark ? (
                  <>
                    <stop offset="0%" stopColor="#e0f2fe" />
                    <stop offset="35%" stopColor="#38bdf8" />
                    <stop offset="70%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="35%" stopColor="#fbbf24" />
                    <stop offset="70%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#92400e" />
                  </>
                )}
              </linearGradient>

              {/* Spherical Orb 3D Body Gradient */}
              <radialGradient id="fb-knob-body-grad" cx="35%" cy="32%" r="68%">
                {isDark ? (
                  <>
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="45%" stopColor="#0284c7" />
                    <stop offset="80%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="85%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </>
                )}
              </radialGradient>

              {/* Ambient Glow & Depth Filter */}
              <filter id="fb-knob-glow" x="-60%" y="-60%" width="220%" height="220%">
                {isDark ? (
                  <>
                    <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="rgba(56, 189, 248, 0.75)" />
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(14, 165, 233, 0.9)" />
                  </>
                ) : (
                  <>
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(217, 119, 6, 0.3)" />
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0, 0, 0, 0.15)" />
                  </>
                )}
              </filter>
            </defs>

            {/* Ceiling Rosette / Bracket Mount at y=0 */}
            <rect
              x={22}
              y={0}
              width={20}
              height={4.5}
              rx={2.25}
              fill="url(#fb-knob-ring-grad)"
            />
            <circle
              cx={32}
              cy={5}
              r={3.2}
              fill="url(#fb-knob-ring-grad)"
            />
            <circle
              cx={32}
              cy={5}
              r={1.3}
              fill={isDark ? '#0f172a' : '#ffffff'}
            />

            {/* Ambient Shadow Path for depth */}
            <path
              ref={shadowPathRef}
              d={pointsToSvgPath(createInitialPoints())}
              stroke={isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0, 0, 0, 0.12)'}
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              vectorEffect="non-scaling-stroke"
              opacity={0.7}
            />

            {/* Main Rope Path */}
            <path
              ref={pathRef}
              d={pointsToSvgPath(createInitialPoints())}
              stroke="url(#fb-rope-grad)"
              strokeWidth={2.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />

            {/* Braided Silk Texture Overlay */}
            <path
              ref={texturePathRef}
              d={pointsToSvgPath(createInitialPoints())}
              stroke={isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.7)'}
              strokeWidth={1.2}
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />

            {/* Enlarged & Themed Knob / Pendant */}
            <g ref={knobRef} className="pullcord-knob-visual">
              {/* Ferrule / Cap connecting rope to knob */}
              <path
                d={`M 27.5 ${RESTING_Y - 12} L 36.5 ${RESTING_Y - 12} L 34.5 ${RESTING_Y - 17} L 29.5 ${RESTING_Y - 17} Z`}
                fill="url(#fb-knob-ring-grad)"
                stroke={isDark ? '#0284c7' : '#b45309'}
                strokeWidth={0.6}
              />
              <circle
                cx={32}
                cy={RESTING_Y - 17}
                r={2.2}
                fill="url(#fb-knob-ring-grad)"
              />

              {/* Outer Metallic Bezel Ring with Glow */}
              <circle
                cx={32}
                cy={RESTING_Y}
                r={14.5}
                fill="none"
                stroke="url(#fb-knob-ring-grad)"
                strokeWidth={2}
                filter="url(#fb-knob-glow)"
              />

              {/* Main Sphere Body */}
              <circle
                cx={32}
                cy={RESTING_Y}
                r={12.5}
                fill="url(#fb-knob-body-grad)"
                stroke={isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(0, 0, 0, 0.08)'}
                strokeWidth={0.75}
              />

              {/* 3D Specular Highlight */}
              <ellipse
                cx={29}
                cy={RESTING_Y - 5}
                rx={5.5}
                ry={2.8}
                fill="#ffffff"
                opacity={isDark ? 0.65 : 0.85}
              />

              {/* Central Motif: Sun in Light Mode, Moon in Dark Mode */}
              {isDark ? (
                <g transform={`translate(32, ${RESTING_Y})`}>
                  {/* Crescent Moon */}
                  <path
                    d="M -1.8 -4.8 C 1.2 -4.8, 3.8 -2.2, 3.2 2.2 C 1.4 3, -1 2.8, -2.6 1.4 C -4.2 -0.2 -4.4 -2.8 -1.8 -4.8 Z"
                    fill="#ffffff"
                  />
                  {/* Mini 4-point star */}
                  <path
                    d="M 3.2 -3 Q 3.2 -1.6 4.6 -1.6 Q 3.2 -1.6 3.2 -0.2 Q 3.2 -1.6 1.8 -1.6 Q 3.2 -1.6 3.2 -3 Z"
                    fill="#a5f3fc"
                  />
                </g>
              ) : (
                <g transform={`translate(32, ${RESTING_Y})`}>
                  {/* Sun glyph */}
                  <circle cx={0} cy={0} r={3.3} fill="#d97706" />
                  <g stroke="#d97706" strokeWidth={1.2} strokeLinecap="round">
                    <line x1={0} y1={-5.2} x2={0} y2={-7.2} />
                    <line x1={0} y1={5.2} x2={0} y2={7.2} />
                    <line x1={-5.2} y1={0} x2={-7.2} y2={0} />
                    <line x1={5.2} y1={0} x2={7.2} y2={0} />
                    <line x1={-3.6} y1={-3.6} x2={-5.1} y2={-5.1} />
                    <line x1={3.6} y1={-3.6} x2={5.1} y2={-5.1} />
                    <line x1={-3.6} y1={3.6} x2={-5.1} y2={5.1} />
                    <line x1={3.6} y1={3.6} x2={5.1} y2={5.1} />
                  </g>
                </g>
              )}

              {/* Bottom Finial Teardrop / Bead */}
              <line
                x1={32}
                y1={RESTING_Y + 12}
                x2={32}
                y2={RESTING_Y + 16.5}
                stroke="url(#fb-knob-ring-grad)"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <circle
                cx={32}
                cy={RESTING_Y + 19.5}
                r={3}
                fill="url(#fb-knob-ring-grad)"
              />
              <circle
                cx={31.2}
                cy={RESTING_Y + 18.7}
                r={1}
                fill="#ffffff"
                opacity={0.7}
              />
            </g>
          </svg>

          {/* Interactive touch/pan button centered over the enlarged knob */}
          <motion.button
            type="button"
            className="pullcord-knob"
            aria-label="Pull cord to toggle light and dark mode"
            aria-pressed={isDark}
            title="Pull to toggle theme"
            onPanStart={
              shouldReduceMotion
                ? undefined
                : () => {
                    isDraggingRef.current = true;
                    hasDraggedRef.current = true;
                    hasToggledRef.current = false;
                    panDistanceRef.current = 0;
                    wakePhysicsRef.current();
                  }
            }
            onPan={
              shouldReduceMotion
                ? undefined
                : (_e, info: PanInfo) => {
                    const { stretchMax, stretchToggle } = configRef.current;
                    const offsetX = info.offset.x;
                    const offsetY = RESTING_Y + info.offset.y;
                    const dist = Math.hypot(offsetX, offsetY) || 0.0001;
                    panDistanceRef.current = Math.hypot(info.offset.x, info.offset.y);
                    const maxLen = RESTING_Y + stretchMax;
                    const scale = dist > maxLen ? maxLen / dist : 1;

                    targetPosRef.current = {
                      x: 32 + offsetX * scale,
                      y: offsetY * scale,
                    };

                    const threshold = Math.min(stretchToggle, stretchMax - 1);
                    if (!hasToggledRef.current && dist - RESTING_Y >= threshold) {
                      hasToggledRef.current = true;
                      handleToggleTheme();
                    }
                  }
            }
            onPanEnd={
              shouldReduceMotion
                ? undefined
                : () => {
                    const { maxVelocity } = configRef.current;
                    isDraggingRef.current = false;
                    const pts = pointsRef.current;
                    if (pts) {
                      const p = pts[pts.length - 1];
                      const vx = p.x - p.ox;
                      const vy = p.y - p.oy;
                      const vel = Math.hypot(vx, vy);
                      if (vel > maxVelocity) {
                        const scale = maxVelocity / vel;
                        p.ox = p.x - vx * scale;
                        p.oy = p.y - vy * scale;
                      }
                    }
                    wakePhysicsRef.current();

                    // If user tapped without pulling (very small pan distance) and hasn't toggled yet
                    if (!hasToggledRef.current && panDistanceRef.current < 6) {
                      triggerClick();
                    }

                    requestAnimationFrame(() => {
                      hasDraggedRef.current = false;
                    });
                  }
            }
            onClick={() => {
              if (!hasDraggedRef.current) {
                triggerClick();
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                e.preventDefault();
                triggerClick();
              }
            }}
            style={{
              position: 'absolute',
              left: 4,
              top: RESTING_Y - 28,
              width: 56,
              height: 56,
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'grab',
              touchAction: 'none',
              pointerEvents: 'auto',
            }}
          />
        </div>
      </div>

      {/* Floating cursive invitation hint: "pull the cord!" with curved arrow */}
      {hintVisible && (
        <div
          className="cord-hint"
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: `calc(var(--pullcord-top, 0px) + ${RESTING_Y - 4}px)`,
            right: anchorRight !== null ? `${anchorRight + 54}px` : 'calc(var(--pullcord-right, 2.5rem) + 54px)',
            zIndex: 'calc(var(--pullcord-z, 70) - 1)',
          }}
        >
          <span className="cord-hint-text">
            pull the
            <br />
            cord!
          </span>
          <svg
            className="cord-hint-arrow"
            viewBox="16 11 59 68"
            width={44}
            height={50}
            aria-hidden="true"
          >
            <path
              d="M63.9304352,16.6935883c-0.7543335-0.2961426-1.5021973-0.5897217-2.2429199-0.8804922c-0.4156494-0.151001-0.8272705-0.3005371-1.2348022-0.4485474c-0.8189087-0.2849731-1.6208496-0.5641479-2.4039307-0.8366699c-3.142334-1.060791-6.0206909-1.8996582-8.4889526-2.4821777c-4.9364014-1.164978-8.2321777-1.3042603-8.7171021-0.1418457c-0.4849243,1.1624756,1.9327393,3.4066162,6.2335815,6.0951529c1.8245239,1.140564,4.0041504,2.3630371,6.4287109,3.6149292c-3.9299927,0.5129395-8.5645752,1.7341919-13.3596802,4.0892334c-2.4478149,1.2183838-4.8989258,2.7646484-7.2866211,4.5922241c-2.3288574,1.8961792-4.618042,4.0429077-6.6160278,6.5328979c-4.0496826,4.9500122-6.6275635,10.5092773-8.1968384,15.6245728c-1.5393066,5.1433716-2.2120972,9.887085-2.272583,13.8354492c-0.1154785,1.9729614,0.012085,3.7541504,0.1219482,5.3097534c0.0647583,0.777832,0.1106567,1.4995117,0.2159424,2.1618042c0.1115112,0.6623535,0.2285767,1.265686,0.350769,1.8070068c0.4889526,2.1658325,1.0587769,3.3349609,1.6884766,3.3342896c0.6296387-0.0006104,1.2607422-1.1640625,1.8604736-3.2163696c0.1498413-0.5132446,0.2977295-1.0822754,0.4429321-1.703186c0.1628418-0.6179199,0.3389282-1.2863159,0.5276489-2.0026855c0.3671875-1.4299927,0.6803589-3.0605469,1.182373-4.8129272c0.8353271-3.5391235,2.0805664-7.6299438,3.805542-11.9075317c1.7584839-4.2592163,4.09375-8.6965942,7.3496704-12.6729736c1.6064453-2.0076294,3.4013062-3.7537842,5.2017822-5.3754272c1.8607788-1.5527344,3.755249-2.9500122,5.6772461-4.1428223c3.8567505-2.3618164,7.7036743-4.0240479,11.0596924-5.2119751c0.1141968-0.0405884,0.2226563-0.0770874,0.3356323-0.1167603c-2.00354,2.4140625-3.7368164,4.677124-5.1082764,6.6715088c-2.8739014,4.1792603-4.1975708,7.2007446-3.2896729,8.0737915c0.9078369,0.8730469,3.8753052-0.5675049,7.9391479-3.602478c2.0318604-1.5174561,4.3378906-3.4335327,6.7976074-5.6582031c0.6096802-0.5618896,1.2340698-1.1373901,1.8716431-1.7250366c0.3148193-0.2980347,0.6328735-0.5991821,0.9540405-0.9032593c0.5633545-0.5615845,1.1321411-1.128479,1.7058105-1.7003784c2.5238647-2.5367432,5.1615601-5.2334595,7.8085938-7.9859619C70.7511749,19.4375458,67.2552032,18.0151825,63.9304352,16.6935883z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
    </>
  );
}

export default PullCordThemeToggle;
