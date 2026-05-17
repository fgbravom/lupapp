import limites from "@/data/limites-normas.json";
import type { TablaNutricional } from "@/types";

const CL = limites.chile;

export function calcularSellos(tn: TablaNutricional): string[] {
  const sellos: string[] = [];
  const p = tn.porcion_g ?? 100;
  const factor = p > 0 ? 100 / p : 1;

  const az = (tn.azucares_g ?? 0) * factor;
  const na = (tn.sodio_mg ?? 0) * factor;
  const gs = (tn.grasas_saturadas_g ?? 0) * factor;
  const kcal = (tn.calorias_kcal ?? 0) * factor;

  if (az > CL.azucares_alto_g) sellos.push("ALTO EN AZÚCARES");
  if (na > CL.sodio_alto_mg) sellos.push("ALTO EN SODIO");
  if (gs > CL.grasas_saturadas_alto_g) sellos.push("ALTO EN GRASAS SATURADAS");
  if (kcal > CL.calorias_alto_kcal) sellos.push("ALTO EN CALORÍAS");

  return sellos;
}

export function tieneGrasasTrans(tn: TablaNutricional): boolean {
  return (tn.grasas_trans_g ?? 0) > 0;
}
