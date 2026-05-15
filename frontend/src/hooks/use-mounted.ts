'use client';

import { useState, useEffect } from 'react';

/** Track hydration state to avoid mismatch between server and client renders */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
