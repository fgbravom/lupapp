"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onDetectado: (codigo: string) => void;
  onCerrar: () => void;
}

export default function BarcodeScanner({ onDetectado, onCerrar }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let html5QrCode: unknown;

    async function iniciarScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!divRef.current) return;

        const id = "lupapp-barcode-reader";
        divRef.current.id = id;

        html5QrCode = new Html5Qrcode(id);
        scannerRef.current = html5QrCode;

        await (html5QrCode as { start: Function }).start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText: string) => {
            onDetectado(decodedText);
          },
          undefined
        );
      } catch (err) {
        setError(
          "No pudimos acceder a la cámara. Revisa los permisos del navegador e intenta de nuevo."
        );
        console.error(err);
      }
    }

    iniciarScanner();

    return () => {
      if (scannerRef.current) {
        const s = scannerRef.current as { stop: () => Promise<void>; clear: () => void };
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
      }
    };
  }, [onDetectado]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="font-bold text-neutral-900 dark:text-white">
            Escanear código
          </h2>
          <button
            onClick={onCerrar}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={onCerrar}
                className="mt-4 text-sm text-neutral-500 underline"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div
              ref={divRef}
              className="w-full rounded-lg overflow-hidden bg-black min-h-[200px]"
            />
          )}
          <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 mt-3">
            Apunta al código de barras del envase
          </p>
        </div>
      </div>
    </div>
  );
}
