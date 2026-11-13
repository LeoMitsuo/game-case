'use client';

import { useEffect } from 'react';
import { useToast, TipoToast } from '@/lib/toast';

const ESTILOS: Record<TipoToast, string> = {
  sucesso: 'border-emerald-600/40 bg-emerald-950/90 text-emerald-100',
  aviso: 'border-amber-600/40 bg-amber-950/90 text-amber-100',
  erro: 'border-red-600/40 bg-red-950/90 text-red-100',
};

const DURACAO = 4000;

export default function Toast() {
  const aviso = useToast((estado) => estado.aviso);
  const fechar = useToast((estado) => estado.fechar);

  const idAviso = aviso?.id;

  useEffect(() => {
    if (!idAviso) return;
    const temporizador = setTimeout(fechar, DURACAO);
    return () => clearTimeout(temporizador);
  }, [idAviso, fechar]);

  if (!aviso) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-entrada fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${ESTILOS[aviso.tipo]}`}
    >
      <span>{aviso.texto}</span>
      <button
        type="button"
        onClick={fechar}
        aria-label="Fechar aviso"
        className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
      >
        ✕
      </button>
    </div>
  );
}