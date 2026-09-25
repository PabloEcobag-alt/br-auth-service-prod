"use client";

import Link from "next/link";
import { Menu, ShoppingBag } from "lucide-react";
import { Button } from "@/lib/ui/components/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/lib/ui/components/sheet";
import { SlideIn } from "@/components/animations/SlideIn";


const navLinks = [
  { label: "Systems", href: "/#systems" },
  { label: "Docs", href: "/docs" },
  { label: "Help & FAQ", href: "/faq" },
];

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 h-16 md:h-20 flex items-center bg-background/80 backdrop-blur-md border-b border-outline-variant">
      <div className="max-w-[1280px] mx-auto w-full px-4 md:px-12 flex justify-between items-center">
        {/* Branding */}
        <Link href="/" className="text-xl font-bold text-primary tracking-tight">
          Bren Raphael&apos;s
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-secondary hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={process.env.NEXT_PUBLIC_SHOP_URL || ""}>
              <ShoppingBag className="size-4" />
              Shop
            </Link>
          </Button>
          <Button asChild>
            <Link href={`${process.env.NEXT_PUBLIC_PORTAL_URL || ""}/signin`}>Sign In</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="text-left text-lg font-bold text-primary">
                  Bren Raphael&apos;s
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 px-4">
                {navLinks.map((link, index) => (
                  <SheetClose key={link.href} asChild>
                    <SlideIn delayMs={index * 100 + 150} asChild>
                      <Link
                        href={link.href}
                        className="py-3 text-base font-medium text-on-surface hover:text-primary border-b border-outline-variant transition-colors"
                      >
                        {link.label}
                      </Link>
                    </SlideIn>
                  </SheetClose>
                ))}
              </nav>
              <div className="flex flex-col gap-3 px-4 mt-6">
                <SheetClose asChild>
                  <SlideIn delayMs={450} asChild>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={process.env.NEXT_PUBLIC_SHOP_URL || ""}>
                        <ShoppingBag className="size-4" />
                        Go to Shop
                      </Link>
                    </Button>
                  </SlideIn>
                </SheetClose>
                <SheetClose asChild>
                  <SlideIn delayMs={550} asChild>
                    <Button className="w-full" asChild>
                      <Link href={`${process.env.NEXT_PUBLIC_PORTAL_URL || ""}/signin`}>Sign In</Link>
                    </Button>
                  </SlideIn>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
