const MAX_DIMENSION = 1600;
const CALIDAD_JPEG = 0.85;
const UMBRAL_BYTES = 800 * 1024;

export async function comprimirImagen(archivo: File): Promise<File> {
  if (!archivo.type.startsWith("image/")) return archivo;
  if (archivo.type === "image/gif") return archivo;
  if (archivo.size <= UMBRAL_BYTES) return archivo;

  const bitmap = await cargarBitmap(archivo);
  const { width, height } = calcularDimensiones(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return archivo;

  ctx.drawImage(bitmap, 0, 0, width, height);
  if ("close" in bitmap) bitmap.close();

  const blob = await canvasABlob(canvas, "image/jpeg", CALIDAD_JPEG);
  if (!blob || blob.size >= archivo.size) return archivo;

  const nombre = reemplazarExtension(archivo.name, "jpg");
  return new File([blob], nombre, { type: "image/jpeg", lastModified: Date.now() });
}

async function cargarBitmap(archivo: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(archivo);
    } catch {
      // fallback abajo
    }
  }
  return await cargarImg(archivo);
}

function cargarImg(archivo: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen"));
    };
    img.src = url;
  });
}

function calcularDimensiones(w: number, h: number) {
  const mayor = Math.max(w, h);
  if (mayor <= MAX_DIMENSION) return { width: w, height: h };
  const ratio = MAX_DIMENSION / mayor;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function canvasABlob(canvas: HTMLCanvasElement, tipo: string, calidad: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, calidad));
}

function reemplazarExtension(nombre: string, nuevaExt: string) {
  const punto = nombre.lastIndexOf(".");
  if (punto === -1) return `${nombre}.${nuevaExt}`;
  return `${nombre.slice(0, punto)}.${nuevaExt}`;
}
