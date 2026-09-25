import Link from "next/link";
import { Badge } from "@/lib/ui/components/badge";
import { Button } from "@/lib/ui/components/button";
import { SystemsCarousel } from "@/components/SystemsCarousel";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-neutral-200/50">
      {/* Decorative background geometric lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-65 select-none">
        {/* Grid pattern */}
        <svg
          className="absolute inset-0 h-full w-full stroke-gray-300/80 [mask-image:radial-gradient(100%_100%_at_top,white,transparent)] dark:stroke-neutral-700/60"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width={40}
              height={40}
              patternUnits="userSpaceOnUse"
              x="-1"
              y="-1"
            >
              <path d="M.5 40V.5H40" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#grid-pattern)" />
        </svg>

        {/* Concentric circles and intersecting lines */}
        <svg
          className="absolute left-1/2 top-1/2 h-[64rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 stroke-gray-400 [mask-image:radial-gradient(closest-side,white,transparent)] dark:stroke-neutral-600"
          aria-hidden="true"
          viewBox="0 0 1024 1024"
          fill="none"
        >
          {/* Concentric circles */}
          <circle cx="512" cy="512" r="512" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="512" cy="512" r="400" strokeWidth="1" />
          <circle cx="512" cy="512" r="280" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="512" cy="512" r="160" strokeWidth="1" />

          {/* Intersecting lines */}
          <line x1="0" y1="0" x2="1024" y2="1024" strokeWidth="1" />
          <line x1="1024" y1="0" x2="0" y2="1024" strokeWidth="1" />
          <line x1="512" y1="0" x2="512" y2="1024" strokeWidth="1" strokeDasharray="8 8" />
          <line x1="0" y1="512" x2="1024" y2="512" strokeWidth="1" strokeDasharray="8 8" />
        </svg>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 text-center relative z-10">
        {/* Badge */}
        <Badge
          variant="outline"
          className="mb-6 px-4 py-1 text-xs font-medium border-outline-variant"
        >
          Internal Platform
        </Badge>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-[64px] font-bold leading-tight tracking-tight mb-8 max-w-4xl mx-auto">
          Bren Raphael&apos;s Enterprise Systems
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
          Your centralized access point to all company systems. Sign in to
          manage operations across CRM, HRM, POS, Supply Chain, and Online
          Shop from a single platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-full md:w-auto px-16 py-6 rounded-xl text-sm font-medium"
            asChild
          >
            <Link href={`${process.env.NEXT_PUBLIC_PORTAL_URL || ""}/signin`}>Sign In to Portal</Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full md:w-auto px-16 py-6 rounded-xl text-sm font-medium"
            asChild
          >
            <Link href="/docs">View Documentation</Link>
          </Button>
        </div>
      </div>

      {/* Systems Carousel */}
      <SystemsCarousel />
    </section>
  );
}
