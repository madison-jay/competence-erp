"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';

const HolidayCalendarManager = () => {
    const [holidays, setHolidays] = useState([]);
    const [newHoliday, setNewHoliday] = useState({ date: '', name: '', type: 'public', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHrManager, setIsHrManager] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const checkUserRoleAndFetchHolidays = async () => {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const userRole = user.app_metadata.role;
                setIsHrManager(userRole === 'hr_manager');
            } else {
                setIsHrManager(false);
            }

            const { data, error: fetchError } = await supabase
                .from('holidays')
                .select('*')
                .order('date', { ascending: true });

            if (fetchError) {
                console.error('Error fetching holidays:', fetchError.message);
                setError('Failed to load holidays.');
            } else {
                setHolidays(data);
            }
            setLoading(false);
        };

        checkUserRoleAndFetchHolidays();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewHoliday(prev => ({ ...prev, [name]: value }));
    };

    const addHoliday = async (e) => {
        e.preventDefault();
        setError(null);

        if (!isHrManager) {
            setError("You do not have permission to add holidays.");
            return;
        }

        if (!newHoliday.date || !newHoliday.name) {
            setError("Date and Name are required for a new holiday.");
            return;
        }

        const { data, error } = await supabase
            .from('holidays')
            .insert([newHoliday])
            .select();

        if (error) {
            console.error('Error adding holiday:', error.message);
            if (error.message.includes('violates row-level security policy')) {
                setError('Failed to add holiday: Insufficient permissions.');
            } else {
                setError('Failed to add holiday.');
            }
        } else {
            setHolidays(prev => [...prev, ...data]);
            setNewHoliday({ date: '', name: '', type: 'public', description: '' });
        }
    };

    const deleteHoliday = async (id) => {
        setError(null);

        if (!isHrManager) {
            setError("You do not have permission to delete holidays.");
            return;
        }

        const { error } = await supabase
            .from('holidays')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting holiday:', error.message);
            if (error.message.includes('violates row-level security policy')) {
                setError('Failed to delete holiday: Insufficient permissions.');
            } else {
                setError('Failed to delete holiday.');
            }
        } else {
            setHolidays(prev => prev.filter(holiday => holiday.id !== id));
        }
    };

    if (loading) {
        return <div className="text-gray-600">Loading holidays...</div>;
    }

    if (error) {
        return <div className="text-red-600">Error: {error}</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Holiday Calendar Management</h2>

            {isHrManager ? (
                <form onSubmit={addHoliday} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 border rounded-lg bg-gray-50">
                    <div className="flex flex-col">
                        <label htmlFor="date" className="text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={newHoliday.date}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={newHoliday.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Christmas Day"
                            className="p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="type" className="text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            id="type"
                            name="type"
                            value={newHoliday.type}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                        >
                            <option value="public">Public Holiday</option>
                            <option value="company">Company Holiday</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={newHoliday.description}
                            onChange={handleInputChange}
                            placeholder="Optional details"
                            className="p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>
                    <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                        >
                            Add Holiday
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-4 border rounded-lg bg-blue-50 text-blue-800">
                    You need `hr_manager` permissions to add new holidays.
                </div>
            )}

            <h3 className="text-xl font-semibold mb-3 text-gray-700">Existing Holidays</h3>
            {holidays.length === 0 ? (
                <p className="text-gray-500">No holidays added yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Date</th>
                                <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Type</th>
                                <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Description</th>
                                <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holidays.map((holiday) => (
                                <tr key={holiday.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b text-gray-800">{holiday.date}</td>
                                    <td className="py-2 px-4 border-b text-gray-800">{holiday.name}</td>
                                    <td className="py-2 px-4 border-b text-gray-800 capitalize">{holiday.type}</td>
                                    <td className="py-2 px-4 border-b text-gray-800">{holiday.description || 'N/A'}</td>
                                    <td className="py-2 px-4 border-b">
                                        {isHrManager && (
                                            <button
                                                onClick={() => deleteHoliday(holiday.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HolidayCalendarManager;