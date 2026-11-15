import React from 'react';
import { cn } from '@/lib/utils';

export interface SliderTick {
  value?: number;
  percent?: number;
  label: string;
}

export interface SliderTickMarksProps {
  min?: number;
  max?: number;
  currentValue?: number;
  ticks: SliderTick[];
  onSelect?: (value: number) => void;
  className?: string;
}

/**
 * SliderTickMarks - Mathematically precise slider label and tick mark row.
 *
 * Aligns intermediate tick labels exactly with Radix UI Slider thumb center positions,
 * taking thumb width (20px) bounds offset into account so that when a slider reaches
 * a value (e.g. 15%), the thumb is positioned directly and squarely above the label.
 */
export const SliderTickMarks: React.FC<SliderTickMarksProps> = ({
  min = 0,
  max = 100,
  currentValue,
  ticks,
  onSelect,
  className,
}) => {
  if (!ticks || ticks.length === 0) return null;

  return (
    <div
      className={cn(
        "relative w-full h-4 text-[11px] font-mono text-slate-400 dark:text-slate-500 select-none overflow-visible",
        className
      )}
      aria-hidden="true"
    >
      {ticks.map((tick, idx) => {
        // Calculate percentage along track
        let pct: number;
        if (tick.percent !== undefined) {
          pct = tick.percent;
        } else if (tick.value !== undefined && max > min) {
          pct = ((tick.value - min) / (max - min)) * 100;
        } else {
          pct = (idx / (ticks.length - 1)) * 100;
        }
        pct = Math.max(0, Math.min(100, pct));

        const isFirst = idx === 0 || pct === 0;
        const isLast = idx === ticks.length - 1 || pct === 100;

        // Is this tick currently active/selected?
        const isActive =
          currentValue !== undefined &&
          tick.value !== undefined &&
          Math.abs(currentValue - tick.value) < 0.5;

        // Radix slider thumb is 20px wide (w-5). In horizontal mode, Radix applies:
        // offset = 10px - 20px * (pct / 100)
        // Center of thumb = calc(pct% + (10 - 20 * (pct / 100))px)
        const thumbOffsetPx = 10 - 20 * (pct / 100);

        const style: React.CSSProperties = isFirst
          ? { left: 0, textAlign: 'left' }
          : isLast
          ? { right: 0, textAlign: 'right' }
          : {
              left: `calc(${pct}% + ${thumbOffsetPx}px)`,
              transform: 'translateX(-50%)',
              textAlign: 'center',
            };

        const handleClick = () => {
          if (onSelect && tick.value !== undefined) {
            onSelect(tick.value);
          }
        };

        return (
          <span
            key={`${tick.label}-${idx}`}
            onClick={onSelect && tick.value !== undefined ? handleClick : undefined}
            style={style}
            className={cn(
              "absolute top-0 whitespace-nowrap transition-colors duration-150",
              onSelect && tick.value !== undefined
                ? "cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400"
                : "",
              isActive && "text-cyan-600 dark:text-cyan-400 font-bold"
            )}
            title={onSelect && tick.value !== undefined ? `Set to ${tick.label}` : undefined}
          >
            {tick.label}
          </span>
        );
      })}
    </div>
  );
};
