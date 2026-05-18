import limites from "@/data/limites-normas.json";
import type { TablaNutricional } from "@/types";

const CL = limites.chile;

export function getUmbralesCL(esLiquido: boolean) {
  return esLiquido ? CL.liquidos : CL.solidos;
}

export function calcularSellos(tn: TablaNutricional): string[] {
  const sellos: string[] = [];
  const p = tn.porcion_g ?? 100;
  const factor = p > 0 ? 100 / p : 1;
  const U = getUmbralesCL(tn.es_liquido ?? false);

  const az = (tn.azucares_g ?? 0) * factor;
  const na = (tn.sodio_mg ?? 0) * factor;
  const gs = (tn.grasas_saturadas_g ?? 0) * factor;
  const kcal = (tn.calorias_kcal ?? 0) * factor;

  if (az > U.azucares_alto_g) sellos.push("ALTO EN AZÚCARES");
  if (na > U.sodio_alto_mg) sellos.push("ALTO EN SODIO");
  if (gs > U.grasas_saturadas_alto_g) sellos.push("ALTO EN GRASAS SATURADAS");
  if (kcal > U.calorias_alto_kcal) sellos.push("ALTO EN CALORÍAS");

  return sellos;
}

export function tieneGrasasTrans(tn: TablaNutricional): boolean {
  return (tn.grasas_trans_g ?? 0) > 0;
}
