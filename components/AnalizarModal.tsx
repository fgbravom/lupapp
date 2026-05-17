"use client";

import { useState, useEffect } from "react";
import BuscadorProducto from "./BuscadorProducto";

interface Props {
  /** Texto y estilo del botón que abre el modal */
  label?: string;
  className?: string;
}

export default function AnalizarModal({
  label = "📷 Analizar producto",
  className = "",
}: Props) {
  const [abierto, setAbierto] = useState(false);

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Botón disparador */}
      <button onClick={() => setAbierto(true)} className={className}>
        {label}
      </button>

      {/* Overlay + panel */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-label="Analizar producto"
        >
          {/* Fondo oscuro */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAbierto(false)}
          />

          {/* Panel — drawer en móvil, modal centrado en desktop */}
          <div className="relative z-10 w-full sm:max-w-xl sm:mx-4 bg-[#F5F5F0] dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92dvh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
              <div>
                <h2 className="font-syne font-black text-lg text-neutral-900 dark:text-white">
                  🔍 Analizar producto
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Busca, escanea o fotografía la etiqueta
                </p>
              </div>
              <button
                onClick={() => setAbierto(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto flex-1 px-5 py-5">
              <BuscadorProducto />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
