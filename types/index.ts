export interface TablaNutricional {
  porcion_g: number | null;
  calorias_kcal: number | null;
  proteinas_g: number | null;
  grasas_totales_g: number | null;
  grasas_saturadas_g: number | null;
  grasas_trans_g: number | null;
  carbohidratos_g: number | null;
  azucares_g: number | null;
  fibra_g: number | null;
  sodio_mg: number | null;
  es_liquido?: boolean;
}

export interface Aditivo {
  nombre: string;
  codigo_e: string;
  riesgo: "bajo" | "medio" | "alto";
}

export interface ComparativaEU {
  azucares?: "cumple" | "excede";
  sodio?: "cumple" | "excede";
  grasas_saturadas?: "cumple" | "excede";
  calorias?: "cumple" | "excede";
}

export interface Producto {
  id: string;
  nombre: string;
  marca: string | null;
  codigo_barras: string | null;
  elaborado_por: string | null;
  registro_sanitario: string | null;
  ingredientes: string[];
  tabla_nutricional: TablaNutricional;
  nota_cl: number;
  sellos_cl: string[];
  aditivos: Aditivo[];
  comparativa_eu: ComparativaEU;
  veces_escaneado: number;
  imagen_url: string | null;
  fuente_datos: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface DatosOCR {
  nombre_producto: string | null;
  marca: string | null;
  codigo_barras: string | null;
  elaborado_por: string | null;
  registro_sanitario: string | null;
  ingredientes: string[];
  tabla_nutricional: TablaNutricional;
}

// Claves numéricas de TablaNutricional (excluye es_liquido)
export type NutriKey = keyof Omit<TablaNutricional, "es_liquido">;

// ─── Evaluación detallada ───────────────────────────────────────────────────

export type NivelNutriente =
  | "excelente"
  | "ok"
  | "moderado"
  | "advertencia"
  | "critico"
  | "neutral";

export interface FilaNutriente {
  label: string;
  valor: string;
  comentario: string;
  nivel: NivelNutriente;
}

export interface TrampaRacion {
  porcionDeclarada_g: number;
  porcionReal_g: number;
  unidad: string;
  caloriasReales_kcal: number;
  sodioReal_mg: number | null;
  titulo: string;
  descripcion: string;
}

export interface SubNota {
  aspecto: string;
  detalle: string;
  nota: number;
}

export interface ResultadoEvaluacion {
  nota: number;
  sellos_cl: string[];
  aditivos: Aditivo[];
  comparativa_eu: ComparativaEU;
}

export interface EvaluacionDetallada extends ResultadoEvaluacion {
  filas_nutrientes: FilaNutriente[];
  trampa_racion: TrampaRacion | null;
  sub_notas: SubNota[];
  valores_por_100g: TablaNutricional;
  veredicto: string;
}
