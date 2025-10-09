"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import "./backgrounds.css";

export default function Background() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {theme === "dark" ? (
        <div className="dark-background" />
      ) : (
        <div className="light-background">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="blur-light" />
          ))}
        </div>
      )}
    </>
  );
}
