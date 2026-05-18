import type { Aditivo } from "@/types";

interface Props {
  aditivo: Aditivo;
}

const styles = {
  bajo: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  medio: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  alto: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
};

const riesgoLabel = { bajo: "Riesgo bajo", medio: "Riesgo medio", alto: "Riesgo alto" };

export default function AditivoTag({ aditivo }: Props) {
  const s = styles[aditivo.riesgo];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}
      title={riesgoLabel[aditivo.riesgo]}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} aria-hidden="true" />
      <span className="font-mono font-semibold">{aditivo.codigo_e}</span>
      <span>{aditivo.nombre}</span>
    </span>
  );
}
