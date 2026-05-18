"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const SELLO_SVG: Record<string, string> = {
  "ALTO EN AZÚCARES":         "/altoenazucares.svg",
  "ALTO EN SODIO":            "/altoensodio.svg",
  "ALTO EN GRASAS SATURADAS": "/altoengrasassaturadas.svg",
  "ALTO EN CALORÍAS":         "/altoencalorias.svg",
};

type Estado = "pendiente" | "cargando" | "ok" | "error";

interface ItemURL {
  id: number;
  url: string;
  estado: Estado;
  resultado?: {
    id: string;
    nombre: string;
    marca: string | null;
    nota: number;
    sellos: string[];
    ingredientes_count: number;
    imagen_url: string | null;
    tabla: {
      calorias_kcal: number | null;
      proteinas_g: number | null;
      grasas_totales_g: number | null;
      grasas_saturadas_g: number | null;
      azucares_g: number | null;
      sodio_mg: number | null;
    };
  };
  error?: string;
}

function notaColor(nota: number) {
  if (nota >= 6) return "text-emerald-600 dark:text-emerald-400";
  if (nota >= 4) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function EstadoBadge({ estado }: { estado: Estado }) {
  const map: Record<Estado, { label: string; cls: string }> = {
    pendiente: { label: "Pendiente", cls: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400" },
    cargando:  { label: "Cargando…", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 animate-pulse" },
    ok:        { label: "Cargado",   cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
    error:     { label: "Error",     cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  };
  const { label, cls } = map[estado];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

export default function AdminLiderPage() {
  const [items, setItems] = useState<ItemURL[]>([]);
  const [input, setInput] = useState("");
  const [procesando, setProcesando] = useState(false);
  const nextId = useRef(1);

  function agregarURL() {
    const urls = input
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.includes("lider.cl"));

    if (!urls.length) return;

    setItems((prev) => [
      ...prev,
      ...urls.map((url) => ({
        id: nextId.current++,
        url,
        estado: "pendiente" as Estado,
      })),
    ]);
    setInput("");
  }

  function eliminar(id: number) {
    setItems((prev) => prev.filter((i) => i.estado !== "cargando" || i.id !== id)
      .filter((i) => i.id !== id));
  }

  async function cargarTodo() {
    const pendientes = items.filter((i) => i.estado === "pendiente");
    if (!pendientes.length) return;

    setProcesando(true);

    for (const item of pendientes) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, estado: "cargando" } : i))
      );

      try {
        const res = await fetch("/api/admin/cargar-lider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: item.url }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  estado: "ok",
                  resultado: {
                    id: data.producto.id,
                    nombre: data.scraped.nombre,
                    marca: data.scraped.marca,
                    nota: data.evaluacion.nota,
                    sellos: data.evaluacion.sellos,
                    ingredientes_count: data.scraped.ingredientes_count,
                    imagen_url: data.producto.imagen_url,
                    tabla: data.scraped.tabla,
                  },
                }
              : i
          )
        );
      } catch (e) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, estado: "error", error: (e as Error).message }
              : i
          )
        );
      }

      // Pausa entre requests para no saturar Lider
      await new Promise((r) => setTimeout(r, 1500));
    }

    setProcesando(false);
  }

  const pendienteCount = items.filter((i) => i.estado === "pendiente").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-black text-2xl text-neutral-900 dark:text-white">
          Carga desde Líder
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Pega uno o varios enlaces de super.lider.cl (uno por línea). Se cargan de a uno para no saturar.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 space-y-3">
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          URL(s) de Líder
        </label>
        <textarea
          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500 font-mono"
          rows={4}
          placeholder={"https://super.lider.cl/ip/platos-preparados/00780460893013\nhttps://super.lider.cl/ip/otra-categoria/codigo"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) agregarURL();
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400">Ctrl+Enter para agregar rápido</p>
          <button
            onClick={agregarURL}
            disabled={!input.trim()}
            className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-semibold hover:bg-neutral-700 dark:hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Agregar a la cola
          </button>
        </div>
      </div>

      {/* Cola */}
      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
              Cola ({items.length})
            </h2>
            <div className="flex items-center gap-2">
              {pendienteCount > 0 && !procesando && (
                <button
                  onClick={cargarTodo}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Cargar {pendienteCount} pendiente{pendienteCount > 1 ? "s" : ""}
                </button>
              )}
              {procesando && (
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                  Procesando…
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden"
              >
                {/* Cabecera del item */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <EstadoBadge estado={item.estado} />
                  <p className="flex-1 text-xs font-mono text-neutral-500 dark:text-neutral-400 truncate">
                    {item.url}
                  </p>
                  {item.estado !== "cargando" && (
                    <button
                      onClick={() => eliminar(item.id)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg leading-none"
                      aria-label="Eliminar"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Resultado exitoso */}
                {item.estado === "ok" && item.resultado && (
                  <div className="border-t border-neutral-100 dark:border-neutral-700 px-4 py-4 space-y-3">
                    <div className="flex items-start gap-3">
                      {item.resultado.imagen_url && (
                        <img
                          src={item.resultado.imagen_url}
                          alt={item.resultado.nombre}
                          className="w-16 h-16 object-contain rounded-lg border border-neutral-100 dark:border-neutral-700 bg-white shrink-0"
                        />
                      )}
                      <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
                            {item.resultado.nombre}
                          </p>
                          {item.resultado.marca && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {item.resultado.marca}
                            </p>
                          )}
                          <p className="text-xs text-neutral-400 mt-0.5">
                            ID: {item.resultado.id} · {item.resultado.ingredientes_count} ingredientes
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-2xl font-black ${notaColor(item.resultado.nota)}`}>
                            {item.resultado.nota.toFixed(1)}
                          </p>
                          <p className="text-xs text-neutral-400">nota CL</p>
                        </div>
                      </div>
                    </div>

                    {/* Sellos */}
                    {item.resultado.sellos.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {item.resultado.sellos.map((s) => {
                          const svgSrc = SELLO_SVG[s];
                          return svgSrc ? (
                            <Image key={s} src={svgSrc} alt={s} width={48} height={48} className="w-12 h-12" />
                          ) : (
                            <span
                              key={s}
                              className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded"
                            >
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Tabla nutricional resumida */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        ["Calorías", item.resultado.tabla.calorias_kcal, "kcal"],
                        ["Proteínas", item.resultado.tabla.proteinas_g, "g"],
                        ["Grasas tot.", item.resultado.tabla.grasas_totales_g, "g"],
                        ["G. saturadas", item.resultado.tabla.grasas_saturadas_g, "g"],
                        ["Azúcares", item.resultado.tabla.azucares_g, "g"],
                        ["Sodio", item.resultado.tabla.sodio_mg, "mg"],
                      ].map(([label, val, unit]) => (
                        <div
                          key={label as string}
                          className="bg-neutral-50 dark:bg-neutral-900 rounded-lg px-2 py-1.5"
                        >
                          <p className="text-neutral-400 truncate">{label as string}</p>
                          <p className="font-semibold text-neutral-900 dark:text-white">
                            {val != null ? `${val}${unit}` : "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {item.estado === "error" && item.error && (
                  <div className="border-t border-neutral-100 dark:border-neutral-700 px-4 py-3">
                    <p className="text-xs text-red-600 dark:text-red-400">{item.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-sm">Agrega URLs de Líder para empezar</p>
        </div>
      )}
    </div>
  );
}
