/**
 * Main animation orchestration for ichigeki.info teaser site
 * Coordinates particles, lightning, and GSAP animations for entrance sequence
 * Enhanced with dramatic slash, glitch, burst, and shake effects
 */

import gsap from "gsap";
import {
  initParticles,
  accelerateParticles,
  resetParticles,
  type Container,
} from "./particles";
import {
  flashLightning,
  flickerLightning,
  startAmbientLightning,
  type AmbientCleanup,
} from "./lightning";

/**
 * Animation phase durations in seconds (enhanced for dramatic effect)
 * - LOADING: Until assets ready (handled by main.ts)
 * - DARKNESS: 0.8s - particles drift slowly, building tension
 * - ANTICIPATION: 1.2s - particle acceleration, lightning flickers, glitch hints
 * - IMPACT: 0.4s - slash, burst, screen shake, title reveals
 * - SETTLE: 2.0s - glow pulses, tagline floats in, coming-soon pulses
 * - AMBIENT: continuous - particles drift, occasional lightning
 */
const PHASE_DURATIONS = {
  darkness: 0.8,
  anticipation: 1.2,
  impact: 0.4,
  settle: 2.0,
} as const;

/** Store ambient cleanup function for potential external cleanup */
let ambientCleanup: AmbientCleanup | null = null;

/**
 * Trigger screen shake effect
 */
function triggerShake(element: HTMLElement, duration: number = 500): void {
  element.classList.add("shake");
  setTimeout(() => element.classList.remove("shake"), duration);
}

/**
 * Trigger slash effect
 */
function triggerSlash(slashLine: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    slashLine.classList.add("animate");
    setTimeout(() => {
      slashLine.classList.remove("animate");
      resolve();
    }, 300);
  });
}

/**
 * Trigger burst effect
 */
function triggerBurst(burstOverlay: HTMLElement): void {
  burstOverlay.classList.add("burst-animate");
  setTimeout(() => {
    burstOverlay.classList.remove("burst-animate");
  }, 600);
}

/**
 * Trigger glitch effect on title
 */
function triggerGlitch(title: HTMLElement, duration: number = 300): void {
  title.classList.add("glitch");
  setTimeout(() => title.classList.remove("glitch"), duration);
}

/**
 * Show all content immediately without animation
 * Used for reduced motion preference fallback
 */
export function showContentImmediately(): void {
  const loading = document.getElementById("loading");
  const content = document.getElementById("content");
  const title = document.querySelector<HTMLElement>(".title");
  const tagline = document.querySelector<HTMLElement>(".tagline");
  const comingSoon = document.querySelector<HTMLElement>(".coming-soon");

  // Hide loading screen
  if (loading) {
    loading.style.display = "none";
  }

  // Show content container
  if (content) {
    content.classList.remove("hidden");
    content.style.opacity = "1";
  }

  // Show all text elements without animation
  if (title) {
    title.style.opacity = "1";
    title.style.transform = "scale(1)";
    title.style.filter = "blur(0px)";
  }

  if (tagline) {
    tagline.style.opacity = "1";
    tagline.style.transform = "translateY(0)";
  }

  if (comingSoon) {
    comingSoon.style.opacity = "1";
  }
}

/**
 * Run the full entrance animation sequence
 * Orchestrates particles, lightning, slash, burst, and text reveals through GSAP timeline
 *
 * @returns Promise that resolves when entrance animation completes
 */
export async function runEntranceAnimation(): Promise<void> {
  // Check reduced motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    showContentImmediately();
    return;
  }

  // Get DOM elements
  const loading = document.getElementById("loading");
  const content = document.getElementById("content");
  const title = document.querySelector<HTMLElement>(".title");
  const tagline = document.querySelector<HTMLElement>(".tagline");
  const comingSoon = document.querySelector<HTMLElement>(".coming-soon");
  const lightningOverlay = document.getElementById("lightning-overlay");
  const slashOverlay = document.getElementById("slash-overlay");
  const slashLine = document.querySelector<HTMLElement>(".slash-line");
  const burstOverlay = document.getElementById("burst-overlay");
  const particlesContainer = document.getElementById("particles");

  // Validate required elements exist
  if (!content || !title || !tagline || !comingSoon || !lightningOverlay) {
    console.warn("Animation: Required DOM elements not found, showing content immediately");
    showContentImmediately();
    return;
  }

  // Initialize particles
  let particles: Container | undefined;
  if (particlesContainer) {
    try {
      particles = await initParticles("particles");
    } catch (error) {
      console.warn("Animation: Failed to initialize particles", error);
    }
  }

  // Hide loading screen with fade
  if (loading) {
    gsap.to(loading, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        loading.style.display = "none";
      },
    });
  }

  // Prepare content - make container visible but keep elements hidden
  content.classList.remove("hidden");
  content.style.opacity = "1";

  // Set initial states for animated elements
  gsap.set(title, {
    opacity: 0,
    scale: 1.5,
    filter: "blur(20px)",
  });

  gsap.set(tagline, {
    opacity: 0,
    y: 30,
  });

  gsap.set(comingSoon, {
    opacity: 0,
    scale: 0.8,
  });

  // Make slash overlay visible
  if (slashOverlay) {
    slashOverlay.style.opacity = "1";
  }

  // Create GSAP timeline for animation sequence
  const tl = gsap.timeline();

  // ============================================
  // DARKNESS PHASE (0.8s)
  // Particles drift slowly, building tension
  // ============================================
  tl.to({}, { duration: PHASE_DURATIONS.darkness });

  // ============================================
  // ANTICIPATION PHASE (1.2s)
  // Particle acceleration, lightning flickers, subtle glitch hints
  // ============================================
  tl.add(() => {
    accelerateParticles(particles);
  });

  // First subtle lightning flicker
  tl.add(() => {
    flickerLightning(lightningOverlay);
  }, "+=0.2");

  // Brief glitch hint
  tl.add(() => {
    triggerGlitch(title, 150);
  }, "+=0.3");

  // Second lightning flicker, building intensity
  tl.add(() => {
    flashLightning(lightningOverlay, "medium");
  }, "+=0.2");

  // Another quick glitch
  tl.add(() => {
    triggerGlitch(title, 100);
  }, "+=0.1");

  // Final anticipation flicker
  tl.add(() => {
    flickerLightning(lightningOverlay);
  }, "+=0.2");

  // ============================================
  // IMPACT PHASE (0.4s)
  // Slash, burst, screen shake, title reveals with power
  // ============================================

  // Full lightning flash
  tl.add(() => {
    flashLightning(lightningOverlay, "full");
  });

  // Trigger slash effect
  tl.add(() => {
    if (slashLine) triggerSlash(slashLine);
  }, "<");

  // Trigger burst effect
  tl.add(() => {
    if (burstOverlay) triggerBurst(burstOverlay);
  }, "<");

  // Screen shake on impact
  tl.add(() => {
    triggerShake(document.body, 500);
  }, "<");

  // Intense glitch on reveal
  tl.add(() => {
    triggerGlitch(title, 200);
  }, "<");

  // Title reveal with dramatic scale and blur-to-sharp effect
  tl.to(
    title,
    {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      duration: PHASE_DURATIONS.impact,
      ease: "power4.out",
    },
    "<"
  );

  // ============================================
  // SETTLE PHASE (2.0s)
  // Glow echo pulses, tagline floats in, coming-soon pulses
  // ============================================

  // Reset particles to normal speed
  tl.add(() => {
    resetParticles(particles);
  });

  // Trigger glow pulse animation on title (CSS handles the pulses)
  tl.add(() => {
    title.classList.add("glow-pulse");
  });

  // Second slash for extra flair (diagonal opposite)
  tl.add(() => {
    if (slashLine) {
      slashLine.style.transform = "rotate(15deg) scaleX(0)";
      triggerSlash(slashLine);
    }
  }, "+=0.3");

  // Tagline fade in with upward float motion
  tl.to(
    tagline,
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        tagline.classList.add("revealed");
      },
    },
    "+=0.2"
  );

  // Coming soon fade in with scale
  tl.to(
    comingSoon,
    {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
      onComplete: () => {
        comingSoon.classList.add("revealed");
      },
    },
    "+=0.3"
  );

  // Occasional extra glitch for style
  tl.add(() => {
    setTimeout(() => triggerGlitch(title, 100), 2000);
  });

  // ============================================
  // AMBIENT PHASE (continuous)
  // Particles drift, occasional lightning
  // ============================================
  tl.add(() => {
    ambientCleanup = startAmbientLightning(lightningOverlay);

    // Add random glitch effects during ambient
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        triggerGlitch(title, 80);
      }
    }, 5000);

    // Store for cleanup
    const originalCleanup = ambientCleanup;
    ambientCleanup = () => {
      originalCleanup();
      clearInterval(glitchInterval);
    };
  });

  // Return promise that resolves when timeline completes
  return new Promise((resolve) => {
    tl.eventCallback("onComplete", () => {
      resolve();
    });
  });
}

/**
 * Stop the ambient lightning effect
 * Call this when cleaning up or navigating away
 */
export function stopAmbientLightning(): void {
  if (ambientCleanup) {
    ambientCleanup();
    ambientCleanup = null;
  }
}
