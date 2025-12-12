import React, { useState } from 'react';
import { Save } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const [siteName, setSiteName] = useState('VRC Admin');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const handleSave = () => {
        // Mock save
        alert('Settings saved!');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
                <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 space-y-6">

                    {/* General Settings */}
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">General Settings</h3>
                        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                            <div className="sm:col-span-1">
                                <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
                                    Site Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="site-name"
                                        id="site-name"
                                        value={siteName}
                                        onChange={(e) => setSiteName(e.target.value)}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* Features */}
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Features</h3>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="maintenance-mode"
                                        name="maintenance-mode"
                                        type="checkbox"
                                        checked={maintenanceMode}
                                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="maintenance-mode" className="font-medium text-gray-700">
                                        Maintenance Mode
                                    </label>
                                    <p className="text-gray-500">Redirect all non-admin users to a maintenance page.</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="email-notifications"
                                        name="email-notifications"
                                        type="checkbox"
                                        checked={emailNotifications}
                                        onChange={(e) => setEmailNotifications(e.target.checked)}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="email-notifications" className="font-medium text-gray-700">
                                        Email Notifications
                                    </label>
                                    <p className="text-gray-500">Receive email alerts for new user registrations.</p>
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
