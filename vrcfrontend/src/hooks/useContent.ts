import { useState, useEffect } from 'react';
import { contentService, Achievement, FAQ } from '@/services/contentService';

// Hook for fetching Achievements
export const useAchievements = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAchievements = async () => {
            setIsLoading(true);
            try {
                // Use public method which filters by is_active
                const result = await contentService.getAchievements();
                if (result.success && result.data) {
                    setAchievements(result.data);
                } else {
                    const failure = result as any;
                    setError(failure.error?.message || 'Failed to load achievements');
                }
            } catch (err) {
                console.error(err);
                setError('An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAchievements();
    }, []);

    return { achievements, isLoading, error };
};

// Hook for fetching FAQs
export const useFAQs = (category?: string) => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFAQs = async () => {
            setIsLoading(true);
            try {
                // Use public method which filters by is_active and supports category
                const result = await contentService.getFAQs(category);
                if (result.success && result.data) {
                    setFaqs(result.data);
                } else {
                    const failure = result as any;
                    setError(failure.error?.message || 'Failed to load FAQs');
                }
            } catch (err) {
                console.error(err);
                setError('An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFAQs();
    }, [category]);

    return { faqs, isLoading, error };
};
