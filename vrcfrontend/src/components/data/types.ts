
export enum ErrorCodes {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NETWORK_ERROR = 'NETWORK_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    DB_ERROR = 'DB_ERROR',
}

export type Success<T> = {
    success: true;
    data: T;
};

export type Failure = {
    success: false;
    error: {
        message: string;
        code: ErrorCodes;
        details?: any;
    };
};

export type Result<T> = Success<T> | Failure;

export const success = <T>(data: T): Success<T> => ({
    success: true,
    data,
});

export const failure = (
    message: string,
    code: ErrorCodes = ErrorCodes.UNKNOWN_ERROR,
    details?: any
): Failure => ({
    success: false,
    error: {
        message,
        code,
        details,
    },
});

// CMS Types
export type ContentType = 'product' | 'event' | 'news' | 'project';

export interface Category {
    id: string;
    name: string;
    slug: string;
    type: ContentType;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    category_id?: string;
    category?: Category;
    price?: string;
    is_new: boolean;
    is_bestseller: boolean;
    image_url?: string;
    features?: string[];
    specifications?: Record<string, string>;
    created_at: string;
    updated_at: string;
}

export interface Event {
    id: string;
    title: string;
    slug: string;
    summary?: string;
    content?: string;
    image_url?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    organizer?: string;
    status: 'upcoming' | 'ongoing' | 'past';
    category_id?: string;
    category?: Category;
    participants_count: number;
    tags?: string[];
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    name: string;
    slug: string;
    description?: string;
    content?: string;
    image_url?: string;
    client?: string;
    completion_date?: string;
    category_id?: string;
    category?: Category;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface NavigationItem {
    id: string;
    label: string;
    path: string;
    parent_id?: string;
    order_index: number;
    is_active: boolean;
    children?: NavigationItem[];
    created_at: string;
}

export interface SiteSetting {
    key: string;
    value: string;
    description?: string;
    updated_at: string;
}
