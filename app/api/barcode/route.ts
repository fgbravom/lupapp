import { NextRequest, NextResponse } from "next/server";
import { buscarProductoPorBarcode, crearClienteAdmin } from "@/lib/insforge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get("codigo");

  if (!codigo) {
    return NextResponse.json({ error: "Código requerido" }, { status: 400 });
  }

  try {
    const producto = await buscarProductoPorBarcode(codigo);

    if (!producto) {
      return NextResponse.json({ producto: null });
    }

    // Incrementar contador de escaneos
    const db = crearClienteAdmin();
    await db.database.rpc("incrementar_escaneos", { producto_id: producto.id });

    return NextResponse.json({ producto });
  } catch {
    return NextResponse.json(
      { error: "Error al buscar producto" },
      { status: 500 }
    );
  }
}
