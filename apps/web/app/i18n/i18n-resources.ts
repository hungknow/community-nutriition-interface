import enUS from "./en-US-web.json";
import viVN from "./vi-VN-web.json";
import { I18N_NAMESPACE_WEB } from "./constants";

export const i18nResources = {
    en: {
        [I18N_NAMESPACE_WEB]: enUS,
    },
    vi: {
        [I18N_NAMESPACE_WEB]: viVN,
    },
} as const;

