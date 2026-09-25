"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, LogOut, User } from "lucide-react";
import { Squash as Hamburger } from "hamburger-react";
import { handleLogout } from "@/app/actions";
import { toTitleCase } from "@/lib/utils";
import { Button } from "@/lib/ui/components/button";
import { Badge } from "@/lib/ui/components/badge";
import { Separator } from "@/lib/ui/components/separator";
import { Avatar, AvatarFallback } from "@/lib/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/lib/ui/components/dropdown-menu";

interface TabNavProps {
  roles: string[];
  userName?: string | null;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() ?? "U";
}

export function TabNav({ roles, userName }: TabNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const isAdmin = roles.includes("Super Admin") || roles.includes("CEO");

  const tabs = useMemo(() => [
    { name: "Portal Launcher", href: "/" },
    ...(isAdmin
      ? [
          { name: "Monitoring", href: "/admin/monitoring" },
          { name: "User Management", href: "/admin/users" },
        ]
      : []),
  ], [isAdmin]);

  const updateIndicator = useCallback((el: HTMLAnchorElement) => {
    const parent = el.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicatorStyle({
      left: elRect.left - parentRect.left,
      width: elRect.width,
    });
  }, []);

  // Update indicator position when pathname changes
  useEffect(() => {
    requestAnimationFrame(() => {
      const activeTab = tabs.find(
        (tab) =>
          pathname === tab.href ||
          (tab.href !== "/" && pathname.startsWith(tab.href))
      );
      if (activeTab) {
        const el = tabRefs.current.get(activeTab.href);
        if (el) updateIndicator(el);
      }
    });
  }, [pathname, tabs, updateIndicator]);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <nav className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-12 max-w-[1280px] mx-auto h-16">
        {/* Left: Brand + Navigation Links */}
        <div className="flex items-center gap-8">
          {/* Mobile menu button */}
          <div className="md:hidden -ml-2 text-on-surface" aria-label="Toggle menu">
            <Hamburger
              toggled={mobileMenuOpen}
              toggle={setMobileMenuOpen}
              size={20}
              rounded
              label="Toggle menu"
            />
          </div>

          {/* Brand */}
          <span className="text-2xl flex flex-col font-bold text-primary tracking-tight whitespace-nowrap">
            Bren Raphael&apos;s{" "}
            <span className="font-normal text-secondary text-sm">
              Enterprise Suite
            </span>
          </span>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-8 relative">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href ||
                (tab.href !== "/" && pathname.startsWith(tab.href));

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  ref={(el) => {
                    if (el) {
                      tabRefs.current.set(tab.href, el);
                    }
                  }}
                  className={`text-sm font-medium tracking-wide transition-colors pb-1 ${
                    isActive
                      ? "text-primary"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
            {/* Animated sliding indicator */}
            <span
              className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-in-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
            />
          </div>
        </div>

        {/* Right: Actions + Avatar */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-primary relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              sideOffset={8}
              className="w-[calc(100vw-2rem)] sm:w-80 bg-surface-container-lowest border-border text-on-surface"
            >
              <DropdownMenuLabel className="text-sm font-semibold text-on-surface">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <span className="text-sm font-medium text-on-surface">
                  New user registered
                </span>
                <span className="text-xs text-secondary">
                  John Doe has been added to the system directory.
                </span>
                <span className="text-xs text-outline mt-0.5">
                  2 minutes ago
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <span className="text-sm font-medium text-on-surface">
                  Password reset requested
                </span>
                <span className="text-xs text-secondary">
                  A password reset was initiated for employee EMP-0042.
                </span>
                <span className="text-xs text-outline mt-0.5">
                  15 minutes ago
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <span className="text-sm font-medium text-on-surface">
                  System maintenance scheduled
                </span>
                <span className="text-xs text-secondary">
                  Auth service will undergo maintenance on Sunday at 02:00 UTC.
                </span>
                <span className="text-xs text-outline mt-0.5">
                  1 hour ago
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Separator */}
          <Separator
            orientation="vertical"
            className="h-8 mx-1 hidden sm:block"
          />

          {/* User Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="User menu"
              >
                <Avatar className="border border-border">
                  <AvatarFallback className="bg-surface-container-highest text-on-surface text-xs font-medium cursor-pointer">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-surface-container-lowest border-border text-on-surface cursor-pointer"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">
                    {toTitleCase(userName ?? "User")}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {roles.map((role) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className="px-1.5 py-0 text-[10px] font-medium"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleLogout()}>
                <LogOut className="mr-2 h-4 w-4 cursor-pointer" />
                <span className="cursor-pointer">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Mobile Navigation - Slides down when hamburger is clicked */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border bg-surface-container-lowest ${
          mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/" && pathname.startsWith(tab.href));

            return (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
