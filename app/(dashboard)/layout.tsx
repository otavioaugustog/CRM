import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/shared/app-shell";
import { fetchCurrentWorkspace } from "@/app/actions/workspace";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // RLS garante que fetchCurrentWorkspace retorna null quando não há membership
  const workspace = await fetchCurrentWorkspace();
  if (!workspace) redirect("/onboarding");

  return <AppShell user={user} plan={workspace.plan}>{children}</AppShell>;
}
