import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesOvertime = () => {
    const data = [
        { month: 'Jan', sales: 2500000, costs: 1000000 },
        { month: 'Feb', sales: 4500000, costs: 3500000 },
        { month: 'Mar', sales: 3500000, costs: 2500000 },
        { month: 'Apr', sales: 1500000, costs: 500000 },
        { month: 'May', sales: 3500000, costs: 1500000 },
        { month: 'Jun', sales: 4000000, costs: 1000000 },
        { month: 'Jul', sales: 6500000, costs: 5500000 },
        { month: 'Aug', sales: 3000000, costs: 500000 },
        { month: 'Sep', sales: 9000000, costs: 3500000 },
        { month: 'Oct', sales: 8500000, costs: 500000 },
        { month: 'Nov', sales: 5500000, costs: 500000 },
        { month: 'Dec', sales: 7500000, costs: 500000 },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Sales overtime</h2>
            </div>
            <div className="flex items-center mb-4 text-sm">
                <span className="inline-block w-3 h-3 bg-green-500 mr-2"></span>
                <span className="mr-4">Sales (revenue)</span>
                <span className="inline-block w-3 h-3 bg-red-500 mr-2"></span>
                <span>Costs (expenditure)</span>
            </div>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `N${value / 1000000}m`} />
                        <Tooltip formatter={(value) => `N${value.toLocaleString()}`} />
                        <Bar dataKey="sales" fill="#22C55E" barSize={20} />
                        <Bar dataKey="costs" fill="#EF4444" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesOvertime;