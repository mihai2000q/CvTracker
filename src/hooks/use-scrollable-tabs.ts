import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const FADE_WIDTH_REM = 2;
// The active tab's count chip takes 125ms to grow (duration-125). A smooth scroll starts a little
// before that, and the instant nudge at its end covers whatever the tab grew after the target
const GROW_DURATION_MS = 100;
// Longer than a smooth scroll takes, for when nothing scrolled and so there's no scrollend
const SMOOTH_SCROLL_MAX_MS = 600;

// For a tab list wider than its container: edge fades that show only on a side with hidden
// tabs, the active tab kept in view as it grows, and a smooth scroll to it after a click
export function useScrollableTabs() {
  const ref = useRef<HTMLDivElement>(null);
  const isRevealPending = useRef(false);
  const cancelReveal = useRef<() => void>(() => {});
  const [hidden, setHidden] = useState({ start: false, end: false });

  const updateHidden = useCallback(() => {
    const scroller = ref.current;
    if (!scroller) return;
    const start = scroller.scrollLeft > 0;
    const end = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1;
    setHidden((previous) =>
      previous.start === start && previous.end === end ? previous : { start, end }
    );
  }, []);

  // Scrolls only the strip, and only as far as needed to get the active tab clear of the fade
  const revealActiveTab = useCallback((behavior: ScrollBehavior) => {
    const scroller = ref.current;
    const tab = scroller?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!scroller || !tab) return;
    const bounds = scroller.getBoundingClientRect();
    const tabBounds = tab.getBoundingClientRect();
    const margin = parseFloat(getComputedStyle(document.documentElement).fontSize) * FADE_WIDTH_REM;
    if (tabBounds.left < bounds.left + margin) {
      scroller.scrollBy({ left: tabBounds.left - bounds.left - margin, behavior });
    } else if (tabBounds.right > bounds.right - margin) {
      scroller.scrollBy({ left: tabBounds.right - bounds.right + margin, behavior });
    }
  }, []);

  // The container resizing and the tabs changing width both change what overflows. The active
  // tab grows when selected, so it's kept in view as it does. That's instant, and not while a
  // click is waiting to scroll, because an instant scroll would cancel the smooth one
  useLayoutEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;
    updateHidden();
    const observer = new ResizeObserver(() => {
      updateHidden();
      if (!isRevealPending.current) revealActiveTab('instant');
    });
    observer.observe(scroller);
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    return () => {
      observer.disconnect();
      cancelReveal.current();
    };
  }, [updateHidden, revealActiveTab]);

  // Focus scrolls a tab into view by itself, a click on a half-hidden one doesn't
  const handleClick = () => {
    const scroller = ref.current;
    if (!scroller) return;
    cancelReveal.current();
    isRevealPending.current = true;

    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      cancelReveal.current();
      isRevealPending.current = false;
      revealActiveTab('instant');
    };
    cancelReveal.current = () => {
      clearTimeout(timer);
      scroller.removeEventListener('scrollend', finish);
    };

    timer = setTimeout(() => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      revealActiveTab(reducedMotion ? 'instant' : 'smooth');
      scroller.addEventListener('scrollend', finish, { once: true });
      timer = setTimeout(finish, SMOOTH_SCROLL_MAX_MS);
    }, GROW_DURATION_MS);
  };

  return {
    overflows: hidden.start || hidden.end,
    scrollerProps: {
      ref,
      onScroll: updateHidden,
      onClick: handleClick,
      style: {
        '--fade-start': hidden.start ? `${FADE_WIDTH_REM}rem` : '0px',
        '--fade-end': hidden.end ? `${FADE_WIDTH_REM}rem` : '0px',
      } as CSSProperties,
    },
  };
}
