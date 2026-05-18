import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";
import AnalizarModal from "@/components/AnalizarModal";
import Logo from "@/components/Logo";
import { IconGithub, IconCoffee } from "@/components/Icons";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import BuyMeCoffeeWidget from "@/components/BuyMeCoffeeWidget";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Lupapp — Ponemos los alimentos chilenos bajo la lupa",
  description:
    "Analiza ingredientes y tabla nutricional de productos vendidos en Chile. Calificamos del 1.0 al 7.0 según la Ley 20.606.",
  keywords: ["alimentos Chile", "sellos nutricionales", "Ley 20.606", "etiquetado"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Lupapp",
    description: "Ponemos los alimentos chilenos bajo la lupa",
    locale: "es_CL",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={cn("font-sans", dmSans.variable)}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

            {/* ── Header ───────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
              <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
                <a href="/" aria-label="Lupapp — inicio" className="flex-shrink-0">
                  <Logo size="md" variant="full" />
                </a>

                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* ── Contenido ─────────────────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-4 py-5 sm:py-10">{children}</main>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <footer className="border-t border-[var(--border)] mt-16">
              <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center sm:items-start gap-1">
                  <Logo size="sm" variant="full" />
                  <p className="text-xs text-[var(--muted-foreground)]">
                    App informativa. No reemplaza consejo nutricional profesional.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors"
                  >
                    <IconGithub size={14} />
                    GitHub
                  </a>
                  <a
                    href="https://www.buymeacoffee.com/fgbravom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors"
                  >
                    <IconCoffee size={14} />
                    Cafecito
                  </a>
                </div>
              </div>
            </footer>

          </div>
        </ThemeProvider>
        <BuyMeCoffeeWidget />
      </body>
    </html>
  );
}
