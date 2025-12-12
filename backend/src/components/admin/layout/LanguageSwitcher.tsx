import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';

interface LanguageOption {
    code: string;
    name: string;
    flag: string;
}

const languageOptions: LanguageOption[] = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
    { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
    { code: 'sr', name: 'Српски', flag: '🇷🇸' },
];

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeLanguage = i18n.language ? i18n.language.split('-')[0] : 'vi';

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    const getActiveLanguageDetails = () => {
        return languageOptions.find(lang => lang.code === activeLanguage) || languageOptions[0];
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={t('language')}
            >
                <span className="text-xl">{getActiveLanguageDetails().flag}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                    {getActiveLanguageDetails().name}
                </span>
                <Globe className="h-4 w-4 text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 z-50">
                    {languageOptions.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={clsx(
                                'flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                                activeLanguage === lang.code && 'bg-gray-50 dark:bg-gray-700 font-medium text-blue-600 dark:text-blue-400'
                            )}
                        >
                            <span className="mr-3 text-lg">{lang.flag}</span>
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
