import { Slot } from "@radix-ui/react-slot";
import { CSSProperties, ReactNode } from "react";

interface SlideInProps {
  children: ReactNode;
  delayMs: number;
  asChild?: boolean;
}

export function SlideIn({ children, delayMs, asChild = false }: SlideInProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp 
      className="animate-slide-in" 
      style={{ animationDelay: `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </Comp>
  );
}
