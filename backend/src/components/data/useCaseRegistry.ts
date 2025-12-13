

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
    'user.create': {
        id: 'user.create',
        domain: 'user',
        description: 'Create a new user',
        input: 'CreateUserDTO',
        output: 'Result<UserDTO>',
        service: 'userService.createUser',
        hook: 'useUser',
    },
    'user.update': {
        id: 'user.update',
        domain: 'user',
        description: 'Update user details',
        input: 'UpdateUserDTO',
        output: 'Result<void>',
        service: 'userService.updateUser',
        hook: 'useUser',
    },
    'user.delete': {
        id: 'user.delete',
        domain: 'user',
        description: 'Delete a user',
        input: 'string', // id
        output: 'Result<void>',
        service: 'userService.deleteUser',
        hook: 'useUser',
    },
    'auth.forgotPassword': {
        id: 'auth.forgotPassword',
        domain: 'auth',
        description: 'Send password reset email',
        input: 'string', // email
        output: 'Result<void>',
        service: 'authService.resetPasswordForEmail',
        hook: 'useAuth',
    },
    'auth.updatePassword': {
        id: 'auth.updatePassword',
        domain: 'auth',
        description: 'Update current user password',
        input: 'string', // password
        output: 'Result<void>',
        service: 'authService.updatePassword',
        hook: 'useAuth',
    },
};
