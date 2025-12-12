
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { categoryService } from '@/services/categoryService';
import { News, Category } from '@/components/data/types';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface NewsFormProps {
    initialData?: News;
    onSave: (data: Partial<News>) => Promise<void>;
    onCancel: () => void;
}

const NewsForm: React.FC<NewsFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<News>>({
        title: '',
        slug: '',
        summary: '',
        content: '',
        image_url: '',
        publish_date: new Date().toISOString().split('T')[0],
        author: 'VRC Admin',
        category_id: '',
        tags: []
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        loadCategories();
        if (initialData) {
            setFormData({
                ...initialData,
                publish_date: initialData.publish_date ? new Date(initialData.publish_date).toISOString().split('T')[0] : '',
            });
        }
    }, [initialData]);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getCategories('news');
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const handleChange = (field: keyof News, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTags = [...(formData.tags || []), tagInput.trim()];
            setFormData(prev => ({ ...prev, tags: newTags }));
            setTagInput('');
        }
    };

    const removeTag = (index: number) => {
        const newTags = (formData.tags || []).filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, tags: newTags }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Auto generate slug if missing
            const slug = formData.slug || formData.title?.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d").replace(/Đ/g, "D")
                .replace(/[^a-z0-9\s-]/g, "")
                .trim().replace(/\s+/g, "-");

            await onSave({ ...formData, slug });
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <Button variant="ghost" onClick={onCancel} className="p-0 hover:bg-transparent">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                </Button>
                <h2 className="text-xl font-semibold">{initialData ? 'Edit News' : 'Create News'}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <Input
                            value={formData.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('title', e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug</label>
                        <Input
                            value={formData.slug}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('slug', e.target.value)}
                            placeholder="Auto-generated from title if empty"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <Select
                            value={formData.category_id}
                            onValueChange={(val: string) => handleChange('category_id', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Author</label>
                        <Input
                            value={formData.author}
                            onChange={(e) => handleChange('author', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Publish Date</label>
                        <Input
                            type="date"
                            value={formData.publish_date}
                            onChange={(e) => handleChange('publish_date', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <div className="flex gap-2">
                            <Input
                                value={formData.image_url}
                                onChange={(e) => handleChange('image_url', e.target.value)}
                                placeholder="https://..."
                            />
                            {formData.image_url && (
                                <a href={formData.image_url} target="_blank" rel="noreferrer" className="flex items-center text-indigo-600">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                        {formData.image_url && (
                            <div className="mt-2 aspect-video w-full rounded-md overflow-hidden bg-gray-100 border">
                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tags (Press Enter to add)</label>
                        <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Add tags..."
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.tags?.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(idx)}
                                        className="ml-1 text-indigo-600 hover:text-indigo-900 focus:outline-none"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Summary</label>
                <Textarea
                    value={formData.summary}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Content (HTML allowed)</label>
                <Textarea
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                />
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save News'}
                </Button>
            </div>
        </form>
    );
};

export default NewsForm;
