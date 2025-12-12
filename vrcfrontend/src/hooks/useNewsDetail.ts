
import { useState, useEffect } from "react";
import { newsAPI } from "@/components/data/services/newsService";
import { NewsItem } from "@/components/data/models/news";

export function useNewsDetail(id: string | undefined) {
    const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) {
                // If it's a new page load with no ID yet, wait or do nothing
                setLoading(false);
                return;
            }

            setLoading(true);

            // Call API directly with string/UUID
            const result = await newsAPI.getById(id);

            if (result.success) {
                setNewsItem(result.data);
            } else {
                setError(result.error.message);
            }
            setLoading(false);
        };

        fetchDetail();
    }, [id]);

    return {
        newsItem,
        loading,
        error
    };
}
