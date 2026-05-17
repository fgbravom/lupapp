import type { Aditivo } from "@/types";

interface Props {
  aditivo: Aditivo;
}

const colores = {
  bajo: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
  medio:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300",
  alto: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300",
};

const etiquetas = {
  bajo: "Riesgo bajo",
  medio: "Riesgo medio",
  alto: "Riesgo alto",
};

export default function AditivoTag({ aditivo }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colores[aditivo.riesgo]}`}
      title={etiquetas[aditivo.riesgo]}
    >
      <span className="font-mono">{aditivo.codigo_e}</span>
      <span>{aditivo.nombre}</span>
    </span>
  );
}
