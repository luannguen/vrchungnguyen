
import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

export const useSettings = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const result = await settingsService.getSettings();
            if (result.success && result.data) {
                setSettings(result.data);
            } else {
                setError(result.error?.message || 'Failed to load settings');
            }
            setLoading(false);
        };

        fetchSettings();
    }, []);

    const getSetting = (key: string, defaultValue: string = '') => {
        return settings[key] || defaultValue;
    };

    return {
        settings,
        loading,
        error,
        getSetting
    };
};
