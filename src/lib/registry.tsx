"use client";

import React from "react";
import { useRef, useEffect, useState, ReactNode } from "react";

interface StyledComponentsRegistryProps {
  children: ReactNode;
}

export default function StyledComponentsRegistry({ children }: StyledComponentsRegistryProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
