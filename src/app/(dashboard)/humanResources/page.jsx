// app/humanResources/page.jsx
'use client';

import React from 'react';
import DashboardCard from '@/components/humanResources/DashboardCard';
import Attendance from '@/components/humanResources/AttendanceTable';

export default function HRManagerDashboardPage() {
    return (
        <div className="">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">HR Manager Dashboard</h1>
            <div className="flex justify-between flex-wrap gap-6 p-4 rounded-lg border border-gray-200 shadow-sm">
                <DashboardCard
                    title="Total Employee"
                    value="54"
                    change="+10%"
                    changeType="increase"
                    link="/employees"
                    changedetails="+4 since last month"
                />

                <DashboardCard
                    title="Total Salaries Paid"
                    value="N 5.2 million"
                    change="-2.8%"
                    changeType="decrease"
                    link="/salaries"
                    changedetails='-N400,000 since last month'
                />

                <DashboardCard
                    title="Total Leave Request"
                    value="50"
                    change="+12"
                    changeType="increase"
                    link="/leave-requests"
                    changedetails='+12 since last month'
                />
            </div>
            <Attendance />
        </div>
    );
}
