/**
 * Lightning flash effect system for ichigeki.info teaser site
 */

/** Flash intensity levels */
export type FlashIntensity = 'subtle' | 'medium' | 'full';

/** Configuration for each intensity level */
interface IntensityConfig {
  duration: number;
  opacity: number;
  blueTint: boolean;
}

const INTENSITY_CONFIG: Record<FlashIntensity, IntensityConfig> = {
  subtle: { duration: 50, opacity: 0.3, blueTint: false },
  medium: { duration: 100, opacity: 0.6, blueTint: false },
  full: { duration: 150, opacity: 0.9, blueTint: true },
};

/** Ambient lightning timing range in milliseconds */
const AMBIENT_MIN_INTERVAL = 8000;
const AMBIENT_MAX_INTERVAL = 12000;

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Wait for a specified duration
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Apply blue tint gradient to overlay
 */
function applyBlueTint(overlay: HTMLElement): void {
  overlay.style.background =
    'linear-gradient(180deg, rgba(100, 149, 237, 0.3) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(100, 149, 237, 0.3) 100%)';
}

/**
 * Remove blue tint and restore default background
 */
function removeBlueTint(overlay: HTMLElement): void {
  overlay.style.background = '';
}

/**
 * Flash the lightning overlay with specified intensity
 *
 * @param overlay - The HTMLElement to flash
 * @param intensity - Flash intensity level: 'subtle', 'medium', or 'full'
 * @returns Promise that resolves when flash completes
 */
export function flashLightning(
  overlay: HTMLElement,
  intensity: FlashIntensity
): Promise<void> {
  // Skip animation if user prefers reduced motion
  if (prefersReducedMotion()) {
    return Promise.resolve();
  }

  const config = INTENSITY_CONFIG[intensity];

  return new Promise((resolve) => {
    // Apply blue tint for full intensity
    if (config.blueTint) {
      applyBlueTint(overlay);
    }

    // Flash on
    overlay.style.opacity = String(config.opacity);

    // Flash off after duration
    setTimeout(() => {
      overlay.style.opacity = '0';

      // Remove blue tint after flash
      if (config.blueTint) {
        removeBlueTint(overlay);
      }

      // Wait for CSS transition to complete before resolving
      setTimeout(resolve, 50);
    }, config.duration);
  });
}

/**
 * Create a realistic flicker pattern with 2-3 quick flashes
 * Pattern: flash -> dark -> flash -> dark -> optional third flash
 * Total duration: ~400ms
 *
 * @param overlay - The HTMLElement to flicker
 * @returns Promise that resolves when flicker sequence completes
 */
export async function flickerLightning(overlay: HTMLElement): Promise<void> {
  // Skip animation if user prefers reduced motion
  if (prefersReducedMotion()) {
    return;
  }

  // First flash - medium intensity, quick
  overlay.style.opacity = '0.5';
  await delay(40);
  overlay.style.opacity = '0';
  await delay(60);

  // Second flash - brighter, slightly longer
  overlay.style.opacity = '0.7';
  await delay(50);
  overlay.style.opacity = '0';
  await delay(80);

  // Third flash - 50% chance, subtle
  if (Math.random() > 0.5) {
    await delay(40);
    overlay.style.opacity = '0.3';
    await delay(30);
    overlay.style.opacity = '0';
  }

  // Final settling delay
  await delay(50);
}

/** Cleanup function type for ambient lightning */
export type AmbientCleanup = () => void;

/**
 * Start random subtle flickers every 8-12 seconds
 * Uses requestAnimationFrame for timing
 *
 * @param overlay - The HTMLElement for lightning effects
 * @returns Cleanup function to stop the ambient effect
 */
export function startAmbientLightning(overlay: HTMLElement): AmbientCleanup {
  let isRunning = true;
  let timeoutId: number | null = null;

  /**
   * Get random interval between min and max
   */
  function getRandomInterval(): number {
    return (
      AMBIENT_MIN_INTERVAL +
      Math.random() * (AMBIENT_MAX_INTERVAL - AMBIENT_MIN_INTERVAL)
    );
  }

  /**
   * Schedule next ambient flash
   */
  function scheduleNext(): void {
    if (!isRunning) return;

    const interval = getRandomInterval();

    timeoutId = window.setTimeout(() => {
      if (!isRunning) return;

      // Use requestAnimationFrame for smooth timing
      requestAnimationFrame(() => {
        if (!isRunning) return;

        // Randomly choose between subtle flash and flicker
        const useFlicker = Math.random() > 0.7;

        if (useFlicker) {
          flickerLightning(overlay).then(() => {
            scheduleNext();
          });
        } else {
          flashLightning(overlay, 'subtle').then(() => {
            scheduleNext();
          });
        }
      });
    }, interval);
  }

  // Start the ambient cycle
  scheduleNext();

  // Return cleanup function
  return () => {
    isRunning = false;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    // Ensure overlay is reset
    overlay.style.opacity = '0';
    removeBlueTint(overlay);
  };
}
