import enUS from "./en-US-who-child-growth-standards-react.json";
import viVN from "./vi-VN-who-child-growth-standards-react.json";
import { I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT } from "./constants";

export const i18nResources = {
    en: {
        [I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT]: enUS,
    },
    vi: {
        [I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT]: viVN,
    },
} as const;


