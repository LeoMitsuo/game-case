import { describe, test, expect } from 'vitest';
import { schemaItem } from './validacao';

describe('schemaItem', () => {
  test('aceita dados válidos', () => {
    const r = schemaItem.safeParse({
      status: 'playing',
      platform: 'PC',
      rating: 8,
      notes: 'Ótimo jogo',
    });
    expect(r.success).toBe(true);
  });

  test('rejeita nota acima de 10', () => {
    const r = schemaItem.safeParse({
      status: 'playing',
      platform: 'PC',
      rating: 11,
      notes: null,
    });
    expect(r.success).toBe(false);
  });

  test('rejeita status fora da lista permitida', () => {
    const r = schemaItem.safeParse({
      status: 'jogando',
      platform: null,
      rating: null,
      notes: null,
    });
    expect(r.success).toBe(false);
  });

  test('converte nota enviada como texto pelo formulário', () => {
    const r = schemaItem.safeParse({
      status: 'finished',
      platform: null,
      rating: '7',
      notes: null,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.rating).toBe(7);
  });

  test('rejeita anotação acima de 500 caracteres', () => {
    const r = schemaItem.safeParse({
      status: 'backlog',
      platform: null,
      rating: null,
      notes: 'a'.repeat(501),
    });
    expect(r.success).toBe(false);
  });
});