import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/lib/ui/components/card";
import { Separator } from "@/lib/ui/components/separator";
import { Badge } from "@/lib/ui/components/badge";
import {
  Users, ShoppingBag, Store, Contact, Package,
  Rocket, BookOpen, Shield, ArrowRight, KeyRound, Lock, AlertTriangle,
} from "lucide-react";

const systemDocs = [
  {
    title: "CRM",
    code: "CRMS",
    description: "Customer records, sales pipelines, interactions, and outreach campaigns.",
    icon: Users,
    href: process.env.NEXT_PUBLIC_CRMS_URL || "",
  },
  {
    title: "HR Management",
    code: "HRMS",
    description: "Leave requests, payslips, employee directory, and performance reviews.",
    icon: Contact,
    href: process.env.NEXT_PUBLIC_HRMS_URL || "",
  },
  {
    title: "Point of Sale",
    code: "POS",
    description: "Transactions, registers, refunds, and shift-based sales reports.",
    icon: Store,
    href: process.env.NEXT_PUBLIC_POS_URL || "",
  },
  {
    title: "Supply Chain",
    code: "SCMS",
    description: "Inventory levels, purchase orders, shipment tracking, and supplier management.",
    icon: Package,
    href: process.env.NEXT_PUBLIC_SCMS_URL || "",
  },
  {
    title: "Online Shop",
    code: "OOS",
    description: "Product listings, online orders, catalog updates, and customer inquiries.",
    icon: ShoppingBag,
    href: process.env.NEXT_PUBLIC_SHOP_URL || "",
  },
];

const sidebarLinks = [
  { label: "Getting Started", href: "#getting-started" },
  { label: "System Guides", href: "#systems" },
  { label: "Security & Best Practices", href: "#security" },
];

export function DocsPageContainer() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-12">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden md:block">
          <nav className="sticky top-28 space-y-1">
            <p className="text-xs font-medium text-secondary uppercase tracking-widest mb-4">
              On this page
            </p>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm text-secondary hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary pl-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Page Header */}
          <div>
            <Badge variant="outline" className="mb-4 text-xs border-outline-variant">
              Employee Resources
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Internal Documentation
            </h1>
            <p className="text-lg text-secondary leading-relaxed max-w-2xl">
              Everything you need to use the platform effectively. From first-time
              setup to system-specific workflows and security practices.
            </p>
          </div>

          {/* Getting Started */}
          <section id="getting-started">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">
              Getting Started
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-outline-variant rounded-xl">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-surface-container-low flex items-center justify-center rounded-lg">
                      <Rocket className="size-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold">
                      First-Time Setup
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm text-secondary leading-relaxed">
                    New employee? Here&apos;s how to get access to your systems.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <ol className="space-y-3 text-sm text-on-surface-variant">
                    <li className="flex gap-3">
                      <span className="text-primary font-semibold shrink-0">1.</span>
                      <span>Your admin provisions your account and assigns systems</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-semibold shrink-0">2.</span>
                      <span>Set your password via the email invitation link</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-semibold shrink-0">3.</span>
                      <span>Sign in at the Portal to see your assigned modules</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-semibold shrink-0">4.</span>
                      <span>Click any module to launch it — SSO handles the rest</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-outline-variant rounded-xl">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-surface-container-low flex items-center justify-center rounded-lg">
                      <BookOpen className="size-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold">
                      How Access Works
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm text-secondary leading-relaxed">
                    Understanding authentication, permissions, and module access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <ul className="space-y-3 text-sm text-on-surface-variant">
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Single Sign-On — one login for all systems</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Role-based access — you only see what you need</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Admin-managed — contact your manager for new access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Password changes apply across all systems instantly</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator className="bg-outline-variant" />

          {/* System Guides */}
          <section id="systems">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-2">
                  System Guides
                </h2>
                <p className="text-sm text-secondary">
                  Quick references for each module. Click to open directly.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {systemDocs.map((system) => {
                const Icon = system.icon;
                return (
                  <Link key={system.code} href={system.href} className="block group">
                    <Card className="border-outline-variant rounded-xl hover:border-primary transition-colors">
                      <CardHeader className="p-5 flex flex-row items-center gap-4">
                        <div className="w-10 h-10 bg-surface-container-low flex items-center justify-center rounded-lg shrink-0 group-hover:bg-primary transition-colors">
                          <Icon className="size-5 text-primary group-hover:text-on-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <CardTitle className="text-sm font-semibold">
                              {system.title}
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-outline-variant">
                              {system.code}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs text-secondary leading-relaxed">
                            {system.description}
                          </CardDescription>
                        </div>
                        <div className="hidden sm:flex items-center shrink-0">
                          <ArrowRight className="size-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          <Separator className="bg-outline-variant" />

          {/* Security & Best Practices */}
          <section id="security">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">
              Security & Best Practices
            </h2>
            <p className="text-sm text-secondary mb-8">
              Keep your account safe and follow company security guidelines.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-outline-variant rounded-xl">
                <CardHeader className="p-6">
                  <div className="w-9 h-9 bg-surface-container-low flex items-center justify-center rounded-lg mb-3">
                    <KeyRound className="size-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-semibold mb-2">
                    Password Policy
                  </CardTitle>
                  <CardDescription className="text-xs text-secondary leading-relaxed">
                    Use a strong password with at least 12 characters. Include
                    uppercase, lowercase, numbers, and symbols. Never share your
                    credentials with anyone.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-outline-variant rounded-xl">
                <CardHeader className="p-6">
                  <div className="w-9 h-9 bg-surface-container-low flex items-center justify-center rounded-lg mb-3">
                    <Lock className="size-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-semibold mb-2">
                    Session Security
                  </CardTitle>
                  <CardDescription className="text-xs text-secondary leading-relaxed">
                    Always sign out when using shared or public computers. Sessions
                    expire automatically after inactivity. Lock your screen when
                    stepping away.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-outline-variant rounded-xl">
                <CardHeader className="p-6">
                  <div className="w-9 h-9 bg-surface-container-low flex items-center justify-center rounded-lg mb-3">
                    <AlertTriangle className="size-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-semibold mb-2">
                    Report Issues
                  </CardTitle>
                  <CardDescription className="text-xs text-secondary leading-relaxed">
                    If you notice suspicious activity, unauthorized access, or
                    receive phishing emails, report immediately to your administrator.
                    Do not click unknown links.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="border-outline-variant rounded-xl mt-6 bg-surface-container-low">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Shield className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Data Handling Reminder
                    </p>
                    <p className="text-xs text-secondary leading-relaxed">
                      All data within the platform is confidential. Do not export,
                      share, or transmit company data to external parties without
                      proper authorization. Follow the company&apos;s data
                      classification policy at all times.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
