import { NextRequest, NextResponse } from "next/server";
import { obtenerProducto, crearClienteAdmin } from "@/lib/insforge";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const producto = await obtenerProducto(params.id);
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ producto });
  } catch {
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 });
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = crearClienteAdmin();
    await db.database.rpc("incrementar_escaneos", { producto_id: params.id });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
