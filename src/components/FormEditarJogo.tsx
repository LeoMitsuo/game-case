'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { schemaItem, DadosItem } from '@/lib/validacao';
import { useToast } from '@/lib/toast';
import { ItemColecao, ROTULOS_STATUS, StatusJogo } from '@/types/colecao';

export default function FormEditarJogo({
  item,
  onFechar,
}: {
  item: ItemColecao;
  onFechar: () => void;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const mostrarAviso = useToast((estado) => estado.mostrar);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosItem>({
    resolver: zodResolver(schemaItem),
    defaultValues: {
      status: item.status,
      platform: item.platform,
      rating: item.rating,
      notes: item.notes,
    },
  });

  async function salvar(dados: DadosItem) {
    setErro(null);

    const { error } = await supabase
      .from('collection_items')
      .update({ ...dados, updated_at: new Date().toISOString() })
      .eq('id', item.id);

    if (error) {
      setErro('Não foi possível salvar. Tente novamente.');
      return;
    }

    router.refresh();
    onFechar();
    mostrarAviso('Alterações salvas.', 'sucesso');
  }

  async function excluir() {
    if (!confirm(`Remover "${item.title}" da sua coleção?`)) return;

    setExcluindo(true);
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('id', item.id);

    if (error) {
      setErro('Não foi possível remover. Tente novamente.');
      setExcluindo(false);
      return;
    }

    router.refresh();
    onFechar();
    mostrarAviso(`${item.title} removido da coleção.`, 'sucesso');
  }

  return (
    <form onSubmit={handleSubmit(salvar)} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="status" className="block text-sm text-zinc-300">
          Status
        </label>
        <select
          id="status"
          {...register('status')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          {(Object.keys(ROTULOS_STATUS) as StatusJogo[]).map((s) => (
            <option key={s} value={s}>
              {ROTULOS_STATUS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="platform" className="block text-sm text-zinc-300">
          Plataforma
        </label>
        <input
          id="platform"
          {...register('platform', { setValueAs: (v) => (v === '' ? null : v) })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="rating" className="block text-sm text-zinc-300">
          Nota (1 a 10)
        </label>
        <input
          id="rating"
          type="number"
          min={1}
          max={10}
          {...register('rating', {
            setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
          })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        {errors.rating && (
          <p className="text-xs text-red-400">{errors.rating.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="notes" className="block text-sm text-zinc-300">
          Anotações
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register('notes', { setValueAs: (v) => (v === '' ? null : v) })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        {errors.notes && (
          <p className="text-xs text-red-400">{errors.notes.message}</p>
        )}
      </div>

      {erro && (
        <p role="alert" className="text-sm text-red-400">
          {erro}
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onFechar}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100"
        >
          Cancelar
        </button>
      </div>

      <button
        type="button"
        onClick={excluir}
        disabled={excluindo}
        className="w-full text-xs text-red-400 hover:text-red-300 disabled:opacity-60"
      >
        {excluindo ? 'Removendo...' : 'Remover da coleção'}
      </button>
    </form>
  );
}