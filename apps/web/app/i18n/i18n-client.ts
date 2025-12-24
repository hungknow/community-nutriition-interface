'use client';

import { I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT, i18nResources as whoChildGrowthStandardsReactI18nResources } from "@community-nutrition/who-child-growth-standards-react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
    en: {
        translation: {
            "Welcome to React": "Welcome to React and react-i18next"
        },
        ...whoChildGrowthStandardsReactI18nResources.en
    },
    vi: {
        translation: {
            "Welcome to React": "Chào mừng bạn đến với React và react-i18next"
        },
        ...whoChildGrowthStandardsReactI18nResources.vi
    }
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        ns: ["translation", I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT],
        lng: "vi", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
        // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
        // if you're using a language detector, do not define the lng option

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
