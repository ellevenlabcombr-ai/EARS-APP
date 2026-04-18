'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<HTMLElement | null>(null);

  const handleScroll = useCallback((e: Event) => {
    let target = e.target as HTMLElement;
    
    // If target is document, use documentElement
    if (e.target === document) {
      target = document.documentElement;
    }

    const scrollTop = target.scrollTop || window.scrollY || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
      setIsVisible(true);
      // Only set scrollTarget if it's an actual element other than document/window
      if (target && target !== document.documentElement) {
        setScrollTarget(target);
      } else {
        setScrollTarget(null);
      }
    } else {
      setIsVisible(false);
    }
  }, []);

  const scrollToTop = () => {
    if (scrollTarget) {
      scrollTarget.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    // Listen to scroll events on the document in the capture phase
    // This allows us to catch scroll events from any scrollable container
    document.addEventListener('scroll', handleScroll, true);
    
    // Also listen to window scroll as a fallback
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[9999] p-3 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-110 focus:outline-none"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
