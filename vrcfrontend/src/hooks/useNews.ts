import { useState, useEffect, useCallback } from "react";
import { newsAPI } from "@/components/data/services/newsService";
import { NewsItem } from "@/components/data/models/news";

export function useNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("all");

    const fetchNews = useCallback(async (search?: string) => {
        setLoading(true);
        // Fetch news
        const newsResult = await newsAPI.getAll(search);

        if (newsResult.success) {
            setNews(newsResult.data);
            setError(null);
        } else {
            setError(newsResult.error.message);
        }
        setLoading(false);
    }, []);

    const fetchCategories = useCallback(async () => {
        const catResult = await newsAPI.getCategories();
        if (catResult.success) {
            // Calculate counts for each category based on current news if needed, 
            // but backend might be better place. For now, we can count on frontend if we have all news.
            // Or just display categories without counts or mock counts if strictly needed.
            // Let's assume we map them directly.
            setCategories(catResult.data.map(c => ({
                ...c,
                count: 0 // Placeholder, or we can calculate from news list
            })));
        }
    }, []);

    useEffect(() => {
        fetchNews();
        fetchCategories();
    }, [fetchNews, fetchCategories]);

    // Update category counts based on fetched news
    useEffect(() => {
        if (news.length > 0 && categories.length > 0) {
            const counts: Record<string, number> = {};
            news.forEach(item => {
                const catName = item.category; // This is the name, matching category.name
                counts[catName] = (counts[catName] || 0) + 1;
            });

            setCategories(prev => prev.map(c => ({
                ...c,
                count: counts[c.name] || 0
            })));
        }
    }, [news]); // Run when news updates


    const getFilteredNews = () => {
        if (activeTab === "all") return news;
        if (activeTab === "news") return news.filter(item => item.type === "news");
        if (activeTab === "events") return news.filter(item => item.type === "event");
        return news;
    };

    const filteredNews = getFilteredNews();
    const featuredNews = news.length > 0 ? news[0] : null;

    return {
        news,
        filteredNews,
        featuredNews,
        categories,
        loading,
        error,
        activeTab,
        setActiveTab,
        getFilteredNews,
        searchNews: fetchNews
    };
}
