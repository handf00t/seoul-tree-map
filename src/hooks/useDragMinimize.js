// src/hooks/useDragMinimize.js
import { useState } from 'react';

export const useDragMinimize = ({
  isMinimized,
  setIsMinimized,
  onMinimizedChange,
  onClose,
  showBenefits,
  setShowBenefits,
  dragThreshold = 50
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
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
