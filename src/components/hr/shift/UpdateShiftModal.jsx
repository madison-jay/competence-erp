"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function UpdateShiftModal({ isOpen, onClose, onAssignShift, shiftTypes, employee }) {
    const [selectedShiftTypeId, setSelectedShiftTypeId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && employee) {
            setSelectedShiftTypeId(employee.shiftTypeId || '');
        } else {
            setSelectedShiftTypeId('');
        }
    }, [isOpen, employee]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!employee?.id) {
            toast.error("No employee selected.");
            return;
        }

        if (!selectedShiftTypeId && selectedShiftTypeId !== 'unassign') {
            toast.error("Please select a shift type.");
            return;
        }

        setLoading(true);
        try {
            await onAssignShift({
                employeeId: employee.id,
                shiftTypeId: selectedShiftTypeId
            });
            onClose();
        } catch (error) {
            console.error("Error updating shift:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const employeeFullName = employee ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : 'N/A';

    return (
        <div className="fixed inset-0 bg-[#000000aa] bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <h3 className="text-xl font-bold mb-6 text-gray-900">
                    {employee ? `Update Shift for ${employeeFullName}` : "Assign New Shift"}
                </h3>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                    disabled={loading}
                >
                    &times;
                </button>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">
                            Employee
                        </label>
                        <input
                            type="text"
                            id="employeeName"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-gray-50"
                            value={employeeFullName}
                            readOnly
                            disabled
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="shiftType" className="block text-sm font-medium text-gray-700">
                            Shift Type
                        </label>
                        <select
                            id="shiftType"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#b88b1b] focus:border-[#b88b1b] sm:text-sm text-black bg-white"
                            value={selectedShiftTypeId}
                            onChange={(e) => setSelectedShiftTypeId(e.target.value)}
                            required
                            disabled={loading}
                        >
                            <option value="">Select a Shift Type</option>
                            {shiftTypes && shiftTypes.length > 0 ? (
                                shiftTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name} ({type.start_time?.substring(0, 5)} - {type.end_time?.substring(0, 5)})
                                    </option>
                                ))
                            ) : (
                                <option disabled>No shift types available</option>
                            )}
                            <option value="unassign">Unassign Shift</option>
                        </select>
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
                            {loading ? "Updating..." : (employee ? "Update Shift" : "Assign Shift")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}