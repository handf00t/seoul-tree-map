// src/hooks/useResponsive.ts
import { useEffect, useState } from 'react';

interface UseResponsiveReturn {
  isMobile: boolean;
  isDesktop: boolean;
}

export const useResponsive = (breakpoint: number = 768): UseResponsiveReturn => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [breakpoint]);

  return { isMobile, isDesktop: !isMobile };
};
