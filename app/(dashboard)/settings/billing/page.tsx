import { CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Planos e cobrança</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Gerencie seu plano e informações de pagamento.
        </p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-24 gap-3">
        <CreditCard className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Integração Stripe disponível no M14 — Monetização
        </p>
      </div>
    </div>
  );
}
