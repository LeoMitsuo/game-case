'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import PainelMarca from '@/components/PainelMarca';

const MENSAGENS_DE_ERRO: Record<string, string> = {
  user_already_exists: 'Já existe uma conta com esse e-mail.',
  weak_password: 'Senha muito fraca. Use ao menos 8 caracteres.',
  over_email_send_rate_limit: 'Muitas tentativas. Aguarde alguns minutos.',
  validation_failed: 'Verifique os dados informados.',
};

export default function CadastroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);

    if (password !== confirmacao) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setErro('A senha precisa ter ao menos 8 caracteres.');
      return;
    }

    setCarregando(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErro(
        MENSAGENS_DE_ERRO[error.code ?? ''] ??
          'Não foi possível criar a conta. Tente novamente.'
      );
      setCarregando(false);
      return;
    }

    // Com confirmação de e-mail desligada, a sessão já vem pronta.
    // Com ela ligada, session é null e mostramos a tela de aviso.
    if (data.session) {
      router.push('/');
      router.refresh();
      return;
    }

    setSucesso(true);
    setCarregando(false);
  }

  if (sucesso) {
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
            <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-50">
              Confira seu e-mail
            </h1>
            <p className="mt-3 text-sm text-zinc-400">
              Enviamos um link de confirmação para{' '}
              <strong className="text-zinc-200">{email}</strong>. Clique nele
              para ativar sua conta.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-medium text-violet-400 hover:text-violet-300"
            >
              Voltar para o login
            </Link>
          </div>
        </section>
      </main>
    );
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
              Comece agora
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-zinc-50">
              Criar conta
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Monte sua estante em poucos segundos.
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ao menos 8 caracteres"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                disabled={carregando}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmacao" className="block text-sm font-medium text-zinc-300">
                Confirmar senha
              </label>
              <input
                id="confirmacao"
                type="password"
                required
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                placeholder="••••••••"
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
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Já tem conta?{' '}
            <Link href="/login" className="font-medium text-violet-400 hover:text-violet-300">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
