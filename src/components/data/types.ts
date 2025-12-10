
export enum ErrorCodes {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NETWORK_ERROR = 'NETWORK_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
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
