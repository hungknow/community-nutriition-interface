import i18n from "./i18n";
import { TOptions } from "i18next";
import { I18N_NAMESPACE_WEB } from "./constants";

/**
 * Server-side translation function with default web namespace
 * @param key - Translation key from the web namespace
 * @param options - Optional translation options (namespace will be merged with default)
 */
export function t(key: string, options?: TOptions): string {
    const mergedOptions: TOptions = options
        ? { ...options, ns: I18N_NAMESPACE_WEB }
        : { ns: I18N_NAMESPACE_WEB };
    return i18n.t(key, mergedOptions);
}

