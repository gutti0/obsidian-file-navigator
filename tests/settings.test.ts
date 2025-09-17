import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, createId } from '../src/settings';

describe('DEFAULT_SETTINGS', () => {
  it('initialises without groups', () => {
    expect(Array.isArray(DEFAULT_SETTINGS.groups)).toBe(true);
    expect(DEFAULT_SETTINGS.groups).toHaveLength(0);
  });
});

describe('createId', () => {
  it('generates an identifier string', () => {
    const id = createId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('falls back when crypto.randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', undefined as unknown as Crypto);
    const id = createId();
    expect(id.startsWith('fn_')).toBe(true);
    vi.unstubAllGlobals();
  });
});
