import DonateButton from "@/components/DonateButton";
import AnalizarModal from "@/components/AnalizarModal";

const EJEMPLOS_SELLOS = [
  "ALTO EN AZÚCARES",
  "ALTO EN SODIO",
  "ALTO EN GRASAS SATURADAS",
  "ALTO EN CALORÍAS",
];

const PASOS = [
  {
    icono: "📷",
    titulo: "Fotografía la etiqueta",
    desc: "O escribe el nombre, o escanea el código de barras.",
  },
  {
    icono: "🔍",
    titulo: "Analizamos con IA",
    desc: "Gemini Vision extrae ingredientes y tabla nutricional.",
  },
  {
    icono: "📊",
    titulo: "Recibe la nota",
    desc: "Del 1.0 al 7.0 según la Ley 20.606 y normas europeas.",
  },
];

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center space-y-6 pt-8">
        <div className="inline-block text-6xl">🔍</div>
        <h1 className="font-syne font-black text-4xl sm:text-5xl text-neutral-900 dark:text-white leading-tight">
          Ponemos los alimentos chilenos{" "}
          <span className="text-[#CC0000]">bajo la lupa</span>
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
          Fotografía cualquier etiqueta y recibe una calificación del 1.0 al
          7.0 según la Ley 20.606. Sin vueltas, sin eufemismos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <AnalizarModal
            label="📷 Analizar producto"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-semibold text-lg hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors"
          />
          <DonateButton />
        </div>
      </section>

      {/* Sellos MINSAL */}
      <section className="space-y-4">
        <h2 className="font-syne font-bold text-lg text-neutral-700 dark:text-neutral-300 text-center">
          Detectamos estos sellos automáticamente
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {EJEMPLOS_SELLOS.map((sello) => (
            <span
              key={sello}
              className="inline-flex items-center gap-1.5 bg-[#CC0000] text-white text-sm font-bold px-4 py-2 rounded"
            >
              ⬛ {sello}
            </span>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="space-y-8">
        <h2 className="font-syne font-bold text-2xl text-neutral-900 dark:text-white text-center">
          ¿Cómo funciona?
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {PASOS.map((paso, i) => (
            <div
              key={i}
              className="text-center space-y-3 p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="text-4xl">{paso.icono}</div>
              <h3 className="font-syne font-bold text-neutral-900 dark:text-white">
                {paso.titulo}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {paso.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo calculamos la nota */}
      <section
        id="metodologia"
        className="rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 space-y-4"
      >
        <h2 className="font-syne font-bold text-xl text-neutral-900 dark:text-white">
          ¿Cómo calculamos la nota?
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Partimos de <strong>7.0</strong> y descontamos según estos criterios:
        </p>
        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-[#CC0000] font-bold mt-0.5">−1.2</span>
            <span>Por cada sello ALTO EN (Ley 20.606)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#CC0000] font-bold mt-0.5">−0.8</span>
            <span>Si contiene grasas trans</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#CC0000] font-bold mt-0.5">−0.5</span>
            <span>Por cada aditivo de riesgo alto</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D4A017] font-bold mt-0.5">−0.2</span>
            <span>Por cada aditivo de riesgo medio</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#1A6B3C] font-bold mt-0.5">+0.3</span>
            <span>Bonus si no hay sellos ni aditivos problemáticos</span>
          </li>
        </ul>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Mínimo: 1.0 · Máximo: 7.0 · Fuente: Ley 20.606, DS 977/96, Reglamento UE 1169/2011
        </p>
      </section>

      {/* CTA final */}
      <section className="text-center space-y-4 pb-8">
        <h2 className="font-syne font-bold text-2xl text-neutral-900 dark:text-white">
          Empieza a saber lo que comes
        </h2>
        <AnalizarModal
          label="📷 Analizar ahora — es gratis"
          className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-lg hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors"
        />
      </section>
    </div>
  );
}
