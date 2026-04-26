import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaBanner() {
  return (
    <section className="bg-[#4F46E5] py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Pronto para fechar mais negócios?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base text-indigo-200 leading-relaxed">
          Crie sua conta grátis em menos de 2 minutos. Sem cartão de crédito,
          sem compromisso.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-8 text-base shadow-lg font-semibold"
            )}
          >
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "text-indigo-200 hover:text-white hover:bg-white/10 text-base"
            )}
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </section>
  );
}
