import { Locale } from "date-fns";
import { enUS, vi } from "date-fns/locale";

export function convertI18nLanguageToDateFnsLocale(language: string): Locale {
    const localeMap: Record<string, Locale> = {
        en: enUS,
        vi: vi,
    }
    return localeMap[language] || enUS
}
