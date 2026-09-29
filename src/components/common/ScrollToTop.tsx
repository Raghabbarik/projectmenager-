import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress, scrollY } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });
  const [strokeDashoffset, setStrokeDashoffset] = useState(100);

  useEffect(() => {
    const unsubscribeScroll = scrollY.on('change', (latest) => {
      setIsVisible(latest > 280);
    });

    const unsubscribeProgress = smoothProgress.on('change', (latest) => {
      // 100 is circumference percentage (dasharray 100)
      const offset = 100 - Math.min(Math.max(latest * 100, 0), 100);
      setStrokeDashoffset(offset);
    });

    return () => {
      unsubscribeScroll();
      unsubscribeProgress();
    };
  }, [scrollY, smoothProgress]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 16 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 p-2.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/25 text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer group flex items-center justify-center transition-colors"
          aria-label="Scroll back to top"
          title="Scroll back to top"
        >
          {/* Circular SVG Progress Ring */}
          <svg className="w-10 h-10 -rotate-90 pointer-events-none" viewBox="0 0 36 36">
            <path
              className="text-neutral-200/70 dark:text-neutral-800/70"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-indigo-600 dark:text-indigo-400 transition-all duration-75"
              strokeDasharray="100, 100"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="2.8"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>

          {/* Centered Arrow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowUp className="w-4 h-4 stroke-[2.4] group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
