import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,70,229,0.14) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 dark:text-indigo-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          Novo: Dashboard com análise de funil em tempo real
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Seu pipeline de vendas,{" "}
          <span
            style={{
              backgroundImage: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            finalmente organizado
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
          Gerencie leads, negocie com times e feche mais vendas com um CRM
          visual e colaborativo — sem planilhas, sem burocracia.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "gap-2 px-8 text-base shadow-lg shadow-indigo-500/20"
            )}
          >
            Começar grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "gap-2 text-base"
            )}
          >
            <Play className="h-4 w-4 fill-current" />
            Ver funcionalidades
          </a>
        </div>

        {/* App mockup */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex h-9 items-center gap-2 border-b border-border bg-muted px-4">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="mx-auto flex h-5 w-56 items-center justify-center rounded bg-background border border-border px-3">
                <span className="text-[10px] text-muted-foreground">
                  app.pipeflow.com/pipeline
                </span>
              </div>
            </div>

            {/* Kanban board mockup */}
            <div className="flex gap-3 overflow-x-auto p-5 bg-muted/30">
              {MOCK_STAGES.map((stage) => (
                <div key={stage.label} className="flex w-48 shrink-0 flex-col gap-2">
                  <div
                    className="rounded-lg px-3 py-2 flex items-center justify-between"
                    style={{ backgroundColor: stage.bg }}
                  >
                    <span className="text-xs font-semibold" style={{ color: stage.color }}>
                      {stage.label}
                    </span>
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: stage.badge, color: stage.color }}
                    >
                      {stage.cards.length}
                    </span>
                  </div>
                  {stage.cards.map((card, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-card p-3 shadow-sm"
                    >
                      <p className="text-xs font-semibold text-foreground leading-snug">
                        {card.title}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{card.value}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -left-6 top-24 hidden lg:flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
              <span className="text-sm">🎉</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Deal fechado!</p>
              <p className="text-[10px] text-muted-foreground">R$ 18.500 — Acme Corp</p>
            </div>
          </div>

          <div className="absolute -right-6 bottom-16 hidden lg:flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm">📈</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">+47% conversão</p>
              <p className="text-[10px] text-muted-foreground">vs. mês anterior</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const MOCK_STAGES = [
  {
    label: "Novo Lead",
    bg: "#1e293b",
    badge: "#334155",
    color: "#94a3b8",
    cards: [
      { title: "Inova Soluções LTDA", value: "R$ 8.200" },
      { title: "Tech Partners", value: "R$ 4.500" },
    ],
  },
  {
    label: "Proposta Enviada",
    bg: "#1e1b4b",
    badge: "#312e81",
    color: "#a5b4fc",
    cards: [
      { title: "Global Commerce", value: "R$ 24.000" },
      { title: "Alpha Sistemas", value: "R$ 12.800" },
    ],
  },
  {
    label: "Negociação",
    bg: "#1c1a0e",
    badge: "#292109",
    color: "#fbbf24",
    cards: [{ title: "Mega Varejo S/A", value: "R$ 51.000" }],
  },
  {
    label: "Fechado Ganho",
    bg: "#052e16",
    badge: "#064e3b",
    color: "#34d399",
    cards: [
      { title: "Acme Corporation", value: "R$ 18.500" },
      { title: "StartX Ventures", value: "R$ 9.300" },
    ],
  },
];
