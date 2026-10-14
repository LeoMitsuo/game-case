import { ItemColecao, ROTULOS_STATUS } from '@/types/colecao';

const CORES_STATUS: Record<string, string> = {
  playing: 'bg-emerald-500/15 text-emerald-400',
  finished: 'bg-blue-500/15 text-blue-400',
  backlog: 'bg-zinc-500/15 text-zinc-400',
  dropped: 'bg-red-500/15 text-red-400',
};

export default function CardJogo({ item }: { item: ItemColecao }) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="aspect-[3/4] bg-zinc-800">
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

      <div className="space-y-2 p-3">
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
    </article>
  );
}