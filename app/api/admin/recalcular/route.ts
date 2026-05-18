import { NextResponse } from "next/server";
import { crearClienteAdmin } from "@/lib/insforge";
import { evaluar } from "@/lib/evaluator";
import type { Producto } from "@/types";

export async function POST() {
  const db = crearClienteAdmin();

  // 1. Traer todos los productos
  const { data, error } = await db.database
    .from("productos")
    .select("id, tabla_nutricional, ingredientes");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const productos = (data ?? []) as Pick<Producto, "id" | "tabla_nutricional" | "ingredientes">[];

  let actualizados = 0;
  const errores: string[] = [];

  // 2. Re-evaluar y actualizar cada producto
  for (const p of productos) {
    try {
      const ev = evaluar(p.tabla_nutricional, p.ingredientes);

      const { error: updateError } = await db.database
        .from("productos")
        .update({
          nota_cl: ev.nota,
          sellos_cl: ev.sellos_cl,
          aditivos: ev.aditivos,
          comparativa_eu: ev.comparativa_eu,
        })
        .eq("id", p.id);

      if (updateError) {
        errores.push(`${p.id}: ${updateError.message}`);
      } else {
        actualizados++;
      }
    } catch (e) {
      errores.push(`${p.id}: ${e instanceof Error ? e.message : "error desconocido"}`);
    }
  }

  return NextResponse.json({
    total: productos.length,
    actualizados,
    errores,
  });
}
