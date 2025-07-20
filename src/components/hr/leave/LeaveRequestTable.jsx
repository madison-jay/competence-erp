"use client"
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast'; 
import apiService from '@/app/lib/apiService';

const DEFAULT_AVATAR = '/default-profile.png';

const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options).replace(/(\w+) (\d+), (\d+)/, '$2 of $1 $3');
};

export const LeaveRow = ({ employee, onUpdateStatus }) => {
    const [imgSrc, setImgSrc] = useState(employee.avatar || DEFAULT_AVATAR);
    const [currentLeaveStatus, setCurrentLeaveStatus] = useState(employee.employment_status);
    const isStatusLocked = currentLeaveStatus === 'Approved' || currentLeaveStatus === 'Declined';

    useEffect(() => {
        setCurrentLeaveStatus(employee.employment_status);
    }, [employee.employment_status]);

    const handleImageError = () => {
        setImgSrc(DEFAULT_AVATAR);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDropdownChange = async (e) => {
        const newStatus = e.target.value;
        setCurrentLeaveStatus(newStatus);

        try {
            const updatedLeaveData = {
                status: newStatus,
            };

            await apiService.updateLeave(employee.id, updatedLeaveData);

            toast.success(`Leave request for ${employee.first_name} ${employee.last_name} updated to ${newStatus}!`);
            if (onUpdateStatus) {
                onUpdateStatus(employee.id, newStatus);
            }
        } catch (error) {
            console.error('Error updating leave status:', error);
            toast.error(`Failed to update leave status: ${error.message || 'An unexpected error occurred.'}`);
            setCurrentLeaveStatus(employee.employment_status); 
        }
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                        <img
                            className="h-full w-full object-cover rounded-full"
                            src={imgSrc}
                            alt={`${employee.first_name}'s avatar`}
                            onError={handleImageError}
                        />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{`${employee.first_name} ${employee.last_name}`}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.department || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.position || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.leave_start_date ? formatDate(employee.leave_start_date) : '—'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.leave_end_date ? formatDate(employee.leave_end_date) : '—'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.leave_duration || '—'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(currentLeaveStatus)} ${isStatusLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                    value={currentLeaveStatus}
                    onChange={handleDropdownChange}
                    disabled={isStatusLocked}
                >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                {employee.admin_approval === 'mark' ? (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg" title="Approved by Admin" />
                ) : (
                    <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-lg" title="Not Approved by Admin" />
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.request_date ? formatDate(employee.request_date) : '—'}
            </td>
        </tr>
    );
};
