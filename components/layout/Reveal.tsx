"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  /** Stagger within a group, in milliseconds. */
  delay?: number;
  className?: string;
}

/**
 * Stages content as it enters the viewport by toggling a class on the node,
 * which keeps the animation out of React's render path. Reduced motion and a
 * missing IntersectionObserver both fall through to fully visible, so content
 * is never hidden from a reader.
 */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const { reduceMotion } = useWorkspace();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
