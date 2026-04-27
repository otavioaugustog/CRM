"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/actions/auth";
import { getInitials } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { WorkspacePlan } from "@/types";
import { NotificationBell } from "@/components/shared/notification-bell";
import { RecentActivitiesButton } from "@/components/shared/recent-activities-button";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/pipeline": "Pipeline",
  "/settings/profile": "Meu Perfil",
  "/settings/billing": "Planos e cobrança",
  "/settings": "Configurações",
};

function usePageTitle() {
  const pathname = usePathname();
  const sorted = Object.entries(PAGE_TITLES).sort((a, b) => b[0].length - a[0].length);
  for (const [path, title] of sorted) {
    if (pathname.startsWith(path)) return title;
  }
  return "Dashboard";
}

interface HeaderProps {
  user: User;
  plan?: WorkspacePlan;
  onMenuClick?: () => void;
}

export function Header({ user, plan, onMenuClick }: HeaderProps) {
  const title = usePageTitle();
  const [signingOut, setSigningOut] = useState(false);

  const rawName: string = user.user_metadata?.name ?? "";
  const avatarUrl: string = user.user_metadata?.avatar_url ?? "";
  const displayName = rawName || user.email || "";
  const initials = displayName ? getInitials(displayName) : "?";
  const firstName = rawName ? rawName.split(" ")[0] : "";

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <RecentActivitiesButton />
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Menu do usuário"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary focus-visible:outline-none"
          >
            <Avatar className="h-7 w-7">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {firstName && (
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {firstName}
              </span>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-start justify-between gap-2 px-2 py-1.5">
              <div className="min-w-0">
                {displayName && (
                  <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                )}
                {user.email && displayName !== user.email && (
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
              {plan && (
                <Badge
                  variant="secondary"
                  className="shrink-0 h-4 px-1.5 text-[10px] font-bold text-primary"
                >
                  {plan === "pro" ? "PRO" : "FREE"}
                </Badge>
              )}
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem render={<Link href="/settings/profile" />}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />}>
              Configurações
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={signingOut}
              onClick={handleSignOut}
            >
              {signingOut ? "Saindo…" : "Sair"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
