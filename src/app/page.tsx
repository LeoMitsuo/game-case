import { createClient } from '@/lib/supabase/server';
import BotaoSair from '@/components/BotaoSair';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-zinc-50">Game Case</h1>
          <p className="text-xs text-zinc-500">{user?.email}</p>
        </div>
        <BotaoSair />
      </header>

      <div className="px-6 py-10">
        <p className="text-zinc-400">Sua coleção aparecerá aqui.</p>
      </div>
    </main>
  );
}