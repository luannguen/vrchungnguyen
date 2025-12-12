
import { supabase } from '@/lib/supabase';

export interface DashboardStats {
    users: number;
    contacts_pending: number;
    news: number;
    products: number;
    projects: number;
    events: number;
}

export const statsService = {
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            // Run parallel queries for counts
            const [
                { count: usersCount },
                { count: contactsCount },
                { count: newsCount },
                { count: productsCount },
                { count: projectsCount },
                { count: eventsCount }
            ] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'new'),
                supabase.from('news').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('projects').select('*', { count: 'exact', head: true }),
                supabase.from('events').select('*', { count: 'exact', head: true }),
            ]);

            return {
                users: usersCount || 0,
                contacts_pending: contactsCount || 0,
                news: newsCount || 0,
                products: productsCount || 0,
                projects: projectsCount || 0,
                events: eventsCount || 0
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Return zeros on error to prevent dashboard crash
            return {
                users: 0,
                contacts_pending: 0,
                news: 0,
                products: 0,
                projects: 0,
                events: 0
            };
        }
    },

    // Dummy mock for growth chart (real implementation would require time-series queries or a dedicated analytics table)
    async getGrowthStats() {
        return [
            { name: 'Th 1', value: 400 },
            { name: 'Th 2', value: 300 },
            { name: 'Th 3', value: 500 },
            { name: 'Th 4', value: 280 },
            { name: 'Th 5', value: 590 },
            { name: 'Th 6', value: 800 },
        ];
    }
};
