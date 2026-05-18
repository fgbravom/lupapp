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
    .replace(/\s*\([^)]*\)/g, "") // quita "(g)", "(mg)", "(kCal)", etc.
    .replace(/\s+/g, " ")
    .trim();
}

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? null : n;
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

// ─── Función principal ────────────────────────────────────────────────────────

export async function scrapearLider(url: string): Promise<DatosLider> {
  // Lider puede rechazar conexiones desde server con parámetros extra — limpiamos query
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

  // ── 1. JSON-LD → nombre, marca, imagen ─────────────────────────────────────
  let nombre = "";
  let marca: string | null = null;
  let imagen_url: string | null = null;

  const ldMatches = [
    ...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ];
  for (const m of ldMatches) {
    try {
      const ld = JSON.parse(m[1]);
      const product = Array.isArray(ld)
        ? ld.find((x: { "@type": string }) => x["@type"] === "Product")
        : ld["@type"] === "Product"
        ? ld
        : null;
      if (product) {
        nombre = product.name ?? "";
        marca = product.brand?.name ?? null;
        const img = product.image;
        imagen_url = Array.isArray(img) ? img[0] : img ?? null;
        break;
      }
    } catch {
      // JSON-LD malformado — ignorar
    }
  }

  // Fallback imagen: og:image
  if (!imagen_url) {
    const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
    if (og) imagen_url = og[1];
  }

  // Fallback nombre: h1
  if (!nombre) {
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (h1) nombre = stripHtml(h1[1]);
  }

  // Fallback nombre: og:title
  if (!nombre) {
    const og = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/);
    if (og) nombre = og[1];
  }

  // ── 2. Tabla nutricional ───────────────────────────────────────────────────
  // Lider muestra columna 2 = por 100g, columna 3 = por porción.
  // Usamos la columna 100g para consistencia con Jumbo.
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

  for (const row of html.matchAll(/<tr[^>]*data-testid="facts-detail-v2"[^>]*>([\s\S]*?)<\/tr>/g)) {
    const cells: string[] = [];
    for (const td of row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)) {
      cells.push(stripHtml(td[1]).trim());
    }
    if (cells.length < 2) continue;

    const [label, v100] = cells;
    const campo = mapNutriente(label);
    if (campo) {
      const num = parseNum(v100);
      if (num !== null) tabla[campo] = num;
    }
  }

  // ── 3. Ingredientes ────────────────────────────────────────────────────────
  let ingredientes: string[] = [];

  // Lider a veces muestra ingredientes en una sección expand-collapse
  const ingMatch = html.match(
    /[Ii]ngredientes[\s\S]{0,300}?<p[^>]*>([\s\S]*?)<\/p>/
  );
  if (ingMatch) {
    const texto = stripHtml(ingMatch[1]).replace(/\.$/, "");
    const partes = texto.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    if (partes.length > 1) ingredientes = partes;
  }

  // ── 4. Descripción ─────────────────────────────────────────────────────────
  let descripcion: string | null = null;
  const descMeta = html.match(
    /<meta[^>]+(?:name="description"|property="og:description")[^>]+content="([^"]+)"/
  );
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
