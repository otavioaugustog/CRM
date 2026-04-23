import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "PipeFlow CRM — Seu pipeline de vendas, finalmente organizado",
  description:
    "Gerencie leads, negocie com times e feche mais vendas com um CRM visual e colaborativo. Pipeline Kanban, dashboard de métricas e multi-empresa em um só lugar.",
  openGraph: {
    title: "PipeFlow CRM — Seu pipeline de vendas, finalmente organizado",
    description:
      "Gerencie leads, negocie com times e feche mais vendas com um CRM visual e colaborativo.",
    type: "website",
    locale: "pt_BR",
    siteName: "PipeFlow CRM",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <LandingNavbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
