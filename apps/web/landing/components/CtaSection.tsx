import Link from "next/link";
import { Button } from "@/lib/ui/components/button";

export function CtaSection() {
  return (
    <section className="py-24 md:py-[120px] bg-primary relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-on-primary mb-8 tracking-tight leading-tight">
          Need help or have questions?
        </h2>
        <p className="text-lg text-on-primary/80 max-w-2xl mx-auto mb-12 leading-relaxed">
          Check our documentation for guides on each system, or visit the FAQ
          for answers to common questions.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-full md:w-auto px-16 py-6 rounded-xl text-sm font-medium bg-on-primary text-primary hover:bg-on-primary/90"
            asChild
          >
            <Link href="/docs">View Documentation</Link>
          </Button>
          <Button
            size="lg"
            className="w-full md:w-auto px-16 py-6 rounded-xl text-sm font-medium border border-on-primary/30 bg-transparent text-on-primary hover:bg-on-primary/10"
            asChild
          >
            <Link href="/faq">Help & FAQ</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
