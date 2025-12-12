import { useState, useEffect } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    MoveUp,
    MoveDown,
    Loader2
} from 'lucide-react';
import { navigationService } from '@/services/navigationService';
import { NavigationItem, Result } from '@/components/data/types';
import { toast } from 'react-hot-toast';

export default function MenuManager() {
    const [items, setItems] = useState<NavigationItem[]>([]);
    const [position, setPosition] = useState<'header' | 'footer'>('header');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<NavigationItem>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const result = await navigationService.getNavigationItems();
        if (result.success) {
            setItems(result.data?.filter(i => (i.position || 'header') === position) || []);
        } else {
            toast.error('Failed to load menu items');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [position]);

    const handleEdit = (item: NavigationItem) => {
        setEditingItem(item);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setEditingItem({
            label: '',
            path: '',
            is_active: true,
            order_index: items.length + 1,
            position: position,
            children: []
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!editingItem.label || !editingItem.path) {
            toast.error('Label and Path are required');
            return;
        }

        setSaving(true);
        let result: Result<NavigationItem>;

        if (editingItem.id) {
            result = await navigationService.updateNavigationItem(editingItem.id, editingItem);
        } else {
            result = await navigationService.createNavigationItem(editingItem);
        }

        if (result.success) {
            toast.success(editingItem.id ? 'Item updated' : 'Item created');
            setIsEditing(false);
            fetchItems();
        } else {
            toast.error(result.error || 'Failed to save item');
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const result = await navigationService.deleteNavigationItem(id);
        if (result.success) {
            toast.success('Item deleted');
            fetchItems();
        } else {
            toast.error(result.error || 'Failed to delete item');
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

        // Update local state largely for UI feedback, but we need to persist order
        // Prepare bulk update
        const updates = newItems.map((item, idx) => ({
            id: item.id,
            order_index: idx + 1
        }));

        // Optimistic update
        setItems(newItems);

        const result = await navigationService.reorderItems(updates);
        if (!result.success) {
            toast.error('Failed to reorder items');
            fetchItems(); // revert
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setPosition('header')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${position === 'header'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        Header Menu
                    </button>
                    <button
                        onClick={() => setPosition('footer')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${position === 'footer'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        Footer Menu
                    </button>
                </nav>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Item
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No menu items found. Create one to get started.</div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {items.map((item, index) => (
                            <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleMove(index, 'up')}
                                                disabled={index === 0}
                                                className="text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                            >
                                                <MoveUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleMove(index, 'down')}
                                                disabled={index === items.length - 1}
                                                className="text-gray-400 hover:text-blue-600 disabled:opacity-30"
                                            >
                                                <MoveDown size={16} />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                {item.label}
                                                {!item.is_active && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Inactive</span>}
                                            </h3>
                                            <p className="text-sm text-gray-500">{item.path}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                            title="Edit"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                {/* Render Simple Children View if necessary, but flat list is fine for root level sorting if we assume 1 level for now or specific UI for tree */}
                                {item.children && item.children.length > 0 && (
                                    <div className="ml-12 mt-2 pl-4 border-l-2 border-gray-200 space-y-2">
                                        {item.children.map(child => (
                                            <div key={child.id} className="text-sm text-gray-600 flex justify-between">
                                                <span>{child.label} ({child.path})</span>
                                                {/* Child editing could be recursive or simpler */}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Edit/Create Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingItem.id ? 'Edit Group' : 'New Group'}</h2>
                            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Label</label>
                                <input
                                    value={editingItem.label || ''}
                                    onChange={e => setEditingItem({ ...editingItem, label: e.target.value })}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="e.g. Home"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Path</label>
                                <input
                                    value={editingItem.path || ''}
                                    onChange={e => setEditingItem({ ...editingItem, path: e.target.value })}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="e.g. /home"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingItem.is_active ?? true}
                                        onChange={e => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium">Active</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving && <Loader2 className="animate-spin" size={16} />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
