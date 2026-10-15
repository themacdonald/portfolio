"use client";

import { useEffect, useState } from "react";

/** Reading progress for the main pane, drawn as a 2px accent rule. */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const scroller = document.querySelector("main");
    if (!scroller) return;

    const update = () => {
      const range = scroller.scrollHeight - scroller.clientHeight;
      setProgress(range <= 0 ? 0 : Math.min(1, scroller.scrollTop / range));
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 z-40 h-[2px] w-full bg-transparent"
    >
      <div
        className="h-full bg-syntax-command transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
