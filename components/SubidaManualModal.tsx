"use client";

import { useState, useCallback, useEffect } from "react";
import UploadZone from "./UploadZone";
import type { Producto } from "@/types";

interface Props {
  onResultado: (producto: Producto) => void;
  onCerrar: () => void;
}

type FaseOCR =
  | { tipo: "idle" }
  | { tipo: "procesando" }
  | { tipo: "error"; mensaje: string };

export default function SubidaManualModal({ onResultado, onCerrar }: Props) {
  const [imgPortada, setImgPortada] = useState<File | null>(null);
  const [imgIngredientes, setImgIngredientes] = useState<File | null>(null);
  const [imgNutricional, setImgNutricional] = useState<File | null>(null);
  const [fase, setFase] = useState<FaseOCR>({ tipo: "idle" });

  // Cerrar con Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onCerrar]);

  // Bloquear scroll
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
        const err = await ocrRes.json();
        throw new Error(err.error ?? "Error al procesar imágenes");
      }
      const { datos, imagen_url } = await ocrRes.json();

      const evalRes = await fetch("/api/evaluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos, imagen_url }),
      });
      if (!evalRes.ok) {
        const err = await evalRes.json();
        throw new Error(err.error ?? "Error al evaluar");
      }
      const { producto } = await evalRes.json();

      onResultado(producto);
    } catch (err) {
      setFase({
        tipo: "error",
        mensaje: err instanceof Error ? err.message : "Error al procesar las imágenes.",
      });
    }
  }, [imgPortada, imgIngredientes, imgNutricional, tieneImagenes, onResultado]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      {/* Fondo */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-syne font-bold text-neutral-900 dark:text-white">
              Agregar producto con foto
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Gemini Vision extrae los datos de la etiqueta automáticamente.
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-2xl leading-none ml-4 mt-0.5"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Instrucción */}
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Sube hasta 3 fotos del producto. La portada da nombre y miniatura; ingredientes y tabla nutricional mejoran la nota.
          </p>

          {/* Zonas de upload */}
          <div className="grid grid-cols-3 gap-2">
            <UploadZone
              label="Portada"
              icono="🖼️"
              archivo={imgPortada}
              onArchivo={setImgPortada}
              deshabilitado={fase.tipo === "procesando"}
            />
            <UploadZone
              label="Ingredientes"
              icono="📋"
              archivo={imgIngredientes}
              onArchivo={setImgIngredientes}
              deshabilitado={fase.tipo === "procesando"}
            />
            <UploadZone
              label="Tabla nutricional"
              icono="📊"
              archivo={imgNutricional}
              onArchivo={setImgNutricional}
              deshabilitado={fase.tipo === "procesando"}
            />
          </div>

          {/* Error */}
          {fase.tipo === "error" && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
              {fase.mensaje}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCerrar}
              disabled={fase.tipo === "procesando"}
              className="flex-1 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={fase.tipo === "error" ? () => setFase({ tipo: "idle" }) : analizar}
              disabled={!tieneImagenes || fase.tipo === "procesando"}
              className="flex-1 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {fase.tipo === "procesando" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white dark:border-neutral-400/40 dark:border-t-neutral-900 rounded-full animate-spin" />
                  Analizando…
                </>
              ) : fase.tipo === "error" ? (
                "Reintentar"
              ) : (
                `🔍 Analizar ${cantFotos > 1 ? `${cantFotos} fotos` : cantFotos === 1 ? "foto" : ""}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
