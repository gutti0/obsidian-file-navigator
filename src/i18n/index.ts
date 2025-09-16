import type { App } from 'obsidian';
import en from './locales/en.json';
import ja from './locales/ja.json';

const dictionaries = {
  en,
  ja
} as const;

export type LocaleCode = keyof typeof dictionaries;
export type TranslationKey = keyof typeof en;

const fallbackLocale: LocaleCode = 'en';

const normalize = (value?: string | LocaleCode): string => {
  if (!value) {
    return '';
  }
  return String(value).toLowerCase();
};

export const resolveLocale = (value?: string | LocaleCode): LocaleCode => {
  const normalized = normalize(value);
  if (normalized.startsWith('ja')) {
    return 'ja';
  }
  return 'en';
};

export const readAppLocale = (app: App): string | undefined => {
  const vault = (app as unknown as { vault?: { getConfig?: (key: string) => unknown } }).vault;
  if (vault?.getConfig) {
    const directLocale = vault.getConfig('locale');
    if (typeof directLocale === 'string') {
      return directLocale;
    }
    const language = vault.getConfig('language');
    if (typeof language === 'string') {
      return language;
    }
  }
  const maybeMoment = (window as unknown as { moment?: { locale?: () => string } }).moment;
  if (typeof maybeMoment?.locale === 'function') {
    return maybeMoment.locale();
  }
  return undefined;
};

export class Translator {
  private locale: LocaleCode;

  constructor(initialLocale: LocaleCode = fallbackLocale) {
    this.locale = initialLocale;
  }

  getLocale(): LocaleCode {
    return this.locale;
  }

  setLocale(locale?: string | LocaleCode): void {
    this.locale = resolveLocale(locale ?? this.locale);
  }

  t(key: TranslationKey): string {
    const current = dictionaries[this.locale] ?? dictionaries[fallbackLocale];
    return current[key] ?? dictionaries[fallbackLocale][key] ?? key;
  }
}

export const createTranslator = (app: App): Translator => {
  const initial = resolveLocale(readAppLocale(app));
  return new Translator(initial);
};
