"use client";

import { cn } from "@/features/shared/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

const RAY_ANGLES = [90, 45, 0, 315, 270, 225, 180, 135];

export function Logo() {
  const [autoAnimating, setAutoAnimating] = useState(false);

  useEffect(() => {
    let startTimeout: number;
    let stopTimeout: number;

    const scheduleNext = () => {
      const delay = 4000 + Math.random() * 8000;
      startTimeout = window.setTimeout(() => {
        setAutoAnimating(true);
        stopTimeout = window.setTimeout(() => {
          setAutoAnimating(false);
          scheduleNext();
        }, 1500);
      }, delay);
    };

    scheduleNext();

    return () => {
      window.clearTimeout(startTimeout);
      window.clearTimeout(stopTimeout);
    };
  }, []);

  return (
    <Link href="/" className="group flex items-center gap-2">
      <svg aria-hidden="true" viewBox="0 0 41 41" className="size-6">
        <g>
          {RAY_ANGLES.map((angle, index) => (
            <g key={angle} transform={`rotate(${angle} 20.5 20.5)`}>
              <path
                className={cn("logo-ray", { "logo-ray-animate": autoAnimating })}
                d="M17.5 3.5 C17.5 7 18.4 11.5 19.6 15.5 L19.6 20.7 L21.4 20.7 L21.4 15.5 C22.6 11.5 23.5 7 23.5 3.5 Z"
                fill="#E66100"
                style={{ animationDelay: `${index * 70}ms` }}
              />
            </g>
          ))}
        </g>
      </svg>
      <span className="font-medium text-foreground text-sm">Emergencias CR</span>
    </Link>
  );
}
