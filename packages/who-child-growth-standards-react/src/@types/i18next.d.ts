// import the original type declarations
import 'i18next'

import { i18nResources } from '../i18n/i18n-resources';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    resources: typeof i18nResources["en"];
    // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
    // set returnNull to false (and also in the i18next init options)
    // returnNull: false;
  }
}