type RawgJogo = {
  id: number;
  name: string;
  background_image: string | null;
  platforms: { platform: { name: string } }[] | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const termo = searchParams.get('q')?.trim() ?? '';

  if (termo.length < 2) {
    return Response.json({ resultados: [] });
  }

  const url = new URL('https://api.rawg.io/api/games');
  url.searchParams.set('key', process.env.RAWG_API_KEY!);
  url.searchParams.set('search', termo);
  url.searchParams.set('page_size', '12');

  try {
    // revalidate: cache da resposta por 1 hora, economizando cota da API
    const resposta = await fetch(url, { next: { revalidate: 3600 } });

    if (!resposta.ok) {
      console.error(
        'RAWG falhou | status:', resposta.status,
        '| chave presente:', Boolean(process.env.RAWG_API_KEY),
        '| tamanho da chave:', process.env.RAWG_API_KEY?.length
      );
      return Response.json(
        { erro: 'Não foi possível buscar jogos agora.' },
        { status: 502 }
      );
    }

    const dados = await resposta.json();

    // Devolvemos apenas os campos que a aplicação usa, já no formato
    // da nossa tabela. Trocar de API no futuro muda só este trecho.
    const resultados = dados.results.map((jogo: RawgJogo) => ({
      external_id: String(jogo.id),
      title: jogo.name,
      cover_url: jogo.background_image,
      platforms: jogo.platforms?.map((p) => p.platform.name) ?? [],
    }));

    return Response.json({ resultados });
  } catch (e) {
    console.error('RAWG erro de rede:', e);
    return Response.json(
      { erro: 'Não foi possível buscar jogos agora.' },
      { status: 502 }
    );
  }
}