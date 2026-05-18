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
  { key: "azucares",        label: "Azúcares",          campo: "azucares_g",        unidad: "g",    limiteCL: 22.5, limiteEU: 22.5 },
  { key: "sodio",           label: "Sodio",              campo: "sodio_mg",          unidad: "mg",   limiteCL: 800,  limiteEU: 600  },
  { key: "grasas_saturadas",label: "Grasas saturadas",   campo: "grasas_saturadas_g",unidad: "g",    limiteCL: 6,    limiteEU: 5    },
  { key: "calorias",        label: "Calorías",           campo: "calorias_kcal",     unidad: "kcal", limiteCL: 350,  limiteEU: 400  },
];

export default function NormasComparison({ comparativa, tablaNutricional }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
          Comparativa CL vs. UE (por 100g)
        </h3>
      </div>

      <div className="divide-y divide-[var(--border)]">
        <div className="grid grid-cols-4 px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)]">
          <span>Nutriente</span>
          <span className="text-center">Valor</span>
          <span className="text-center">Norma CL</span>
          <span className="text-center">Norma UE</span>
        </div>

        {filas.map(({ key, label, campo, unidad, limiteCL, limiteEU }) => {
          const valor = tablaNutricional[campo] as number | null;
          const estado = comparativa[key];
          return (
            <div key={key} className="grid grid-cols-4 px-4 py-3 text-sm items-center">
              <span className="text-[var(--foreground)] font-medium">{label}</span>
              <span className="text-center text-[var(--muted-foreground)] font-mono text-xs">
                {valor != null ? `${valor} ${unidad}` : "—"}
              </span>
              <span className="text-center">
                <NormaBadge estado={estado} limite={limiteCL} unidad={unidad} />
              </span>
              <span className="text-center">
                <NormaBadge estado={estado} limite={limiteEU} unidad={unidad} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NormaBadge({ estado, limite, unidad }: { estado?: "cumple" | "excede"; limite: number; unidad: string }) {
  if (!estado) return <span className="text-[var(--muted-foreground)] text-xs">—</span>;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
        estado === "cumple"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
          : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      }`}
      title={`Límite: ${limite} ${unidad}`}
    >
      {estado === "cumple" ? "✓ Cumple" : "✗ Excede"}
    </span>
  );
}
