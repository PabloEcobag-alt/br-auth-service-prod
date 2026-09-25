"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/lib/ui/components/card";
import { Button } from "@/lib/ui/components/button";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { systems } from "@/constants/systems";

export function SystemsCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % systems.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + systems.length) % systems.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  const currentSystem = systems[current];
  const Icon = currentSystem.icon;

  return (
    <div className="mt-16 max-w-5xl mx-auto px-4 md:px-12">
      <Card className="relative rounded-2xl overflow-hidden border-outline-variant shadow-2xl bg-surface-container-lowest">
        <div className="relative aspect-[16/9] md:aspect-[16/7] flex items-center justify-center">
          {/* Background */}
          <div className={`absolute inset-0 ${currentSystem.color} transition-colors duration-500`} />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 md:py-16">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-background border border-outline-variant rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Icon className="size-8 md:size-10 text-primary" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-3">
              {currentSystem.title}
            </h3>
            <p className="text-sm md:text-base text-secondary max-w-md leading-relaxed">
              {currentSystem.description}
            </p>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-outline-variant hover:bg-background"
            onClick={prev}
          >
            <ChevronLeft className="size-5" />
            <span className="sr-only">Previous system</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border border-outline-variant hover:bg-background"
            onClick={next}
          >
            <ChevronRight className="size-5" />
            <span className="sr-only">Next system</span>
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2 pb-6">
          {systems.map((system, index) => (
            <button
              key={system.title}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === current
                  ? "w-6 bg-primary"
                  : "w-2 bg-outline-variant hover:bg-outline"
              }`}
            >
              <span className="sr-only">{system.title}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
