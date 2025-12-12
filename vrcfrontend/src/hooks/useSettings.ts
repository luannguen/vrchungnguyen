
import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

export const useSettings = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const result = await settingsService.getSettings();

                if (result.success) {
                    setSettings(result.data);
                } else {
                    const failureResult = result as { success: false; error: { message: string } };
                    setError(failureResult.error?.message || 'Failed to load settings');
                }
            } catch (err) {
                console.error('useSettings exception:', err);
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
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
