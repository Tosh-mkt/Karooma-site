import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FlipbookPage {
  id: string;
  content: React.ReactNode;
}

interface FlipbookCoreProps {
  pages: FlipbookPage[];
  colorScheme: {
    primary: string;
    secondary: string;
    gradient: string;
    background: string;
    text: string;
    accent: string;
  };
  onPageChange?: (pageIndex: number) => void;
}

export function FlipbookCore({ pages, colorScheme, onPageChange }: FlipbookCoreProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const flipbookRef = useRef<HTMLDivElement>(null);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setDirection(1);
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setDirection(pageIndex > currentPage ? 1 : -1);
      setCurrentPage(pageIndex);
    }
  };

  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  // Touch gesture handling
  useEffect(() => {
    const flipbook = flipbookRef.current;
    if (!flipbook) return;

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Check if horizontal swipe is more dominant than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          prevPage(); // Swipe right = previous page
        } else {
          nextPage(); // Swipe left = next page
        }
      }
    };

    flipbook.addEventListener('touchstart', handleTouchStart, { passive: false });
    flipbook.addEventListener('touchmove', handleTouchMove, { passive: false });
    flipbook.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      flipbook.removeEventListener('touchstart', handleTouchStart);
      flipbook.removeEventListener('touchmove', handleTouchMove);
      flipbook.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div 
      ref={flipbookRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: colorScheme.background }}
    >
      {/* Page Content */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentPage}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.5,
            ease: "easeInOut"
          }}
          className="absolute inset-0 w-full h-full"
        >
          {pages[currentPage]?.content}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`p-4 m-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-all ${
            currentPage === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-white/30 active:scale-95'
          }`}
          style={{ color: colorScheme.text }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className={`p-4 m-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-all ${
            currentPage === pages.length - 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-white/30 active:scale-95'
          }`}
          style={{ color: colorScheme.text }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Page Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentPage 
                  ? 'scale-125' 
                  : 'hover:scale-110'
              }`}
              style={{ 
                backgroundColor: index === currentPage 
                  ? colorScheme.primary 
                  : colorScheme.accent 
              }}
            />
          ))}
        </div>
      </div>

      {/* Page Counter */}
      <div className="absolute top-6 right-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-poppins" style={{ color: colorScheme.text }}>
          {currentPage + 1} / {pages.length}
        </div>
      </div>
    </div>
  );
}