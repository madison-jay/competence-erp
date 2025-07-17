"use client"

import PayrollCard from '@/components/hr/payroll/PayrollCard';
import Link from 'next/link';
import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faAngleLeft, faAngleRight, faEye } from '@fortawesome/free-solid-svg-icons';

export default function PayrollPage() {
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8); // Number of items per page
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Dummy data for the table
    const [payrollData, _setPayrollData] = useState([
        { id: 1, name: 'John Doe', email: 'john@madisonjay.com', date: 'Jul 11, 2025 - 09:45 AM', department: 'HR', salary: 200000, bonus: 50000, status: 'Paid', avatar: 'https://placehold.co/40x40/FFD700/000?text=JD' },
        { id: 2, name: 'Fuad Abdulrauf', email: 'fuad@madisonjay.com', date: 'Jul 11, 2025 - 09:45 AM', department: 'IT', salary: 200000, bonus: 50000, status: 'Pending', avatar: 'https://placehold.co/40x40/ADD8E6/000?text=FA' },
        { id: 3, name: 'Victor Oluwatobi', email: 'victor@madisonjay.com', date: 'Jul 11, 2025 - 09:45 AM', department: 'Customer service', salary: 200000, bonus: 50000, status: 'Failed', avatar: 'https://placehold.co/40x40/90EE90/000?text=VO' },
        { id: 4, name: 'Mary Smith', email: 'mary@madisonjay.com', date: 'Jul 11, 2025 - 09:45 AM', department: 'Sales', salary: 200000, bonus: 50000, status: 'Paid', avatar: 'https://placehold.co/40x40/FFB6C1/000?text=MS' },
        { id: 5, name: 'Isreal Inene', email: 'isreal@madisonjay.com', date: 'Jul 11, 2025 - 09:45 AM', department: 'Engineering', salary: 200000, bonus: 50000, status: 'Paid', avatar: 'https://placehold.co/40x40/DDA0DD/000?text=II' },
        { id: 6, name: 'Esther John', email: 'esther@madisonjay.com', date: 'Jul 11, 2025 - 09:45 AM', department: 'Finance', salary: 200000, bonus: 50000, status: 'Pending', avatar: 'https://placehold.co/40x40/FFFACD/000?text=EJ' },
        { id: 7, name: 'Victor Bakare', email: 'victor@madisonjay.com', date: 'Jul 11, 2025 - 09:45 AM', department: 'IT', salary: 200000, bonus: 50000, status: 'Failed', avatar: 'https://placehold.co/40x40/C0C0C0/000?text=VB' },
        { id: 8, name: 'Gabriel Timothy', email: 'gabriel@madisonjay.com', date: 'Jul 11, 2025 - 09:45 AM', department: 'HR', salary: 200000, bonus: 50000, status: 'Pending', avatar: 'https://placehold.co/40x40/FFDAB9/000?text=GT' },
        { id: 9, name: 'Gabriel Timothy', email: 'gabriel@madisonjay.com', date: 'Jul 11, 2025 - 09:45 AM', department: 'HR', salary: 200000, bonus: 50000, status: 'Pending', avatar: 'https://placehold.co/40x40/FFDAB9/000?text=GT' },
        { id: 10, name: 'Alice Wonderland', email: 'alice@madisonjay.com', date: 'Jul 10, 2025 - 10:00 AM', department: 'Marketing', salary: 180000, bonus: 40000, status: 'Paid', avatar: 'https://placehold.co/40x40/E0BBE4/000?text=AW' },
        { id: 11, name: 'Bob The Builder', email: 'bob@madisonjay.com', date: 'Jul 10, 2025 - 10:30 AM', department: 'Construction', salary: 220000, bonus: 60000, status: 'Failed', avatar: 'https://placehold.co/40x40/957DAD/000?text=BB' },
        { id: 12, name: 'Charlie Chaplin', email: 'charlie@madisonjay.com', date: 'Jul 09, 2025 - 11:00 AM', department: 'HR', salary: 190000, bonus: 45000, status: 'Paid', avatar: 'https://placehold.co/40x40/D291BC/000?text=CC' },
        { id: 13, name: 'Diana Prince', email: 'diana@madisonjay.com', date: 'Jul 09, 2025 - 11:30 AM', department: 'Legal', salary: 250000, bonus: 70000, status: 'Pending', avatar: 'https://placehold.co/40x40/FFC72C/000?text=DP' },
        { id: 14, name: 'Eve Harrington', email: 'eve@madisonjay.com', date: 'Jul 08, 2025 - 12:00 PM', department: 'Sales', salary: 170000, bonus: 35000, status: 'Paid', avatar: 'https://placehold.co/40x40/F7B2BD/000?text=EH' },
        { id: 15, name: 'Frankenstein', email: 'frank@madisonjay.com', date: 'Jul 08, 2025 - 01:00 PM', department: 'R&D', salary: 210000, bonus: 55000, status: 'Failed', avatar: 'https://placehold.co/40x40/A7D9B8/000?text=FR' },
    ]);

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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...payrollData];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle string comparison for names and departments
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [payrollData, sortConfig]);

    const filteredData = useMemo(() => {
        return sortedData.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sortedData, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getClassNamesFor = (name) => {
        if (!sortConfig.key) {
            return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case 'Paid':
                return 'text-green-600 bg-green-100';
            case 'Pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'Failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    // Generate pagination numbers
    const getPaginationNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (startPage > 1) {
            pageNumbers.push(1);
            if (startPage > 2) {
                pageNumbers.push('...');
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push('...');
            }
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };


    return (
        <div className="">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-5 mb-14">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Payroll Management</h1>
                    <p className="text-[#A09D9D] font-medium mt-2 text-sm">View and manage all payroll activities in your organization</p>
                </div>
                <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D] text-sm mt-4 sm:mt-0'>
                    {currentDateTime}
                </span>
            </div>
            <div className='mb-10 px-5 py-7 bg-[#FDEDC5] text-center rounded-xl'>
                <p className='text-[#A09D9D] text-[16px] font-medium'>Your next payroll is</p>
                <p className='text-black font-medium text-xl my-4'>Pay period (Jul 3, to Aug 10, 2023)</p>
                <p className='text-[#A09D9D] text-[16px] font-medium'>Click prepare payroll to begin running payroll for this period</p>
                <Link href="/humanResources/payroll/prepare-payroll" className='inline-block mt-4 bg-[#b88b1b] text-white px-6 py-2 rounded-lg hover:bg-[#b88b1b]/90 transition-colors duration-300'>Prepare Payroll</Link>
            </div>
            <div className='flex flex-wrap gap-4 justify-between items-center mb-10'>
                <PayrollCard title="Total employees" value={54} />
                <PayrollCard title="Total net(N)" value='200,000,000' />
                <PayrollCard title="Total salary(N)" value="500,879,000" />
                <PayrollCard title="Total gross(N)" value="500,000,000" />
            </div>

            {/* Recent Activity Table */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Recent activity</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b88b1b] focus:border-[#b88b1b]"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('name')}
                                >
                                    Employee
                                    {getClassNamesFor('name') === 'ascending' && ' ↑'}
                                    {getClassNamesFor('name') === 'descending' && ' ↓'}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('date')}
                                >
                                    Date and Time
                                    {getClassNamesFor('date') === 'ascending' && ' ↑'}
                                    {getClassNamesFor('date') === 'descending' && ' ↓'}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('department')}
                                >
                                    Department
                                    {getClassNamesFor('department') === 'ascending' && ' ↑'}
                                    {getClassNamesFor('department') === 'descending' && ' ↓'}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('salary')}
                                >
                                    Salary
                                    {getClassNamesFor('salary') === 'ascending' && ' ↑'}
                                    {getClassNamesFor('salary') === 'descending' && ' ↓'}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('bonus')}
                                >
                                    Bonus
                                    {getClassNamesFor('bonus') === 'ascending' && ' ↑'}
                                    {getClassNamesFor('bonus') === 'descending' && ' ↓'}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('status')}
                                >
                                    Status
                                    {getClassNamesFor('status') === 'ascending' && ' ↑'}
                                    {getClassNamesFor('status') === 'descending' && ' ↓'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full" src={item.avatar} alt={`${item.name}'s avatar`} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                    <div className="text-sm text-gray-500">{item.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.department}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            N {item.salary.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            N {item.bonus.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className='p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-300 cursor-pointer'>
                                                <FontAwesomeIcon icon={faEye} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        No matching payroll activities found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faAngleLeft} className="mr-2" /> Previous
                    </button>
                    <div className="flex space-x-2">
                        {getPaginationNumbers().map((number, index) => (
                            <button
                                key={index}
                                onClick={() => typeof number === 'number' && paginate(number)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                    currentPage === number
                                        ? 'bg-[#b88b1b] text-white'
                                        : typeof number === 'number'
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        : 'text-gray-500 cursor-default' // For '...'
                                }`}
                                disabled={typeof number !== 'number'}
                            >
                                {number}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next <FontAwesomeIcon icon={faAngleRight} className="ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
}
