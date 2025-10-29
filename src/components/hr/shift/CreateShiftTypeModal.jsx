"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function CreateShiftTypeModal({ isOpen, onClose, onCreateShiftType }) {
    const [name, setName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name) {
            toast.error("Shift name is required.");
            return;
        }

        if (!startTime || !endTime) {
            toast.error("Start and end times are required.");
            return;
        }

        setLoading(true);
        try {
            await onCreateShiftType({
                name,
                start_time: startTime,
                end_time: endTime
            });
            setName('');
            setStartTime('');
            setEndTime('');
            onClose();
        } catch (error) {
            console.error("Error creating shift type:", error);
            toast.error(error.message || "Failed to create shift type.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#000000aa] bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Create New Shift Type</h3>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                    disabled={loading}
                >
                    &times;
                </button>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="shiftName" className="block text-sm font-medium text-gray-700">
                            Shift Name
                        </label>
                        <input
                            type="text"
                            id="shiftName"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                            Start Time (HH:MM:SS)
                        </label>
                        <input
                            type="time"
                            id="startTime"
                            step="1"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                            End Time (HH:MM:SS)
                        </label>
                        <input
                            type="time"
                            id="endTime"
                            step="1"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b88b1b]"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#b88b1b] hover:bg-[#a67c18] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b88b1b] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Shift Type"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}