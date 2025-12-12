
import { supabase } from "@/lib/supabase";
import { Project } from "@/components/data/types";
import { v4 as uuidv4 } from 'uuid';

export const projectService = {
    async getProjects(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*, category:categories(*)')
            .order('completion_date', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }

        return data || [];
    },

    async getProjectById(id: string): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .select('*, category:categories(*)')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching project:', error);
            throw error;
        }

        return data;
    },

    async createProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
        const newProject = {
            ...project,
            id: uuidv4(),
        };

        const { data, error } = await supabase
            .from('projects')
            .insert([newProject])
            .select()
            .single();

        if (error) {
            console.error('Error creating project:', error);
            throw error;
        }

        return data;
    },

    async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating project:', error);
            throw error;
        }

        return data;
    },

    async deleteProject(id: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }
};
