"use client";

import { useState, useEffect } from "react";
import BuscadorProducto from "./BuscadorProducto";
import Logo from "./Logo";
import { IconX } from "./Icons";

interface Props {
  label?: string;
  className?: string;
}

export default function AnalizarModal({ label = "Analizar producto", className = "" }: Props) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [abierto]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button onClick={() => setAbierto(true)} className={className}>
        {label}
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-label="Analizar producto"
        >
          {/* Fondo */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAbierto(false)}
          />

          {/* Panel */}
          <div className="relative z-10 w-full sm:max-w-xl sm:mx-4 bg-[var(--background)] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92dvh] flex flex-col animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
              <div className="flex items-center gap-3">
                <Logo size="sm" variant="icon" />
                <div>
                  <h2 className="font-syne font-black text-base text-[var(--foreground)]">
                    Analizar producto
                  </h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Busca, escanea o fotografía la etiqueta
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAbierto(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Cerrar"
              >
                <IconX size={17} />
              </button>
            </div>

            {/* Contenido */}
            <div className="overflow-y-auto flex-1 px-5 py-5">
              <BuscadorProducto />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
