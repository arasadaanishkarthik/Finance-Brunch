/**
 * Finance Brunch — Arc Gallery Configuration & Exposed Constants
 * 
 * Strict specifications for the scroll-driven cinematic Arc Gallery
 * using GSAP + ScrollTrigger.
 */

export const ARC_GALLERY_CONSTANTS = {
  /** Initial count of visible calculators in default collapsed grid */
  INITIAL_VISIBLE_COUNT: 4,

  /** Threshold above which the gallery performs continuous seamless looping */
  LOOP_THRESHOLD: 8,

  /** Multiplier for the circular title arc radius (desktop: 1.05× viewport width) */
  ARC_RADIUS_MULTIPLIER_DESKTOP: 1.05,

  /** Multiplier for the circular title arc radius (mobile: 1.5× viewport width) */
  ARC_RADIUS_MULTIPLIER_MOBILE: 1.5,

  /** Title spacing gap ratio (7% of viewport width) */
  TITLE_GAP_RATIO: 0.07,

  /** Scale reduction per step away from the active center card (14%) */
  CARD_SCALE_STEP: 0.14,

  /** Minimum allowable card scale for distant neighbors (50%) */
  MIN_CARD_SCALE: 0.5,

  /** Pin scroll length per calculator on desktop (55% of viewport height) */
  PIN_LENGTH_PER_PROJECT_DESKTOP: 0.55,

  /** Pin scroll length per calculator on mobile (40% of viewport height) */
  PIN_LENGTH_PER_PROJECT_MOBILE: 0.40,

  /** ScrollTrigger scrub delay value for smooth fluid motion */
  SCRUB: 0.6,

  /** Portrait card height ratio relative to viewport height (52%) */
  CARD_HEIGHT_RATIO: 0.52,

  /** Maximum allowable card height in pixels */
  MAX_CARD_HEIGHT: 600,

  /** Width-to-height ratio for portrait cards in expanded gallery (62% of height) */
  CARD_ASPECT_RATIO_EXPANDED: 0.62,

  /** Mobile layout breakpoint in pixels */
  MOBILE_BREAKPOINT: 769,

  /** Collapsed grid responsive breakpoint in pixels (single column below 820px) */
  COLLAPSED_GRID_BREAKPOINT: 820,
} as const;

export type ArcGalleryConstants = typeof ARC_GALLERY_CONSTANTS;

