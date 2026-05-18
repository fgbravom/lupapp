import type { TablaNutricional, NutriKey } from "@/types";

export interface DatosJumbo {
  nombre: string;
  marca: string | null;
  descripcion: string | null;
  ingredientes: string[];
  puede_contener: string | null;
  tabla_nutricional: TablaNutricional;
  condiciones_alimentarias: string[];
  caracteristicas: Record<string, string>;
  imagen_url: string | null;
  url_jumbo: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// Lowercase + sin tildes + sin unidades entre paréntesis
function norm(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? null : n;
}

// Mapea el label del nutriente (en texto de Jumbo) al campo del schema
function mapNutriente(label: string): NutriKey | null {
  const n = norm(label);
  if (n === "energia" || n.startsWith("energia")) return "calorias_kcal";
  if (n.startsWith("proteina")) return "proteinas_g";
  if (n === "grasas trans" || n.startsWith("grasas trans")) return "grasas_trans_g";
  if (n === "grasas saturadas" || n.startsWith("grasas saturadas")) return "grasas_saturadas_g";
  if (n === "grasas totales" || n.startsWith("grasas totales")) return "grasas_totales_g";
  if (n.startsWith("hidratos de carbono")) return "carbohidratos_g";
  if (n.startsWith("azucar")) return "azucares_g"; // cubre "azucares totales"
  if (n.startsWith("fibra")) return "fibra_g";
  if (n === "sodio" || n.startsWith("sodio")) return "sodio_mg";
  return null;
}

// Divide el HTML en secciones usando los </details> como separadores
function extractSections(html: string): Map<string, string> {
  const sections = new Map<string, string>();
  const parts = html.split("</details>");

  for (const part of parts) {
    const titleMatch = part.match(/seo-accordion__title">(.*?)<\/span>/);
    const contentIdx = part.indexOf('seo-accordion__content">');
    if (titleMatch && contentIdx !== -1) {
      const title = titleMatch[1].trim();
      const content = part.slice(contentIdx + 'seo-accordion__content">'.length);
      sections.set(title, content);
    }
  }

  return sections;
}

// ─── Función principal ────────────────────────────────────────────────────────

export async function scrapearJumbo(url: string): Promise<DatosJumbo> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "es-CL,es;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${url}`);
  const html = await res.text();

  // ── 1. JSON-LD → nombre, marca, imagen ────────────────────────────────────
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
        ? ld.find((x) => x["@type"] === "Product")
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

  // Fallback imagen: og:image (más fiable que JSON-LD en Jumbo)
  if (!imagen_url) {
    const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
    if (og) imagen_url = og[1];
  }

  // Fallback imagen: primera img de assets-jumbo
  if (!imagen_url) {
    const img = html.match(/https:\/\/assets-jumbo\.ecomm\.cencosud\.com\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/i);
    if (img) imagen_url = img[0];
  }

  // Fallback nombre: primer h1
  if (!nombre) {
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (h1) nombre = stripHtml(h1[1]);
  }

  // ── 2. Secciones del acordeón ──────────────────────────────────────────────
  const sections = extractSections(html);

  // ── 3. Descripción ────────────────────────────────────────────────────────
  let descripcion: string | null = null;
  const descHtml = sections.get("Descripción");
  if (descHtml) {
    const m = descHtml.match(/<div[^>]*text-base[^>]*leading-6[^>]*>([\s\S]*?)<\/div>/);
    if (m) descripcion = stripHtml(m[1]) || null;
  }

  // ── 4. Condiciones alimentarias ───────────────────────────────────────────
  const condiciones: string[] = [];
  const condHtml = sections.get("Condición alimentaria");
  if (condHtml) {
    for (const c of condHtml.matchAll(
      /<span class="food-certificate-text">([\s\S]*?)<\/span>/g
    )) {
      const texto = stripHtml(c[1]).replace(/\s+/g, " ").trim();
      if (texto) condiciones.push(texto);
    }
  }

  // ── 5. Ingredientes ───────────────────────────────────────────────────────
  let ingredientes: string[] = [];
  let puede_contener: string | null = null;
  const ingHtml = sections.get("Ingredientes");
  if (ingHtml) {
    // Lista de ingredientes
    const paraMatch = ingHtml.match(/<p[^>]*py-2[^>]*>([\s\S]*?)<\/p>/);
    if (paraMatch) {
      const texto = stripHtml(paraMatch[1]).replace(/\.$/, "");
      ingredientes = texto
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Puede contener (trazas)
    const puedeMatch = ingHtml.match(
      /<div[^>]*bg-grey[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/
    );
    if (puedeMatch) {
      puede_contener = stripHtml(puedeMatch[1]).replace(/\.$/, "").trim() || null;
    }
  }

  // ── 6. Tabla nutricional ──────────────────────────────────────────────────
  const tabla: TablaNutricional = {
    porcion_g: 100, // Jumbo muestra valores por 100g en la primera columna
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

  const nutHtml = sections.get("Información nutricional");
  if (nutHtml) {
    for (const ul of nutHtml.matchAll(/<ul[^>]*grid-cols-3[^>]*>([\s\S]*?)<\/ul>/g)) {
      const lis: string[] = [];
      for (const li of ul[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)) {
        lis.push(stripHtml(li[1]).trim());
      }
      if (lis.length !== 3) continue;

      const [label, v100] = lis;

      // Saltar fila de encabezado
      if (norm(label).includes("valores") || norm(v100).includes("por cada")) continue;

      const campo = mapNutriente(label);
      if (campo) {
        const num = parseNum(v100);
        if (num !== null) tabla[campo] = num;
      }
    }
  }

  // ── 7. Características ────────────────────────────────────────────────────
  const caracteristicas: Record<string, string> = {};
  const charHtml = sections.get("Características");
  if (charHtml) {
    for (const pair of charHtml.matchAll(
      /<p[^>]*font-bold[^>]*>([\s\S]*?)<\/p>\s*<p[^>]*font-normal[^>]*>([\s\S]*?)<\/p>/g
    )) {
      const key = stripHtml(pair[1]).trim();
      const val = stripHtml(pair[2]).trim();
      if (key && val) caracteristicas[key] = val;
    }
  }

  // Marca desde características si no vino en JSON-LD
  if (!marca && caracteristicas["Marca"]) {
    marca = caracteristicas["Marca"];
  }

  return {
    nombre,
    marca,
    descripcion,
    ingredientes,
    puede_contener,
    tabla_nutricional: tabla,
    condiciones_alimentarias: condiciones,
    caracteristicas,
    imagen_url,
    url_jumbo: url,
  };
}
