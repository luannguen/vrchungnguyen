export type Result<T> = {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
};

export const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NETWORK_ERROR: 'NETWORK_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export function success<T>(data: T): Result<T> {
    return { success: true, data };
}

export function failure(error: string, code = ErrorCodes.UNKNOWN_ERROR): Result<null> {
    return { success: false, error, code };
}

// Auth DTOs
export interface LoginDTO {
    email: string;
    password?: string; // Optional because magic link or OAuth might not need it, but for now we use password
}

export interface UserDTO {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role?: 'admin' | 'editor' | 'user';
}

export interface SessionDTO {
    access_token: string;
    user: UserDTO;
}
