'use client';

import { useId, useState } from 'react';
import { ItemColecao, ROTULOS_STATUS } from '@/types/colecao';

const CORES_STATUS: Record<string, string> = {
  playing: 'bg-emerald-500/15 text-emerald-400',
  finished: 'bg-blue-500/15 text-blue-400',
  backlog: 'bg-zinc-500/15 text-zinc-400',
  dropped: 'bg-red-500/15 text-red-400',
};

export default function CardJogo({
  item,
  onEditar,
}: {
  item: ItemColecao;
  onEditar: (item: ItemColecao) => void;
}) {
  const [anotacoesAbertas, setAnotacoesAbertas] = useState(false);
  const idPainel = useId();

  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-600">
      <button
        type="button"
        onClick={() => onEditar(item)}
        className="flex flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400"
      >
        <div className="aspect-[3/4] w-full bg-zinc-800">
          {item.cover_url ? (
            <img
              src={item.cover_url}
              alt={`Capa de ${item.title}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-600">
              Sem capa
            </div>
          )}
        </div>

        <div className="w-full space-y-2 p-3">
          <h3 className="line-clamp-2 text-sm font-medium text-zinc-100">
            {item.title}
          </h3>

          <div className="flex items-center justify-between gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-xs ${CORES_STATUS[item.status]}`}
            >
              {ROTULOS_STATUS[item.status]}
            </span>
            {item.rating && (
              <span className="text-xs text-zinc-400">{item.rating}/10</span>
            )}
          </div>

          {item.platform && (
            <p className="text-xs text-zinc-500">{item.platform}</p>
          )}
        </div>
      </button>

      {item.notes && (
        <>
          {anotacoesAbertas && (
            <div
              id={idPainel}
              className="absolute inset-x-0 top-0 aspect-[3/4] overflow-y-auto bg-zinc-950/95 p-4"
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Anotações
              </p>
              <p className="whitespace-pre-wrap text-sm text-zinc-200">
                {item.notes}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setAnotacoesAbertas((abertas) => !abertas)}
            aria-expanded={anotacoesAbertas}
            aria-controls={idPainel}
            className="border-t border-zinc-800 px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-400"
          >
            {anotacoesAbertas ? 'Ocultar anotações' : 'Ver anotações'}
          </button>
        </>
      )}
    </article>
  );
}