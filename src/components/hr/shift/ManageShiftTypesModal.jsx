// components/hr/shift/ManageShiftTypesModal.jsx
"use client";

import React, { useState, useEffect } from 'react';

export default function ManageShiftTypesModal({ isOpen, onClose, shiftTypes, onUpdateShiftType }) {
    const [editableShiftTypes, setEditableShiftTypes] = useState([]);

    useEffect(() => {
        if (isOpen && shiftTypes) {
            setEditableShiftTypes(shiftTypes.map(type => ({ ...type })));
        }
    }, [isOpen, shiftTypes]);

    if (!isOpen) return null;

    const handleTimeChange = (id, field, value) => {
        setEditableShiftTypes(prevTypes =>
            prevTypes.map(type =>
                type.id === id ? { ...type, [field]: value } : type
            )
        );
    };

    const handleSave = async (shiftTypeToSave) => {
        await onUpdateShiftType(shiftTypeToSave.id, {
            name: shiftTypeToSave.name,
            start_time: shiftTypeToSave.start_time,
            end_time: shiftTypeToSave.end_time,
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Manage Shift Types</h2>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                >
                    &times;
                </button>

                {editableShiftTypes.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">No shift types available.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Shift Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Start Time (HH:MM)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        End Time (HH:MM)
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {editableShiftTypes.map(type => (
                                    <tr key={type.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {type.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="time"
                                                value={type.start_time || ''}
                                                onChange={(e) => handleTimeChange(type.id, 'start_time', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b88b1b] focus:ring-[#b88b1b] sm:text-sm"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="time"
                                                value={type.end_time || ''}
                                                onChange={(e) => handleTimeChange(type.id, 'end_time', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b88b1b] focus:ring-[#b88b1b] sm:text-sm"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleSave(type)}
                                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#b88b1b] hover:bg-[#a67c18] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b88b1b]"
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}