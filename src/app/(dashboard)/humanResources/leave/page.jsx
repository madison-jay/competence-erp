"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { LeaveRow } from '@/components/hr/leave/LeaveRequestTable'; // Assuming LeaveRow is correctly imported
import apiService from '@/app/lib/apiService';
import toast from 'react-hot-toast'; // Assuming toast is available

// LeaveRequestTable Component
const LeaveRequestTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const employeesPerPage = 5; // Renamed to leavesPerPage for clarity, but keeping original for now
    const [currentDateTime, setCurrentDateTime] = useState('');

    // State for actual leave data, loading, and error
    const [leavesData, setLeavesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch leave requests from the API on component mount
    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiService.getLeaves();
                // Assuming your backend returns an array of leave objects
                setLeavesData(data);
            } catch (err) {
                console.error("Error fetching leave requests:", err);
                setError("Failed to load leave requests. Please try again.");
                toast.error("Failed to load leave requests.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaves();
    }, []); // Empty dependency array means this runs once on mount

    const handleUpdateEmployeeStatus = (employeeId, newStatus) => {
        // Optimistically update the local state
        setLeavesData(prevLeaves =>
            prevLeaves.map(leave => {
                if (leave.id === employeeId) {
                    // Assuming 'employment_status' in your leave object maps to the status field
                    return { ...leave, employment_status: newStatus };
                }
                return leave;
            })
        );
        // The actual API call for updating status is handled within LeaveRow,
        // so no direct API call here. The onUpdateStatus prop is just for local state sync.
    };

    const filteredLeaves = useMemo(() => {
        if (!searchTerm) {
            return leavesData;
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return leavesData.filter(leave =>
            // Adjust these fields based on what's searchable in your leave object
            (leave.first_name && leave.first_name.toLowerCase().includes(lowercasedSearchTerm)) ||
            (leave.last_name && leave.last_name.toLowerCase().includes(lowercasedSearchTerm)) ||
            (leave.email && leave.email.toLowerCase().includes(lowercasedSearchTerm)) ||
            (leave.department && leave.department.toLowerCase().includes(lowercasedSearchTerm)) ||
            (leave.position && leave.position.toLowerCase().includes(lowercasedSearchTerm))
        );
    }, [searchTerm, leavesData]);

    const indexOfLastLeave = currentPage * employeesPerPage;
    const indexOfFirstLeave = indexOfLastLeave - employeesPerPage;
    const currentLeaves = filteredLeaves.slice(indexOfFirstLeave, indexOfLastLeave);
    const totalPages = Math.ceil(filteredLeaves.length / employeesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(1);
            if (startPage > 2) pageNumbers.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }

        return pageNumbers.map((number, index) => (
            <button
                key={index}
                onClick={() => typeof number === 'number' && paginate(number)}
                className={`px-4 py-2 rounded-md mx-1 text-sm font-medium transition-colors
                    ${number === currentPage ? 'bg-white border border-solid border-[#b88b1b]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    ${number === '...' ? 'cursor-default bg-transparent hover:bg-transparent' : ''}`}
                disabled={number === '...'}
            >
                {number}
            </button>
        ));
    };

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            setCurrentDateTime(now.toLocaleString('en-US', options));
        };

        updateDateTime();
        const intervalId = setInterval(updateDateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);


    return (
        <div className="">
            <div className="">
                {/* Header Section */}
                <div className='flex justify-between items-center mt-5 mb-14 flex-wrap gap-4'>
                    <div>
                        <h1 className='text-2xl font-bold '>Leave Request Management</h1>
                        <p className='text-[#A09D9D] font-medium mt-2'>View and manage all leave requests in your organization</p>
                    </div>
                    <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
                        {currentDateTime}
                    </span>
                </div>

                {/* Employee List Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">Leave list</h2>
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            {/* Search icon */}
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Conditional rendering for loading, error, and empty states */}
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading leave requests...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : filteredLeaves.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No leave requests found.</div>
                ) : (
                    <div className="overflow-x-auto shadow-md sm:rounded-lg rounded-lg border border-gray-200 table-container">
                        <table className="min-w-full divide-y divide-gray-200 bg-white">
                            <thead>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Days</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved by Admin</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentLeaves.map(leave => (
                                    // Pass 'leave' object as 'employee' prop to LeaveRow
                                    <LeaveRow key={leave.id} employee={leave} onUpdateStatus={handleUpdateEmployeeStatus} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {filteredLeaves.length > 0 && (
                    <div className="flex justify-center items-center mt-6 space-x-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:text-white hover:bg-[#b88b1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            &lt;
                        </button>
                        {renderPaginationNumbers()}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:text-white hover:bg-[#b88b1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveRequestTable;
