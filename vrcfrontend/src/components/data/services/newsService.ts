
import { Result, success, failure, ErrorCodes } from "../types";
import { NewsItem } from "../models/news";
import { mockNewsItems } from "../mock/newsData";

import { supabase } from "@/lib/supabaseClient"; // Ensure this client exists and is configured
import { Result, success, failure, ErrorCodes } from "../types";
import { NewsItem } from "../models/news";

export const newsAPI = {
    getAll: async (): Promise<Result<NewsItem[]>> => {
        try {
            const { data, error } = await supabase
                .from('news')
                .select(`
                    id,
                    title,
                    slug,
                    summary,
                    content,
                    image_url,
                    publish_date,
                    author,
                    categories (name),
                    tags,
                    views,
                    created_at
                `)
                .order('publish_date', { ascending: false });

            if (error) throw error;

            const mappedData: NewsItem[] = data.map((item: any) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                content: item.content,
                image: item.image_url, // Map image_url to image
                publishDate: item.publish_date,
                author: item.author,
                category: item.categories?.name || 'Uncategorized', // Flatten category name
                tags: item.tags || [],
                location: "", // Not standard in news table, add if needed or map from extended props
                organizer: "",
                comments: 0,
                views: item.views,
                type: "news", // Default type, or infer if column exists. 
                // Actually table news is just news. Events are separate table. 
                // But frontend might mix them. For now let's say "news".
                eventDate: ""
            }));

            // If frontend expects mix of news and events, we might need to fetch events too and merge.
            // Let's fetch events as well if 'getAll' implies all feed.
            const { data: eventsData, error: eventError } = await supabase
                .from('events')
                .select('*')
                .order('start_date', { ascending: false });

            if (!eventError && eventsData) {
                const mappedEvents: NewsItem[] = eventsData.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    summary: item.summary,
                    content: item.content,
                    image: item.image_url,
                    publishDate: item.created_at, // Use created_at or generic date
                    author: item.organizer || "VRC",
                    category: "Sự kiện", // Or fetch category name if joined
                    tags: item.tags || [],
                    location: item.location,
                    organizer: item.organizer,
                    comments: 0,
                    views: item.participants_count,
                    type: "event",
                    eventDate: item.start_date
                }));

                // Merge and sort
                const combined = [...mappedData, ...mappedEvents].sort((a, b) =>
                    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
                );

                return success(combined);
            }

            return success(mappedData);
        } catch (error: any) {
            console.error(error);
            return failure(
                error.message || "Failed to fetch news",
                ErrorCodes.SERVER_ERROR,
                error
            );
        }
    },

    getById: async (id: number | string): Promise<Result<NewsItem>> => {
        try {
            // Check news first
            const { data: newsData, error: newsError } = await supabase
                .from('news')
                .select(`
                     *,
                     categories (name)
                `)
                .eq('id', id)
                .single();

            if (newsData) {
                const item: NewsItem = {
                    id: newsData.id,
                    title: newsData.title,
                    summary: newsData.summary,
                    content: newsData.content,
                    image: newsData.image_url,
                    publishDate: newsData.publish_date,
                    author: newsData.author,
                    category: newsData.categories?.name || 'Uncategorized',
                    tags: newsData.tags || [],
                    location: "",
                    organizer: "",
                    comments: 0,
                    views: newsData.views,
                    type: "news",
                    eventDate: ""
                };
                return success(item);
            }

            // Check events
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single();

            if (eventData) {
                const item: NewsItem = {
                    id: eventData.id,
                    title: eventData.title,
                    summary: eventData.summary,
                    content: eventData.content,
                    image: eventData.image_url,
                    publishDate: eventData.created_at,
                    author: eventData.organizer || "VRC",
                    category: "Sự kiện",
                    tags: eventData.tags || [],
                    location: eventData.location,
                    organizer: eventData.organizer,
                    comments: 0,
                    views: eventData.participants_count,
                    type: "event",
                    eventDate: eventData.start_date
                };
                return success(item);
            }

            return failure("Not found", ErrorCodes.NOT_FOUND);

        } catch (error: any) {
            return failure(
                error.message || "Failed to fetch details",
                ErrorCodes.SERVER_ERROR,
                error
            );
        }
    }
};

