"use client";

import { useState } from "react";

import type { HeatmapDay } from "@/types/portfolio-contract";
import { cn } from "@/lib/utils";

/** Five shading steps, mapped to the blueprint accent. */
const HEAT = [
  "bg-syntax-surface-muted",
  "bg-syntax-command/25",
  "bg-syntax-command/45",
  "bg-syntax-command/70",
  "bg-syntax-command",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface ContributionHeatmapProps {
  weeks: HeatmapDay[][];
  label: string;
}

/** One cell per day, seven rows per column, oldest column first. */
export default function ContributionHeatmap({ weeks }: ContributionHeatmapProps) {
  const [hover, setHover] = useState<HeatmapDay | null>(null);

  if (weeks.length === 0) {
    return <p className="font-mono text-[11px] text-syntax-comment">no calendar captured</p>;
  }

  const days = weeks.flat();
  const total = days.reduce((sum, day) => sum + day.value, 0);
  const active = days.filter((day) => day.value > 0).length;
  const busiest = days.reduce((max, day) => (day.value > max.value ? day : max), days[0]);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-end">
        <span className="readout text-[15px] text-syntax-text">
          {hover ? `${hover.date} · ${hover.value}` : `peak ${busiest.value} · ${busiest.date}`}
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="flex gap-[2px]"
          role="img"
          aria-label={`${total} contributions across ${active} active days.`}
        >
          {weeks.map((week, weekIndex) => (
            <div key={week[0]?.date ?? weekIndex} className="flex flex-col gap-[2px]">
              {week.map((day) => (
                <span
                  key={day.date}
                  title={`${day.date}: ${day.value}`}
                  onMouseEnter={() => setHover(day)}
                  onMouseLeave={() => setHover(null)}
                  className={cn(
                    "fig-reveal h-[7px] w-[7px] rounded-[1px]",
                    HEAT[day.level] ?? HEAT[0]
                  )}
                  style={{ animationDelay: `${Math.min(weekIndex * 8, 420)}ms` }}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-1.5 flex gap-[2px]">
          {weeks.map((week, index) => {
            const first = week[0]?.date ?? "";
            const month = first.slice(5, 7);
            const previous = index > 0 ? (weeks[index - 1][0]?.date ?? "").slice(5, 7) : "";
            return (
              <span
                key={first || index}
                className="w-[7px] overflow-visible whitespace-nowrap font-mono text-[8px] text-syntax-comment"
              >
                {month !== previous && month !== "" ? MONTHS[Number(month) - 1] : ""}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
