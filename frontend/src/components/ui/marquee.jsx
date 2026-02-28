import { cn } from "@/lib/utils";
import React from "react";

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
  children,
  ...props
}) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden [--gap:1rem]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 items-center justify-around gap-[--gap]",
            vertical
              ? "animate-marquee-vertical flex-col"
              : "animate-marquee flex-row",
            reverse && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
