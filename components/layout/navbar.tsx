"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isForca = pathname.startsWith("/forca");
  const isTotvsRm = pathname.startsWith("/totvs-rm");
  const isPlayground = pathname.startsWith("/playground");

  const navItems = [
    {
      href: "/",
      label: "Início",
      isActive: isHome && !isDashboard,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      isActive: isDashboard,
    },
    {
      href: "/totvs-rm",
      label: "RM SQL AI",
      isActive: isTotvsRm,
    },
    {
      href: "/forca",
      label: "App FORÇA",
      isActive: isForca,
    },
    {
      href: "/playground",
      label: "Design System",
      isActive: isPlayground,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            Camini
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  item.isActive ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden hover:bg-muted"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Mobile Drawer */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
