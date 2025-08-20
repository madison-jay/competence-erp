"use client";

import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const ViewTaskModal = ({ isOpen, onClose, task }) => {
    if (!isOpen || !task) return null;

    const assignedEmployees = task.assignedEmployees || [];
    const primaryEmployee = assignedEmployees.length > 0 ? assignedEmployees[0] : null;

    const employeeName = primaryEmployee ? `${primaryEmployee.first_name} ${primaryEmployee.last_name}` : 'Unassigned';
    const employeeEmail = primaryEmployee ? primaryEmployee.email : 'N/A';
    const employeeProfilePic = primaryEmployee?.avatar_url || '/default-profile.png';

    const renderBadge = (status) => {
        let bgColorClass = '';
        let textColorClass = '';

        const normalizedStatus = status ? status.toLowerCase() : 'unknown';

        switch (normalizedStatus) {
            case 'completed':
                bgColorClass = 'bg-green-100';
                textColorClass = 'text-green-800';
                break;
            case 'pending':
                bgColorClass = 'bg-blue-100';
                textColorClass = 'text-blue-800';
                break;
            case 'in progress':
                bgColorClass = 'bg-yellow-100';
                textColorClass = 'text-yellow-800';
                break;
            case 'overdue':
                bgColorClass = 'bg-red-100';
                textColorClass = 'text-red-800';
                break;
            default:
                bgColorClass = 'bg-gray-100';
                textColorClass = 'text-gray-800';
        }

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColorClass} ${textColorClass}`}
            >
                {status}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-[#b88b1b]">Task Title:</p>
                        <p className="text-lg text-black font-semibold">{task.title}</p>
                    </div>

                    {task.description && (
                        <div>
                            <p className="text-sm font-medium text-[#b88b1b]">Description:</p>
                            <p className="text-base text-black font-semibold whitespace-pre-wrap">{task.description}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-sm font-medium text-[#b88b1b]">Assigned To:</p>
                        <div className="flex items-center mt-1">
                            {primaryEmployee ? (
                                <>
                                    <Image
                                        className="h-8 w-8 rounded-full object-cover mr-2"
                                        src={employeeProfilePic}
                                        alt={`${employeeName}'s profile`}
                                        width={32}
                                        height={32}
                                        unoptimized={employeeProfilePic.startsWith('http')}
                                    />
                                    <p className="text-base text-black font-semibold">{employeeName} {employeeEmail !== 'N/A' && `(${employeeEmail})`}</p>
                                </>
                            ) : (
                                <p className="text-base text-black font-semibold">Unassigned</p>
                            )}
                        </div>
                        {assignedEmployees.length > 1 && (
                            <p className="text-sm text-gray-500 mt-1">
                                +{assignedEmployees.length - 1} more assigned
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-[#b88b1b]">Start Date:</p>
                            <p className="text-base text-black font-semibold">{task.start_date}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#b88b1b]">Due Date:</p>
                            <p className="text-base text-black font-semibold">{task.end_date}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-[#b88b1b]">Status:</p>
                        {renderBadge(task.status)}
                    </div>

                    {task.isOverdue && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-700 font-medium">This task is overdue</p>
                        </div>
                    )}

                    {task.task_documents && task.task_documents.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-[#b88b1b] mt-4">Attachments:</p>
                            <div className="mt-2 space-y-2">
                                {task.task_documents.map((doc, index) => (
                                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                                        <FontAwesomeIcon icon={faFileAlt} className="h-5 w-5 mr-2 text-gray-500" />
                                        <a
                                            href={doc.document_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline break-all text-sm"
                                        >
                                            {doc.document_name || 'Document'}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center rounded-md border border-transparent bg-[#b88b1b] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#a67c18] focus:outline-none focus:ring-2 focus:ring-[#b88b1b] focus:ring-offset-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewTaskModal;