import type { Producto, NivelNutriente, SubNota } from "@/types";
import { evaluar } from "@/lib/evaluator";
import { getGradeInfo } from "@/lib/gradeColor";
import GradeBadge from "./GradeBadge";
import AditivoTag from "./AditivoTag";
import Link from "next/link";
import Image from "next/image";
import { IconUsers, IconAlertTriangle, IconChevronRight } from "./Icons";

// ─── Mapa de sellos a SVG ─────────────────────────────────────────────────────

const SELLO_SVG: Record<string, string> = {
  "ALTO EN AZÚCARES":         "/altoenazucares.svg",
  "ALTO EN SODIO":            "/altoensodio.svg",
  "ALTO EN GRASAS SATURADAS": "/altoengrasassaturadas.svg",
  "ALTO EN CALORÍAS":         "/altoencalorias.svg",
};

// ─── Barras de nutriente ──────────────────────────────────────────────────────

const nivelAncho: Record<NivelNutriente, number> = {
  excelente: 12, ok: 28, moderado: 52, advertencia: 74, critico: 92, neutral: 40,
};

const nivelColor: Record<NivelNutriente, string> = {
  excelente: "#00B86B", ok: "#00B86B", moderado: "#FF9500",
  advertencia: "#FF5722", critico: "#E63030", neutral: "#9CA3AF",
};

const nivelLabel: Record<NivelNutriente, string> = {
  excelente: "Óptimo", ok: "OK", moderado: "Moderado",
  advertencia: "⚠ Alto", critico: "✗ Crítico", neutral: "—",
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ResultCard({ producto }: { producto: Producto }) {
  const ev = evaluar(producto.tabla_nutricional, producto.ingredientes);
  const { color, bg, ring } = getGradeInfo(ev.nota);

  return (
    <div className="space-y-5 animate-fade-up">

      {/* ── 1. Cabecera ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 p-5" style={{ background: bg, borderColor: ring }}>
        <div className="flex items-center gap-4">
          {producto.imagen_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-black/5"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-[var(--foreground)] leading-tight">
              {producto.nombre}
            </h2>
            {producto.marca && (
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{producto.marca}</p>
            )}
            {producto.veces_escaneado > 1 && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1.5 flex items-center gap-1.5">
                <IconUsers size={13} />
                Escaneado {producto.veces_escaneado} veces
              </p>
            )}
          </div>
          <GradeBadge nota={ev.nota} size="lg" showLabel className="flex-shrink-0" />
        </div>
      </div>

      {/* ── 2. Veredicto ─────────────────────────────────────────────────── */}
      <section
        className="rounded-xl border px-4 py-3.5"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          <span className="font-semibold">Por qué esta nota: </span>
          {ev.veredicto}
        </p>
      </section>

      {/* ── 3. Sellos ALTO EN ─────────────────────────────────────────────── */}
      {ev.sellos_cl.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            Sellos Ley 20.606
          </h3>
          <div className="flex flex-wrap gap-4">
            {ev.sellos_cl.map((sello) => {
              const svgSrc = SELLO_SVG[sello];
              return svgSrc ? (
                <div key={sello} className="flex flex-col items-center gap-1.5">
                  <Image src={svgSrc} alt={sello} width={64} height={64} className="w-14 h-14" />
                  <span className="text-xs font-bold text-[var(--foreground)] text-center leading-tight max-w-[72px]">
                    {sello.replace("ALTO EN ", "")}
                  </span>
                </div>
              ) : (
                <span
                  key={sello}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: "var(--alerta)" }}
                >
                  {sello}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 3. Trampa de ración ───────────────────────────────────────────── */}
      {ev.trampa_racion && (
        <section className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-1.5">
          <h3 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 text-sm">
            <IconAlertTriangle size={16} />
            {ev.trampa_racion.titulo}
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            {ev.trampa_racion.descripcion}
          </p>
        </section>
      )}

      {/* ── 4. Nutrientes — barras visuales ───────────────────────────────── */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
          Tabla nutricional por 100g
        </h3>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border)]">
          {ev.filas_nutrientes.map((fila) => (
            <div key={fila.label} className="px-4 py-3 grid grid-cols-[1fr_auto] gap-x-4 items-center">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">
                    {fila.label}
                  </span>
                  <span className="text-xs font-mono text-[var(--muted-foreground)] flex-shrink-0">
                    {fila.valor}
                  </span>
                </div>
                <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${nivelAncho[fila.nivel]}%`,
                      backgroundColor: nivelColor[fila.nivel],
                    }}
                  />
                </div>
              </div>
              <span
                className="text-xs font-semibold flex-shrink-0 tabular-nums"
                style={{ color: nivelColor[fila.nivel] }}
              >
                {nivelLabel[fila.nivel]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Veredicto por aspecto ──────────────────────────────────────── */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
          Veredicto por aspecto
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ev.sub_notas.map((sub) => (
            <SubNotaCard key={sub.aspecto} sub={sub} />
          ))}
        </div>

        {/* Nota final destacada */}
        <div
          className="rounded-xl border-2 px-5 py-4 flex items-center justify-between"
          style={{ background: bg, borderColor: ring }}
        >
          <div>
            <p className="font-black text-[var(--foreground)] text-base">Nota final</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Azúcar 25% · Sodio 25% · Grasas 20% · Calorías 15% · Ingredientes 15%
            </p>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span
              className="font-black text-4xl tabular-nums leading-none"
              style={{ color }}
            >
              {ev.nota.toFixed(1)}
            </span>
            <span className="text-base text-[var(--muted-foreground)] font-normal">/7</span>
          </div>
        </div>
      </section>

      {/* ── 6. Aditivos ───────────────────────────────────────────────────── */}
      {ev.aditivos.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            Aditivos detectados
          </h3>
          <div className="flex flex-wrap gap-2">
            {ev.aditivos.map((a) => (
              <AditivoTag key={a.codigo_e} aditivo={a} />
            ))}
          </div>
        </section>
      )}

      {/* ── 7. Footer ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1 text-xs text-[var(--muted-foreground)]">
        <Link
          href={`/producto/${producto.id}`}
          className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
        >
          Ver ficha completa
          <IconChevronRight size={13} />
        </Link>
        <span className="italic hidden sm:block">App informativa. No reemplaza consejo nutricional.</span>
      </div>
    </div>
  );
}

// ─── Tarjeta de sub-nota ──────────────────────────────────────────────────────

function SubNotaCard({ sub }: { sub: SubNota }) {
  const { color, bg, ring } = getGradeInfo(sub.nota);
  const barWidth = `${((sub.nota - 1) / 6) * 100}%`;
  const display = sub.nota % 1 === 0 ? sub.nota.toFixed(0) : sub.nota.toFixed(1);

  return (
    <div className="rounded-xl border p-3.5 flex flex-col gap-3" style={{ background: bg, borderColor: ring }}>
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center border-2"
          style={{ backgroundColor: "var(--card)", borderColor: ring }}
        >
          <span
            className="font-black text-sm tabular-nums leading-none tracking-tight"
            style={{ color }}
          >
            {display}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[var(--foreground)] leading-tight">{sub.aspecto}</p>
          {sub.detalle && (
            <p
              className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-tight"
              style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
            >
              {sub.detalle}
            </p>
          )}
        </div>
      </div>
      <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: barWidth, backgroundColor: color }} />
      </div>
    </div>
  );
}
