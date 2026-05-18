"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import ResultCard from "./ResultCard";
import SubidaManualModal from "./SubidaManualModal";
import { getGradeInfo } from "@/lib/gradeColor";
import { guardarReciente } from "@/lib/recientes";
import { IconSearch, IconCamera, IconBarcode, IconArrowLeft } from "./Icons";
import type { Producto } from "@/types";

const BarcodeScanner = dynamic(() => import("./BarcodeScanner"), { ssr: false });

type Estado =
  | { tipo: "idle" }
  | { tipo: "buscando" }
  | { tipo: "seleccionando"; resultados: Producto[] }
  | { tipo: "resultado"; producto: Producto }
  | { tipo: "error"; mensaje: string };

interface BuscadorProps {
  onResultadoChange?: (tieneResultado: boolean) => void;
}

// ─── Fila de producto en dropdown ─────────────────────────────────────────────

function ProductoRow({ producto, onClick }: { producto: Producto; onClick: () => void }) {
  const { color } = getGradeInfo(producto.nota_cl);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-black/4 dark:hover:bg-white/5 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden bg-[var(--border)] flex items-center justify-center">
        {producto.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-[var(--muted-foreground)]">
            {(producto.nombre[0] ?? "?").toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">{producto.nombre}</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          {producto.marca ?? "Sin marca"} · {producto.veces_escaneado}× escaneado
        </p>
      </div>
      <span className="text-sm font-black flex-shrink-0" style={{ color }}>
        {producto.nota_cl.toFixed(1)}
      </span>
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function BuscadorProducto({ onResultadoChange }: BuscadorProps = {}) {
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
    onResultadoChange?.(estado.tipo === "resultado");
  }, [estado.tipo, onResultadoChange]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (contenedorRef.current && !contenedorRef.current.contains(target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cargarDropdown = useCallback(async (query: string) => {
    setCargandoDropdown(true);
    try {
      const url = query.trim().length >= 2
        ? `/api/productos?nombre=${encodeURIComponent(query.trim())}`
        : "/api/productos";
      const res = await fetch(url, { cache: "no-store" });
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

  const onChangeTexto = useCallback((valor: string) => {
    setTexto(valor);
    setDropdownAbierto(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargarDropdown(valor), 300);
  }, [cargarDropdown]);

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
        setEstado({ tipo: "error", mensaje: "No encontramos ese producto. ¿Lo tienes a mano? Puedes escanearlo." });
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
        setEstado({ tipo: "error", mensaje: `Código ${codigo} no está en nuestra base de datos aún.` });
      }
    } catch {
      setEstado({ tipo: "error", mensaje: "Error al buscar el código de barras." });
    }
  }, []);

  async function incrementarYMostrar(producto: Producto) {
    setEstado({ tipo: "resultado", producto });
    guardarReciente({
      id: producto.id,
      nombre: producto.nombre,
      marca: producto.marca,
      nota_cl: producto.nota_cl,
      imagen_url: producto.imagen_url,
      sellos_cl: producto.sellos_cl,
    });
    await fetch(`/api/productos/${producto.id}`, { method: "PATCH" }).catch(() => {});
  }

  const reiniciar = () => { setEstado({ tipo: "idle" }); setTexto(""); };
  const estaOcupado = estado.tipo === "buscando";

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">

      {/* ── Barra de búsqueda ────────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* Fila primaria: input + botón buscar */}
        <div className="flex gap-2" ref={contenedorRef}>
          <div className="relative flex-1">
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
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]/50 disabled:opacity-50 transition-shadow text-base"
              autoComplete="off"
            />

            {/* Dropdown anclado al input */}
            {dropdownAbierto && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                <div className="px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    {cargandoDropdown
                      ? "Buscando…"
                      : dropdownEsRecientes
                      ? "Productos en la base de datos"
                      : `${dropdownProductos.length} resultado(s)`}
                  </span>
                  {cargandoDropdown && (
                    <div className="w-3 h-3 border border-[var(--border)] border-t-[var(--muted-foreground)] rounded-full animate-spin" />
                  )}
                </div>

                {!cargandoDropdown && dropdownProductos.length === 0 && (
                  <div className="px-4 py-5 text-center">
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {texto.trim().length >= 2 ? "Sin resultados" : "Aún no hay productos en la base de datos"}
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

          <button
            onClick={() => { setDropdownAbierto(false); buscarPorTexto(); }}
            disabled={estaOcupado || texto.trim().length < 2}
            className="px-5 py-3 bg-[var(--brand)] text-white rounded-xl hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-40 flex items-center gap-2 font-semibold text-sm flex-shrink-0"
            aria-label="Buscar"
          >
            <IconSearch size={16} />
            <span className="hidden sm:inline">Buscar</span>
          </button>
        </div>

        {/* Fila secundaria: acciones alternativas con label */}
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarSubidaManual(true)}
            disabled={estaOcupado}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 transition-colors disabled:opacity-40 text-sm font-medium"
          >
            <IconCamera size={16} />
            Fotografiar etiqueta
          </button>
          <button
            onClick={() => setMostrarBarcode(true)}
            disabled={estaOcupado}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 transition-colors disabled:opacity-40 text-sm font-medium"
          >
            <IconBarcode size={16} />
            Código de barras
          </button>
        </div>
      </div>

      {/* ── Estados ───────────────────────────────────────────────────────── */}
      {estado.tipo === "buscando" && (
        <div className="text-center py-10">
          <div className="inline-block w-7 h-7 border-2 border-[var(--border)] border-t-[var(--brand)] rounded-full animate-spin mb-3" />
          <p className="text-sm text-[var(--muted-foreground)]">Buscando…</p>
        </div>
      )}

      {estado.tipo === "seleccionando" && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--muted-foreground)] px-1 pb-1">
            Encontramos {estado.resultados.length} productos. ¿Cuál es?
          </p>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border)]">
            {estado.resultados.map((p) => (
              <ProductoRow key={p.id} producto={p} onClick={() => incrementarYMostrar(p)} />
            ))}
          </div>
        </div>
      )}

      {estado.tipo === "error" && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 space-y-3">
          <p className="text-sm text-red-700 dark:text-red-400">{estado.mensaje}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={reiniciar}
              className="text-xs text-red-600 dark:text-red-400 underline"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => setMostrarSubidaManual(true)}
              className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-medium"
            >
              <IconCamera size={13} />
              Agregar con foto
            </button>
          </div>
        </div>
      )}

      {estado.tipo === "resultado" && (
        <div>
          <button
            onClick={reiniciar}
            className="mb-5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5"
          >
            <IconArrowLeft size={15} />
            Buscar otro producto
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
