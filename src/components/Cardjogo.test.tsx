import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';
import CardJogo from './CardJogo';
import { ItemColecao } from '@/types/colecao';

const itemBase: ItemColecao = {
  id: 'abc',
  user_id: 'user-1',
  external_id: '3498',
  title: 'Grand Theft Auto V',
  cover_url: null,
  platform: 'PlayStation 5',
  status: 'finished',
  rating: 9,
  notes: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('CardJogo', () => {
  test('exibe título, status traduzido, nota e plataforma', () => {
    render(<CardJogo item={itemBase} onEditar={vi.fn()} />);

    expect(screen.getByText('Grand Theft Auto V')).toBeInTheDocument();
    expect(screen.getByText('Zerado')).toBeInTheDocument();
    expect(screen.getByText('9/10')).toBeInTheDocument();
    expect(screen.getByText('PlayStation 5')).toBeInTheDocument();
  });

  test('mostra o texto alternativo quando não há capa', () => {
    render(<CardJogo item={itemBase} onEditar={vi.fn()} />);
    expect(screen.getByText('Sem capa')).toBeInTheDocument();
  });

  test('renderiza a imagem com alt descritivo quando há capa', () => {
    render(
      <CardJogo
        item={{ ...itemBase, cover_url: 'https://exemplo.com/capa.jpg' }}
        onEditar={vi.fn()}
      />
    );

    expect(
      screen.getByAltText('Capa de Grand Theft Auto V')
    ).toBeInTheDocument();
  });

  test('omite a nota quando ela não foi preenchida', () => {
    render(<CardJogo item={{ ...itemBase, rating: null }} onEditar={vi.fn()} />);
    expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();
  });

  test('chama onEditar com o item ao clicar no card', async () => {
    const aoEditar = vi.fn();
    render(<CardJogo item={itemBase} onEditar={aoEditar} />);

    await userEvent.click(screen.getByRole('button'));

    expect(aoEditar).toHaveBeenCalledWith(itemBase);
  });
});