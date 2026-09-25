import Link from "next/link";
import { Separator } from "@/lib/ui/components/separator";

const systems = [
  { label: "CRM", href: process.env.NEXT_PUBLIC_CRMS_URL || "" },
  { label: "Online Shop", href: process.env.NEXT_PUBLIC_SHOP_URL || "" },
  { label: "Point of Sale", href: process.env.NEXT_PUBLIC_POS_URL || "" },
  { label: "HR Management", href: process.env.NEXT_PUBLIC_HRMS_URL || "" },
  { label: "Supply Chain", href: process.env.NEXT_PUBLIC_SCMS_URL || "" },
];

const resources = [
  { label: "Documentation", href: "/docs" },
  { label: "Help & FAQ", href: "/faq" },
  { label: "Online Shop", href: process.env.NEXT_PUBLIC_SHOP_URL || "" },
  { label: "Sign In", href: `${process.env.NEXT_PUBLIC_PORTAL_URL || ""}/signin` },
];

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="text-xl font-bold text-primary">
              Bren Raphael&apos;s
            </Link>
            <p className="mt-4 text-sm text-secondary leading-relaxed">
              Internal enterprise platform. For employee use only.
            </p>
          </div>

          {/* Systems */}
          <div>
            <h4 className="text-sm font-medium text-primary mb-4 tracking-wide">
              Systems
            </h4>
            <ul className="space-y-2">
              {systems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-secondary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-medium text-primary mb-4 tracking-wide">
              Resources
            </h4>
            <ul className="space-y-2">
              {resources.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-secondary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-outline-variant" />

        {/* Copyright */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-secondary">
            © {new Date().getFullYear()}&nbsp;Bren Raphael&apos;s Enterprise Suite. Internal use only.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-secondary hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-secondary hover:text-primary transition-colors">
              Acceptable Use Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
