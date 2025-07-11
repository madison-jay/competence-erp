"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from "@/app/lib/supabase/client";
import AddEmployeeModal from '@/components/hr/employees/AddEmployee';
import EmployeeDetailModal from '@/components/hr/employees/EmployeeDetails';
import EditEmployeeModal from '@/components/hr/employees/EditEmployee';

const supabase = createClient();

const DEFAULT_AVATAR = 'https://placehold.co/40x40/cccccc/000000?text=👤';

const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options).replace(/(\w+) (\d+), (\d+)/, '$2 of $1 $3');
};

const EmployeeRow = ({ employee, onEdit, onView }) => {
    const [imgSrc, setImgSrc] = useState(employee.avatar_url || DEFAULT_AVATAR);

    // Handles image loading errors, falling back to a default avatar
    const handleImageError = () => {
        setImgSrc(DEFAULT_AVATAR);
    };

    // Determines the Tailwind CSS classes for the employment status badge
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Probation':
                return 'bg-yellow-100 text-yellow-800';
            case 'Transferred':
                return 'bg-blue-100 text-blue-800';
            case 'Terminated':
                return 'bg-red-100 text-red-800';
            case 'On Leave':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                {employee.phone_number || '—'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.position_id || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(employee.date_of_birth)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(employee.hire_date)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.employment_status)}`}>
                    {employee.employment_status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                    onClick={() => onView(employee)}
                    className="text-gray-600 hover:text-gray-800 mr-2 p-1 rounded-md hover:bg-gray-50"
                    title="View Details"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
                <button
                    onClick={() => onEdit(employee)}
                    className="text-blue-600 hover:text-blue-800 mr-2 p-1 rounded-md hover:bg-blue-50"
                    title="Edit"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z" />
                    </svg>
                </button>
            </td>
        </tr>
    );
};

/**
 * EmployeeListTable component displays a list of employees with search, pagination,
 * and actions to add, view, and edit employees.
 */
const EmployeeListTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(''); // Use setSuccessMessage
    const employeesPerPage = 10;
    const [currentDateTime, setCurrentDateTime] = useState('');

    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [isViewEmployeeModalOpen, setIsViewEmployeeModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null); // Used for viewing details

    // State for the Edit Employee Modal
    const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
    const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState(null); // Holds employee data for editing

    // Fetches employee data from Supabase, including linked position and department names.
    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);
        // Select all employee fields and join with 'positions' and 'departments' tables
        const { data, error } = await supabase
            .from('employees')
            .select(`
                *,
                positions (id, title),
                departments (id, name)
            `);

        if (error) {
            console.error("Error fetching employees:", error);
            setError("Failed to fetch employees. Please try again.");
        } else {
            // Map the fetched data to include position_id and department_id as their names/titles
            const employeesWithDetails = data.map(employee => ({
                ...employee,
                position_id: employee.positions?.id, // Keep ID for edit modal
                position_title: employee.positions?.title || 'N/A', // Display title
                department_id: employee.departments?.id, // Keep ID for edit modal
                department_name: employee.departments?.name || 'N/A', // Display name
            }));
            setEmployees(employeesWithDetails || []);
        }
        setLoading(false);
    }, []);

    // Effect hook to fetch employees on component mount
    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    /**
     * Handles the edit action for an employee.
     * Sets the selected employee data for editing and opens the edit modal.
     * @param {object} employeeData - The full employee object to be edited.
     */
    const handleEdit = (employeeData) => {
        setSelectedEmployeeForEdit(employeeData);
        setIsEditEmployeeModalOpen(true);
    };

    /**
     * Handles the view action for an employee.
     * Sets the selected employee data for viewing and opens the detail modal.
     * @param {object} employeeData - The full employee object to be viewed.
     */
    const handleView = (employeeData) => {
        setSelectedEmployee(employeeData);
        setIsViewEmployeeModalOpen(true);
    };

    /**
     * Callback function executed after a new employee is successfully added.
     * Refetches employees, closes the add modal, and displays a success toast.
     */
    const handleEmployeeAdded = () => {
        fetchEmployees();
        setIsAddEmployeeModalOpen(false);
        setSuccessMessage('New employee added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    };

    /**
     * Callback function executed after an employee is successfully updated.
     * Refetches employees, closes the edit modal, and displays a success toast.
     */
    const handleEmployeeUpdated = () => {
        fetchEmployees();
        setIsEditEmployeeModalOpen(false);
        setSuccessMessage('Employee details updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    };

    // Memoized filtered employees based on search term
    const filteredEmployees = useMemo(() => {
        if (!searchTerm) {
            return employees;
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return employees.filter(employee =>
            employee.first_name?.toLowerCase().includes(lowercasedSearchTerm) ||
            employee.last_name?.toLowerCase().includes(lowercasedSearchTerm) ||
            employee.email?.toLowerCase().includes(lowercasedSearchTerm) ||
            employee.phone_number?.includes(lowercasedSearchTerm)
        );
    }, [searchTerm, employees]);

    // Pagination logic
    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Renders pagination numbers with ellipsis for large number of pages
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

    // Effect to update current date and time
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
        <div className="max-w-[1400px] mx-auto">
            <div className='flex justify-between items-center mt-5 mb-14 flex-wrap gap-4'>
                <div>
                    <h1 className='text-2xl font-bold '>Employee directory page</h1>
                    <p className='text-[#A09D9D] font-medium mt-2'>Manage and collaborate within your organization’s teams</p>
                </div>
                <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
                    {currentDateTime}
                </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-6">
                <h2 className="text-2xl font-semibold text-gray-800">Employee list</h2>
                <div className="flex items-center space-x-4 w-full sm:w-auto flex-wrap gap-4">
                    <div className='flex flex-nowrap gap-2 items-center'>
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <button
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Filter"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 9.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <button
                        onClick={() => setIsAddEmployeeModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-[#b88b1b] text-white rounded-lg hover:bg-[#997417] transition-colors shadow-md cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add employee
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                </div>
            )}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading employees...</div>
            ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No employees found matching your search.</div>
            ) : (
                <div className="overflow-x-auto shadow-md sm:rounded-lg rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                        <thead>
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile no</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of birth</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentEmployees.map(employee => (
                                <EmployeeRow
                                    key={employee.id}
                                    employee={employee}
                                    onEdit={handleEdit}
                                    onView={handleView}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredEmployees.length > 0 && (
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
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:text-white hover:bg-[#b88b1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        &gt;
                    </button>
                </div>
            )}

            {/* Add Employee Multi-Step Modal */}
            <AddEmployeeModal
                isOpen={isAddEmployeeModalOpen}
                onClose={() => setIsAddEmployeeModalOpen(false)}
                onEmployeeAdded={handleEmployeeAdded}
            />

            {/* Employee Detail Modal */}
            <EmployeeDetailModal
                isOpen={isViewEmployeeModalOpen}
                onClose={() => setIsViewEmployeeModalOpen(false)}
                employee={selectedEmployee}
            />

            {/* Edit Employee Modal */}
            <EditEmployeeModal
                isOpen={isEditEmployeeModalOpen}
                onClose={() => setIsEditEmployeeModalOpen(false)}
                onEmployeeUpdated={handleEmployeeUpdated}
                employee={selectedEmployeeForEdit}
            />
        </div>
    );
};

export default EmployeeListTable;
