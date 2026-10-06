import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente do Supabase para código que roda no SERVIDOR.
 * Usado em Server Components, Route Handlers e Server Actions.
 *
 * Precisa ser criado a cada requisição, porque lê os cookies
 * daquela requisição específica — não dá para reaproveitar
 * uma instância entre usuários diferentes.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components não podem escrever cookies.
            // Sem problema: o middleware já renova a sessão a cada
            // requisição, então essa escrita é redundante aqui.
          }
        },
      },
    }
  );
}
