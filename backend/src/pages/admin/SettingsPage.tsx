import React, { useState, useEffect } from 'react';
import { Save, Loader2, Upload, Image as ImageIcon, X } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { mediaService } from '@/services/mediaService';
import { toast } from 'react-hot-toast';

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const result = await settingsService.getSettings();
        if (result.success && result.data) {
            const settingMap = result.data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);
            setSettings(settingMap);
        } else {
            toast.error('Failed to load settings');
        }
        setLoading(false);
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Validations
        if (file.size > 2 * 1024 * 1024) { // 2MB limit for logo
            toast.error('Logo size too large. Max 2MB.');
            return;
        }

        setUploadingLogo(true);
        try {
            const result = await mediaService.uploadImage(file, 'settings');
            if (result) {
                handleChange('site_logo', result.url);
                toast.success('Logo uploaded temporarily. Save changes to persist.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleRemoveLogo = () => {
        if (confirm('Remove current logo?')) {
            handleChange('site_logo', '');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const updates = Object.entries(settings).map(([key, value]) => ({
            key,
            value
        }));

        const result = await settingsService.updateSettings(updates);
        if (result.success) {
            toast.success('Settings saved successfully');
        } else {
            toast.error('Failed to save settings');
        }
        setSaving(false);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">System Settings</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Brand Identity */}
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg lg:col-span-2">
                    <div className="px-4 py-5 sm:p-6 space-y-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Brand Identity</h3>
                        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="flex-shrink-0">
                                {settings['site_logo'] ? (
                                    <div className="relative group">
                                        <img
                                            src={settings['site_logo']}
                                            alt="Site Logo"
                                            className="h-24 w-auto object-contain bg-gray-50 border rounded-md p-2"
                                        />
                                        <button
                                            onClick={handleRemoveLogo}
                                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove Logo"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50/50">
                                        <ImageIcon className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Website Logo
                                </label>
                                <p className="text-sm text-gray-500">
                                    Recommended size: 200x60px. Max size: 2MB. Format: PNG, JPG, WEBP.
                                </p>
                                <div className="mt-2">
                                    <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        {uploadingLogo ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Upload className="h-4 w-4 mr-2" />
                                        )}
                                        {uploadingLogo ? 'Uploading...' : 'Change Logo'}
                                    </label>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        disabled={uploadingLogo}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* General Information */}
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 space-y-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">General Information & SEO</h3>
                        <div className="grid grid-cols-1 gap-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                                <input
                                    type="text"
                                    value={settings['company_name'] || ''}
                                    onChange={(e) => handleChange('company_name', e.target.value)}
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Tổng công ty Kỹ thuật lạnh Việt Nam (VRC)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slogan / Tagline</label>
                                <input
                                    type="text"
                                    value={settings['company_slogan'] || ''}
                                    onChange={(e) => handleChange('company_slogan', e.target.value)}
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Tiên phong trong lĩnh vực kỹ thuật lạnh tại Việt Nam"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title (Default)</label>
                                <input
                                    type="text"
                                    value={settings['site_title'] || ''}
                                    onChange={(e) => handleChange('site_title', e.target.value)}
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description (Default)</label>
                                <textarea
                                    rows={3}
                                    value={settings['site_description'] || ''}
                                    onChange={(e) => handleChange('site_description', e.target.value)}
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 space-y-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Contact Details</h3>
                        <div className="grid grid-cols-1 gap-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                <input
                                    type="text"
                                    value={settings['contact_address'] || ''}
                                    onChange={(e) => handleChange('contact_address', e.target.value)}
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                                    <input
                                        type="text"
                                        value={settings['contact_phone'] || ''}
                                        onChange={(e) => handleChange('contact_phone', e.target.value)}
                                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="+84 (28) 1234 5678"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hotline</label>
                                    <input
                                        type="text"
                                        value={settings['contact_hotline'] || ''}
                                        onChange={(e) => handleChange('contact_hotline', e.target.value)}
                                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="1800 1234"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        value={settings['contact_email'] || ''}
                                        onChange={(e) => handleChange('contact_email', e.target.value)}
                                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="info@vrcorp.vn"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Working Hours</label>
                                    <input
                                        type="text"
                                        value={settings['contact_working_hours'] || ''}
                                        onChange={(e) => handleChange('contact_working_hours', e.target.value)}
                                        className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="8:00 - 17:30, Thứ 2 - Thứ 6"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 space-y-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Social Media Links</h3>
                        <div className="grid grid-cols-1 gap-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Facebook URL</label>
                                <input
                                    type="text"
                                    value={settings['social_facebook'] || ''}
                                    onChange={(e) => handleChange('social_facebook', e.target.value)}
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zalo URL</label>
                                <input
                                    type="text"
                                    value={settings['social_zalo'] || ''}
                                    onChange={(e) => handleChange('social_zalo', e.target.value)}
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="https://zalo.me/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">YouTube URL</label>
                                <input
                                    type="text"
                                    value={settings['social_youtube'] || ''}
                                    onChange={(e) => handleChange('social_youtube', e.target.value)}
                                    className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map & Embeds */}
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 space-y-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Map & Embeds</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Map Embed URL (src attribute from Google Maps)</label>
                            <textarea
                                rows={4}
                                value={settings['map_embed_url'] || ''}
                                onChange={(e) => handleChange('map_embed_url', e.target.value)}
                                className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-xs"
                                placeholder="https://www.google.com/maps/embed?..."
                            />
                            <p className="mt-1 text-xs text-gray-500">Copy the 'src' URL from Google Maps Embed HTML.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

