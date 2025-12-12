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
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'vi',
        interpolation: {
            escapeValue: false,
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
