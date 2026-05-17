"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import ResultCard from "./ResultCard";
import SubidaManualModal from "./SubidaManualModal";
import type { Producto } from "@/types";

const BarcodeScanner = dynamic(() => import("./BarcodeScanner"), { ssr: false });

type Estado =
  | { tipo: "idle" }
  | { tipo: "buscando" }
  | { tipo: "seleccionando"; resultados: Producto[] }
  | { tipo: "resultado"; producto: Producto }
  | { tipo: "error"; mensaje: string };

// ─── Miniatura de producto ────────────────────────────────────────────────────

function ProductoRow({
  producto,
  onClick,
}: {
  producto: Producto;
  onClick: () => void;
}) {
  function colorNota(n: number) {
    if (n >= 6) return "text-[#1A6B3C]";
    if (n >= 4) return "text-[#D4A017]";
    return "text-[#CC0000]";
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center">
        {producto.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-300">
            {(producto.nombre[0] ?? "?").toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {producto.nombre}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {producto.marca ?? "Sin marca"} · {producto.veces_escaneado}× escaneado
        </p>
      </div>

      <span className={`text-sm font-syne font-black flex-shrink-0 ${colorNota(producto.nota_cl)}`}>
        {producto.nota_cl.toFixed(1)}
      </span>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function BuscadorProducto() {
  const [estado, setEstado] = useState<Estado>({ tipo: "idle" });
  const [texto, setTexto] = useState("");
  const [mostrarBarcode, setMostrarBarcode] = useState(false);
  const [mostrarSubidaManual, setMostrarSubidaManual] = useState(false);

  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [dropdownProductos, setDropdownProductos] = useState<Producto[]>([]);
  const [dropdownEsRecientes, setDropdownEsRecientes] = useState(false);
  const [cargandoDropdown, setCargandoDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cargarDropdown = useCallback(async (query: string) => {
    setCargandoDropdown(true);
    try {
      const url =
        query.trim().length >= 2
          ? `/api/productos?nombre=${encodeURIComponent(query.trim())}`
          : "/api/productos";
      const res = await fetch(url);
      const json = await res.json();
      setDropdownProductos(json.productos ?? []);
      setDropdownEsRecientes(!!json.esRecientes && query.trim().length < 2);
    } finally {
      setCargandoDropdown(false);
    }
  }, []);

  const onFocusInput = useCallback(() => {
    setDropdownAbierto(true);
    cargarDropdown(texto);
  }, [cargarDropdown, texto]);

  const onChangeTexto = useCallback(
    (valor: string) => {
      setTexto(valor);
      setDropdownAbierto(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => cargarDropdown(valor), 300);
    },
    [cargarDropdown]
  );

  const buscarPorTexto = useCallback(async () => {
    if (texto.trim().length < 2) return;
    setDropdownAbierto(false);
    setEstado({ tipo: "buscando" });
    try {
      const res = await fetch(`/api/productos?nombre=${encodeURIComponent(texto.trim())}`);
      const json = await res.json();
      if (json.productos?.length === 1) {
        await incrementarYMostrar(json.productos[0]);
      } else if (json.productos?.length > 1) {
        setEstado({ tipo: "seleccionando", resultados: json.productos });
      } else {
        setEstado({
          tipo: "error",
          mensaje: "No encontramos ese producto. ¿Lo tienes a mano? Puedes escanearlo.",
        });
      }
    } catch {
      setEstado({ tipo: "error", mensaje: "Error al buscar. Intenta de nuevo." });
    }
  }, [texto]);

  const onBarcode = useCallback(async (codigo: string) => {
    setMostrarBarcode(false);
    setEstado({ tipo: "buscando" });
    try {
      const res = await fetch(`/api/barcode?codigo=${encodeURIComponent(codigo)}`);
      const json = await res.json();
      if (json.producto) {
        setEstado({ tipo: "resultado", producto: json.producto });
      } else {
        setEstado({
          tipo: "error",
          mensaje: `Código ${codigo} no está en nuestra base de datos aún.`,
        });
      }
    } catch {
      setEstado({ tipo: "error", mensaje: "Error al buscar el código de barras." });
    }
  }, []);

  async function incrementarYMostrar(producto: Producto) {
    setEstado({ tipo: "resultado", producto });
    await fetch(`/api/productos/${producto.id}`, { method: "PATCH" }).catch(() => {});
  }

  const reiniciar = () => {
    setEstado({ tipo: "idle" });
    setTexto("");
  };

  const estaOcupado = estado.tipo === "buscando";

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">

      {/* ── Barra de búsqueda ────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <div className="flex-1 relative" ref={contenedorRef}>
          <input
            ref={inputRef}
            type="text"
            value={texto}
            onChange={(e) => onChangeTexto(e.target.value)}
            onFocus={onFocusInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") { setDropdownAbierto(false); buscarPorTexto(); }
              if (e.key === "Escape") setDropdownAbierto(false);
            }}
            placeholder="Buscar producto por nombre…"
            disabled={estaOcupado}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:opacity-50"
            autoComplete="off"
          />

          {/* Dropdown */}
          {dropdownAbierto && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl z-30 overflow-hidden max-h-80 overflow-y-auto">
              <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                  {cargandoDropdown
                    ? "Buscando…"
                    : dropdownEsRecientes
                    ? "Productos en la base de datos"
                    : `${dropdownProductos.length} resultado(s)`}
                </span>
                {cargandoDropdown && (
                  <div className="w-3 h-3 border border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                )}
              </div>

              {!cargandoDropdown && dropdownProductos.length === 0 && (
                <div className="px-4 py-4 text-center">
                  <p className="text-sm text-neutral-400 dark:text-neutral-500">
                    {texto.trim().length >= 2
                      ? "Sin resultados"
                      : "Aún no hay productos en la base de datos"}
                  </p>
                </div>
              )}

              {dropdownProductos.map((p) => (
                <ProductoRow
                  key={p.id}
                  producto={p}
                  onClick={() => { setDropdownAbierto(false); incrementarYMostrar(p); }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Buscar */}
        <button
          onClick={() => { setDropdownAbierto(false); buscarPorTexto(); }}
          disabled={estaOcupado || texto.trim().length < 2}
          className="px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors disabled:opacity-40"
          aria-label="Buscar"
        >
          🔍
        </button>

        {/* Código de barras */}
        <button
          onClick={() => setMostrarBarcode(true)}
          disabled={estaOcupado}
          className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-40"
          aria-label="Escanear código de barras"
          title="Escanear código de barras"
        >
          📦
        </button>

        {/* Subida manual con foto */}
        <button
          onClick={() => setMostrarSubidaManual(true)}
          disabled={estaOcupado}
          className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-40"
          aria-label="Agregar producto con foto"
          title="Agregar producto con foto (OCR)"
        >
          📷
        </button>
      </div>

      {/* ── Estados ──────────────────────────────────────────────────────── */}
      {estado.tipo === "buscando" && (
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <div className="inline-block w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin mb-3" />
          <p className="text-sm">Buscando…</p>
        </div>
      )}

      {estado.tipo === "seleccionando" && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Encontramos {estado.resultados.length} productos. ¿Cuál es?
          </p>
          {estado.resultados.map((p) => (
            <ProductoRow key={p.id} producto={p} onClick={() => incrementarYMostrar(p)} />
          ))}
        </div>
      )}

      {estado.tipo === "error" && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 space-y-3">
          <p className="text-sm text-red-700 dark:text-red-400">{estado.mensaje}</p>
          <div className="flex items-center gap-3">
            <button onClick={reiniciar} className="text-xs text-red-600 dark:text-red-400 underline">
              Intentar de nuevo
            </button>
            <button
              onClick={() => setMostrarSubidaManual(true)}
              className="text-xs px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg"
            >
              📷 Agregar con foto
            </button>
          </div>
        </div>
      )}

      {estado.tipo === "resultado" && (
        <div>
          <button
            onClick={reiniciar}
            className="mb-4 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors flex items-center gap-1"
          >
            ← Buscar otro producto
          </button>
          <ResultCard producto={estado.producto} />
        </div>
      )}

      {mostrarBarcode && (
        <BarcodeScanner onDetectado={onBarcode} onCerrar={() => setMostrarBarcode(false)} />
      )}

      {mostrarSubidaManual && (
        <SubidaManualModal
          onResultado={(producto) => {
            setMostrarSubidaManual(false);
            setEstado({ tipo: "resultado", producto });
          }}
          onCerrar={() => setMostrarSubidaManual(false)}
        />
      )}
    </div>
  );
}
