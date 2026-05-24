import { NextRequest, NextResponse } from "next/server";
import {
  buscarProductoPorBarcode,
  incrementarEscaneos,
  crearProducto,
} from "@/lib/insforge";
import { buscarEnOFF } from "@/lib/openfoodfacts";
import { evaluar } from "@/lib/evaluator";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get("codigo");

  if (!codigo) {
    return NextResponse.json({ error: "Código requerido" }, { status: 400 });
  }

  try {
    // 1. Hit local
    const local = await buscarProductoPorBarcode(codigo);
    if (local) {
      await incrementarEscaneos(local.id);
      return NextResponse.json({ producto: local });
    }

    // 2. Fallback OpenFoodFacts
    const off = await buscarEnOFF(codigo);
    if (!off) {
      return NextResponse.json({ producto: null });
    }

    off.datos.codigo_barras = codigo;
    const resultado = evaluar(off.datos.tabla_nutricional, off.datos.ingredientes);
    const producto = await crearProducto(
      off.datos,
      resultado,
      off.imagen_url,
      "openfoodfacts"
    );

    return NextResponse.json({ producto });
  } catch {
    return NextResponse.json(
      { error: "Error al buscar producto" },
      { status: 500 }
    );
  }
}
