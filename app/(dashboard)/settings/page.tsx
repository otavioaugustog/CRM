import { Settings } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Configurações</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Gerencie seu workspace, membros e plano.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="text-sm">Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Nome, slug e configurações gerais — disponível no M12
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="text-sm">Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Convites e papéis de acesso — disponível no M12
            </p>
          </CardContent>
        </Card>

        <Link href="/settings/billing">
          <Card className="cursor-pointer transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle className="text-sm">Planos e cobrança</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Ver plano atual e fazer upgrade
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
