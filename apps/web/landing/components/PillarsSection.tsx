import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/lib/ui/components/card";
import {
  Users,
  ShoppingBag,
  Store,
  Contact,
  Package,
  ArrowRight,
} from "lucide-react";

export function PillarsSection() {
  return (
    <section id="systems" className="py-16 md:py-24 bg-surface">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-[30px] font-semibold leading-tight tracking-tight mb-4">
            Company Systems
          </h2>
          <p className="text-base text-secondary max-w-2xl leading-relaxed">
            Access the internal tools you use daily. Each system is available
            through Single Sign-On—log in once and switch between modules
            seamlessly.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* CRM - Large Card (spans 8 cols) */}
          <Link
            href={process.env.NEXT_PUBLIC_CRMS_URL || ""}
            className="md:col-span-8 group block"
          >
            <Card className="h-full bg-surface-container-low border-outline-variant hover:border-primary transition-colors relative overflow-hidden rounded-2xl">
              <CardHeader className="p-6 md:p-8">
                <div className="mb-4">
                  <Users className="size-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold mb-2">
                  CRM
                </CardTitle>
                <CardDescription className="text-sm text-secondary max-w-md leading-relaxed">
                  Manage customer relationships, track sales pipelines, and
                  handle lead generation and outreach campaigns.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Online Shop - Small Card (spans 4 cols) */}
          <Link
            href={process.env.NEXT_PUBLIC_SHOP_URL || ""}
            className="md:col-span-4 group block"
          >
            <Card className="h-full bg-surface-container-highest border-outline-variant hover:border-primary transition-colors rounded-2xl flex flex-col justify-between">
              <CardHeader className="p-6">
                <div className="mb-4">
                  <ShoppingBag className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold mb-2">
                  Online Shop
                </CardTitle>
                <CardDescription className="text-sm text-secondary leading-relaxed">
                  Manage the online storefront, product catalogs, orders, and
                  customer-facing e-commerce operations.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="border-t border-outline-variant pt-4 flex justify-between items-center">
                  <span className="text-xs font-medium">E-commerce</span>
                  <ArrowRight className="size-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* POS - Small Card (spans 4 cols) */}
          <Link
            href={process.env.NEXT_PUBLIC_POS_URL || ""}
            className="md:col-span-4 group block"
          >
            <Card className="h-full bg-background border-outline-variant hover:border-primary transition-colors rounded-2xl">
              <CardHeader className="p-6">
                <div className="mb-4">
                  <Store className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold mb-2">
                  Point of Sale
                </CardTitle>
                <CardDescription className="text-sm text-secondary leading-relaxed mb-6">
                  Process transactions, manage registers, and handle day-to-day
                  retail operations across all locations.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="bg-surface-container-low h-32 rounded-lg border border-outline-variant" />
              </CardContent>
            </Card>
          </Link>

          {/* HRM - Dark Card (spans 4 cols) */}
          <Link
            href={process.env.NEXT_PUBLIC_HRMS_URL || ""}
            className="md:col-span-4 group block"
          >
            <Card className="h-full bg-primary-container border-outline-variant hover:bg-black transition-colors rounded-2xl flex flex-col justify-between">
              <CardHeader className="p-6">
                <div className="mb-4">
                  <Contact className="size-8 text-on-primary" />
                </div>
                <CardTitle className="text-xl font-semibold mb-2 text-on-primary">
                  HR Management
                </CardTitle>
                <CardDescription className="text-sm text-on-primary/70 leading-relaxed">
                  Access payroll, leave requests, employee records, performance
                  reviews, and organizational structure.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-primary-container bg-surface-container-high flex items-center justify-center text-[10px] font-medium">
                    JD
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-primary-container bg-surface-container-high flex items-center justify-center text-[10px] font-medium">
                    ML
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-primary-container bg-surface-container-high flex items-center justify-center text-[10px] font-medium">
                    RA
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-primary-container bg-outline flex items-center justify-center text-[10px] font-medium text-on-primary">
                    +12
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* SCM - Small Card (spans 4 cols) */}
          <Link
            href={process.env.NEXT_PUBLIC_SCMS_URL || ""}
            className="md:col-span-4 group block"
          >
            <Card className="h-full bg-surface-container border-outline-variant hover:border-primary transition-colors rounded-2xl">
              <CardHeader className="p-6">
                <div className="mb-4">
                  <Package className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold mb-2">
                  Supply Chain
                </CardTitle>
                <CardDescription className="text-sm text-secondary leading-relaxed">
                  Track inventory levels, manage supplier orders, monitor
                  shipments, and coordinate logistics.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-outline-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3" />
                  </div>
                  <span className="text-xs font-medium text-secondary">67%</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}
