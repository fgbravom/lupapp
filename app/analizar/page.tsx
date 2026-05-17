import type { Metadata } from "next";
import BuscadorProducto from "@/components/BuscadorProducto";

export const metadata: Metadata = {
  title: "Analizar producto — Lupapp",
  description:
    "Fotografía o escanea cualquier alimento y recibe su calificación según la Ley 20.606.",
};

export default function AnalizarPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-syne font-black text-3xl text-neutral-900 dark:text-white">
          Analizar producto
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Busca por nombre, escanea el código de barras o fotografía la etiqueta.
        </p>
      </div>

      <BuscadorProducto />
    </div>
  );
}
