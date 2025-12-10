/**
 * backend/src/components/data/useCaseRegistry.ts
 * Registry to track all use cases in the Admin Dashboard.
 */

export const useCaseRegistry = [
    // --- Authentication ---
    {
        id: 'auth.login',
        domain: 'auth',
        description: 'Login with email and password',
        input: 'email, password',
        output: 'Result<AuthDTO>',
        service: 'authService.login',
        hook: 'useAuthFeature',
    },
    {
        id: 'auth.logout',
        domain: 'auth',
        description: 'Logout current user',
        input: 'void',
        output: 'Result<void>',
        service: 'authService.logout',
        hook: 'useAuthFeature',
    },
    {
        id: 'auth.getCurrentUser',
        domain: 'auth',
        description: 'Get current authenticated session/user',
        input: 'void',
        output: 'Result<UserDTO>',
        service: 'authService.getCurrentUser',
        hook: 'useAuthFeature',
    }
];
