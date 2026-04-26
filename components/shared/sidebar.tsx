"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Settings,
  Zap,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "@/components/shared/workspace-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function SidebarContent() {
  const pathname = usePathname();
  const [plan, setPlan] = useState<string>("free");
  const handlePlanChange = useCallback((p: string) => setPlan(p), []);
  const isPro = plan === "pro";

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-sidebar-foreground">
          PipeFlow
        </span>
      </div>

      {/* Workspace switcher */}
      <div className="border-b border-sidebar-border p-2">
        <WorkspaceSwitcher onPlanChange={handlePlanChange} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — plan badge + upgrade CTA */}
      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg bg-sidebar-accent px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Plano atual
            </span>
            <Badge
              variant="secondary"
              className="h-4 px-1.5 text-[10px] font-bold text-primary"
            >
              {isPro ? "PRO" : "FREE"}
            </Badge>
          </div>
          {isPro ? (
            <Link
              href="/settings/billing"
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Zap className="h-3.5 w-3.5" />
              Gerenciar plano
            </Link>
          ) : (
            <Link
              href="/settings/billing"
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Rocket className="h-3.5 w-3.5" />
              Fazer upgrade
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-sidebar-border">
      <SidebarContent />
    </aside>
  );
}
