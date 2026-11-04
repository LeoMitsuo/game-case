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

  test('aceita nota nula quando o usuário não preenche', () => {
    const r = schemaItem.safeParse({
     status: 'backlog',
      platform: null,
      rating: null,
     notes: null,
    });
    expect(r.success).toBe(true);
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