import { NextRequest, NextResponse } from "next/server";
import {
  buscarProductosPorNombre,
  buscarProductoPorBarcode,
  listarProductosRecientes,
} from "@/lib/insforge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get("nombre");
  const barcode = searchParams.get("barcode");
  const recientes = searchParams.get("recientes");

  try {
    if (barcode) {
      const producto = await buscarProductoPorBarcode(barcode);
      return NextResponse.json({ productos: producto ? [producto] : [] });
    }

    if (nombre && nombre.trim().length >= 2) {
      const productos = await buscarProductosPorNombre(nombre.trim());
      return NextResponse.json({ productos });
    }

    if (recientes !== null || (!nombre && !barcode)) {
      const productos = await listarProductosRecientes(20);
      return NextResponse.json({ productos, esRecientes: true });
    }

    return NextResponse.json({ productos: [] });
  } catch {
    return NextResponse.json(
      { error: "Error al buscar productos" },
      { status: 500 }
    );
  }
}
