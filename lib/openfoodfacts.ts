import type { DatosOCR, TablaNutricional } from "@/types";

const OFF_TIMEOUT_MS = 3000;
const USER_AGENT = "Lupapp/1.0 (https://lupapp.vercel.app)";

interface OFFNutriments {
  "energy-kcal_100g"?: number;
  proteins_100g?: number;
  fat_100g?: number;
  "saturated-fat_100g"?: number;
  "trans-fat_100g"?: number;
  carbohydrates_100g?: number;
  sugars_100g?: number;
  fiber_100g?: number;
  sodium_100g?: number;
  salt_100g?: number;
}

interface OFFProduct {
  product_name?: string;
  product_name_es?: string;
  brands?: string;
  ingredients_text?: string;
  ingredients_text_es?: string;
  image_url?: string;
  image_front_url?: string;
  nutriments?: OFFNutriments;
}

interface OFFResponse {
  status: 0 | 1;
  product?: OFFProduct;
}

export interface ResultadoOFF {
  datos: DatosOCR;
  imagen_url: string | null;
}

function primeraMarca(brands: string | undefined): string | null {
  if (!brands) return null;
  const primera = brands.split(",")[0]?.trim();
  return primera || null;
}

function parsearIngredientes(texto: string | undefined): string[] {
  if (!texto) return [];
  return texto
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function construirTablaNutricional(n: OFFNutriments | undefined): TablaNutricional {
  if (!n) {
    return {
      porcion_g: 100,
      calorias_kcal: null,
      proteinas_g: null,
      grasas_totales_g: null,
      grasas_saturadas_g: null,
      grasas_trans_g: null,
      carbohidratos_g: null,
      azucares_g: null,
      fibra_g: null,
      sodio_mg: null,
    };
  }

  // OFF da sodio en gramos por 100g; convertir a mg.
  // Si no hay sodium directo, derivar desde salt (sal/2.5 = sodio, en mismas unidades).
  let sodio_mg: number | null = null;
  if (typeof n.sodium_100g === "number") {
    sodio_mg = Math.round(n.sodium_100g * 1000);
  } else if (typeof n.salt_100g === "number") {
    sodio_mg = Math.round((n.salt_100g / 2.5) * 1000);
  }

  return {
    porcion_g: 100,
    calorias_kcal: n["energy-kcal_100g"] ?? null,
    proteinas_g: n.proteins_100g ?? null,
    grasas_totales_g: n.fat_100g ?? null,
    grasas_saturadas_g: n["saturated-fat_100g"] ?? null,
    grasas_trans_g: n["trans-fat_100g"] ?? null,
    carbohidratos_g: n.carbohydrates_100g ?? null,
    azucares_g: n.sugars_100g ?? null,
    fibra_g: n.fiber_100g ?? null,
    sodio_mg,
  };
}

function tieneNutricionUsable(tn: TablaNutricional): boolean {
  // Necesitamos al menos calorías o proteínas para que la nota tenga sentido.
  return tn.calorias_kcal != null || tn.proteinas_g != null;
}

export async function buscarEnOFF(codigo: string): Promise<ResultadoOFF | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(codigo)}.json`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OFF_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;

    const json = (await res.json()) as OFFResponse;
    if (json.status !== 1 || !json.product) return null;

    const p = json.product;
    const tabla = construirTablaNutricional(p.nutriments);
    if (!tieneNutricionUsable(tabla)) return null;

    const nombre = p.product_name_es ?? p.product_name ?? null;
    if (!nombre) return null;

    const datos: DatosOCR = {
      nombre_producto: nombre,
      marca: primeraMarca(p.brands),
      codigo_barras: null, // lo fuerza el caller con el valor escaneado
      elaborado_por: null,
      registro_sanitario: null,
      ingredientes: parsearIngredientes(p.ingredients_text_es ?? p.ingredients_text),
      tabla_nutricional: tabla,
    };

    return {
      datos,
      imagen_url: p.image_front_url ?? p.image_url ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
