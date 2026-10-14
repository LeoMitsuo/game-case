import { createClient } from '@/lib/supabase/server';
import BotaoSair from '@/components/BotaoSair';
import CardJogo from '@/components/CardJogo';
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
          <h1 className="text-lg font-bold text-zinc-50">Game Case</h1>
          <p className="text-xs text-zinc-500">{user?.email}</p>
        </div>
        <BotaoSair />
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {(itens as ItemColecao[]).map((item) => (
                <CardJogo key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}