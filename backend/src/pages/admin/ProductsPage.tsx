import React, { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import { Product, Category } from '@/components/data/types';
import { Plus, Edit2, Trash2, Search, Loader2, Package } from 'lucide-react';
import ProductForm from '@/components/admin/products/ProductForm';
import { useTranslation } from 'react-i18next';

const ProductsPage: React.FC = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Edit/Create State
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [prodResult, catResult] = await Promise.all([
                productService.getProducts(),
                productService.getCategories()
            ]);

            if (prodResult.success) setProducts(prodResult.data || []);
            if (catResult.success) setCategories(catResult.data || []);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        const result = await productService.getProducts({
            search: searchTerm,
            categoryId: filterCategory || undefined
        });
        if (result.success) {
            setProducts(result.data || []);
        }
        setLoading(false);
    };

    // Filter effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterCategory]);

    const handleDelete = async (id: string) => {
        if (!confirm(t('confirm_delete_product'))) return;

        const result = await productService.deleteProduct(id);
        if (result.success) {
            setProducts(prev => prev.filter(p => p.id !== id));
        } else {
            alert(t('delete_product_fail') + result.error);
        }
    };

    const handleSave = async (productData: Partial<Product>) => {
        let result;
        if (editingProduct?.id) {
            result = await productService.updateProduct(editingProduct.id, productData);
        } else {
            result = await productService.createProduct(productData);
        }

        if (result.success) {
            setIsEditing(false);
            setEditingProduct(undefined);
            loadData(); // Refresh list
        } else {
            alert(t('save_fail') + result.error);
        }
    };

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {editingProduct ? t('edit_product') : t('create_product')}
                    </h1>
                </div>
                <ProductForm
                    initialData={editingProduct}
                    categories={categories}
                    onSave={handleSave}
                    onCancel={() => { setIsEditing(false); setEditingProduct(undefined); }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">{t('products')}</h1>
                <button
                    onClick={() => { setEditingProduct(undefined); setIsEditing(true); }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('add_product')}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
                        placeholder={t('search_products_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                        <option value="">{t('all_categories')}</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                        <Package className="h-12 w-12 mb-2 opacity-50" />
                        <p>{t('no_products')}</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('product_header')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('category_header')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('price_header')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('status_header')}
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">{t('actions')}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {product.image_url ? (
                                                    <img className="h-10 w-10 rounded object-cover" src={product.image_url} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500 text-xs">/{product.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{product.category?.name || t('uncategorized')}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.price}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-col gap-1">
                                            {product.is_new && (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 w-fit">
                                                    {t('new_label')}
                                                </span>
                                            )}
                                            {product.is_bestseller && (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 w-fit">
                                                    {t('bestseller_label')}
                                                </span>
                                            )}
                                            {!product.is_new && !product.is_bestseller && (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => { setEditingProduct(product); setIsEditing(true); }}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
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

export default ProductsPage;
