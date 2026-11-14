'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PainelMarca from '@/components/PainelMarca';

const MENSAGENS_DE_ERRO: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
  over_request_rate_limit: 'Muitas tentativas. Aguarde alguns instantes.',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro(
        MENSAGENS_DE_ERRO[error.code ?? ''] ??
        'Não foi possível entrar. Tente novamente.'
      );
      setCarregando(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <PainelMarca />

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <img
            src="/logo-horizontal.svg"
            alt="Game Case"
            width={179}
            height={60}
            className="mb-10 h-10 w-auto lg:hidden"
          />

          <div className="mb-8">
            <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300">
              Bem-vindo de volta
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-zinc-50">
              Entrar na sua conta
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Acesse sua estante e continue de onde parou.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                disabled={carregando}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                disabled={carregando}
              />
            </div>

            {erro && (
              <p
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300"
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Não tem conta?{' '}
            <Link href="/cadastro" className="font-medium text-violet-400 hover:text-violet-300">
              Criar conta
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
