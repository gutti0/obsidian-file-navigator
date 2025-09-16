import { describe, expect, it } from 'vitest';
import { Translator, readAppLocale, resolveLocale } from '../src/i18n';
import en from '../src/i18n/locales/en.json';
import ja from '../src/i18n/locales/ja.json';
import type { App } from 'obsidian';

const createApp = (config: Record<string, unknown>): App => {
  return new (class {
    vault = {
      getConfig: (key: string) => config[key]
    };
  })() as unknown as App;
};

describe('resolveLocale', () => {
  it('returns ja for Japanese locales', () => {
    expect(resolveLocale('ja')).toBe('ja');
    expect(resolveLocale('JA-jp')).toBe('ja');
  });

  it('falls back to en for unknown locales', () => {
    expect(resolveLocale('fr')).toBe('en');
    expect(resolveLocale(undefined)).toBe('en');
  });
});

describe('Translator', () => {
  it('uses fallback strings when key is missing', () => {
    const translator = new Translator('en');
    const key: keyof typeof en = 'commands.navigateNext';
    expect(translator.t(key)).toBe(en[key]);
  });

  it('switches locale dynamically', () => {
    const translator = new Translator('en');
    translator.setLocale('ja');
    const key: keyof typeof ja = 'commands.navigateLatest';
    expect(translator.t(key)).toBe(ja[key]);
  });
});

describe('readAppLocale', () => {
  it('prefers locale config key when available', () => {
    const app = createApp({ locale: 'ja' });
    expect(readAppLocale(app)).toBe('ja');
  });

  it('falls back to language key when locale is missing', () => {
    const app = createApp({ language: 'en-gb' });
    expect(readAppLocale(app)).toBe('en-gb');
  });

  it('returns undefined if config keys are missing', () => {
    const app = createApp({});
    expect(readAppLocale(app)).toBeUndefined();
  });
});
