export type StatusJogo = 'playing' | 'finished' | 'backlog' | 'dropped';

export const ROTULOS_STATUS: Record<StatusJogo, string> = {
  playing: 'Jogando',
  finished: 'Zerado',
  backlog: 'Quero jogar',
  dropped: 'Abandonado',
};

export type ItemColecao = {
  id: string;
  user_id: string;
  external_id: string;
  title: string;
  cover_url: string | null;
  platform: string | null;
  status: StatusJogo;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};