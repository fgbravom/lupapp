"use client";

import { useState } from "react";
import Image from "next/image";
import BuscadorProducto from "./BuscadorProducto";
import GradeBadge from "./GradeBadge";
import { IconCamera, IconSparkles } from "./Icons";

// ─── Datos ────────────────────────────────────────────────────────────────────

const ESCALA = [
  { nota: 7, label: "Excelente",  desc: "Sin sellos ni aditivos problemáticos",     pct: 100, color: "#00B86B" },
  { nota: 5, label: "Bueno",      desc: "Uno o dos aspectos por mejorar",            pct: 64,  color: "#8BC34A" },
  { nota: 4, label: "Suficiente", desc: "Aprobado, pero con observaciones claras",   pct: 43,  color: "#FF9500" },
  { nota: 3, label: "Deficiente", desc: "Varios sellos o aditivos de riesgo",        pct: 29,  color: "#FF5722" },
  { nota: 1, label: "Reprobado",  desc: "Múltiples alertas. No recomendado",         pct: 7,   color: "#E63030" },
];

const SELLOS = [
  { label: "ALTO EN AZÚCARES",         src: "/altoenazucares.svg" },
  { label: "ALTO EN SODIO",            src: "/altoensodio.svg" },
  { label: "ALTO EN GRASAS SATURADAS", src: "/altoengrasassaturadas.svg" },
  { label: "ALTO EN CALORÍAS",         src: "/altoencalorias.svg" },
];

const CRITERIOS = [
  { puntos: "−1.2", texto: "Por cada sello ALTO EN (Ley 20.606)",  color: "var(--alerta)" },
  { puntos: "−0.8", texto: "Si contiene grasas trans",              color: "var(--alerta)" },
  { puntos: "−0.5", texto: "Por cada aditivo de riesgo alto",       color: "var(--alerta)" },
  { puntos: "−0.2", texto: "Por cada aditivo de riesgo medio",      color: "var(--advertencia)" },
  { puntos: "+0.3", texto: "Bonus sin sellos ni aditivos problemáticos", color: "var(--ok)" },
];

// ─── Página ───────────────────────────────────────────────────────────────────

export default function HomeContent() {
  const [tieneResultado, setTieneResultado] = useState(false);

  return (
    <div className="space-y-12 sm:space-y-20">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-6 pb-2 flex flex-col items-center text-center space-y-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="font-dm font-bold text-4xl sm:text-5xl text-[var(--foreground)] leading-[1.1] tracking-tight">
            Descubre la nota real<br />
            <span style={{ color: "var(--brand)" }}>de lo que comes.</span>
          </h1>
          <p className="text-lg text-[var(--muted)]">
            Calificamos alimentos del{" "}
            <strong className="text-[var(--foreground)]">1.0 al 7.0</strong>{" "}
            según la Ley&nbsp;20.606. Sin vueltas, sin eufemismos.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <BuscadorProducto onResultadoChange={setTieneResultado} />
        </div>

        {/* Ejemplos decorativos */}
        {!tieneResultado && (
          <div className="flex items-end justify-center gap-6 pt-1 animate-fade-up">
            {[
              { nota: 6.8, nombre: "Almendras" },
              { nota: 4.2, nombre: "Yogurt c/ frutas" },
              { nota: 1.8, nombre: "Bebida azucarada" },
            ].map((ej) => (
              <div key={ej.nombre} className="flex flex-col items-center gap-2">
                <GradeBadge nota={ej.nota} size="md" />
                <span className="text-xs text-[var(--muted)] font-medium">{ej.nombre}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Secciones informativas (ocultas cuando hay resultado) ─────────── */}
      {!tieneResultado && (
        <>
          {/* ── La escala ──────────────────────────────────────────────────── */}
          <section className="space-y-6 animate-fade-up">
            <div className="space-y-1">
              <h2 className="font-syne font-bold text-2xl text-[var(--foreground)]">
                La escala que ya conoces
              </h2>
              <p className="text-sm text-[var(--muted)]">
                La misma del colegio chileno, aplicada a lo que comes.
              </p>
            </div>

            <div className="space-y-3">
              {ESCALA.map((item) => (
                <div key={item.nota} className="flex items-center gap-4">
                  <GradeBadge nota={item.nota} size="sm" className="flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--foreground)]">{item.label}</span>
                      <span className="text-xs text-[var(--muted)]">{item.desc}</span>
                    </div>
                    <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Cómo funciona ──────────────────────────────────────────────── */}
          <section className="space-y-8 animate-fade-up">
            <div className="space-y-1">
              <h2 className="font-syne font-bold text-2xl text-[var(--foreground)]">
                ¿Cómo funciona?
              </h2>
              <p className="text-sm text-[var(--muted)]">Tres pasos. Sin registro. Sin costo.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  num: "01", titulo: "Fotografía la etiqueta",
                  desc: "O escribe el nombre, o escanea el código de barras.",
                  icon: <IconCamera size={22} />,
                },
                {
                  num: "02", titulo: "Analizamos con IA",
                  desc: "Gemini Vision lee ingredientes y tabla nutricional.",
                  icon: <IconSparkles size={22} />,
                },
                {
                  num: "03", titulo: "Recibe la nota",
                  desc: "Del 1.0 al 7.0 según la Ley 20.606 y normas europeas.",
                  icon: <GradeBadge nota={6.5} size="xs" />,
                },
              ].map((paso) => (
                <div
                  key={paso.num}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 hover:border-[var(--brand)]/30 hover:shadow-card-md transition-all"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(230,48,48,0.08)", color: "var(--brand)" }}
                  >
                    {paso.icon}
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--brand)" }}>
                      {paso.num}
                    </span>
                    <h3 className="font-syne font-bold text-base text-[var(--foreground)]">
                      {paso.titulo}
                    </h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{paso.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Sellos MINSAL ──────────────────────────────────────────────── */}
          <section className="space-y-6 animate-fade-up">
            <div className="space-y-1">
              <h2 className="font-syne font-bold text-2xl text-[var(--foreground)]">
                Detectamos los sellos automáticamente
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Los octágonos de la Ley 20.606 son el primer filtro de nuestra evaluación.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SELLOS.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <Image src={s.src} alt={s.label} width={72} height={72} className="w-16 h-16" />
                  <span className="text-center text-xs font-bold text-[var(--foreground)] leading-tight">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Metodología ────────────────────────────────────────────────── */}
          <section id="metodologia" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-5 animate-fade-up">
            <div className="space-y-1">
              <h2 className="font-syne font-bold text-lg text-[var(--foreground)]">
                ¿Cómo calculamos la nota?
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Partimos de <strong className="text-[var(--foreground)]">7.0</strong> y descontamos:
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {CRITERIOS.map((c) => (
                <div key={c.texto} className="flex items-center gap-3">
                  <span
                    className="font-syne font-black text-sm tabular-nums flex-shrink-0 w-12 text-right"
                    style={{ color: c.color }}
                  >
                    {c.puntos}
                  </span>
                  <span className="text-sm text-[var(--muted)]">{c.texto}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-[var(--muted)]">
              Mínimo: 1.0 · Máximo: 7.0 · Fuente: Ley 20.606, DS 977/96, Reglamento UE 1169/2011
            </p>
          </section>

          {/* ── CTA final ──────────────────────────────────────────────────── */}
          <section className="text-center space-y-5 pb-4 animate-fade-up">
            <div className="flex justify-center gap-4">
              <GradeBadge nota={7} size="sm" showLabel />
              <GradeBadge nota={4} size="sm" showLabel />
              <GradeBadge nota={2} size="sm" showLabel />
            </div>
            <div className="space-y-2">
              <h2 className="font-syne font-bold text-2xl text-[var(--foreground)]">
                Empieza a saber lo que comes.
              </h2>
              <p className="text-sm text-[var(--muted)]">Gratis, sin registro, sin publicidad.</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
