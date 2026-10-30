'use client';

import { useState } from 'react';
import CardJogo from './CardJogo';
import FormEditarJogo from './FormEditarJogo';
import { ItemColecao } from '@/types/colecao';

export default function ListaColecao({ itens }: { itens: ItemColecao[] }) {
  const [emEdicao, setEmEdicao] = useState<ItemColecao | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {itens.map((item) => (
          <CardJogo key={item.id} item={item} onEditar={setEmEdicao} />
        ))}
      </div>

      {emEdicao && (
        <FormEditarJogo item={emEdicao} onFechar={() => setEmEdicao(null)} />
      )}
    </>
  );
}