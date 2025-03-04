import { useState, useCallback, useEffect } from 'react';

export const useCarousel = (length: number) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % length);
  }, [length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + length) % length);
  }, [length]);

  const goto = useCallback((index: number) => {
    if (index >= 0 && index < length) {
      setCurrentIndex(index);
    }
  }, [length]);

  // Reset index when length changes
  useEffect(() => {
    if (currentIndex >= length) {
      setCurrentIndex(0);
    }
  }, [length, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prev();
      } else if (e.key === 'ArrowRight') {
        next();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev]);

  return {
    currentIndex,
    next,
    prev,
    goto,
  };
};
