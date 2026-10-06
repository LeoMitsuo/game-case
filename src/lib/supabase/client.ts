import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente do Supabase para código que roda no NAVEGADOR.
 * Usado em Client Components (arquivos com "use client").
 *
 * Lê a sessão dos cookies do navegador automaticamente.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
