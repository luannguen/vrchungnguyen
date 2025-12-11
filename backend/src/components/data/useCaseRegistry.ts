

export const useCaseRegistry = {
    'auth.login': {
        id: 'auth.login',
        domain: 'auth',
        description: 'User login with email and password',
        input: 'LoginDTO',
        output: 'Result<SessionDTO>',
        service: 'authService.login',
        hook: 'useAuth',
    },
    'auth.loginWithGoogle': {
        id: 'auth.loginWithGoogle',
        domain: 'auth',
        description: 'Login with Google OAuth',
        input: 'void',
        output: 'Result<{ url: string } | void>',
        service: 'authService.loginWithGoogle',
        hook: 'useAuth',
    },
    'auth.logout': {
        id: 'auth.logout',
        domain: 'auth',
        description: 'User logout',
        input: 'void',
        output: 'Result<void>',
        service: 'authService.logout',
        hook: 'useAuth',
    },
    'auth.getCurrentUser': {
        id: 'auth.getCurrentUser',
        domain: 'auth',
        description: 'Get current authenticated user',
        input: 'void',
        output: 'Result<UserDTO>',
        service: 'authService.getCurrentUser',
        hook: 'useAuth',
    },
    'rbac.getUserRole': {
        id: 'rbac.getUserRole',
        domain: 'rbac',
        description: 'Get current user role',
        input: 'void', // userId
        output: 'Result<Role>',
        service: 'rbacService.getUserRole',
        hook: 'useRBAC',
    },
};
