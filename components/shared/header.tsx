"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { NotificationBell } from "@/components/shared/notification-bell";
import { RecentActivitiesButton } from "@/components/shared/recent-activities-button";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/pipeline": "Pipeline",
  "/settings": "Configurações",
  "/settings/billing": "Planos e cobrança",
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
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const title = usePageTitle();

  const rawName: string = user.user_metadata?.name ?? "";
  const displayName = rawName || user.email || "";
  const initials = displayName ? getInitials(displayName) : "?";
  // Só exibe primeiro nome quando vem de metadata real (não é um e-mail)
  const firstName = rawName ? rawName.split(" ")[0] : "";

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
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              {displayName && (
                <p className="text-sm font-medium text-foreground">{displayName}</p>
              )}
              {user.email && displayName !== user.email && (
                <p className="text-xs text-muted-foreground">{user.email}</p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/settings" className="w-full">Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={async () => { await signOut(); }}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
