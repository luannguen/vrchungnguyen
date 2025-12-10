
import { Result, success, failure, ErrorCodes } from "../types";
import { NewsItem } from "../models/news";
import { mockNewsItems } from "../mock/newsData";

export const newsAPI = {
    getAll: async (): Promise<Result<NewsItem[]>> => {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
            return success(mockNewsItems);
        } catch (error: any) {
            return failure(
                error.message || "Failed to fetch news",
                ErrorCodes.SERVER_ERROR,
                error
            );
        }
    },

    getById: async (id: number): Promise<Result<NewsItem>> => {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            const item = mockNewsItems.find((n) => n.id === id);

            if (!item) {
                return failure("News item not found", ErrorCodes.NOT_FOUND);
            }

            return success(item);
        } catch (error: any) {
            return failure(
                error.message || "Failed to fetch news detail",
                ErrorCodes.SERVER_ERROR,
                error
            );
        }
    }
};
