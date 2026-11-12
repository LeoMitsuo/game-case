'use client';

import { useCallback, useState } from 'react';
import CardJogo from './CardJogo';
import FormEditarJogo from './FormEditarJogo';
import Modal from './Modal';
import { ItemColecao } from '@/types/colecao';

export default function ListaColecao({ itens }: { itens: ItemColecao[] }) {
  const [emEdicao, setEmEdicao] = useState<ItemColecao | null>(null);

  // Identidade estável: evita que o efeito de teclado do Modal
  // seja refeito a cada renderização desta lista.
  const fecharEdicao = useCallback(() => setEmEdicao(null), []);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {itens.map((item) => (
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