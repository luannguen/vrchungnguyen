
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
                setError("Invalid ID");
                setLoading(false);
                return;
            }

            setLoading(true);
            const numericId = parseInt(id, 10);

            if (isNaN(numericId)) {
                setError("Invalid ID format");
                setLoading(false);
                return;
            }

            const result = await newsAPI.getById(numericId);

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
