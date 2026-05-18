const KEY = "lup_recientes";
const MAX = 3;

export interface ProductoReciente {
  id: string;
  nombre: string;
  marca: string | null;
  nota_cl: number;
  imagen_url: string | null;
  sellos_cl: string[];
}

export function guardarReciente(p: ProductoReciente): void {
  if (typeof window === "undefined") return;
  try {
    const prev = cargarRecientes().filter((r) => r.id !== p.id);
    const next = [p, ...prev].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function cargarRecientes(): ProductoReciente[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
