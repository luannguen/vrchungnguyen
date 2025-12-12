import React, { useEffect, useState } from 'react';
import { resourceService, Resource } from '@/services/resourcesService';
import { Plus, Edit2, Trash2, Search, Loader2, PenTool, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

const ResourcesPage: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: '',
        link: '',
        features: [] as string[],
        slug: '',
        content: '',
        type: 'category' as 'category' | 'tool' | 'article' | 'service',
        parent_id: null as string | null
    });
    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await resourceService.getAll();
            setResources(data);
        } catch (error) {
            console.error('Failed to load resources', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingResource(null);
        setFormData({
            title: '',
            description: '',
            icon: '',
            link: '',
            features: [],
            slug: '',
            content: '',
            type: 'category',
            parent_id: null
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (resource: Resource) => {
        setEditingResource(resource);
        setFormData({
            title: resource.title,
            description: resource.description || '',
            icon: resource.icon,
            link: resource.link || '',
            features: resource.features || [],
            slug: resource.slug || '',
            content: resource.content || '',
            type: resource.type || 'category',
            parent_id: resource.parent_id || null
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingResource) {
                await resourceService.update(editingResource.id, formData);
            } else {
                await resourceService.create(formData);
            }
            setIsDialogOpen(false);
            loadData();
        } catch (error) {
            alert('Failed to save resource');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;
        try {
            await resourceService.delete(id);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            alert('Failed to delete resource');
        }
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Tools & Resources</h1>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                        type="text"
                        className="pl-10"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                        <PenTool className="h-12 w-12 mb-2 opacity-50" />
                        <p>No resources found.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredResources.map((resource) => (
                                <tr key={resource.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.icon}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resource.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{resource.description || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-blue-500">{resource.link}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(resource)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(resource.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingResource ? 'Edit Resource' : 'Create Resource'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Slug</label>
                                <Input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="url-slug"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Icon Name</label>
                                <Input
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="e.g. LineChart"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.type || 'category'}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                >
                                    <option value="category">Category</option>
                                    <option value="tool">Tool</option>
                                    <option value="article">Article</option>
                                    <option value="service">Service</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Parent Resource (Optional)</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.parent_id || ''}
                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                            >
                                <option value="">None (Top Level)</option>
                                {resources.filter(r => r.id !== editingResource?.id).map(r => (
                                    <option key={r.id} value={r.id}>{r.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Link (Legacy/External)</label>
                            <Input
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
                            <textarea
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                                value={formData.content || ''}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="<h1>Content Title</h1><p>HTML Content...</p>"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Add a feature..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addFeature();
                                        }
                                    }}
                                />
                                <Button type="button" onClick={addFeature} size="sm">Add</Button>
                            </div>
                            <ul className="space-y-1">
                                {formData.features.map((feature, index) => (
                                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                        <span>{feature}</span>
                                        <button type="button" onClick={() => removeFeature(index)} className="text-red-500 hover:text-red-700">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ResourcesPage;
