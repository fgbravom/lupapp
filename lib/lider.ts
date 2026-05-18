import type { TablaNutricional, NutriKey } from "@/types";

export interface DatosLider {
  nombre: string;
  marca: string | null;
  descripcion: string | null;
  ingredientes: string[];
  tabla_nutricional: TablaNutricional;
  imagen_url: string | null;
  url_lider: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function norm(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNum(s: string | null | undefined): number | null {
  if (!s) return null;
  const n = parseFloat(String(s).replace(",", "."));
  return isNaN(n) ? null : n;
}

// Busca recursivamente una clave en un objeto JSON anidado
function findKey<T>(obj: unknown, key: string): T | null {
  if (!obj || typeof obj !== "object") return null;
  if (key in (obj as Record<string, unknown>)) {
    return (obj as Record<string, unknown>)[key] as T;
  }
  for (const v of Object.values(obj as Record<string, unknown>)) {
    const found = findKey<T>(v, key);
    if (found !== null) return found;
  }
  return null;
}

// Lider usa etiquetas distintas a Jumbo ("H. de C. disponibles" en vez de "Hidratos de Carbono")
function mapNutriente(label: string): NutriKey | null {
  const n = norm(label);
  if (n.startsWith("energ")) return "calorias_kcal";
  if (n.startsWith("proteina")) return "proteinas_g";
  if (n === "grasas trans" || n.startsWith("grasas trans")) return "grasas_trans_g";
  if (n === "grasas saturadas" || n.startsWith("grasas saturadas")) return "grasas_saturadas_g";
  if (n === "grasas totales" || n.startsWith("grasas totales")) return "grasas_totales_g";
  if (n.startsWith("h. de c") || n.startsWith("hidratos de carbono") || n.startsWith("carbohidrato")) return "carbohidratos_g";
  if (n.startsWith("azucar")) return "azucares_g";
  if (n.startsWith("fibra")) return "fibra_g";
  if (n === "sodio" || n.startsWith("sodio")) return "sodio_mg";
  return null;
}

// Tipos internos del JSON de Lider
interface LiderNutrient {
  name: string;
  standardServingAmount: string | null;
  amount: string | null;
  childNutrients: LiderNutrient[] | null;
}

interface LiderNutrientEntry {
  mainNutrient: LiderNutrient | null;
  childNutrients: LiderNutrientEntry[] | null;
}

interface LiderServingValue {
  name: string;
  value: string;
  attribute: string;
}

interface LiderNutritionFacts {
  keyNutrients: { values: LiderNutrientEntry[] } | null;
  servingInfo: { values: LiderServingValue[] } | null;
}

// ─── Función principal ────────────────────────────────────────────────────────

export async function scrapearLider(url: string): Promise<DatosLider> {
  const urlLimpia = url.split("?")[0];

  const res = await fetch(urlLimpia, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "es-CL,es;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${urlLimpia}`);
  const html = await res.text();

  // ── 1. Nombre, marca e imagen desde JSON-LD ────────────────────────────────
  let nombre = "";
  let marca: string | null = null;
  let imagen_url: string | null = null;

  for (const m of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const ld = JSON.parse(m[1]);
      const product = Array.isArray(ld)
        ? ld.find((x: { "@type": string }) => x["@type"] === "Product")
        : ld["@type"] === "Product" ? ld : null;
      if (product) {
        nombre = product.name ?? "";
        marca = product.brand?.name ?? null;
        const img = product.image;
        imagen_url = Array.isArray(img) ? img[0] : img ?? null;
        break;
      }
    } catch { /* JSON-LD malformado */ }
  }

  // Fallbacks
  if (!imagen_url) {
    const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
    if (og) imagen_url = og[1];
  }
  if (!nombre) {
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (h1) nombre = stripHtml(h1[1]);
  }
  if (!nombre) {
    const og = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/);
    if (og) nombre = og[1];
  }

  // ── 2. Tabla nutricional desde __NEXT_DATA__ ───────────────────────────────
  // Lider renderiza la tabla vía JS, pero los datos vienen en el JSON de SSR.
  // keyNutrients[].mainNutrient.standardServingAmount = valor por 100g
  const tabla: TablaNutricional = {
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

  // Lider escribe el atributo id sin comillas: id=__NEXT_DATA__
  const nextDataMatch = html.match(/<script[^>]+id=["']?__NEXT_DATA__["']?[^>]*>([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]);
      const nf = findKey<LiderNutritionFacts>(nextData, "nutritionFacts");

      if (nf?.keyNutrients?.values) {
        for (const entry of nf.keyNutrients.values) {
          // Nutriente principal
          if (entry.mainNutrient?.name) {
            const campo = mapNutriente(entry.mainNutrient.name);
            if (campo) {
              const num = parseNum(entry.mainNutrient.standardServingAmount);
              if (num !== null) tabla[campo] = num;
            }
          }

          // Sub-nutrientes (ej: grasas saturadas anidadas bajo grasas totales)
          for (const child of entry.childNutrients ?? []) {
            if (child.mainNutrient?.name) {
              const campo = mapNutriente(child.mainNutrient.name);
              if (campo) {
                const num = parseNum(child.mainNutrient.standardServingAmount);
                if (num !== null) tabla[campo] = num;
              }
            }
          }
        }
      }

      // Tamaño de porción
      if (nf?.servingInfo?.values) {
        const ps = nf.servingInfo.values.find((v) => v.attribute === "servingSize");
        if (ps) {
          const m = ps.value.match(/\((\d+(?:[.,]\d+)?)\s*g\)/);
          if (m) tabla.porcion_g = parseNum(m[1]);
        }
      }

      // Imagen desde imageInfo si no se encontró antes
      if (!imagen_url) {
        const imgInfo = findKey<{ thumbnailUrl?: string }>(nextData, "imageInfo");
        if (imgInfo?.thumbnailUrl) imagen_url = imgInfo.thumbnailUrl;
      }

      // Marca desde product.brand si no vino en JSON-LD
      if (!marca) {
        const brandVal = findKey<string>(nextData, "brand");
        if (brandVal && typeof brandVal === "string" && brandVal !== "Lider") {
          marca = brandVal;
        }
      }
    } catch { /* __NEXT_DATA__ malformado */ }
  }

  // ── 3. Ingredientes ────────────────────────────────────────────────────────
  let ingredientes: string[] = [];
  const ingMatch = html.match(/[Ii]ngredientes[\s\S]{0,300}?<p[^>]*>([\s\S]*?)<\/p>/);
  if (ingMatch) {
    const texto = stripHtml(ingMatch[1]).replace(/\.$/, "");
    const partes = texto.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    if (partes.length > 1) ingredientes = partes;
  }

  // ── 4. Descripción ─────────────────────────────────────────────────────────
  let descripcion: string | null = null;
  const descMeta = html.match(/<meta[^>]+(?:name="description"|property="og:description")[^>]+content="([^"]+)"/);
  if (descMeta) descripcion = descMeta[1];

  return {
    nombre,
    marca,
    descripcion,
    ingredientes,
    tabla_nutricional: tabla,
    imagen_url,
    url_lider: url,
  };
}
