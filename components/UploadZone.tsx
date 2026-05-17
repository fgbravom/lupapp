"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  label: string;
  icono: string;
  archivo: File | null;
  onArchivo: (archivo: File | null) => void;
  deshabilitado?: boolean;
}

export default function UploadZone({
  label,
  icono,
  archivo,
  onArchivo,
  deshabilitado = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const manejarArchivo = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onArchivo(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    },
    [onArchivo]
  );

  const quitar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchivo(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setArrastrando(false);
      const file = e.dataTransfer.files[0];
      if (file) manejarArchivo(file);
    },
    [manejarArchivo]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={onDrop}
      onClick={() => !deshabilitado && !archivo && inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed transition-all
        ${archivo ? "border-neutral-300 dark:border-neutral-600 cursor-default" : "cursor-pointer"}
        ${arrastrando ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-neutral-300 dark:border-neutral-600"}
        ${!archivo && !arrastrando ? "hover:border-neutral-400 dark:hover:border-neutral-500" : ""}
        ${deshabilitado ? "opacity-50 pointer-events-none" : ""}`}
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

      {archivo && preview ? (
        /* Vista previa */
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={label}
            className="w-full h-32 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black/30 rounded-xl flex items-end p-2">
            <span className="text-white text-xs font-medium flex-1 truncate">
              {archivo.name}
            </span>
          </div>
          <button
            onClick={quitar}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs leading-none transition-colors"
            aria-label={`Quitar imagen de ${label}`}
          >
            ×
          </button>
          <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            ✓ Lista
          </div>
        </div>
      ) : (
        /* Zona de drop vacía */
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl">
            {icono}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {label}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
              Toca o arrastra
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
