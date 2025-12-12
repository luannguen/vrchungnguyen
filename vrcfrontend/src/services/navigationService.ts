import { supabase } from "./supabase";
import { NavigationItem, Result, success, failure } from "@/components/data/types";

export const navigationService = {
    async getNavigationItems(): Promise<Result<NavigationItem[]>> {
        try {
            const { data, error } = await supabase
                .from('navigation')
                .select('*')
                .eq('is_active', true)
                .order('order_index', { ascending: true });

            if (error) throw error;

            // Build tree structure
            const items = data as NavigationItem[];
            const rootItems = items.filter(i => !i.parent_id);

            const buildTree = (parents: NavigationItem[]): NavigationItem[] => {
                return parents.map(parent => {
                    const children = items.filter(i => i.parent_id === parent.id);
                    if (children.length > 0) {
                        return { ...parent, children: buildTree(children) };
                    }
                    return parent;
                });
            };

            return success(buildTree(rootItems));
        } catch (error) {
            console.error('Error fetching navigation:', error);
            return failure('Failed to fetch navigation items');
        }
    }
};
