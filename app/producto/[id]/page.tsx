import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { obtenerProducto } from "@/lib/insforge";
import ResultCard from "@/components/ResultCard";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const producto = await obtenerProducto(params.id);
  if (!producto) return { title: "Producto no encontrado — Lupapp" };

  return {
    title: `${producto.nombre} — Lupapp`,
    description: `Nota: ${producto.nota_cl}/7.0. ${producto.sellos_cl.join(", ")}`,
  };
}

export default async function ProductoPage({ params }: Props) {
  const producto = await obtenerProducto(params.id);
  if (!producto) notFound();

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-700 dark:hover:text-neutral-200">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/analizar" className="hover:text-neutral-700 dark:hover:text-neutral-200">
          Analizar
        </Link>
        <span>/</span>
        <span className="text-neutral-700 dark:text-neutral-200 truncate max-w-[200px]">
          {producto.nombre}
        </span>
      </nav>

      <ResultCard producto={producto} />

      {/* Metadatos adicionales */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-100 dark:divide-neutral-800">
        {[
          { label: "Elaborado por", valor: producto.elaborado_por },
          { label: "Registro sanitario", valor: producto.registro_sanitario },
          { label: "Código de barras", valor: producto.codigo_barras },
          {
            label: "Primera vez escaneado",
            valor: new Date(producto.creado_en).toLocaleDateString("es-CL"),
          },
        ]
          .filter((f) => f.valor)
          .map(({ label, valor }) => (
            <div key={label} className="grid grid-cols-2 px-4 py-2.5 text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
              <span className="text-neutral-800 dark:text-neutral-200">{valor}</span>
            </div>
          ))}
      </div>

      {/* Ingredientes */}
      {producto.ingredientes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wide">
            Ingredientes
          </h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {producto.ingredientes.join(", ")}
          </p>
        </div>
      )}

      {/* Reportar error */}
      <div className="text-center pt-4">
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          ¿Los datos no son correctos?{" "}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-neutral-600"
          >
            Reportar en GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
