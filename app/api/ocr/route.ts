import { NextRequest, NextResponse } from "next/server";
import { extraerDatosDeImagen, type ImagenInput } from "@/lib/gemini";
import { crearClienteAdmin } from "@/lib/insforge";

const MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function archivoAInput(archivo: File): Promise<ImagenInput> {
  if (!MIME_PERMITIDOS.includes(archivo.type)) {
    throw new Error(`Formato no soportado: ${archivo.type}. Usa JPG, PNG o WebP.`);
  }
  if (archivo.size > MAX_BYTES) {
    throw new Error("Una imagen supera el tamaño máximo de 10 MB");
  }
  const bytes = await archivo.arrayBuffer();
  return {
    base64: Buffer.from(bytes).toString("base64"),
    mimeType: archivo.type,
  };
}

async function subirPortada(archivo: File): Promise<string | null> {
  try {
    const db = crearClienteAdmin();
    const ext = EXT[archivo.type] ?? "jpg";
    const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await archivo.arrayBuffer();

    const { error } = await db.storage
      .from("portadas")
      .upload(key, new Blob([bytes], { type: archivo.type }));

    if (error) return null;

    // URL pública del bucket
    const base = process.env.INSFORGE_URL ?? process.env.NEXT_PUBLIC_INSFORGE_URL ?? "";
    return `${base}/api/storage/buckets/portadas/objects/${key}`;
  } catch {
    return null; // imagen_url queda null si falla, no bloquea el análisis
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const archivoSimple = formData.get("imagen") as File | null;
    const archivoPortada = formData.get("imagen_portada") as File | null;
    const archivoIngredientes = formData.get("imagen_ingredientes") as File | null;
    const archivoNutricional = formData.get("imagen_nutricional") as File | null;

    const archivos = archivoSimple
      ? [archivoSimple]
      : [archivoPortada, archivoIngredientes, archivoNutricional].filter(Boolean) as File[];

    if (archivos.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos una imagen" },
        { status: 400 }
      );
    }

    // Gemini + subida de portada en paralelo
    const portadaArchivo = archivoPortada ?? archivoSimple ?? null;
    const [imagenes, imagen_url] = await Promise.all([
      Promise.all(archivos.map(archivoAInput)),
      portadaArchivo ? subirPortada(portadaArchivo) : Promise.resolve(null),
    ]);

    const datos = await extraerDatosDeImagen(imagenes);

    return NextResponse.json({ datos, imagen_url });
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "Error al procesar la imagen";

    if (mensaje.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "API de visión no configurada" },
        { status: 503 }
      );
    }
    if (
      mensaje.includes("429") ||
      mensaje.includes("quota") ||
      mensaje.includes("Too Many Requests")
    ) {
      return NextResponse.json(
        { error: "Límite de análisis alcanzado. Intenta en unos minutos." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
