import { toTitleCase } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/lib/ui/components/card";
import { Badge } from "@/lib/ui/components/badge";
import { Button } from "@/lib/ui/components/button";
import { 
  Users, 
  Contact, 
  Store, 
  Package, 
  Shield, 
  LayoutGrid, 
  ArrowRight,
  Rocket,
  ShoppingBagIcon
} from "lucide-react";
import Link from "next/link";

interface SystemDto {
  code: string;
  name: string;
  url: string;
}

interface PortalDashboardProps {
  userName?: string | null;
  systems: SystemDto[];
}

export function PortalDashboard({ userName, systems }: PortalDashboardProps) {
  // Map system names to friendly descriptions and lucide icons
  const getSystemProps = (code: string) => {
    switch (code.toUpperCase()) {
      case "CRM":
      case "CRMS":
        return {
          desc: "Manage customer relationships, sales pipelines, and lead generation analytics.",
          Icon: Users
        };
      case "HRM":
      case "HRMS":
        return {
          desc: "Oversee human resources, payroll, employee benefits, and talent management.",
          Icon: Contact
        };
      case "POS":
        return {
          desc: "Streamline point-of-sale transactions and real-time retail reporting systems.",
          Icon: Store
        };
      case "SCM":
      case "SCMS":
        return {
          desc: "Optimize supply chain logistics, inventory tracking, and vendor coordination.",
          Icon: Package
        };
      case "OOS":
      case "OOS ADMIN":
        return {
          desc: "Manage online orders, inventory, and order tracking.",
          Icon: ShoppingBagIcon
        };
      case "PORTAL":
      case "ADMIN":
        return {
          desc: "Global system configuration, user permissions, and security protocol management.",
          Icon: Shield
        };
      default:
        return {
          desc: "Access this system module for authorized operations and management.",
          Icon: LayoutGrid
        };
    }
  };

  return (
    <div className="py-8 space-y-12">
      {/* Welcome Header */}
      <section>
        <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Welcome back, {toTitleCase(userName || "User")}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-secondary max-w-2xl leading-relaxed">
          Access your enterprise ecosystem. Select a module to manage your business operations across departments.
        </p>
      </section>

      {/* Systems Grid */}
      {systems.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed p-12 text-center bg-surface-container-lowest">
          <div className="w-14 h-14 rounded-lg bg-danger/10 flex items-center justify-center mb-4">
            <Shield className="text-danger w-6 h-6" />
          </div>
          <CardTitle className="text-lg">No Access Granted</CardTitle>
          <CardDescription className="max-w-md mt-2">
            You do not have access to any application systems. Please contact
            your administrator or system manager to assign role permissions.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {systems.map((system) => {
            const { desc, Icon } = getSystemProps(system.code);
            return (
              <Link key={system.code} href={system.url} className="group block focus-visible:outline-hidden">
                <Card className="h-full bg-surface-container-lowest transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary">
                  <CardHeader className="pb-4">
                    {/* Icon Container */}
                    <div className="w-12 h-12 bg-surface-container-low flex items-center justify-center rounded-lg mb-2 group-hover:bg-primary transition-colors">
                      <Icon className="w-6 h-6 text-primary group-hover:text-on-primary transition-colors" />
                    </div>
                    <CardTitle className="text-xl text-primary group-hover:text-primary transition-colors">
                      {system.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex flex-col flex-1 justify-between gap-6">
                    <CardDescription className="text-sm leading-relaxed text-secondary">
                      {desc}
                    </CardDescription>

                    {/* Launch Indicator */}
                    <div className="flex items-center text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-200">
                      Launch Module
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Featured Section (Asymmetric Insight Cards) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        <Card className="lg:col-span-2 bg-primary text-on-primary border-transparent rounded-xl relative overflow-hidden flex flex-col justify-center min-h-[300px]">
          <CardContent className="p-8 sm:p-12 relative z-10 flex flex-col items-start gap-4 h-full justify-center">
            <Badge variant="secondary" className="bg-white/10 text-on-primary hover:bg-white/20 backdrop-blur-md border-transparent">
              System Update v4.2
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mt-2">
              Enhanced HRM Modules are now live.
            </h2>
            <p className="text-base sm:text-lg opacity-80 max-w-lg leading-relaxed mb-4">
              Discover the new predictive analytics tools designed to improve employee retention and workforce planning.
            </p>
            <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Review Updates
            </Button>
          </CardContent>
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none flex items-center justify-center">
            <Rocket className="w-[300px] h-[300px] translate-x-20 translate-y-10" />
          </div>
        </Card>

        <Card className="bg-surface-container-lowest rounded-xl flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-xl">Daily Insight</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4 border-b border-border pb-6">
              <div className="text-primary font-extrabold text-3xl">12%</div>
              <div className="text-secondary text-sm leading-relaxed">
                Growth in CRM lead conversion since last month.
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-primary font-extrabold text-3xl">04</div>
              <div className="text-secondary text-sm leading-relaxed">
                Pending HR reviews requiring your immediate attention.
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              View Detailed Reports
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
