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
import { calcularSellos, tieneGrasasTrans, getUmbralesCL } from "@/lib/normas/chile";
import { compararConEU } from "@/lib/normas/eu";
import limites from "@/data/limites-normas.json";

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

// ─── Scoring anclado a la Ley 20606 ─────────────────────────────────────────
// El umbral legal "ALTO EN" es el límite crítico (ratio = 1.0 → nota 1.0).
// La escala es proporcional al % del umbral que se alcanza.

function notaDesdeUmbral(valor: number | null, umbral: number, fallback = 5.0): number {
  if (valor == null) return fallback;
  const ratio = valor / umbral;
  if (ratio > 1.0)  return 1.0;  // ALTO EN — excede la ley
  if (ratio > 0.85) return 1.5;  // 85–100% del umbral
  if (ratio > 0.65) return 2.5;  // 65–85%
  if (ratio > 0.45) return 4.0;  // 45–65%
  if (ratio > 0.20) return 5.5;  // 20–45%
  return 7.0;                     // < 20%
}

function notaGrasas(sat: number | null, trans: number | null, umbralSat: number): number {
  const s = sat ?? 0;
  const t = trans ?? 0;
  if (t > limites.chile.grasas_trans_max_g) return 1.0;
  const efectivo = s + t * 2;  // trans penaliza doble
  return notaDesdeUmbral(efectivo, umbralSat);
}

function notaIngredientes(aditivosList: Aditivo[], transPresentes: boolean): number {
  let nota = 7.0;
  for (const a of aditivosList) {
    if (a.riesgo === "alto")  nota -= 0.6;
    if (a.riesgo === "medio") nota -= 0.3;
  }
  if (transPresentes) nota -= 1.0;
  return Math.max(1.0, Math.round(nota * 10) / 10);
}

// ─── Nivel semántico desde ratio con umbral ──────────────────────────────────

function nivelDesdeRatio(ratio: number): NivelNutriente {
  if (ratio > 1.0)  return "critico";
  if (ratio > 0.85) return "critico";
  if (ratio > 0.65) return "advertencia";
  if (ratio > 0.45) return "moderado";
  if (ratio > 0.20) return "ok";
  return "excelente";
}

// ─── Comentarios por nutriente ───────────────────────────────────────────────

function comentarioAzucar(
  az: number | null,
  carbs: number | null,
  umbral: number
): { comentario: string; nivel: NivelNutriente } {
  if (az == null) return { comentario: "—", nivel: "neutral" };

  const ratio = az / umbral;

  if (carbs != null && carbs > 0) {
    const pct = Math.round((az / carbs) * 100);
    if (pct > 75 && ratio > 0.45) {
      return {
        comentario: `⚠️ El ${pct}% de los carbos son azúcar`,
        nivel: ratio > 0.85 ? "critico" : "advertencia",
      };
    }
  }

  if (ratio > 1.0)  return { comentario: "⚠️ Supera norma CL", nivel: "critico" };
  if (ratio > 0.85) return { comentario: "⚠️ Muy elevado", nivel: "critico" };
  if (ratio > 0.65) return { comentario: "⚠️ Elevado", nivel: "advertencia" };
  if (ratio > 0.45) return { comentario: "Moderado", nivel: "moderado" };
  if (ratio > 0.20) return { comentario: "Bajo", nivel: "ok" };
  return { comentario: "✅ Muy bajo", nivel: "excelente" };
}

function comentarioSodio(
  na: number | null,
  umbral: number
): { comentario: string; nivel: NivelNutriente } {
  if (na == null) return { comentario: "—", nivel: "neutral" };
  const ratio = na / umbral;
  if (ratio > 1.0)  return { comentario: "⚠️ Supera norma CL", nivel: "critico" };
  if (ratio > 0.85) return { comentario: "⚠️ Muy alto", nivel: "critico" };
  if (ratio > 0.65) return { comentario: "⚠️ Elevado", nivel: "advertencia" };
  if (ratio > 0.45) return { comentario: "Moderado", nivel: "moderado" };
  if (ratio > 0.20) return { comentario: "Bajo", nivel: "ok" };
  return { comentario: "✅ Muy bajo", nivel: "excelente" };
}

function comentarioCalorias(
  kcal: number | null,
  umbral: number
): { comentario: string; nivel: NivelNutriente } {
  if (kcal == null) return { comentario: "—", nivel: "neutral" };
  const ratio = kcal / umbral;
  if (ratio > 1.0)  return { comentario: "⚠️ Supera norma CL", nivel: "critico" };
  if (ratio > 0.85) return { comentario: "⚠️ Muy alto", nivel: "critico" };
  if (ratio > 0.65) return { comentario: "⚠️ Alto", nivel: "advertencia" };
  if (ratio > 0.45) return { comentario: "Moderado-alto", nivel: "moderado" };
  if (ratio > 0.20) return { comentario: "Moderado", nivel: "ok" };
  return { comentario: "Bajo", nivel: "excelente" };
}

function generarFilas(p100: TablaNutricional, U: typeof import("@/data/limites-normas.json")["chile"]["solidos"]): FilaNutriente[] {
  const az = p100.azucares_g;
  const na = p100.sodio_mg;
  const kcal = p100.calorias_kcal;
  const prot = p100.proteinas_g;
  const gt = p100.grasas_totales_g;
  const gs = p100.grasas_saturadas_g;
  const gtrans = p100.grasas_trans_g;
  const carbs = p100.carbohidratos_g;
  const fib = p100.fibra_g;

  const azInfo = comentarioAzucar(az, carbs, U.azucares_alto_g);
  const naInfo = comentarioSodio(na, U.sodio_alto_mg);
  const kcalInfo = comentarioCalorias(kcal, U.calorias_alto_kcal);

  const filas: FilaNutriente[] = [
    {
      label: "Calorías",
      valor: kcal != null ? `${kcal} kcal` : "—",
      comentario: kcalInfo.comentario,
      nivel: kcalInfo.nivel,
    },
    {
      label: "Proteínas",
      valor: prot != null ? `${prot}g` : "—",
      comentario:
        prot == null ? "—"
        : prot >= 8  ? "✅ Buena fuente"
        : prot >= 3  ? "Aceptable"
        : prot >= 1  ? "Bajo"
        : "Insignificante",
      nivel: prot == null ? "neutral" : prot >= 8 ? "excelente" : prot >= 1 ? "ok" : "neutral",
    },
    {
      label: "Grasas totales",
      valor: gt != null ? `${gt}g` : "—",
      comentario:
        gt == null ? "—"
        : gt <= 1   ? "✅ Casi nada"
        : gt <= 5   ? "Bajo"
        : gt <= 15  ? "Moderado"
        : "⚠️ Alto",
      nivel:
        gt == null ? "neutral"
        : gt <= 1   ? "excelente"
        : gt <= 5   ? "ok"
        : gt <= 15  ? "moderado"
        : "advertencia",
    },
    {
      label: "Grasas saturadas",
      valor: gs != null ? `${gs}g` : "—",
      comentario:
        gs == null  ? "—"
        : gs === 0  ? "✅ Excelente"
        : nivelDesdeRatio(gs / U.grasas_saturadas_alto_g) === "excelente" ? "✅ Muy bajo"
        : nivelDesdeRatio(gs / U.grasas_saturadas_alto_g) === "ok"        ? "Bajo"
        : nivelDesdeRatio(gs / U.grasas_saturadas_alto_g) === "moderado"  ? "Moderado"
        : nivelDesdeRatio(gs / U.grasas_saturadas_alto_g) === "advertencia" ? "⚠️ Elevado"
        : "⚠️ Supera norma CL",
      nivel: gs == null ? "neutral" : nivelDesdeRatio(gs / U.grasas_saturadas_alto_g),
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
        fib == null ? "—"
        : fib >= 3  ? "✅ Buena"
        : fib >= 1  ? "Aceptable"
        : "Mínima",
      nivel: fib == null ? "neutral" : fib >= 3 ? "excelente" : fib >= 1 ? "ok" : "neutral",
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
  const esLiquido = tn.es_liquido ?? false;
  const U = getUmbralesCL(esLiquido);

  // 1. Normalizar a por 100g/100ml
  const p = tn.porcion_g ?? 100;
  const f = p > 0 ? 100 / p : 1;

  const por100: TablaNutricional = {
    porcion_g: 100,
    es_liquido: esLiquido,
    calorias_kcal:        r1(tn.calorias_kcal        != null ? tn.calorias_kcal        * f : null),
    proteinas_g:          r1(tn.proteinas_g           != null ? tn.proteinas_g          * f : null),
    grasas_totales_g:     r1(tn.grasas_totales_g      != null ? tn.grasas_totales_g     * f : null),
    grasas_saturadas_g:   r1(tn.grasas_saturadas_g    != null ? tn.grasas_saturadas_g   * f : null),
    grasas_trans_g:       r1(tn.grasas_trans_g        != null ? tn.grasas_trans_g       * f : null),
    carbohidratos_g:      r1(tn.carbohidratos_g       != null ? tn.carbohidratos_g      * f : null),
    azucares_g:           r1(tn.azucares_g            != null ? tn.azucares_g           * f : null),
    fibra_g:              r1(tn.fibra_g               != null ? tn.fibra_g              * f : null),
    sodio_mg:             r1(tn.sodio_mg              != null ? tn.sodio_mg             * f : null),
  };

  // 2. Sellos + aditivos + comparativa
  const sellos = calcularSellos(tn);
  const transPresentes = tieneGrasasTrans(tn);
  const aditivosList = detectarAditivos(ingredientes);
  const comparativa = compararConEU(tn);

  // 3. Sub-notas ancladas a umbrales Ley 20606
  const nCalorias = notaDesdeUmbral(por100.calorias_kcal, U.calorias_alto_kcal);
  const nAzucar   = notaDesdeUmbral(por100.azucares_g, U.azucares_alto_g);
  const nSodio    = notaDesdeUmbral(por100.sodio_mg, U.sodio_alto_mg);
  const nGrasas   = notaGrasas(por100.grasas_saturadas_g, por100.grasas_trans_g, U.grasas_saturadas_alto_g);
  const nIng      = notaIngredientes(aditivosList, transPresentes);

  // 4. Nota final ponderada — 4 nutrientes críticos de la ley + calidad
  const notaRaw =
    nCalorias * 0.15 +
    nAzucar   * 0.25 +
    nSodio    * 0.25 +
    nGrasas   * 0.20 +
    nIng      * 0.15;

  const nota = Math.max(1.0, Math.min(7.0, Math.round(notaRaw * 10) / 10));

  // 5. Filas de nutrientes
  const filas_nutrientes = generarFilas(por100, U);

  // 6. Trampa de la ración
  const trampa_racion = detectarTrampa(tn, por100);

  // 7. Sub-notas para display
  const sub_notas: SubNota[] = [
    {
      aspecto: "Calorías",
      detalle: por100.calorias_kcal != null ? `${por100.calorias_kcal} kcal/100${esLiquido ? "ml" : "g"} (umbral ${U.calorias_alto_kcal})` : "",
      nota: nCalorias,
    },
    {
      aspecto: "Azúcar",
      detalle: por100.azucares_g != null ? `${por100.azucares_g}g/100${esLiquido ? "ml" : "g"} (umbral ${U.azucares_alto_g}g)` : "",
      nota: nAzucar,
    },
    {
      aspecto: "Sodio",
      detalle: por100.sodio_mg != null ? `${por100.sodio_mg}mg/100${esLiquido ? "ml" : "g"} (umbral ${U.sodio_alto_mg}mg)` : "",
      nota: nSodio,
    },
    {
      aspecto: "Grasas",
      detalle: generarDetalleGrasas(por100),
      nota: nGrasas,
    },
    {
      aspecto: "Ingredientes",
      detalle: generarDetalleIng(aditivosList, transPresentes),
      nota: nIng,
    },
  ];

  const veredicto = generarVeredicto(sellos, por100, U, esLiquido, sub_notas);

  return {
    nota,
    sellos_cl: sellos,
    aditivos: aditivosList,
    comparativa_eu: comparativa,
    filas_nutrientes,
    trampa_racion,
    sub_notas,
    valores_por_100g: por100,
    veredicto,
  };
}

// ─── Veredicto en lenguaje natural ───────────────────────────────────────────

function generarVeredicto(
  sellos: string[],
  por100: TablaNutricional,
  U: { calorias_alto_kcal: number; azucares_alto_g: number; sodio_alto_mg: number; grasas_saturadas_alto_g: number },
  esLiquido: boolean,
  sub_notas: SubNota[]
): string {
  const ref = esLiquido ? "100 ml" : "100 g";

  if (sellos.length === 0) {
    const enRiesgo = sub_notas.find(
      (s) => ["Calorías", "Azúcar", "Sodio", "Grasas"].includes(s.aspecto) && s.nota < 4.0
    );
    if (enRiesgo) {
      return `No tiene sellos de advertencia, pero su ${enRiesgo.aspecto.toLowerCase()} (${enRiesgo.detalle}) está cerca del límite legal — por eso la nota no sube más.`;
    }
    return "No tiene sellos de advertencia. Todos sus nutrientes críticos están dentro de los límites de la Ley 20.606.";
  }

  const excesos: string[] = [];

  if (por100.azucares_g != null && por100.azucares_g > U.azucares_alto_g) {
    const veces = +(por100.azucares_g / U.azucares_alto_g).toFixed(1);
    excesos.push(
      `azúcares (${por100.azucares_g}g por ${ref}, límite ${U.azucares_alto_g}g${veces >= 1.5 ? ` — ${veces}× el máximo` : ""})`
    );
  }
  if (por100.sodio_mg != null && por100.sodio_mg > U.sodio_alto_mg) {
    const veces = +(por100.sodio_mg / U.sodio_alto_mg).toFixed(1);
    excesos.push(
      `sodio (${por100.sodio_mg}mg por ${ref}, límite ${U.sodio_alto_mg}mg${veces >= 1.5 ? ` — ${veces}× el máximo` : ""})`
    );
  }
  if (por100.grasas_saturadas_g != null && por100.grasas_saturadas_g > U.grasas_saturadas_alto_g) {
    const veces = +(por100.grasas_saturadas_g / U.grasas_saturadas_alto_g).toFixed(1);
    excesos.push(
      `grasas saturadas (${por100.grasas_saturadas_g}g por ${ref}, límite ${U.grasas_saturadas_alto_g}g${veces >= 1.5 ? ` — ${veces}× el máximo` : ""})`
    );
  }
  if (por100.calorias_kcal != null && por100.calorias_kcal > U.calorias_alto_kcal) {
    const veces = +(por100.calorias_kcal / U.calorias_alto_kcal).toFixed(1);
    excesos.push(
      `calorías (${por100.calorias_kcal} kcal por ${ref}, límite ${U.calorias_alto_kcal} kcal${veces >= 1.5 ? ` — ${veces}× el máximo` : ""})`
    );
  }

  const nSellos = sellos.length;
  const intro =
    nSellos === 1
      ? "Tiene 1 sello de advertencia porque supera el límite legal en"
      : `Tiene ${nSellos} sellos de advertencia porque supera el límite legal en`;

  if (excesos.length === 0) return `${intro} uno o más nutrientes críticos según la Ley 20.606.`;
  if (excesos.length === 1) return `${intro} ${excesos[0]}.`;
  const last = excesos.pop()!;
  return `${intro} ${excesos.join(", ")} y ${last}.`;
}

// ─── Helpers de texto ────────────────────────────────────────────────────────

function generarDetalleIng(aditivosList: Aditivo[], trans: boolean): string {
  const partes: string[] = [];
  const riesgoAlto  = aditivosList.filter((a) => a.riesgo === "alto").length;
  const riesgoMedio = aditivosList.filter((a) => a.riesgo === "medio").length;
  if (riesgoAlto  > 0) partes.push(`${riesgoAlto} aditivo(s) alto riesgo`);
  if (riesgoMedio > 0) partes.push(`${riesgoMedio} aditivo(s) riesgo medio`);
  if (trans) partes.push("grasas trans");
  return partes.length > 0 ? partes.join(", ") : "Sin alertas";
}

function generarDetalleGrasas(por100: TablaNutricional): string {
  const sat   = por100.grasas_saturadas_g;
  const trans = por100.grasas_trans_g;
  if (sat == null) return "";
  if (trans && trans > 0) return `${sat}g sat + ${trans}g trans/100g`;
  return `${sat}g sat/100g`;
}
