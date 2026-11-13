'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useToast, TipoToast } from '@/lib/toast';

type JogoEncontrado = {
  external_id: string;
  title: string;
  cover_url: string | null;
  platforms: string[];
};

// Erro que carrega o tipo de aviso que deve aparecer na tela.
class ErroAplicacao extends Error {
  tipo: TipoToast;
  constructor(mensagem: string, tipo: TipoToast) {
    super(mensagem);
    this.tipo = tipo;
  }
}

export default function BuscarPage() {
  const [termo, setTermo] = useState('');
  const [termoBusca, setTermoBusca] = useState('');

  const router = useRouter();
  const supabase = createClient();
  const mostrarAviso = useToast((estado) => estado.mostrar);

  // Debounce: o termo digitado só vira termo de busca 400ms depois da última tecla.
  useEffect(() => {
    const temporizador = setTimeout(() => setTermoBusca(termo), 400);
    return () => clearTimeout(temporizador);
  }, [termo]);

  const habilitada = termoBusca.trim().length >= 2;

  const {
    data: resultados = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['jogos', termoBusca],
    // O signal vem do próprio React Query: ele aborta a requisição anterior
    // quando a queryKey muda, sem AbortController manual.
    queryFn: async ({ signal }) => {
      const resposta = await fetch(`/api/jogos?q=${encodeURIComponent(termoBusca)}`, { signal });
      if (!resposta.ok) throw new Error('Falha na busca');
      const dados = await resposta.json();
      return dados.resultados as JogoEncontrado[];
    },
    enabled: habilitada,
  });

  const adicionar = useMutation({
    mutationFn: async (jogo: JogoEncontrado) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new ErroAplicacao('Sessão expirada. Entre novamente.', 'aviso');

      const { error } = await supabase.from('collection_items').insert({
        user_id: user.id,
        external_id: jogo.external_id,
        title: jogo.title,
        cover_url: jogo.cover_url,
        platform: jogo.platforms[0] ?? null,
        status: 'backlog',
      });

      // 23505 = violação de índice único: o jogo já está na coleção
      if (error?.code === '23505') {
        throw new ErroAplicacao('Esse jogo já está na sua coleção.', 'aviso');
      }
      if (error) {
        throw new ErroAplicacao('Não foi possível adicionar. Tente novamente.', 'erro');
      }

      return jogo;
    },
    onSuccess: (jogo) => {
      router.refresh();
      mostrarAviso(`${jogo.title} adicionado à coleção.`, 'sucesso');
    },
    onError: (erro) => {
      const tipo = erro instanceof ErroAplicacao ? erro.tipo : 'erro';
      mostrarAviso(erro.message, tipo);
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <h1 className="text-lg font-bold text-zinc-50">Buscar jogos</h1>
        <Link href="/" className="text-sm text-zinc-400 transition hover:text-zinc-100">
          Minha coleção
        </Link>
      </header>

      <div className="px-6 py-8">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Digite o nome de um jogo..."
          aria-label="Buscar jogos"
          className="w-full max-w-lg rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        {isError && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            Não foi possível buscar agora. Tente novamente.
          </p>
        )}

        {isFetching && <p className="mt-6 text-sm text-zinc-500">Buscando...</p>}

        {!isFetching && habilitada && resultados.length === 0 && !isError && (
          <p className="mt-6 text-sm text-zinc-500">Nenhum jogo encontrado para “{termoBusca}”.</p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {resultados.map((jogo) => {
            const salvandoEste =
              adicionar.isPending && adicionar.variables?.external_id === jogo.external_id;

            return (
              <article
                key={jogo.external_id}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
              >
                <div className="aspect-video bg-zinc-800">
                  {jogo.cover_url ? (
                    <img
                      src={jogo.cover_url}
                      alt={`Capa de ${jogo.title}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                      Sem capa
                    </div>
                  )}
                </div>

                <div className="space-y-2 p-3">
                  <h2 className="line-clamp-2 text-sm font-medium text-zinc-100">{jogo.title}</h2>
                  <p className="line-clamp-1 text-xs text-zinc-500">
                    {jogo.platforms.slice(0, 3).join(' · ')}
                  </p>
                  <button
                    type="button"
                    onClick={() => adicionar.mutate(jogo)}
                    disabled={salvandoEste}
                    className="w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {salvandoEste ? 'Adicionando...' : 'Adicionar'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <footer className="border-t border-zinc-800 px-6 py-4">
        <p className="text-xs text-zinc-600">
          Dados e imagens fornecidos por{' '}
          <a
            href="https://www.igdb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-400"
          >
            IGDB
          </a>
        </p>
      </footer>
    </main>
  );
}