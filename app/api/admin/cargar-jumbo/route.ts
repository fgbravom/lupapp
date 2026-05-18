import { NextRequest, NextResponse } from "next/server";
import { scrapearJumbo } from "@/lib/jumbo";
import { evaluar } from "@/lib/evaluator";
import { crearClienteAdmin } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  let url: string;
  try {
    ({ url } = await req.json());
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  if (!url || !url.includes("jumbo.cl")) {
    return NextResponse.json({ error: "Se requiere una URL de jumbo.cl" }, { status: 400 });
  }

  let datos;
  try {
    datos = await scrapearJumbo(url);
  } catch (e) {
    return NextResponse.json(
      { error: `Error al scrapear: ${(e as Error).message}` },
      { status: 502 }
    );
  }

  const resultado = evaluar(datos.tabla_nutricional, datos.ingredientes);

  const db = crearClienteAdmin();
  const { data, error } = await db.database
    .from("productos")
    .insert([
      {
        nombre: datos.nombre || "Producto sin nombre",
        marca: datos.marca,
        ingredientes: datos.ingredientes,
        tabla_nutricional: datos.tabla_nutricional,
        nota_cl: resultado.nota,
        sellos_cl: resultado.sellos_cl,
        aditivos: resultado.aditivos,
        comparativa_eu: resultado.comparativa_eu,
        imagen_url: datos.imagen_url,
        veces_escaneado: 0,
        fuente: "jumbo",
        estado: "aprobado",
        descripcion: datos.descripcion,
        condiciones_alimentarias: datos.condiciones_alimentarias,
        caracteristicas: {
          ...datos.caracteristicas,
          ...(datos.puede_contener ? { puede_contener: datos.puede_contener } : {}),
          url_jumbo: datos.url_jumbo,
        },
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    producto: data![0],
    scraped: {
      nombre: datos.nombre,
      marca: datos.marca,
      ingredientes_count: datos.ingredientes.length,
      tabla: datos.tabla_nutricional,
      condiciones: datos.condiciones_alimentarias,
      caracteristicas: datos.caracteristicas,
    },
    evaluacion: {
      nota: resultado.nota,
      sellos: resultado.sellos_cl,
      aditivos: resultado.aditivos.length,
    },
  });
}
