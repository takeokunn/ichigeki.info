import { tsParticles, type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

/**
 * Particle configuration for ember/spark effect
 * Creates a mystical atmosphere with gold and amber particles
 * drifting slowly upward
 */
const particleConfig: ISourceOptions = {
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 60,
  particles: {
    number: {
      value: 50,
      density: {
        enable: true,
        width: 1920,
        height: 1080,
      },
    },
    color: {
      value: ["#d4af37", "#ffbf00", "#ffd700", "#daa520"],
    },
    shape: {
      type: "circle",
    },
    opacity: {
      value: {
        min: 0.3,
        max: 0.8,
      },
      animation: {
        enable: true,
        speed: 0.5,
        sync: false,
        startValue: "random",
        destroy: "min",
      },
    },
    size: {
      value: {
        min: 1,
        max: 3,
      },
      animation: {
        enable: true,
        speed: 0.5,
        sync: false,
        startValue: "random",
      },
    },
    move: {
      enable: true,
      speed: {
        min: 0.5,
        max: 1,
      },
      direction: "top",
      random: true,
      straight: false,
      outModes: {
        default: "out",
        top: "out",
        bottom: "out",
      },
      drift: {
        min: -0.5,
        max: 0.5,
      },
    },
    life: {
      duration: {
        sync: false,
        value: {
          min: 3,
          max: 6,
        },
      },
      count: 0,
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: false,
      },
      onClick: {
        enable: false,
      },
    },
  },
  detectRetina: true,
  responsive: [
    {
      maxWidth: 768,
      options: {
        particles: {
          number: {
            value: 25,
          },
        },
      },
    },
    {
      maxWidth: 480,
      options: {
        particles: {
          number: {
            value: 15,
          },
        },
      },
    },
  ],
};

/**
 * Initialize the particle system
 * @param containerId - The ID of the container element
 * @returns Promise resolving to the particle container instance
 */
export async function initParticles(containerId: string): Promise<Container | undefined> {
  await loadSlim(tsParticles);

  const container = await tsParticles.load({
    id: containerId,
    options: particleConfig,
  });

  return container;
}

/**
 * Accelerate particles for anticipation phase during entrance animation
 * Temporarily increases particle speed and adds more intensity
 * @param container - The particle container instance
 */
export function accelerateParticles(container: Container | undefined): void {
  if (!container) return;

  const particleArray = container.particles.filter(() => true);

  for (const particle of particleArray) {
    if (particle.velocity) {
      particle.velocity.x *= 3;
      particle.velocity.y *= 3;
    }
  }

  const options = container.options;
  if (options.particles?.number) {
    const currentValue = options.particles.number.value;
    if (typeof currentValue === "number") {
      options.particles.number.value = currentValue * 1.5;
    }
  }
}

/**
 * Reset particles to normal speed after anticipation phase
 * @param container - The particle container instance
 */
export function resetParticles(container: Container | undefined): void {
  if (!container) return;

  const particleArray = container.particles.filter(() => true);

  for (const particle of particleArray) {
    if (particle.velocity) {
      particle.velocity.x /= 3;
      particle.velocity.y /= 3;
    }
  }

  const options = container.options;
  if (options.particles?.number) {
    const currentValue = options.particles.number.value;
    if (typeof currentValue === "number") {
      options.particles.number.value = currentValue / 1.5;
    }
  }
}

export type { Container };
