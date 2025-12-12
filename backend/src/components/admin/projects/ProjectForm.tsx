
import React, { useState, useEffect } from 'react';
import { Project, Category } from '@/components/data/types';
import { X } from 'lucide-react';

interface ProjectFormProps {
    initialData?: Project;
    categories: Category[];
    onSave: (project: Partial<Project>) => Promise<void>;
    onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, categories, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Project>>({
        name: '',
        slug: '',
        description: '',
        content: '',
        client: '',
        completion_date: '',
        category_id: '',
        image_url: '',
        is_featured: false
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Failed to save', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-generate slug from name if empty
    const handleNameBlur = () => {
        if (formData.name && !formData.slug) {
            const slug = formData.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                    {initialData ? 'Edit Project' : 'New Project'}
                </h3>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            onBlur={handleNameBlur}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            name="category_id"
                            value={formData.category_id || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        >
                            <option value="">Select Category</option>
                            {categories.filter(c => c.type === 'project' || !c.type).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client</label>
                        <input
                            type="text"
                            name="client"
                            value={formData.client || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Completion Date</label>
                        <input
                            type="date"
                            name="completion_date"
                            value={formData.completion_date ? formData.completion_date.split('T')[0] : ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div className="flex items-center mt-4">
                        <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured || false}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">Featured Project</span>
                    </div>
                </div>

                {/* Details & Image */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                name="image_url"
                                value={formData.image_url || ''}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                        </div>
                        {formData.image_url && (
                            <div className="mt-2 h-32 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden border">
                                <img src={formData.image_url} alt="Preview" className="h-full object-contain" />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                    name="content"
                    rows={6}
                    value={formData.content || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
            </div>

            <div className="flex justify-end space-x-3 border-t pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Project'}
                </button>
            </div>
        </form>
    );
};

export default ProjectForm;
