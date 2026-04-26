"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspace } from "@/app/actions/workspace";

const schema = z.object({
  workspaceName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setServerError(null);

    const result = await createWorkspace(data.workspaceName);

    if ('error' in result) {
      setServerError(result.error);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Crie seu workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          É aqui que você e sua equipe vão trabalhar juntos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="workspaceName">Nome do workspace</Label>
          <Input
            id="workspaceName"
            type="text"
            placeholder="Ex: Acme Vendas, Minha Empresa"
            autoComplete="organization"
            autoFocus
            aria-invalid={!!errors.workspaceName}
            {...register("workspaceName")}
          />
          {errors.workspaceName && (
            <p className="text-xs text-destructive">
              {errors.workspaceName.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Pode ser o nome da sua empresa ou do seu time
          </p>
        </div>

        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full h-9 mt-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Criando workspace…
            </>
          ) : (
            "Criar workspace e entrar"
          )}
        </Button>
      </form>
    </div>
  );
}
