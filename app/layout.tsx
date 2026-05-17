import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";
import AnalizarModal from "@/components/AnalizarModal";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lupapp — Ponemos los alimentos chilenos bajo la lupa",
  description:
    "Analiza ingredientes y tabla nutricional de productos vendidos en Chile. Calificamos del 1.0 al 7.0 según la Ley 20.606.",
  keywords: ["alimentos Chile", "sellos nutricionales", "Ley 20.606", "etiquetado"],
  openGraph: {
    title: "Lupapp",
    description: "Ponemos los alimentos chilenos bajo la lupa",
    locale: "es_CL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-40">
              <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                <a
                  href="/"
                  className="font-syne font-black text-xl text-neutral-900 dark:text-white tracking-tight"
                >
                  🔍 Lupapp
                </a>
                <div className="flex items-center gap-3">
                  <AnalizarModal
                    label="Analizar"
                    className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>

            <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-16 py-8">
              <div className="max-w-3xl mx-auto px-4 text-center space-y-2">
                <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">
                  App informativa. No reemplaza consejo nutricional profesional.
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Lupapp es open source (MIT) —{" "}
                  <a
                    href="https://github.com"
                    className="underline hover:text-neutral-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>{" "}
                  ·{" "}
                  <a
                    href="https://ko-fi.com"
                    className="underline hover:text-neutral-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ko-fi
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
