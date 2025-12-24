import i18n from "./i18n-react";
import { TOptions } from "i18next";
import { I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT } from "./constants";
import type { TranslationKey } from "../@types/i18next";

/**
 * Re-export of i18next's `t` function with default namespace
 * @param key - Translation key from the who-child-growth-standards-react namespace
 * @param options - Optional translation options (namespace will be merged with default)
 */
export function t(
    key: TranslationKey,
    options?: TOptions
): ReturnType<typeof i18n.t> {
    const mergedOptions: TOptions = options
        ? { ...options, ns: I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT }
        : { ns: I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT };
    return i18n.t(key, mergedOptions);
}
