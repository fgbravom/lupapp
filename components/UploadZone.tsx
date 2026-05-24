"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { comprimirImagen } from "@/lib/comprimir-imagen";

interface Props {
  label: string;
  icono: ReactNode;
  archivo: File | null;
  onArchivo: (archivo: File | null) => void;
  deshabilitado?: boolean;
}

export default function UploadZone({ label, icono, archivo, onArchivo, deshabilitado = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [comprimiendo, setComprimiendo] = useState(false);

  const manejarArchivo = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setComprimiendo(true);
    try {
      const optimizado = await comprimirImagen(file);
      onArchivo(optimizado);
      const url = URL.createObjectURL(optimizado);
      setPreview(url);
    } catch {
      onArchivo(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    } finally {
      setComprimiendo(false);
    }
  }, [onArchivo]);

  const quitar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchivo(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files[0];
    if (file) manejarArchivo(file);
  }, [manejarArchivo]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={onDrop}
      onClick={() => !deshabilitado && !comprimiendo && !archivo && inputRef.current?.click()}
      className={[
        "relative rounded-xl border-2 border-dashed transition-all",
        archivo ? "border-[var(--border)] cursor-default" : "cursor-pointer",
        arrastrando
          ? "border-[var(--brand)] bg-[rgba(230,48,48,0.05)]"
          : !archivo
          ? "border-[var(--border)] hover:border-[var(--brand)]/40"
          : "",
        deshabilitado ? "opacity-50 pointer-events-none" : "",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) manejarArchivo(file);
          e.target.value = "";
        }}
      />

      {comprimiendo ? (
        <div className="flex flex-col items-center justify-center gap-2 p-4 h-28 text-center">
          <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--brand)] rounded-full animate-spin" />
          <p className="text-xs text-[var(--muted-foreground)]">Optimizando…</p>
        </div>
      ) : archivo && preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="w-full h-28 object-cover rounded-xl" />
          <div className="absolute inset-0 bg-black/30 rounded-xl flex items-end p-2">
            <span className="text-white text-xs font-medium flex-1 truncate">{archivo.name}</span>
          </div>
          <button
            onClick={quitar}
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs leading-none transition-colors"
            aria-label={`Quitar imagen de ${label}`}
          >
            ×
          </button>
          <div className="absolute top-1.5 left-1.5 bg-[var(--ok)] text-white text-xs px-2 py-0.5 rounded-full font-semibold">
            ✓
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <div className="w-9 h-9 rounded-xl bg-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)]">
            {icono}
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--foreground)]">{label}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Toca o arrastra</p>
          </div>
        </div>
      )}
    </div>
  );
}
