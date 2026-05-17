import type { Producto, NivelNutriente, SubNota } from "@/types";
import { evaluar } from "@/lib/evaluator";
import AditivoTag from "./AditivoTag";
import Link from "next/link";

interface Props {
  producto: Producto;
}

// ─── Colores ──────────────────────────────────────────────────────────────────

function colorNota(n: number) {
  if (n >= 6.0) return { text: "text-[#1A6B3C]", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" };
  if (n >= 4.5) return { text: "text-[#D4A017]", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" };
  if (n >= 3.0) return { text: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" };
  return { text: "text-[#CC0000]", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" };
}

const nivelColores: Record<NivelNutriente, string> = {
  excelente: "text-[#1A6B3C] dark:text-green-400",
  ok: "text-[#1A6B3C] dark:text-green-400",
  moderado: "text-[#D4A017] dark:text-yellow-400",
  advertencia: "text-orange-600 dark:text-orange-400",
  critico: "text-[#CC0000] dark:text-red-400",
  neutral: "text-neutral-500 dark:text-neutral-400",
};

function SubNotaBadge({ nota }: { nota: number }) {
  const { text } = colorNota(nota);
  return (
    <span className={`font-syne font-black text-lg tabular-nums ${text}`}>
      {nota % 1 === 0 ? nota.toFixed(0) : nota.toFixed(1)}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ResultCard({ producto }: Props) {
  const ev = evaluar(producto.tabla_nutricional, producto.ingredientes);
  const { text: colorNotaText, bg: bgNota } = colorNota(ev.nota);

  return (
    <div className="space-y-5">

      {/* ── 1. Cabecera ─────────────────────────────────────────────── */}
      <div className={`rounded-2xl border-2 p-5 ${bgNota}`}>
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-syne font-black text-neutral-900 dark:text-white leading-tight">
              {producto.nombre}
            </h2>
            {producto.marca && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {producto.marca}
              </p>
            )}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
              {ev.trampa_racion
                ? "Evaluación completa (con análisis de ración)"
                : "Evaluación completa"}
            </p>
            {producto.veces_escaneado > 1 && (
              <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                <span>👥</span>
                <span>Escaneado {producto.veces_escaneado} veces</span>
              </p>
            )}
          </div>

          <div className="flex-shrink-0 text-right">
            <div className={`text-6xl font-syne font-black tabular-nums leading-none ${colorNotaText}`}>
              {ev.nota.toFixed(1)}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">/ 7.0</div>
          </div>
        </div>
      </div>

      {/* ── 2. Tabla nutricional por 100g ────────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2">
          Lo que revela la tabla nutricional (por 100g)
        </h3>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left px-4 py-2.5 font-medium text-neutral-600 dark:text-neutral-400 w-2/5">
                  Nutriente
                </th>
                <th className="text-right px-4 py-2.5 font-medium text-neutral-600 dark:text-neutral-400 w-1/5">
                  Valor
                </th>
                <th className="text-left px-4 py-2.5 font-medium text-neutral-600 dark:text-neutral-400">
                  Comentario
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {ev.filas_nutrientes.map((fila) => (
                <tr key={fila.label} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-neutral-700 dark:text-neutral-300">
                    {fila.label}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                    {fila.valor}
                  </td>
                  <td className={`px-4 py-2.5 font-medium ${nivelColores[fila.nivel]}`}>
                    {fila.comentario}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 3. Trampa de la ración ───────────────────────────────────── */}
      {ev.trampa_racion && (
        <section className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 space-y-1.5">
          <h3 className="font-syne font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            🚨 {ev.trampa_racion.titulo}
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            {ev.trampa_racion.descripcion}
          </p>
        </section>
      )}

      {/* ── 4. Veredicto por aspecto ─────────────────────────────────── */}
      <section>
        <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2">
          Veredicto
        </h3>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left px-4 py-2.5 font-medium text-neutral-600 dark:text-neutral-400">
                  Aspecto
                </th>
                <th className="text-right px-4 py-2.5 font-medium text-neutral-600 dark:text-neutral-400 w-20">
                  Nota
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {ev.sub_notas.map((sub) => (
                <SubNotaFila key={sub.aspecto} sub={sub} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Nota final destacada */}
        <div className={`mt-3 rounded-xl border-2 px-5 py-4 flex items-center justify-between ${bgNota}`}>
          <div>
            <p className="font-syne font-black text-neutral-900 dark:text-white text-lg">
              Nota final
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Ponderado: azúcar 25% · sodio 25% · grasas 20% · ingredientes 20% · ración 10%
            </p>
          </div>
          <div className={`text-4xl font-syne font-black tabular-nums ${colorNotaText}`}>
            {ev.nota.toFixed(1)}<span className="text-lg font-normal text-neutral-400">/7</span>
          </div>
        </div>
      </section>

      {/* ── 5. Sellos ALTO EN ────────────────────────────────────────── */}
      {ev.sellos_cl.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2">
            Sellos Ley 20.606
          </h3>
          <div className="flex flex-wrap gap-2">
            {ev.sellos_cl.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 bg-[#CC0000] text-white text-xs font-bold px-3 py-1.5 rounded"
              >
                ⬛ {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Aditivos ─────────────────────────────────────────────── */}
      {ev.aditivos.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2">
            Aditivos detectados
          </h3>
          <div className="flex flex-wrap gap-2">
            {ev.aditivos.map((a) => (
              <AditivoTag key={a.codigo_e} aditivo={a} />
            ))}
          </div>
        </section>
      )}

      {/* ── 7. Footer ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1 text-xs text-neutral-400 dark:text-neutral-500">
        <Link
          href={`/producto/${producto.id}`}
          className="hover:text-neutral-600 dark:hover:text-neutral-300 underline"
        >
          Ver ficha completa →
        </Link>
        <span className="italic">App informativa. No reemplaza consejo nutricional profesional.</span>
      </div>
    </div>
  );
}

// ─── Fila de sub-nota ─────────────────────────────────────────────────────────

function SubNotaFila({ sub }: { sub: SubNota }) {
  const { text } = colorNota(sub.nota);
  const barWidth = `${((sub.nota - 1) / 6) * 100}%`;

  return (
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-neutral-700 dark:text-neutral-300">
          {sub.aspecto}
        </div>
        {sub.detalle && (
          <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
            {sub.detalle}
          </div>
        )}
        {/* Barra visual */}
        <div className="mt-1.5 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full w-full max-w-[160px]">
          <div
            className={`h-full rounded-full transition-all ${
              sub.nota >= 6 ? "bg-[#1A6B3C]" : sub.nota >= 4 ? "bg-[#D4A017]" : "bg-[#CC0000]"
            }`}
            style={{ width: barWidth }}
          />
        </div>
      </td>
      <td className={`px-4 py-3 text-right font-syne font-black text-2xl tabular-nums ${text}`}>
        {sub.nota % 1 === 0 ? sub.nota.toFixed(0) : sub.nota.toFixed(1)}
      </td>
    </tr>
  );
}
