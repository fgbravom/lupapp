import { NextRequest, NextResponse } from "next/server";
import { evaluar } from "@/lib/evaluator";
import { crearProducto, buscarProductoPorBarcode } from "@/lib/insforge";
import type { DatosOCR } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ocr = body.datos as DatosOCR;
    const imagen_url: string | null = body.imagen_url ?? null;

    if (!ocr || !ocr.tabla_nutricional) {
      return NextResponse.json(
        { error: "Datos OCR incompletos" },
        { status: 400 }
      );
    }

    // Si hay barcode, verificar que no exista ya
    if (ocr.codigo_barras) {
      const existente = await buscarProductoPorBarcode(ocr.codigo_barras);
      if (existente) {
        return NextResponse.json({ producto: existente, existia: true });
      }
    }

    const resultado = evaluar(ocr.tabla_nutricional, ocr.ingredientes ?? []);
    const producto = await crearProducto(ocr, resultado, imagen_url, "foto");

    return NextResponse.json({ producto, existia: false });
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "Error al evaluar producto";
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
