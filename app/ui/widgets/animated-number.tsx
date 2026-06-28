"use client";

import * as React from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

export interface AnimatedNumberProps {
  value: number;
  /** Formats the in-flight value for display. */
  format?: (n: number) => string;
  className?: string;
}

/** Count-up number that animates once it scrolls into view. */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString(),
  className,
}: AnimatedNumberProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 90,
    damping: 20,
    mass: 0.8,
  });

  React.useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  React.useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) ref.current.textContent = format(latest);
    });
  }, [spring, format]);

  return (
    <span ref={ref} className={className}>
      {format(0)}
    </span>
  );
}
