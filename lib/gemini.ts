import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DatosOCR } from "@/types";

export interface ImagenInput {
  base64: string;
  mimeType: string;
}

const PROMPT_OCR = `Eres un sistema de extracción de datos nutricionales de etiquetas de alimentos en español.
Analiza TODAS las imágenes adjuntas (pueden ser la lista de ingredientes y la tabla nutricional por separado) y extrae ÚNICAMENTE la siguiente información combinada en un solo formato JSON válido.
Sin texto adicional, sin markdown, sin explicaciones. Solo JSON.

{
  "nombre_producto": "string o null",
  "marca": "string o null",
  "codigo_barras": "string o null",
  "elaborado_por": "string o null",
  "registro_sanitario": "string o null",
  "ingredientes": ["ingrediente1", "ingrediente2"],
  "tabla_nutricional": {
    "porcion_g": number | null,
    "calorias_kcal": number | null,
    "proteinas_g": number | null,
    "grasas_totales_g": number | null,
    "grasas_saturadas_g": number | null,
    "grasas_trans_g": number | null,
    "carbohidratos_g": number | null,
    "azucares_g": number | null,
    "fibra_g": number | null,
    "sodio_mg": number | null
  }
}

Los valores numéricos deben ser solo números sin unidades. Si no encuentras un dato, usa null.`;

async function extraerConGemini(imagenes: ImagenInput[]): Promise<DatosOCR> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const partes = [
    PROMPT_OCR,
    ...imagenes.map((img) => ({
      inlineData: { mimeType: img.mimeType, data: img.base64 },
    })),
  ];

  const result = await model.generateContent(partes);
  const texto = result.response.text().trim();
  const json = texto.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  return JSON.parse(json) as DatosOCR;
}

async function extraerConMistral(imagenes: ImagenInput[]): Promise<DatosOCR> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY no configurada");

  const contenido = [
    { type: "text", text: PROMPT_OCR },
    ...imagenes.map((img) => ({
      type: "image_url",
      image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
    })),
  ];

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "pixtral-12b-2409",
      messages: [{ role: "user", content: contenido }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mistral ${response.status}: ${err}`);
  }

  const data = await response.json();
  const texto = (data.choices[0].message.content as string).trim();
  const json = texto.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  return JSON.parse(json) as DatosOCR;
}

export async function extraerDatosDeImagen(
  imagenes: ImagenInput[]
): Promise<DatosOCR> {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await extraerConGemini(imagenes);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      const esFallback =
        msg.includes("429") ||
        msg.includes("quota") ||
        msg.includes("Too Many Requests") ||
        msg.includes("400") ||
        msg.includes("API_KEY_INVALID") ||
        msg.includes("expired");
      if (!esFallback) throw error;
    }
  }

  return await extraerConMistral(imagenes);
}
