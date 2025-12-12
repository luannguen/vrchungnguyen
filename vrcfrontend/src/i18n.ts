import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import vi from './locales/vi/translation.json';
import de from './locales/de/translation.json';
import fr from './locales/fr/translation.json';
import ru from './locales/ru/translation.json';
import hr from './locales/hr/translation.json';
import sl from './locales/sl/translation.json';
import sr from './locales/sr/translation.json';

i18n
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        debug: true,
        fallbackLng: 'vi',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            en: { translation: en },
            vi: { translation: vi },
            de: { translation: de },
            fr: { translation: fr },
            ru: { translation: ru },
            hr: { translation: hr },
            sl: { translation: sl },
            sr: { translation: sr }
        }
    });

export default i18n;
