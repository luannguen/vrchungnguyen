
import { useState, useEffect } from "react";
import { newsAPI } from "@/components/data/services/newsService";
import { NewsItem } from "@/components/data/models/news";
import { categories as mockCategories } from "@/components/data/mock/newsData";

export function useNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("all");

    // We can also fetch categories from API if needed, but for now reuse mock
    const categories = mockCategories;

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            const result = await newsAPI.getAll();

            if (result.success) {
                setNews(result.data);
            } else {
                setError(result.error.message);
            }
            setLoading(false);
        };

        fetchNews();
    }, []);

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
        getFilteredNews
    };
}
