import { en } from './en.ts';

export type TranslationKey = keyof typeof en;

/**
 * Resolves a translation key, filling {placeholders} from params.
 *
 * English is currently the only locale; a future locale switch only has to
 * change which dictionary this module reads — every call site already goes
 * through keys.
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const template: string = en[key];
  if (params === undefined) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
