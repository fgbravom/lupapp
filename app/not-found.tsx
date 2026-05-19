import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center space-y-4 py-16">
      <div className="text-6xl">🔍</div>
      <h1 className="font-black text-3xl text-neutral-900 dark:text-white">
        Aquí no hay nada
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400">
        Esta página no existe... pero si buscabas un producto, te ayudamos igual.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors"
      >
        Ir a buscar
      </Link>
    </div>
  );
}
