import './style.css';
import { runEntranceAnimation } from './animation';

async function init(): Promise<void> {
  // Wait for DOM content loaded
  if (document.readyState === 'loading') {
    await new Promise<void>(resolve =>
      document.addEventListener('DOMContentLoaded', () => resolve())
    );
  }

  // Wait for fonts to load (important for Japanese fonts)
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Small delay to ensure everything is painted
  await new Promise<void>(resolve => setTimeout(resolve, 100));

  // Run the entrance animation
  try {
    await runEntranceAnimation();
  } catch (error) {
    console.error('Animation error:', error);
    // Fallback: show content anyway
    showFallbackContent();
  }
}

function showFallbackContent(): void {
  const loading = document.getElementById('loading');
  const content = document.getElementById('content');

  if (loading) loading.style.display = 'none';
  if (content) {
    content.classList.remove('hidden');
    // Make all elements visible
    const title = content.querySelector('.title') as HTMLElement;
    const tagline = content.querySelector('.tagline') as HTMLElement;
    const comingSoon = content.querySelector('.coming-soon') as HTMLElement;

    if (title) {
      title.style.opacity = '1';
      title.style.transform = 'scale(1)';
      title.style.filter = 'none';
    }
    if (tagline) {
      tagline.style.opacity = '1';
      tagline.style.transform = 'none';
    }
    if (comingSoon) {
      comingSoon.style.opacity = '1';
    }
  }
}

init();
