import { t as i18nextT, TOptions } from "i18next";
import { I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT } from "./constants";

/**
 * Re-export of i18next's `t` function with default namespace
 * @param key - Translation key
 * @param options - Optional translation options (namespace will be merged with default)
 */
export function t(
    key: string,
    options?: TOptions
): ReturnType<typeof i18nextT> {
    return i18nextT(key, {
        ...(options || {}),
        ns: I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT,
    } as TOptions);
}
