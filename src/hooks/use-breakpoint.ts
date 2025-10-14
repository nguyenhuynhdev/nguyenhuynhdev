"use client";
import { useState, useEffect } from "react";

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<"mobile" | "tablet" | "laptop" | "desktop">("mobile");

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width >= 1280) setBreakpoint("desktop");
      else if (width >= 1024) setBreakpoint("laptop");
      else if (width >= 640) setBreakpoint("tablet");
      else setBreakpoint("mobile");
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isLaptop: breakpoint === "laptop",
    isDesktop: breakpoint === "desktop",
  };
}