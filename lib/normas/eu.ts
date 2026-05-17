import limites from "@/data/limites-normas.json";
import type { TablaNutricional, ComparativaEU } from "@/types";

const EU = limites.eu;

export function compararConEU(tn: TablaNutricional): ComparativaEU {
  const p = tn.porcion_g ?? 100;
  const factor = p > 0 ? 100 / p : 1;

  return {
    azucares:
      (tn.azucares_g ?? 0) * factor > EU.azucares_alto_g ? "excede" : "cumple",
    sodio:
      (tn.sodio_mg ?? 0) * factor > EU.sodio_alto_mg ? "excede" : "cumple",
    grasas_saturadas:
      (tn.grasas_saturadas_g ?? 0) * factor > EU.grasas_saturadas_alto_g
        ? "excede"
        : "cumple",
    calorias:
      (tn.calorias_kcal ?? 0) * factor > EU.calorias_alto_kcal
        ? "excede"
        : "cumple",
  };
}
