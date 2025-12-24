// import the original type declarations
import 'i18next'

import { i18nResources } from '../i18n/i18n-resources';
import { I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT } from '../i18n/constants';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    resources: typeof i18nResources["en"];
    // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
    // set returnNull to false (and also in the i18next init options)
    // returnNull: false;
  }
}

// Export type for translation keys in the namespace
export type TranslationKey = keyof typeof i18nResources["en"][typeof I18N_NAMESPACE_WHO_CHILD_GROWTH_STANDARDS_REACT];