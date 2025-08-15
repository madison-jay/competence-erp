"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit } from '@fortawesome/free-solid-svg-icons';

const ShiftTable = ({ shifts = [], onViewShift, onOpenUpdateShiftModal, loading, error }) => {
    if (loading) {
        return <div className="text-center py-8">Loading shifts...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    if (!shifts || shifts.length === 0) {
        return <div className="text-center py-8">No shifts found</div>;
    }

    // Safe filtering of shifts
    const filteredShifts = shifts.filter(shift => {
        if (!shift) return false;
        
        const employeeName = shift.employee?.name?.toLowerCase?.() || '';
        const department = shift.department?.toLowerCase?.() || '';
        const shiftType = shift.shiftType?.toLowerCase?.() || '';
        
        return employeeName || department || shiftType;
    });

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredShifts.map((shift) => (
                        <tr key={shift.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img 
                                            className="h-10 w-10 rounded-full" 
                                            src={shift.employee?.avatar || '/default-profile.png'} 
                                            alt={shift.employee?.name || 'Employee'} 
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {shift.employee?.name || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {shift.employee?.email || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {shift.department || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {shift.shiftType || 'Unassigned'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {shift.startTime && shift.endTime ? `${shift.startTime} - ${shift.endTime}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onViewShift(shift)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                    <button
                                        onClick={() => onOpenUpdateShiftModal(shift)}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ShiftTable;