
export interface NewsItem {
    id: string | number;
    title: string;
    summary: string;
    content?: string; // Content might be optional in list view, or loaded fully
    image: string;
    publishDate: string;
    author: string;
    category: string;
    tags: string[];
    location?: string;
    organizer?: string;
    comments: number;
    views: number;
    type: "news" | "event";
    eventDate?: string;
}
