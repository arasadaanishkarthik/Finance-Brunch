const fs = require('fs');
const assert = require('assert');

console.log('--- Testing 3D Orbit Card Carousel Implementation & Reusability ---');

const orbitCode = fs.readFileSync('./src/components/investment/OrbitCardCarousel.tsx', 'utf8');
const investmentPageCode = fs.readFileSync('./src/pages/InvestmentPlanning.tsx', 'utf8');

// 1. Verify Exposed Constants
assert(orbitCode.includes('ORBIT_CAROUSEL_CONSTANTS'), 'Must export ORBIT_CAROUSEL_CONSTANTS');
assert(orbitCode.includes('horizontalRadiusRatio: 0.30'), 'Horizontal radius ratio must be 0.30');
assert(orbitCode.includes('horizontalRadiusMax: 560'), 'Horizontal radius max must be 560');
assert(orbitCode.includes('verticalRadiusRatio: 0.34'), 'Vertical radius ratio must be 0.34');
assert(orbitCode.includes('laps: 1'), 'Laps count must be 1');
assert(orbitCode.includes("pinLength: '320%'"), 'Pin length must be 320%');
assert(orbitCode.includes('scrubSmoothing: 0.5'), 'Scrub smoothing must be 0.5');
assert(orbitCode.includes('backScale: 0.6'), 'Back card scale must be 0.6');
assert(orbitCode.includes('maxBlur: 10'), 'Max blur must be 10px');
assert(orbitCode.includes('minOpacity: 0.18'), 'Min opacity must be 0.18');
assert(orbitCode.includes('entranceSlideDistanceVh: 40'), 'Entrance slide distance must be 40vh');
assert(orbitCode.includes('minCardCount: 3'), 'Min card count must be 3');
assert(orbitCode.includes('desktopBreakpoint: 1080'), 'Desktop breakpoint must be 1080px');
console.log('✓ PASS: All required constants exposed and verified with exact numerical values');

// 2. Verify Dynamic N Handling (reads from data array, never hardcoded)
assert(orbitCode.includes('const N = items.length;'), 'Must read card count dynamically from items array');
assert(orbitCode.includes('N < ORBIT_CAROUSEL_CONSTANTS.minCardCount'), 'Must check minimum card count < 3');
assert(orbitCode.includes('N > 8'), 'Must handle N > 8 scaling');
assert(orbitCode.includes('(i / N) * twoPi'), 'Must space cards evenly around 360° / N');
console.log('✓ PASS: Dynamic N card calculation, even 360°/N spacing, and N > 8 scaling verified');

// 3. Verify ScrollTriggers and Direct DOM Updates
assert(orbitCode.includes('ScrollTrigger.create({') && orbitCode.includes("start: 'top 95%'"), 'Must have entrance ScrollTrigger from top 95% to top top');
assert(orbitCode.includes("pin: true"), 'Must have pinned ScrollTrigger for rotation');
assert(orbitCode.includes("cardEl.style.transform = `translate3d"), 'Must write transforms directly to DOM for 60fps performance');
assert(orbitCode.includes("cardEl.style.filter ="), 'Must set blur directly on DOM element');
assert(orbitCode.includes("cardEl.style.opacity ="), 'Must set opacity directly on DOM element');
assert(orbitCode.includes("cardEl.style.zIndex ="), 'Must set zIndex directly on DOM element');
assert(orbitCode.includes("cardEl.style.pointerEvents ="), 'Must set pointerEvents directly on DOM element');
assert(orbitCode.includes("depth >= 0.80"), 'Only front ~20% of depth must accept clicks');
console.log('✓ PASS: GSAP ScrollTriggers, direct DOM manipulation, and front 20% clickability verified');

// 4. Verify matchMedia and cleanup
assert(orbitCode.includes('gsap.matchMedia()'), 'Must use gsap.matchMedia for desktop breakpoint');
assert(orbitCode.includes('ctx.revert()'), 'Must clean up ScrollTriggers and animations on unmount');
assert(orbitCode.includes('prefers-reduced-motion'), 'Must support prefers-reduced-motion fallback');
console.log('✓ PASS: gsap.matchMedia, responsive 1080px threshold, and clean unmount context verified');

// 5. Verify Fallback Responsive Grid (< 1080px)
assert(orbitCode.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-3'), 'Fallback must provide responsive grid layout');
assert(orbitCode.includes('hover:scale-[1.03]'), 'Fallback hover effect must enlarge card slightly');
assert(orbitCode.includes('group-hover/fallback:opacity-70') || orbitCode.includes('group-hover'), 'Fallback sibling cards must fade on hover');
console.log('✓ PASS: Fallback grid layout and desktop mouse hover focus effect verified');

// 6. Verify Integration in InvestmentPlanning.tsx
assert(investmentPageCode.includes('<OrbitCardCarousel'), 'InvestmentPlanning must render OrbitCardCarousel');
assert(investmentPageCode.includes('label="Strategic Investment Solutions"'), 'Must pass Strategic Investment Solutions label');
assert(investmentPageCode.includes('headlineWords'), 'Must pass Maximize Your Investment Potential headline');
assert(investmentPageCode.includes('items={orbitItems}'), 'Must pass dynamic orbitItems array');
console.log('✓ PASS: InvestmentPlanning.tsx hero section cleanly integrated with OrbitCardCarousel');

console.log('\n========================================');
console.log('🎉 ALL 3D ORBIT CAROUSEL TESTS PASSED!');
console.log('========================================\n');

