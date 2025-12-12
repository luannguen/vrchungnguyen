import React, { useState, useEffect } from 'react';
import { Product, Category } from '@/components/data/types';
import { X, Plus, Trash2 } from 'lucide-react';

interface ProductFormProps {
    initialData?: Product;
    categories: Category[];
    onSave: (product: Partial<Product>) => Promise<void>;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, categories, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        slug: '',
        description: '',
        category_id: '',
        price: '',
        image_url: '',
        is_new: false,
        is_bestseller: false,
        features: [],
        specifications: {}
    });

    const [loading, setLoading] = useState(false);
    const [newFeature, setNewFeature] = useState('');
    const [specKey, setSpecKey] = useState('');
    const [specValue, setSpecValue] = useState('');

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

    const handleAddFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...(prev.features || []), newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: (prev.features || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddSpec = () => {
        if (specKey.trim() && specValue.trim()) {
            setFormData(prev => ({
                ...prev,
                specifications: {
                    ...(prev.specifications || {}),
                    [specKey.trim()]: specValue.trim()
                }
            }));
            setSpecKey('');
            setSpecValue('');
        }
    };

    const handleRemoveSpec = (key: string) => {
        const newSpecs = { ...(formData.specifications || {}) };
        delete newSpecs[key];
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
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
                    {initialData ? 'Edit Product' : 'New Product'}
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
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                            type="text"
                            name="price"
                            value={formData.price || ''}
                            onChange={handleChange}
                            placeholder="e.g. $99.99 or Contact for Quote"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_new"
                                checked={formData.is_new || false}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-900">New Arrival</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_bestseller"
                                checked={formData.is_bestseller || false}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-900">Bestseller</span>
                        </label>
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

            <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Features */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Add feature"
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                        <button
                            type="button"
                            onClick={handleAddFeature}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {formData.features?.map((feature, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded">
                                <span className="text-sm text-gray-700 truncate">{feature}</span>
                                <button type="button" onClick={() => handleRemoveFeature(index)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Specifications */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            value={specKey}
                            onChange={(e) => setSpecKey(e.target.value)}
                            placeholder="Key (e.g. Weight)"
                            className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                        <input
                            type="text"
                            value={specValue}
                            onChange={(e) => setSpecValue(e.target.value)}
                            placeholder="Value (e.g. 5kg)"
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                        <button
                            type="button"
                            onClick={handleAddSpec}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {Object.entries(formData.specifications || {}).map(([key, value]) => (
                            <li key={key} className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded">
                                <span className="text-sm text-gray-700 truncate">
                                    <span className="font-medium">{key}:</span> {value}
                                </span>
                                <button type="button" onClick={() => handleRemoveSpec(key)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
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
                    {loading ? 'Saving...' : 'Save Product'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
