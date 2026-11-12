'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Toast, { TipoToast } from '@/components/Toast';

type JogoEncontrado = {
  external_id: string;
  title: string;
  cover_url: string | null;
  platforms: string[];
};

export default function BuscarPage() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<JogoEncontrado[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{
    id: number;
    texto: string;
    tipo: TipoToast;
  } | null>(null);

  const controladorRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Identidade estável: sem isso o efeito do Toast se refaz a cada
  // renderização e o cronômetro de 4s nunca chega ao fim.
  const fecharMensagem = useCallback(() => setMensagem(null), []);

  // O id garante que cada aviso seja um componente novo (ver key no JSX),
  // reiniciando o cronômetro mesmo quando o texto se repete.
  function mostrarAviso(texto: string, tipo: TipoToast) {
    setMensagem({ id: Date.now(), texto, tipo });
  }

  // Debounce: só busca 400ms depois que o usuário para de digitar.
  // A limpeza do efeito cancela o agendamento anterior a cada tecla.
  useEffect(() => {
    if (termo.trim().length < 2) {
      setResultados([]);
      return;
    }

    const temporizador = setTimeout(() => {
      buscar(termo);
    }, 400);

    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termo]);

  async function buscar(valor: string) {
    // Aborta a busca anterior para evitar que uma resposta atrasada
    // sobrescreva o resultado da busca mais recente.
    controladorRef.current?.abort();
    const controlador = new AbortController();
    controladorRef.current = controlador;

    setCarregando(true);
    setErro(null);

    try {
      const resposta = await fetch(
        `/api/jogos?q=${encodeURIComponent(valor)}`,
        { signal: controlador.signal }
      );

      if (!resposta.ok) throw new Error();

      const dados = await resposta.json();
      setResultados(dados.resultados);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setErro('Não foi possível buscar agora. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  async function adicionar(jogo: JogoEncontrado) {
    setSalvando(jogo.external_id);
    setMensagem(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      mostrarAviso('Sessão expirada. Entre novamente.', 'aviso');
      setSalvando(null);
      return;
    }

    const { error } = await supabase.from('collection_items').insert({
      user_id: user.id,
      external_id: jogo.external_id,
      title: jogo.title,
      cover_url: jogo.cover_url,
      platform: jogo.platforms[0] ?? null,
      status: 'backlog',
    });

    if (error) {
      // 23505 = violação de índice único: o jogo já está na coleção
      if (error.code === '23505') {
        mostrarAviso('Esse jogo já está na sua coleção.', 'aviso');
      } else {
        mostrarAviso('Não foi possível adicionar. Tente novamente.', 'erro');
      }
      setSalvando(null);
      return;
    }

    router.refresh();
    mostrarAviso(`${jogo.title} adicionado à coleção.`, 'sucesso');
    setSalvando(null);
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <h1 className="text-lg font-bold text-zinc-50">Buscar jogos</h1>
        <Link
          href="/"
          className="text-sm text-zinc-400 transition hover:text-zinc-100"
        >
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

        {erro && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {erro}
          </p>
        )}

        {carregando && (
          <p className="mt-6 text-sm text-zinc-500">Buscando...</p>
        )}

        {!carregando && termo.trim().length >= 2 && resultados.length === 0 && !erro && (
          <p className="mt-6 text-sm text-zinc-500">
            Nenhum jogo encontrado para “{termo}”.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {resultados.map((jogo) => (
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
                <h2 className="line-clamp-2 text-sm font-medium text-zinc-100">
                  {jogo.title}
                </h2>
                <p className="line-clamp-1 text-xs text-zinc-500">
                  {jogo.platforms.slice(0, 3).join(' · ')}
                </p>
                <button
                  type="button"
                  onClick={() => adicionar(jogo)}
                  disabled={salvando === jogo.external_id}
                  className="w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  {salvando === jogo.external_id ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <footer className="border-t border-zinc-800 px-6 py-4">
        <p className="text-xs text-zinc-600">
          Dados e imagens fornecidos por{' '}
          <a href="https://www.igdb.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-400">
            IGDB
          </a>
        </p>
      </footer>

      {mensagem && (
        <Toast
          key={mensagem.id}
          texto={mensagem.texto}
          tipo={mensagem.tipo}
          onFechar={fecharMensagem}
        />
      )}
    </main>
  );
}