import { LanguageSwitcher } from './LanguageSwitcher';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Header() {
    const { t } = useTranslation();

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-4">
                {/* Mobile menu trigger could go here if needed, or breadcrumbs */}
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {t('dashboard')}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">{t('notification')}</span>
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <LanguageSwitcher />
            </div>
        </header>
    );
}
