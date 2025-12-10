/**
 * Core Data Types for 3-Layer Architecture
 */

// --- Result Pattern ---

export type Success<T> = {
    success: true;
    data: T;
};

export type Failure = {
    success: false;
    error: string;
    code: ErrorCodes;
};

export type Result<T> = Success<T> | Failure;

export const success = <T>(data: T): Success<T> => ({
    success: true,
    data,
});

export const failure = (error: string, code: ErrorCodes): Failure => ({
    success: false,
    error,
    code,
});

// --- Error Codes ---

export enum ErrorCodes {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NETWORK_ERROR = 'NETWORK_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// --- DTOs (Data Transfer Objects) ---

export interface UserDTO {
    id: string;
    email: string;
    role: 'admin' | 'user' | 'moderator' | 'manager';
    fullName?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    location?: string;
    bio?: string;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        github?: string;
    };
}

export interface AuthDTO {
    user: UserDTO;
    session: unknown; // Supabase session object
}
