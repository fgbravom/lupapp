import type { ComparativaEU, TablaNutricional } from "@/types";

interface Props {
  comparativa: ComparativaEU;
  tablaNutricional: TablaNutricional;
}

const filas: {
  key: keyof ComparativaEU;
  label: string;
  campo: keyof TablaNutricional;
  unidad: string;
  limiteCL: number;
  limiteEU: number;
}[] = [
  {
    key: "azucares",
    label: "Azúcares",
    campo: "azucares_g",
    unidad: "g",
    limiteCL: 22.5,
    limiteEU: 22.5,
  },
  {
    key: "sodio",
    label: "Sodio",
    campo: "sodio_mg",
    unidad: "mg",
    limiteCL: 800,
    limiteEU: 600,
  },
  {
    key: "grasas_saturadas",
    label: "Grasas saturadas",
    campo: "grasas_saturadas_g",
    unidad: "g",
    limiteCL: 6,
    limiteEU: 5,
  },
  {
    key: "calorias",
    label: "Calorías",
    campo: "calorias_kcal",
    unidad: "kcal",
    limiteCL: 350,
    limiteEU: 400,
  },
];

export default function NormasComparison({ comparativa, tablaNutricional }: Props) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Comparativa CL vs. UE (por 100g)
        </h3>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        <div className="grid grid-cols-4 px-4 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <span>Nutriente</span>
          <span className="text-center">Valor</span>
          <span className="text-center">Norma CL</span>
          <span className="text-center">Norma UE</span>
        </div>

        {filas.map(({ key, label, campo, unidad, limiteCL, limiteEU }) => {
          const valor = tablaNutricional[campo] as number | null;
          const estadoCL = comparativa[key];
          const estadoEU = comparativa[key];

          return (
            <div
              key={key}
              className="grid grid-cols-4 px-4 py-2.5 text-sm items-center"
            >
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                {label}
              </span>
              <span className="text-center text-neutral-600 dark:text-neutral-400">
                {valor != null ? `${valor} ${unidad}` : "—"}
              </span>
              <span className="text-center">
                <Badge estado={estadoCL} limite={limiteCL} unidad={unidad} />
              </span>
              <span className="text-center">
                <Badge estado={estadoEU} limite={limiteEU} unidad={unidad} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Badge({
  estado,
  limite,
  unidad,
}: {
  estado?: "cumple" | "excede";
  limite: number;
  unidad: string;
}) {
  if (!estado) return <span className="text-neutral-400">—</span>;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        estado === "cumple"
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
      title={`Límite: ${limite} ${unidad}`}
    >
      {estado === "cumple" ? "✓ Cumple" : "✗ Excede"}
    </span>
  );
}
