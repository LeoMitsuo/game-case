'use client';

import { useEffect } from 'react';

export type TipoToast = 'sucesso' | 'aviso' | 'erro';

type ToastProps = {
  texto: string;
  tipo: TipoToast;
  onFechar: () => void;
  duracao?: number;
};

const ESTILOS: Record<TipoToast, string> = {
  sucesso: 'border-emerald-600/40 bg-emerald-950/90 text-emerald-100',
  aviso: 'border-amber-600/40 bg-amber-950/90 text-amber-100',
  erro: 'border-red-600/40 bg-red-950/90 text-red-100',
};

export default function Toast({ texto, tipo, onFechar, duracao = 4000 }: ToastProps) {
  useEffect(() => {
    const temporizador = setTimeout(onFechar, duracao);
    return () => clearTimeout(temporizador);
  }, [onFechar, duracao]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-entrada fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${ESTILOS[tipo]}`}
    >
      <span>{texto}</span>
      <button
        type="button"
        onClick={onFechar}
        aria-label="Fechar aviso"
        className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
      >
        ✕
      </button>
    </div>
  );
}