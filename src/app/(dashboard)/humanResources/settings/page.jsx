// src/app/dashboard/settings/page.jsx (Conceptual HR Admin Settings Page)
"use client";

import React from 'react';
import HolidayCalendarManager from '@/components/hr/setting/HolidayCalendarManager';
import DataManagement from '@/components/hr/setting/DataManagement';

export default function HrDashboardSettingsPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white text-center">
                HR Dashboard Settings
            </h1>

            <div className="space-y-8">
                <HolidayCalendarManager />
                <DataManagement />

                {/* You can add more settings sections here */}
                {/* E.g., User & Role Management, Policy Configuration, etc. */}
                {/* <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">User & Role Management</h2>
                    <p className="text-gray-700 dark:text-gray-300">Manage HR user accounts and their permissions.</p>
                </div> */}
            </div>
        </div>
    );
}