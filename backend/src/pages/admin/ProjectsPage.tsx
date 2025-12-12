
import React, { useEffect, useState } from 'react';
import { projectService } from '@/services/projectService';
import { productService } from '@/services/productService'; // Reusing for getCategories
import { Project, Category } from '@/components/data/types';
import { Plus, Edit2, Trash2, Search, Loader2, Briefcase } from 'lucide-react';
import ProjectForm from '@/components/admin/projects/ProjectForm';
import { useTranslation } from 'react-i18next';

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');

    // Edit/Create State
    const [isEditing, setIsEditing] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [projectsData, catResult] = await Promise.all([
                projectService.getProjects(),
                productService.getCategories()
            ]);

            setProjects(projectsData || []);
            if (catResult.success) setCategories(catResult.data || []);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('confirm_delete_project'))) return;

        try {
            await projectService.deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            alert(t('delete_project_fail'));
        }
    };

    const handleSave = async (projectData: Partial<Project>) => {
        try {
            if (editingProject?.id) {
                await projectService.updateProject(editingProject.id, projectData);
            } else {
                await projectService.createProject(projectData as any);
            }
            setIsEditing(false);
            setEditingProject(undefined);
            loadData();
        } catch (error) {
            alert(t('save_project_fail'));
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {editingProject ? t('edit_project') : t('create_project')}
                    </h1>
                </div>
                <ProjectForm
                    initialData={editingProject}
                    categories={categories}
                    onSave={handleSave}
                    onCancel={() => { setIsEditing(false); setEditingProject(undefined); }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">{t('projects')}</h1>
                <button
                    onClick={() => { setEditingProject(undefined); setIsEditing(true); }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('add_project')}
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
                        placeholder={t('search_projects_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                        <Briefcase className="h-12 w-12 mb-2 opacity-50" />
                        <p>{t('no_projects')}</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('project_header')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('client_header')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('completion_date_header')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('featured_header')}
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">{t('actions_header')}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {project.image_url ? (
                                                    <img className="h-10 w-10 rounded object-cover" src={project.image_url} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                                        <Briefcase className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                                <div className="text-sm text-gray-500 text-xs">/{project.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {project.client || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {project.completion_date || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {project.is_featured ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                {t('featured_header')}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => { setEditingProject(project); setIsEditing(true); }}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProjectsPage;
