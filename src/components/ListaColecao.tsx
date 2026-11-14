'use client';

import { useCallback, useMemo, useState } from 'react';
import CardJogo from './CardJogo';
import FormEditarJogo from './FormEditarJogo';
import Modal from './Modal';
import { ItemColecao, ROTULOS_STATUS, StatusJogo } from '@/types/colecao';

type Filtro = StatusJogo | 'todos';

export default function ListaColecao({ itens }: { itens: ItemColecao[] }) {
  const [emEdicao, setEmEdicao] = useState<ItemColecao | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  // Identidade estável: evita que o efeito de teclado do Modal
  // seja refeito a cada renderização desta lista.
  const fecharEdicao = useCallback(() => setEmEdicao(null), []);

  const quantidadePorStatus = useMemo(() => {
    const contagem: Partial<Record<StatusJogo, number>> = {};
    for (const item of itens) {
      contagem[item.status] = (contagem[item.status] ?? 0) + 1;
    }
    return contagem;
  }, [itens]);

  const itensVisiveis = useMemo(
    () => (filtro === 'todos' ? itens : itens.filter((item) => item.status === filtro)),
    [itens, filtro]
  );

  const opcoes: { valor: Filtro; rotulo: string; quantidade: number }[] = [
    { valor: 'todos', rotulo: 'Todos', quantidade: itens.length },
    ...(Object.keys(ROTULOS_STATUS) as StatusJogo[]).map((status) => ({
      valor: status,
      rotulo: ROTULOS_STATUS[status],
      quantidade: quantidadePorStatus[status] ?? 0,
    })),
  ];

  return (
    <>
      {itens.length > 0 && (
        <div
          role="group"
          aria-label="Filtrar por status"
          className="mb-6 flex flex-wrap gap-2"
        >
          {opcoes.map((opcao) => {
            const ativo = filtro === opcao.valor;

            return (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => setFiltro(opcao.valor)}
                aria-pressed={ativo}
                className={`rounded-full border px-3 py-1 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                  ativo
                    ? 'border-violet-400 bg-violet-500/20 text-violet-100'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-100'
                }`}
              >
                {opcao.rotulo}
                <span className={ativo ? 'ml-1.5 text-violet-300' : 'ml-1.5 text-zinc-600'}>
                  {opcao.quantidade}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {itens.length > 0 && itensVisiveis.length === 0 && (
        <p className="py-12 text-center text-sm text-zinc-500">
          Nenhum jogo com esse status.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {itensVisiveis.map((item) => (
          <CardJogo key={item.id} item={item} onEditar={setEmEdicao} />
        ))}
      </div>

      {emEdicao && (
        <Modal titulo={emEdicao.title} onFechar={fecharEdicao}>
          <FormEditarJogo item={emEdicao} onFechar={fecharEdicao} />
        </Modal>
      )}
    </>
  );
}