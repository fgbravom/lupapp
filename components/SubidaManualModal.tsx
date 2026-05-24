"use client";

import { useState, useCallback, useEffect } from "react";
import UploadZone from "./UploadZone";
import { IconX, IconSearch, IconImage, IconFileText, IconTable } from "./Icons";
import type { Producto } from "@/types";

interface Props {
  onResultado: (producto: Producto) => void;
  onCerrar: () => void;
  codigoBarras?: string;
}

type Fase = { tipo: "idle" } | { tipo: "procesando" } | { tipo: "error"; mensaje: string };

async function mensajeError(res: Response, fallback: string): Promise<string> {
  if (res.status === 413) {
    return "Las imágenes son muy grandes. Intenta con menos fotos o vuelve a tomarlas.";
  }
  try {
    const data = await res.json();
    if (data && typeof data.error === "string") return data.error;
  } catch {
    // body no era JSON (p.ej. error 413 de Vercel devuelve texto plano)
  }
  return fallback;
}

export default function SubidaManualModal({ onResultado, onCerrar, codigoBarras }: Props) {
  const [imgPortada, setImgPortada] = useState<File | null>(null);
  const [imgIngredientes, setImgIngredientes] = useState<File | null>(null);
  const [imgNutricional, setImgNutricional] = useState<File | null>(null);
  const [fase, setFase] = useState<Fase>({ tipo: "idle" });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onCerrar]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const tieneImagenes = !!imgPortada || !!imgIngredientes || !!imgNutricional;
  const cantFotos = [imgPortada, imgIngredientes, imgNutricional].filter(Boolean).length;

  const analizar = useCallback(async () => {
    if (!tieneImagenes) return;
    setFase({ tipo: "procesando" });

    try {
      const formData = new FormData();
      if (imgPortada) formData.append("imagen_portada", imgPortada);
      if (imgIngredientes) formData.append("imagen_ingredientes", imgIngredientes);
      if (imgNutricional) formData.append("imagen_nutricional", imgNutricional);

      const ocrRes = await fetch("/api/ocr", { method: "POST", body: formData });
      if (!ocrRes.ok) {
        throw new Error(await mensajeError(ocrRes, "Error al procesar imágenes"));
      }
      const { datos, imagen_url } = await ocrRes.json();

      if (codigoBarras) {
        datos.codigo_barras = codigoBarras;
      }

      const evalRes = await fetch("/api/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos, imagen_url }),
      });
      if (!evalRes.ok) {
        throw new Error(await mensajeError(evalRes, "Error al evaluar"));
      }
      const { producto } = await evalRes.json();
      onResultado(producto);
    } catch (err) {
      setFase({
        tipo: "error",
        mensaje: err instanceof Error ? err.message : "Error al procesar las imágenes.",
      });
    }
  }, [imgPortada, imgIngredientes, imgNutricional, tieneImagenes, onResultado, codigoBarras]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md bg-[var(--background)] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Agregar con foto
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Sube la foto y nosotros hacemos el resto.
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-4"
            aria-label="Cerrar"
          >
            <IconX size={17} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-[var(--muted-foreground)]">
            Una foto alcanza. Si subes ingredientes y tabla nutricional, la nota es más precisa.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <UploadZone
              label="Portada"
              icono={<IconImage size={20} />}
              archivo={imgPortada}
              onArchivo={setImgPortada}
              deshabilitado={fase.tipo === "procesando"}
            />
            <UploadZone
              label="Ingredientes"
              icono={<IconFileText size={20} />}
              archivo={imgIngredientes}
              onArchivo={setImgIngredientes}
              deshabilitado={fase.tipo === "procesando"}
            />
            <UploadZone
              label="Tabla nutricional"
              icono={<IconTable size={20} />}
              archivo={imgNutricional}
              onArchivo={setImgNutricional}
              deshabilitado={fase.tipo === "procesando"}
            />
          </div>

          {fase.tipo === "error" && (
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
              {fase.mensaje}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onCerrar}
              disabled={fase.tipo === "procesando"}
              className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-black/3 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={fase.tipo === "error" ? () => setFase({ tipo: "idle" }) : analizar}
              disabled={!tieneImagenes || fase.tipo === "procesando"}
              className="flex-1 py-3 rounded-xl bg-[var(--brand)] text-white text-sm font-semibold hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {fase.tipo === "procesando" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analizando…
                </>
              ) : fase.tipo === "error" ? (
                "Reintentar"
              ) : (
                <>
                  <IconSearch size={15} />
                  Analizar {cantFotos > 1 ? `${cantFotos} fotos` : cantFotos === 1 ? "foto" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
