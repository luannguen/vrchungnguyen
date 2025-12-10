/**
 * Registry to track all use cases in the application.
 * Helps to avoid duplication and maintain visibility of features.
 */
export const useCaseRegistry = [
    {
        id: 'contact.submit',
        domain: 'contact',
        description: 'Submit contact form',
        input: 'ContactDTO',
        output: 'Result<void>',
        service: 'contactAPI.submit',
        hook: 'useContactForm',
    },
    {
        id: 'news.getDetail',
        domain: 'news',
        description: 'Get news detail by ID',
        input: 'id: number',
        output: 'Result<NewsItem>',
        service: 'newsAPI.getById',
        hook: 'useNewsDetail',
    },
    {
        id: 'news.list',
        domain: 'news',
        description: 'List all news items',
        input: 'void',
        output: 'Result<NewsItem[]>',
        service: 'newsAPI.getAll',
        hook: 'useNews',
    }
];
