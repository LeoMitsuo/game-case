import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BotaoSair from '@/components/BotaoSair';
import ListaColecao from '@/components/ListaColecao';
import { ItemColecao } from '@/types/colecao';

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sem filtro por user_id: o Row Level Security já restringe
  // as linhas ao usuário do JWT desta requisição.
  const { data: itens, error } = await supabase
    .from('collection_items')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div>
          <h1>
            <img
              src="/logo-horizontal.svg"
              alt="Game Case"
              width={119}
              height={40}
              className="h-9 w-auto"
            />
          </h1>
          <p className="mt-1 text-xs text-zinc-500">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/buscar"
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500"
          >
            Adicionar jogo
          </Link>
          <BotaoSair />
        </div>
      </header>

      <div className="px-6 py-8">
        {error ? (
          <p role="alert" className="text-sm text-red-400">
            Não foi possível carregar sua coleção. Tente recarregar a página.
          </p>
        ) : !itens || itens.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-zinc-300">Sua coleção está vazia.</p>
            <p className="mt-1 text-sm text-zinc-500">
              Busque um jogo e adicione o primeiro à sua estante.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-zinc-500">
              {itens.length} {itens.length === 1 ? 'jogo' : 'jogos'}
            </p>
            <ListaColecao itens={itens as ItemColecao[]} />
          </>
        )}
      </div>
    </main>
  );
}