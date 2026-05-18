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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-[var(--foreground)] truncate max-w-[240px]">{producto.nombre}</span>
      </nav>

      <ResultCard producto={producto} />

      {/* Metadatos */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border)]">
        {[
          { label: "Elaborado por",       valor: producto.elaborado_por },
          { label: "Registro sanitario",  valor: producto.registro_sanitario },
          { label: "Código de barras",    valor: producto.codigo_barras },
          { label: "Primera vez visto",   valor: new Date(producto.creado_en).toLocaleDateString("es-CL") },
        ]
          .filter((f) => f.valor)
          .map(({ label, valor }) => (
            <div key={label} className="grid grid-cols-2 px-4 py-2.5 text-sm">
              <span className="text-[var(--muted-foreground)]">{label}</span>
              <span className="text-[var(--foreground)]">{valor}</span>
            </div>
          ))}
      </div>

      {/* Ingredientes */}
      {producto.ingredientes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            Ingredientes
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            {producto.ingredientes.join(", ")}
          </p>
        </div>
      )}

      {/* Reportar error */}
      <div className="text-center pt-2">
        <p className="text-xs text-[var(--muted-foreground)]">
          ¿Los datos no son correctos?{" "}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[var(--foreground)] transition-colors"
          >
            Reportar en GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
