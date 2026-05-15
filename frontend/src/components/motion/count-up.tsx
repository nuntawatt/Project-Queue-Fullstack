'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface CountUpProps {
  value: number;
  className?: string;
  duration?: number;
}

/** Animated number counter with spring physics */
export function CountUp({ value, className, duration = 0.8 }: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v));
  const prevRef = useRef(value);

  useEffect(() => {
    spring.set(value);
    prevRef.current = value;
  }, [spring, value]);

  useEffect(() => {
    const unsub = display.on('change', (v) => setDisplayValue(v));
    return unsub;
  }, [display]);

  return (
    <motion.span className={className}>
      {displayValue.toLocaleString()}
    </motion.span>
  );
}
