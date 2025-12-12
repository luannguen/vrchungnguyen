import React, { useState, useEffect } from 'react';
import { TeamMember } from '@/components/data/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Image as ImageIcon } from 'lucide-react';
import { ImagePickerModal } from '@/components/admin/media/ImagePickerModal';

interface TeamFormProps {
    initialData?: TeamMember;
    onSave: (member: Partial<TeamMember>) => Promise<void>;
    onCancel: () => void;
}

const TeamForm: React.FC<TeamFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<TeamMember>>({
        name: '',
        role: '',
        bio: '',
        image_url: '',
        social_links: {},
        display_order: 0
    });
    const [loading, setLoading] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (field: keyof TeamMember, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [platform]: value
            }
        }));
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

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        {initialData ? 'Edit Team Member' : 'New Team Member'}
                    </h3>
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <Input
                                value={formData.name || ''}
                                onChange={e => handleChange('name', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <Input
                                value={formData.role || ''}
                                onChange={e => handleChange('role', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Order</label>
                            <Input
                                type="number"
                                value={formData.display_order || 0}
                                onChange={e => handleChange('display_order', parseInt(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image</label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.image_url || ''}
                                    onChange={e => handleChange('image_url', e.target.value)}
                                    placeholder="https://..."
                                />
                                <Button type="button" variant="outline" onClick={() => setShowImagePicker(true)}>
                                    <ImageIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            {formData.image_url && (
                                <div className="mt-2 w-24 h-24 rounded-full overflow-hidden border">
                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                            <Textarea
                                value={formData.bio || ''}
                                onChange={e => handleChange('bio', e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Social Links</label>
                            <div className="grid grid-cols-1 gap-2">
                                <Input
                                    placeholder="LinkedIn URL"
                                    value={formData.social_links?.linkedin || ''}
                                    onChange={e => handleSocialChange('linkedin', e.target.value)}
                                />
                                <Input
                                    placeholder="Twitter URL"
                                    value={formData.social_links?.twitter || ''}
                                    onChange={e => handleSocialChange('twitter', e.target.value)}
                                />
                                <Input
                                    placeholder="Email Address"
                                    value={formData.social_links?.email || ''}
                                    onChange={e => handleSocialChange('email', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Member'}
                    </Button>
                </div>
            </form>

            <ImagePickerModal
                open={showImagePicker}
                onOpenChange={setShowImagePicker}
                onSelect={(url) => handleChange('image_url', url)}
            />
        </>
    );
};

export default TeamForm;
