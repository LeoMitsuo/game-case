import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Rotas acessíveis sem login. Todo o resto exige sessão.
const ROTAS_PUBLICAS = ['/login', '/cadastro', '/auth'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Atualiza os cookies na requisição e na resposta:
          // a requisição para que o resto do fluxo já enxergue o
          // token novo, a resposta para que o navegador o guarde.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() valida o token junto ao servidor do Supabase.
  // Nunca use getSession() para decidir acesso: ele apenas lê o
  // cookie, que pode ter sido forjado no navegador.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ehRotaPublica = ROTAS_PUBLICAS.some((rota) =>
    request.nextUrl.pathname.startsWith(rota)
  );

  // Visitante sem sessão tentando acessar área protegida
  if (!user && !ehRotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Usuário logado não precisa ver login nem cadastro
  if (user && ehRotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Ignora arquivos estáticos e imagens: middleware neles seria
  // custo por requisição sem nenhum ganho.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
