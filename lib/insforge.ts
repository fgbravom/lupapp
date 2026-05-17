import { createClient } from "@insforge/sdk";
import type { Producto, DatosOCR, ResultadoEvaluacion } from "@/types";

// Cliente público (anon) — para uso en Client Components
export const insforgePublico = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

// Cliente admin — solo para API Routes (server-side)
export function crearClienteAdmin() {
  return createClient({
    baseUrl: process.env.INSFORGE_URL!,
    anonKey: process.env.INSFORGE_API_KEY!,
  });
}

export async function buscarProductoPorBarcode(
  codigo: string
): Promise<Producto | null> {
  const db = crearClienteAdmin();
  const { data, error } = await db.database
    .from("productos")
    .select("*")
    .eq("codigo_barras", codigo)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0] as Producto;
}

export async function buscarProductosPorNombre(
  nombre: string
): Promise<Producto[]> {
  const db = crearClienteAdmin();
  const { data, error } = await db.database
    .from("productos")
    .select("*")
    .textSearch("nombre", nombre, { type: "websearch", config: "spanish" })
    .limit(10);

  if (error || !data) return [];
  return data as Producto[];
}

export async function listarProductosRecientes(
  limite = 20
): Promise<Producto[]> {
  const db = crearClienteAdmin();
  const { data, error } = await db.database
    .from("productos")
    .select("*")
    .order("veces_escaneado", { ascending: false })
    .order("creado_en", { ascending: false })
    .limit(limite);

  if (error || !data) return [];
  return data as Producto[];
}

export async function obtenerProducto(id: string): Promise<Producto | null> {
  const db = crearClienteAdmin();
  const { data, error } = await db.database
    .from("productos")
    .select("*")
    .eq("id", id)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0] as Producto;
}

export async function incrementarEscaneos(id: string): Promise<void> {
  const db = crearClienteAdmin();
  await db.database.rpc("incrementar_escaneos", { producto_id: id });
}

export async function crearProducto(
  ocr: DatosOCR,
  resultado: ResultadoEvaluacion,
  imagen_url: string | null = null
): Promise<Producto> {
  const db = crearClienteAdmin();
  const { data, error } = await db.database
    .from("productos")
    .insert([
      {
        nombre: ocr.nombre_producto ?? "Producto sin nombre",
        marca: ocr.marca,
        codigo_barras: ocr.codigo_barras,
        elaborado_por: ocr.elaborado_por,
        registro_sanitario: ocr.registro_sanitario,
        ingredientes: ocr.ingredientes,
        tabla_nutricional: ocr.tabla_nutricional,
        nota_cl: resultado.nota,
        sellos_cl: resultado.sellos_cl,
        aditivos: resultado.aditivos,
        comparativa_eu: resultado.comparativa_eu,
        veces_escaneado: 1,
        imagen_url,
      },
    ])
    .select();

  if (error) throw new Error(error.message);
  return data![0] as Producto;
}
