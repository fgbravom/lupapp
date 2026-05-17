import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center space-y-4 py-16">
      <div className="text-6xl">🔍</div>
      <h1 className="font-syne font-black text-3xl text-neutral-900 dark:text-white">
        Página no encontrada
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400">
        Este producto o página no existe en Lupapp.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
