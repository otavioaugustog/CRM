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

  const { data: memberships } = await (supabase as any)
    .from("workspace_members")
    .select("workspace_id")
    .limit(1);

  if (!memberships || memberships.length === 0) {
    redirect("/onboarding");
  }

  const workspace = await fetchCurrentWorkspace();

  return <AppShell user={user} plan={workspace?.plan}>{children}</AppShell>;
}
