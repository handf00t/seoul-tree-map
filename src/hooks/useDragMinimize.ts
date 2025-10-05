// src/hooks/useDragMinimize.ts
import { useState } from 'react';

interface UseDragMinimizeParams {
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  onMinimizedChange?: (value: boolean) => void;
  onClose: () => void;
  showBenefits: boolean;
  setShowBenefits: (value: boolean) => void;
  dragThreshold?: number;
}

interface UseDragMinimizeReturn {
  isDragging: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleHandleClick: () => void;
}

export const useDragMinimize = ({
  isMinimized,
  setIsMinimized,
  onMinimizedChange,
  onClose,
  showBenefits,
  setShowBenefits,
  dragThreshold = 50
}: UseDragMinimizeParams): UseDragMinimizeReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const deltaY = currentY - startY;

    if (deltaY > dragThreshold) {
      if (showBenefits) {
        setShowBenefits(false);
      } else if (!isMinimized) {
        setIsMinimized(true);
        onMinimizedChange?.(true);
      } else {
        onClose();
      }
    } else if (deltaY < -dragThreshold && isMinimized) {
      setIsMinimized(false);
      onMinimizedChange?.(false);
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  const handleHandleClick = () => {
    if (isDragging) return;

    if (isMinimized) {
      setIsMinimized(false);
      onMinimizedChange?.(false);
    } else {
      setIsMinimized(true);
      setShowBenefits(false);
      onMinimizedChange?.(true);
    }
  };

  return {
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleHandleClick
  };
};
