'use client';

import { useEffect, useRef } from 'react';

const SELETOR_FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ModalProps = {
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
};

export default function Modal({ titulo, onFechar, children }: ModalProps) {
  const referenciaCaixa = useRef<HTMLDivElement>(null);

  // Esc fecha; Tab circula apenas dentro do modal.
  useEffect(() => {
    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        onFechar();
        return;
      }

      if (evento.key !== 'Tab') return;

      const caixa = referenciaCaixa.current;
      if (!caixa) return;

      const focaveis = caixa.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS);
      if (focaveis.length === 0) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener('keydown', aoPressionarTecla);
    return () => document.removeEventListener('keydown', aoPressionarTecla);
  }, [onFechar]);

  // Foca o primeiro campo (nunca o botão de fechar) e devolve o foco ao sair.
  useEffect(() => {
    const elementoAnterior = document.activeElement as HTMLElement | null;

    const focaveis = referenciaCaixa.current?.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS);
    const primeiroCampo = Array.from(focaveis ?? []).find(
      (elemento) => !elemento.hasAttribute('data-fechar')
    );
    (primeiroCampo ?? focaveis?.[0])?.focus();

    return () => elementoAnterior?.focus();
  }, []);

  // Impede a página de fundo de rolar enquanto o modal está aberto.
  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onFechar();
      }}
    >
      <div
        ref={referenciaCaixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        className="relative w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
      >
        <button
          type="button"
          data-fechar
          onClick={onFechar}
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          ✕
        </button>

        <h2 id="titulo-modal" className="mb-4 pr-8 font-display text-lg font-semibold text-zinc-100">
          {titulo}
        </h2>

        {children}
      </div>
    </div>
  );
}