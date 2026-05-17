import aditivos from "@/data/aditivos-riesgo.json";
import type {
  TablaNutricional,
  Aditivo,
  FilaNutriente,
  NivelNutriente,
  TrampaRacion,
  SubNota,
  EvaluacionDetallada,
} from "@/types";
import { calcularSellos, tieneGrasasTrans } from "@/lib/normas/chile";
import { compararConEU } from "@/lib/normas/eu";

// ─── Helpers ────────────────────────────────────────────────────────────────

const ADITIVOS_MAP = new Map(
  aditivos.map((a) => [a.nombre.toLowerCase(), a])
);

function r1(x: number | null): number | null {
  return x != null ? Math.round(x * 10) / 10 : null;
}

function detectarAditivos(ingredientes: string[]): Aditivo[] {
  const texto = ingredientes.join(" ").toLowerCase();
  const detectados: Aditivo[] = [];
  for (const [nombre, info] of ADITIVOS_MAP) {
    if (texto.includes(nombre) || texto.includes(info.codigo_e.toLowerCase())) {
      detectados.push(info as Aditivo);
    }
  }
  return detectados;
}

// ─── Sub-notas (escala 1–7) ──────────────────────────────────────────────────

function notaAzucar(az: number | null): number {
  if (az == null) return 5.0;
  if (az <= 5) return 7.0;
  if (az <= 10) return 6.0;
  if (az <= 15) return 5.0;
  if (az <= 18) return 3.5;
  if (az <= 22.5) return 2.0;
  if (az <= 30) return 1.5;
  return 1.0;
}

function notaSodio(na: number | null): number {
  if (na == null) return 5.0;
  if (na <= 200) return 7.0;
  if (na <= 400) return 6.0;
  if (na <= 600) return 4.5;
  if (na <= 800) return 2.0;
  return 1.5;
}

function notaGrasas(sat: number | null, trans: number | null): number {
  const s = sat ?? 0;
  const t = trans ?? 0;
  const total = s + t * 2; // grasas trans pesan doble
  if (total === 0) return 7.0;
  if (total <= 1) return 7.0;
  if (total <= 3) return 6.0;
  if (total <= 5) return 5.0;
  if (total <= 6) return 3.5;
  return 2.0;
}

function notaIngredientes(sellos: string[], aditivosList: Aditivo[]): number {
  let nota = 7.0;
  nota -= sellos.length * 0.8;
  for (const a of aditivosList) {
    if (a.riesgo === "alto") nota -= 0.5;
    if (a.riesgo === "medio") nota -= 0.2;
  }
  return Math.max(1.0, Math.round(nota * 10) / 10);
}

function notaPorcion(porcion_g: number | null): number {
  if (porcion_g == null) return 5.0;
  if (porcion_g >= 25) return 6.5;
  if (porcion_g >= 15) return 4.5;
  if (porcion_g >= 10) return 3.0;
  return 2.0;
}

// ─── Comentarios por nutriente ───────────────────────────────────────────────

function comentarioAzucar(
  az: number | null,
  carbs: number | null
): { comentario: string; nivel: NivelNutriente } {
  if (az == null) return { comentario: "—", nivel: "neutral" };

  if (carbs != null && carbs > 0) {
    const pct = Math.round((az / carbs) * 100);
    if (pct > 75) {
      return {
        comentario: `⚠️ El ${pct}% de los carbos son azúcar`,
        nivel: az > 18 ? "critico" : "advertencia",
      };
    }
  }

  if (az > 22.5) return { comentario: "⚠️ Supera norma CL", nivel: "critico" };
  if (az > 18) return { comentario: "⚠️ Muy elevado", nivel: "advertencia" };
  if (az > 15) return { comentario: "⚠️ Elevado", nivel: "advertencia" };
  if (az > 10) return { comentario: "Moderado", nivel: "moderado" };
  if (az > 5) return { comentario: "Bajo", nivel: "ok" };
  return { comentario: "✅ Muy bajo", nivel: "excelente" };
}

function comentarioSodio(na: number | null): { comentario: string; nivel: NivelNutriente } {
  if (na == null) return { comentario: "—", nivel: "neutral" };
  if (na > 800) return { comentario: "⚠️ Crítico", nivel: "critico" };
  if (na > 600) return { comentario: "⚠️ Muy alto", nivel: "advertencia" };
  if (na > 400) return { comentario: "Elevado", nivel: "moderado" };
  if (na > 200) return { comentario: "Moderado", nivel: "ok" };
  return { comentario: "✅ Bajo", nivel: "excelente" };
}

function generarFilas(p100: TablaNutricional): FilaNutriente[] {
  const az = p100.azucares_g;
  const na = p100.sodio_mg;
  const kcal = p100.calorias_kcal;
  const prot = p100.proteinas_g;
  const gt = p100.grasas_totales_g;
  const gs = p100.grasas_saturadas_g;
  const gtrans = p100.grasas_trans_g;
  const carbs = p100.carbohidratos_g;
  const fib = p100.fibra_g;

  const azInfo = comentarioAzucar(az, carbs);
  const naInfo = comentarioSodio(na);

  function kcalNivel(): NivelNutriente {
    if (kcal == null) return "neutral";
    if (kcal > 400) return "advertencia";
    if (kcal > 300) return "moderado";
    if (kcal > 200) return "moderado";
    return "ok";
  }

  function kcalComentario(): string {
    if (kcal == null) return "—";
    if (kcal > 400) return "⚠️ Muy alto";
    if (kcal > 300) return "⚠️ Alto";
    if (kcal > 200) return "Moderado-alto";
    if (kcal > 100) return "Moderado";
    return "Bajo";
  }

  const filas: FilaNutriente[] = [
    {
      label: "Calorías",
      valor: kcal != null ? `${kcal} kcal` : "—",
      comentario: kcalComentario(),
      nivel: kcalNivel(),
    },
    {
      label: "Proteínas",
      valor: prot != null ? `${prot}g` : "—",
      comentario:
        prot == null
          ? "—"
          : prot >= 8
          ? "✅ Buena fuente"
          : prot >= 3
          ? "Aceptable"
          : prot >= 1
          ? "Bajo"
          : "Insignificante",
      nivel: prot == null ? "neutral" : prot >= 8 ? "excelente" : prot >= 1 ? "ok" : "neutral",
    },
    {
      label: "Grasas totales",
      valor: gt != null ? `${gt}g` : "—",
      comentario:
        gt == null
          ? "—"
          : gt <= 1
          ? "✅ Casi nada"
          : gt <= 5
          ? "Bajo"
          : gt <= 15
          ? "Moderado"
          : "⚠️ Alto",
      nivel:
        gt == null
          ? "neutral"
          : gt <= 1
          ? "excelente"
          : gt <= 5
          ? "ok"
          : gt <= 15
          ? "moderado"
          : "advertencia",
    },
    {
      label: "Grasas saturadas",
      valor: gs != null ? `${gs}g` : "—",
      comentario:
        gs == null
          ? "—"
          : gs === 0
          ? "✅ Excelente"
          : gs <= 1
          ? "✅ Muy bajo"
          : gs <= 3
          ? "Aceptable"
          : gs <= 6
          ? "⚠️ Moderado"
          : "⚠️ Alto",
      nivel:
        gs == null
          ? "neutral"
          : gs === 0
          ? "excelente"
          : gs <= 1
          ? "excelente"
          : gs <= 3
          ? "ok"
          : gs <= 6
          ? "moderado"
          : "advertencia",
    },
    {
      label: "Carbohidratos",
      valor: carbs != null ? `${carbs}g` : "—",
      comentario: "—",
      nivel: "neutral",
    },
    {
      label: "Azúcares",
      valor: az != null ? `${az}g` : "—",
      comentario: azInfo.comentario,
      nivel: azInfo.nivel,
    },
    {
      label: "Fibra",
      valor: fib != null ? `${fib}g` : "—",
      comentario:
        fib == null
          ? "—"
          : fib >= 3
          ? "✅ Buena"
          : fib >= 1
          ? "Aceptable"
          : "Mínima",
      nivel:
        fib == null ? "neutral" : fib >= 3 ? "excelente" : fib >= 1 ? "ok" : "neutral",
    },
    {
      label: "Sodio",
      valor: na != null ? `${na}mg` : "—",
      comentario: naInfo.comentario,
      nivel: naInfo.nivel,
    },
  ];

  if (gtrans != null && gtrans > 0) {
    filas.splice(4, 0, {
      label: "Grasas trans",
      valor: `${gtrans}g`,
      comentario: "⚠️ Presente — evitar",
      nivel: "critico",
    });
  }

  return filas;
}

// ─── Trampa de la ración ─────────────────────────────────────────────────────

function detectarTrampa(
  tn: TablaNutricional,
  por100: TablaNutricional
): TrampaRacion | null {
  const p = tn.porcion_g;
  if (!p || p >= 20) return null;

  const porcionReal = Math.max(30, p * 3);
  const factorReal = porcionReal / 100;

  const kcal100 = por100.calorias_kcal ?? 0;
  const na100 = por100.sodio_mg ?? 0;
  const caloriasReales = Math.round(kcal100 * factorReal);
  const sodioReal = Math.round(na100 * factorReal);

  const unidad = p <= 5 ? "1 cdita" : p <= 12 ? "1 cda" : "1 porción pequeña";
  const kcalPorcion = Math.round(kcal100 * p / 100);

  return {
    porcionDeclarada_g: p,
    porcionReal_g: porcionReal,
    unidad,
    caloriasReales_kcal: caloriasReales,
    sodioReal_mg: sodioReal > 0 ? sodioReal : null,
    titulo: `La trampa del "${unidad} = ${kcalPorcion} kcal"`,
    descripcion:
      `La porción declarada es ${p}g (${unidad}). Nadie usa solo ${p}g. ` +
      `Una porción real son ${porcionReal}g → estás consumiendo ~${caloriasReales} kcal` +
      (sodioReal > 0 ? ` y ~${sodioReal}mg de sodio` : "") +
      ` de un condimento.`,
  };
}

// ─── Función principal ───────────────────────────────────────────────────────

export function evaluar(
  tn: TablaNutricional,
  ingredientes: string[]
): EvaluacionDetallada {
  // 1. Normalizar a por 100g
  const p = tn.porcion_g ?? 100;
  const f = p > 0 ? 100 / p : 1;

  const por100: TablaNutricional = {
    porcion_g: 100,
    calorias_kcal: r1(tn.calorias_kcal != null ? tn.calorias_kcal * f : null),
    proteinas_g: r1(tn.proteinas_g != null ? tn.proteinas_g * f : null),
    grasas_totales_g: r1(tn.grasas_totales_g != null ? tn.grasas_totales_g * f : null),
    grasas_saturadas_g: r1(tn.grasas_saturadas_g != null ? tn.grasas_saturadas_g * f : null),
    grasas_trans_g: r1(tn.grasas_trans_g != null ? tn.grasas_trans_g * f : null),
    carbohidratos_g: r1(tn.carbohidratos_g != null ? tn.carbohidratos_g * f : null),
    azucares_g: r1(tn.azucares_g != null ? tn.azucares_g * f : null),
    fibra_g: r1(tn.fibra_g != null ? tn.fibra_g * f : null),
    sodio_mg: r1(tn.sodio_mg != null ? tn.sodio_mg * f : null),
  };

  // 2. Sellos + aditivos + comparativa
  const sellos = calcularSellos(tn);
  const transPresentes = tieneGrasasTrans(tn);
  const aditivosList = detectarAditivos(ingredientes);
  const comparativa = compararConEU(tn);

  // 3. Sub-notas
  const nAzucar = notaAzucar(por100.azucares_g);
  const nSodio = notaSodio(por100.sodio_mg);
  const nGrasas = notaGrasas(por100.grasas_saturadas_g, por100.grasas_trans_g);
  const nIng = notaIngredientes(sellos, aditivosList);
  const nPorcion = notaPorcion(p < 100 ? p : null);

  // 4. Nota final ponderada (pesos: az=0.25, na=0.25, g=0.20, i=0.20, p=0.10)
  const notaRaw =
    nAzucar * 0.25 +
    nSodio * 0.25 +
    nGrasas * 0.20 +
    nIng * 0.20 +
    nPorcion * 0.10;

  const nota = Math.max(1.0, Math.min(7.0, Math.round(notaRaw * 10) / 10));

  // 5. Comentarios nutrientes
  const filas_nutrientes = generarFilas(por100);

  // 6. Trampa de la ración
  const trampa_racion = detectarTrampa(tn, por100);

  // 7. Sub-notas para display
  const sub_notas: SubNota[] = [
    {
      aspecto: "Ingredientes",
      detalle: generarDetalleIng(sellos, aditivosList, transPresentes),
      nota: nIng,
    },
    {
      aspecto: "Azúcar",
      detalle: por100.azucares_g != null ? `${por100.azucares_g}g/100g` : "",
      nota: nAzucar,
    },
    {
      aspecto: "Sodio",
      detalle: por100.sodio_mg != null ? `${por100.sodio_mg}mg/100g` : "",
      nota: nSodio,
    },
    {
      aspecto: "Grasas",
      detalle: generarDetalleGrasas(por100),
      nota: nGrasas,
    },
  ];

  if (p < 20) {
    sub_notas.push({
      aspecto: "Porción declarada vs real",
      detalle: `${p}g declarados`,
      nota: nPorcion,
    });
  }

  return {
    nota,
    sellos_cl: sellos,
    aditivos: aditivosList,
    comparativa_eu: comparativa,
    filas_nutrientes,
    trampa_racion,
    sub_notas,
    valores_por_100g: por100,
  };
}

// ─── Helpers de texto ────────────────────────────────────────────────────────

function generarDetalleIng(
  sellos: string[],
  aditivosList: Aditivo[],
  trans: boolean
): string {
  const partes: string[] = [];
  if (sellos.length > 0) partes.push(`${sellos.length} sello(s)`);
  const riesgoAlto = aditivosList.filter((a) => a.riesgo === "alto").length;
  const riesgoMedio = aditivosList.filter((a) => a.riesgo === "medio").length;
  if (riesgoAlto > 0) partes.push(`${riesgoAlto} aditivo(s) alto riesgo`);
  if (riesgoMedio > 0) partes.push(`${riesgoMedio} aditivo(s) riesgo medio`);
  if (trans) partes.push("grasas trans");
  return partes.length > 0 ? partes.join(", ") : "Sin alertas";
}

function generarDetalleGrasas(por100: TablaNutricional): string {
  const sat = por100.grasas_saturadas_g;
  const trans = por100.grasas_trans_g;
  if (sat == null) return "";
  if (trans && trans > 0) return `${sat}g sat + ${trans}g trans/100g`;
  return `${sat}g sat/100g`;
}
