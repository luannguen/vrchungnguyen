import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Image as ImageIcon, X, Save, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { productsService } from '../../../services/products.service';

interface ProductFormProps {
    initialData?: any;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        category: initialData?.category || '',
        price: initialData?.price || '',
        image: initialData?.image || '',
        description: initialData?.description || '',
        isNew: initialData?.isNew || false,
        isBestseller: initialData?.isBestseller || false,
        features: initialData?.features || [],
        specifications: initialData?.specifications || {},
    });

    const [featureInput, setFeatureInput] = useState('');
    const [newSpec, setNewSpec] = useState({ key: '', value: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleAddFeature = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && featureInput.trim()) {
            e.preventDefault();
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, featureInput.trim()]
            }));
            setFeatureInput('');
        }
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_: string, i: number) => i !== index)
        }));
    };

    const handleAddSpec = () => {
        if (newSpec.key && newSpec.value) {
            setFormData(prev => ({
                ...prev,
                specifications: { ...prev.specifications, [newSpec.key]: newSpec.value }
            }));
            setNewSpec({ key: '', value: '' });
        }
    };

    const removeSpec = (key: string) => {
        const newSpecs = { ...formData.specifications };
        delete newSpecs[key];
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData) {
                await productsService.update(initialData.id, formData);
            } else {
                await productsService.create(formData);
            }
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        {initialData ? t('edit_product') : t('new_product')}
                    </h3>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                        >
                            <X className="w-4 h-4 mr-2" />
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? t('saving') : t('save_product')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('product_name')}</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('slug')}</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('category')}</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">{t('select_category')}</option>
                                    <option value="vr-headsets">VR Headsets</option>
                                    <option value="accessories">Accessories</option>
                                    <option value="cameras">Cameras</option>
                                    <option value="software">Software</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('price')}</label>
                                <input
                                    type="text"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder={t('price_placeholder')}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex space-x-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isNew"
                                    checked={formData.isNew}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{t('is_new')}</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isBestseller"
                                    checked={formData.isBestseller}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{t('is_bestseller')}</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('image_url')}</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ImageIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="block w-full pl-10 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('image_url')}</label>
                            <div className="mt-1 relative aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                                {formData.image ? (
                                    <img src={formData.image} alt={t('preview')} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-1 text-sm text-gray-500">{t('image_url')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('description')}</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('features')}</label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            onKeyDown={handleAddFeature}
                            placeholder={t('add_feature')}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (featureInput.trim()) {
                                    setFormData(prev => ({
                                        ...prev,
                                        features: [...prev.features, featureInput.trim()]
                                    }));
                                    setFeatureInput('');
                                }
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <ul className="space-y-2">
                        {formData.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                <span className="text-sm text-gray-700">{feature}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFeature(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('specifications')}</label>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <input
                            type="text"
                            value={newSpec.key}
                            onChange={(e) => setNewSpec(prev => ({ ...prev, key: e.target.value }))}
                            placeholder={t('spec_key')}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSpec.value}
                                onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))}
                                placeholder={t('spec_value')}
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={handleAddSpec}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(formData.specifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <span className="text-sm font-medium text-gray-700">{key}</span>
                                    <span className="text-sm text-gray-600">{value as string}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeSpec(key)}
                                    className="text-red-500 hover:text-red-700 ml-4"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ProductForm;
