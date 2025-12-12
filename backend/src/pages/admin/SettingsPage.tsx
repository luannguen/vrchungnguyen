import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { toast } from 'react-hot-toast';

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 space-y-6">

                    {/* General Settings */}
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">General Settings</h3>
                        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                            <div className="sm:col-span-2">
                                <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Site Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="site_name"
                                        value={settings['site_name'] || ''}
                                        onChange={(e) => handleChange('site_name', e.target.value)}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Contact Information</h3>
                        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">

                            <div className="sm:col-span-1">
                                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contact Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        id="contact_email"
                                        value={settings['contact_email'] || ''}
                                        onChange={(e) => handleChange('contact_email', e.target.value)}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-1">
                                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contact Phone
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="contact_phone"
                                        value={settings['contact_phone'] || ''}
                                        onChange={(e) => handleChange('contact_phone', e.target.value)}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="contact_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Address
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="contact_address"
                                        value={settings['contact_address'] || ''}
                                        onChange={(e) => handleChange('contact_address', e.target.value)}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="copyright_text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Copyright Text
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="copyright_text"
                                        value={settings['copyright_text'] || ''}
                                        onChange={(e) => handleChange('copyright_text', e.target.value)}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

