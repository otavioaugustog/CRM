const STATS = [
  {
    value: "+47%",
    label: "taxa de conversão",
    description: "Times que usam PipeFlow fecham mais negócios",
  },
  {
    value: "3.2x",
    label: "leads qualificados",
    description: "Mais leads prontos para comprar no pipeline",
  },
  {
    value: "-62%",
    label: "ciclo de venda",
    description: "Reduza o tempo entre o contato e o fechamento",
  },
  {
    value: "1200+",
    label: "times ativos",
    description: "Empresas de todos os tamanhos confiam no PipeFlow",
  },
];

export function Stats() {
  return (
    <section className="bg-[#4F46E5] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map(({ value, label, description }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                {value}
              </p>
              <p className="mt-1 text-sm font-semibold text-indigo-200 uppercase tracking-wide">
                {label}
              </p>
              <p className="mt-2 text-xs text-indigo-300 leading-relaxed hidden md:block">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
