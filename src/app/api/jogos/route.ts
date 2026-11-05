type IgdbJogo = {
  id: number;
  name: string;
  cover?: { image_id: string };
  platforms?: { name: string }[];
};

// O token de acesso vale ~60 dias. Guardamos em memória para não
// pedir um novo a cada busca; se a função esfriar, pede de novo.
let tokenCache: { valor: string; expiraEm: number } | null = null;

async function obterToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiraEm) {
    return tokenCache.valor;
  }

  const url = new URL('https://id.twitch.tv/oauth2/token');
  url.searchParams.set('client_id', process.env.TWITCH_CLIENT_ID!);
  url.searchParams.set('client_secret', process.env.TWITCH_CLIENT_SECRET!);
  url.searchParams.set('grant_type', 'client_credentials');

  const resposta = await fetch(url, { method: 'POST', cache: 'no-store' });

  if (!resposta.ok) {
    console.error(
      'Token Twitch falhou | status:', resposta.status,
      '| id presente:', Boolean(process.env.TWITCH_CLIENT_ID),
      '| secret presente:', Boolean(process.env.TWITCH_CLIENT_SECRET)
    );
    throw new Error(`Falha ao obter token: ${resposta.status}`);
  }

  const dados = await resposta.json();

  tokenCache = {
    valor: dados.access_token,
    // margem de 60s para nunca usar um token prestes a expirar
    expiraEm: Date.now() + (dados.expires_in - 60) * 1000,
  };

  return tokenCache.valor;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const termo = searchParams.get('q')?.trim() ?? '';

  if (termo.length < 2) {
    return Response.json({ resultados: [] });
  }

  try {
    const token = await obterToken();

    // Apicalypse: linguagem de consulta da IGDB, enviada no corpo do POST.
    // As aspas são removidas do termo para não quebrar a sintaxe.
    const consulta = `
      search "${termo.replace(/"/g, '')}";
      fields name, cover.image_id, platforms.name;
      limit 12;
    `;

    const resposta = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
      },
      body: consulta,
      // Sem cache: uma resposta com erro ficaria congelada por uma hora,
      // problema que enfrentamos com a API anterior.
      cache: 'no-store',
    });

    if (!resposta.ok) {
      console.error('IGDB falhou | status:', resposta.status, '| corpo:', await resposta.text());
      return Response.json(
        { erro: 'Não foi possível buscar jogos agora.' },
        { status: 502 }
      );
    }

    const jogos: IgdbJogo[] = await resposta.json();

    // Mesmos quatro campos de antes: a tela de busca não muda.
    const resultados = jogos.map((jogo) => ({
      external_id: String(jogo.id),
      title: jogo.name,
      cover_url: jogo.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${jogo.cover.image_id}.jpg`
        : null,
      platforms: jogo.platforms?.map((p) => p.name) ?? [],
    }));

    return Response.json({ resultados });
  } catch (e) {
    console.error('Erro na busca:', e);
    return Response.json(
      { erro: 'Não foi possível buscar jogos agora.' },
      { status: 502 }
    );
  }
}