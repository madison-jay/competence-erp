"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function ShiftManagement({ shifts, loading, error }) {
    const router = useRouter(); // Initialize useRouter
    const [selectedDate, setSelectedDate] = useState('');
    const [displayDates, setDisplayDates] = useState([]);

    useEffect(() => {
        const initializeDates = () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dates = [];
            for (let i = 0; i < 5; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                dates.push(date);
            }
            setDisplayDates(dates);
            setSelectedDate(today.toISOString().split('T')[0]);
        };

        initializeDates();
    }, []);

    const getFilteredShifts = () => {
        if (!shifts || !selectedDate) {
            return [];
        }
        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setHours(0, 0, 0, 0);

        return shifts.filter(shift => {
            if (!shift.date) return false;
            const shiftDateObj = new Date(shift.date);
            shiftDateObj.setHours(0, 0, 0, 0);

            return shiftDateObj.getTime() === selectedDateObj.getTime();
        });
    };

    const formatDateForDisplay = (date) => {
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    };

    const getDayOfWeek = (date) => {
        return date.toLocaleString('en-US', { weekday: 'long' });
    };

    const shiftsToDisplay = getFilteredShifts();

    const handleSeeAllClick = () => {
        router.push('/humanResources/shift'); // Navigate to the dedicated shifts page
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 my-8">
            <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Shift Management</h2>
                <button
                    onClick={handleSeeAllClick} // Add onClick handler
                    className="text-[#A09D9D] text-sm font-medium hover:text-black transition-all cursor-pointer rounded-md px-3 py-1"
                >
                    See all
                </button>
            </div>

            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4 overflow-x-auto">
                {displayDates.map((date, index) => {
                    const dateString = date.toISOString().split('T')[0];
                    const isSelected = dateString === selectedDate;
                    const dayOfWeek = getDayOfWeek(date);

                    return (
                        <div
                            key={index}
                            className={`flex flex-col items-center cursor-pointer p-4 rounded-lg transition-colors duration-200
                                ${isSelected ? 'bg-[#b88b1b] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 transition-all '}`}
                            onClick={() => setSelectedDate(dateString)}
                        >
                            <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                {formatDateForDisplay(date).split(' ')[0]}
                            </span>
                            <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                {formatDateForDisplay(date).split(' ')[1]}
                            </span>
                            <span className={`text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                {dayOfWeek}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {loading ? (
                    <div className="text-center text-gray-500 p-8">Loading shifts...</div>
                ) : error ? (
                    <div className="text-center text-red-500 p-8">Error: {error}</div>
                ) : shiftsToDisplay.length > 0 ? (
                    shiftsToDisplay.map(shift => (
                        <div key={shift.id} className="flex items-center p-3 rounded-lg border border-gray-100">
                            <img
                                src={shift.employee?.avatar || 'https://placehold.co/100x100/A09D9D/ffffff?text=?'}
                                alt={shift.employee?.name || 'Employee'}
                                className="w-12 h-12 rounded-full mr-4 object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/A09D9D/ffffff?text=?' }}
                            />
                            <div>
                                <p className="font-semibold text-gray-800">{shift.employee?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">{shift.employee?.role || shift.department || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{shift.startTime} - {shift.endTime}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 p-8">
                        No shifts scheduled for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
                    </div>
                )}
            </div>
        </div>
    );
}