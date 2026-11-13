import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

function renderizarModal(onFechar = vi.fn()) {
  const utilitarios = render(
    <Modal titulo="Editar jogo" onFechar={onFechar}>
      <input aria-label="Plataforma" />
      <button type="button">Salvar</button>
    </Modal>
  );
  return { onFechar, ...utilitarios };
}

describe('Modal', () => {
  it('exibe o conteúdo dentro de um diálogo nomeado pelo título', () => {
    renderizarModal();

    expect(screen.getByRole('dialog', { name: 'Editar jogo' })).toBeInTheDocument();
    expect(screen.getByLabelText('Plataforma')).toBeInTheDocument();
  });

  it('fecha ao pressionar Esc', () => {
    const { onFechar } = renderizarModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  it('fecha ao clicar no fundo escuro', () => {
    const { onFechar } = renderizarModal();
    const fundo = screen.getByRole('dialog').parentElement!;

    fireEvent.click(fundo);

    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  it('não fecha ao clicar dentro da caixa', () => {
    const { onFechar } = renderizarModal();

    fireEvent.click(screen.getByRole('dialog'));
    fireEvent.click(screen.getByLabelText('Plataforma'));

    expect(onFechar).not.toHaveBeenCalled();
  });

  it('fecha pelo botão de fechar', () => {
    const { onFechar } = renderizarModal();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  it('foca o primeiro campo ao abrir, e não o botão de fechar', () => {
    renderizarModal();

    expect(screen.getByLabelText('Plataforma')).toHaveFocus();
  });

  it('mantém o foco dentro do diálogo ao navegar com Tab', () => {
    renderizarModal();
    const botaoFechar = screen.getByRole('button', { name: 'Fechar' });
    const ultimo = screen.getByRole('button', { name: 'Salvar' });

    ultimo.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(botaoFechar).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(ultimo).toHaveFocus();
  });

  it('devolve o foco ao elemento anterior quando é fechado', () => {
    const gatilho = document.createElement('button');
    document.body.appendChild(gatilho);
    gatilho.focus();

    const { unmount } = renderizarModal();
    expect(gatilho).not.toHaveFocus();

    unmount();
    expect(gatilho).toHaveFocus();

    gatilho.remove();
  });

  it('trava a rolagem da página enquanto está aberto', () => {
    const { unmount } = renderizarModal();
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});