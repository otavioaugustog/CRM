"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap, Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Funcionalidades" },
  { href: "#pricing", label: "Preços" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 shadow-sm backdrop-blur-md border-b border-border"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            PipeFlow
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Entrar
          </Link>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Começar grátis
          </Link>
        </div>

        {/* Mobile: CTA sempre visível + toggle */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Começar grátis
          </Link>
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 pb-5 pt-3 flex flex-col gap-3 shadow-lg">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-foreground py-1.5"
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline" })}
            >
              Entrar
            </Link>
            <Link href="/signup" className={buttonVariants({})}>
              Começar grátis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
