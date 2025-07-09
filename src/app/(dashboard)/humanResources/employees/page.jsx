"use client"

import React, { useState, useEffect, useMemo } from 'react';

// Default avatar for image fallbacks
const DEFAULT_AVATAR = 'https://placehold.co/40x40/cccccc/000000?text=👤';

// Helper function to generate a simple UUID-like string
const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Helper function to generate a random date within a range
const getRandomDate = (start, end) => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Helper function to generate a random timestamp
const getRandomTimestamp = (start, end) => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString(); // ISO 8601 format with timezone
};

// Data for Nigerian locations and names - EMBEDDED DIRECTLY
const NIGERIAN_CITIES_STATES = [
    { city: "Lagos", state: "Lagos", zip_code: "100001" },
    { city: "Abuja", state: "FCT", zip_code: "900001" },
    { city: "Port Harcourt", state: "Rivers", zip_code: "500001" },
    { city: "Kano", state: "Kano", zip_code: "700001" },
    { city: "Ibadan", state: "Oyo", zip_code: "200001" },
    { city: "Enugu", state: "Enugu", zip_code: "400001" },
    { city: "Calabar", state: "Cross River", zip_code: "540001" },
    { city: "Benin City", state: "Edo", zip_code: "300001" },
    { city: "Kaduna", state: "Kaduna", zip_code: "800001" },
    { city: "Jos", state: "Plateau", zip_code: "930001" },
];

const NIGERIAN_FIRST_NAMES = [
    "Chinedu", "Fatima", "Oluwaseun", "Aisha", "Emeka", "Zainab", "Tunde", "Amaka",
    "Mohammed", "Ngozi", "David", "Blessing", "Kunle", "Funke", "Segun"
];
const NIGERIAN_LAST_NAMES = [
    "Okoro", "Abdullahi", "Adekunle", "Musa", "Nwachukwu", "Aliyu", "Oladipo", "Chukwu",
    "Ibrahim", "Nwosu", "Akpan", "Eze", "Sani", "Bello", "Okafor"
];

const FAKE_EMPLOYEES = Array.from({ length: 15 }, (_, i) => {
    const randomCityState = NIGERIAN_CITIES_STATES[Math.floor(Math.random() * NIGERIAN_CITIES_STATES.length)];
    const firstName = NIGERIAN_FIRST_NAMES[Math.floor(Math.random() * NIGERIAN_FIRST_NAMES.length)];
    const lastName = NIGERIAN_LAST_NAMES[Math.floor(Math.random() * NIGERIAN_LAST_NAMES.length)];
    const phoneNumber = `+234${Math.floor(100000000 + Math.random() * 900000000)}`; // Nigerian format

    let employmentStatus;
    if (i % 3 === 0) {
        employmentStatus = "Active";
    } else if (i % 3 === 1) {
        employmentStatus = "On Leave";
    } else {
        employmentStatus = "Terminated";
    }

    return {
        id: generateUuid(),
        user_id: generateUuid(),
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone_number: phoneNumber,
        address: `${Math.floor(Math.random() * 200) + 1} ${["Adewale", "Obafemi", "Victoria", "Aminu", "Kingsway"][Math.floor(Math.random() * 5)]} Rd`,
        city: randomCityState.city,
        state: randomCityState.state,
        zip_code: randomCityState.zip_code,
        country: "Nigeria",
        date_of_birth: getRandomDate(new Date(1970, 0, 1), new Date(2000, 11, 31)),
        hire_date: getRandomDate(new Date(2010, 0, 1), new Date(2024, 11, 31)),
        position_id: generateUuid(),
        department_id: generateUuid(),
        salary: (Math.random() * (150000 - 40000) + 40000).toFixed(2), // Random salary between 40k and 150k
        employment_status: employmentStatus,
        supervisor_id: i % 2 === 0 ? generateUuid() : null, // Roughly half have supervisors
        created_at: getRandomTimestamp(new Date(2010, 0, 1), new Date()),
        updated_at: getRandomTimestamp(new Date(2010, 0, 1), new Date()),
    };
});


// Helper function to format dates as "DD of Mon YYYY"
const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options).replace(/(\w+) (\d+), (\d+)/, '$2 of $1 $3');
};

// Component for a single employee row
const EmployeeRow = ({ employee }) => {
    const [imgSrc, setImgSrc] = useState(employee.avatar || DEFAULT_AVATAR);

    // Handle image loading errors, falling back to default avatar
    const handleImageError = () => {
        setImgSrc(DEFAULT_AVATAR);
    };

    // Determine status badge color based on employment status
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
            case 'On Leave': // From fake-employee-db
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };


    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
            {/* Employee Name and Email */}
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
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{`${employee.first_name} ${employee.last_name}`}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</div>
                    </div>
                </div>
            </td>
            {/* Mobile Number */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {employee.phone_number || '—'}
            </td>
            {/* Role (using a placeholder for now, as 'role' isn't directly in fake-employee-db) */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {/* Assuming position_id can map to a role name or just display a generic role */}
                UX Designer {/* Placeholder role */}
            </td>
            {/* Date of Birth */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {formatDate(employee.date_of_birth)}
            </td>
            {/* Joining Date (Hire Date) */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {formatDate(employee.hire_date)}
            </td>
            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.employment_status)}`}>
                    {employee.employment_status}
                </span>
            </td>
            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 mr-2 p-1 rounded-md hover:bg-blue-50"
                    title="Edit"
                >
                    {/* Edit icon (example using SVG) */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z" />
                    </svg>
                </button>
                <button
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600 p-1 rounded-md hover:bg-red-50"
                    title="Delete"
                >
                    {/* Delete icon (example using SVG) */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                    </svg>
                </button>
            </td>
        </tr>
    );
};

const EmployeeListTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const employeesPerPage = 10; // As per the image, showing 10 items per page
    const [currentDateTime, setCurrentDateTime] = useState('');

    // Filter employees based on search term
    const filteredEmployees = useMemo(() => {
        if (!searchTerm) {
            return FAKE_EMPLOYEES;
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return FAKE_EMPLOYEES.filter(employee =>
            employee.first_name.toLowerCase().includes(lowercasedSearchTerm) ||
            employee.last_name.toLowerCase().includes(lowercasedSearchTerm) ||
            employee.email.toLowerCase().includes(lowercasedSearchTerm) ||
            employee.phone_number.includes(lowercasedSearchTerm) ||
            // Assuming role can be searched, though not directly in mock data
            'ux designer'.includes(lowercasedSearchTerm) || // Placeholder for role search
            employee.employment_status.toLowerCase().includes(lowercasedSearchTerm)
        );
    }, [searchTerm]);

    // Pagination logic
    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

    // Change page handler
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Generate pagination numbers
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
                weekday: 'long', // "Monday"
                year: 'numeric', // "2025"
                month: 'long', // "July"
                day: 'numeric', // "9"
                hour: '2-digit', // "05"
                minute: '2-digit', // "36"
                second: '2-digit', // "24"
                hour12: true // "PM"
            };
            setCurrentDateTime(now.toLocaleString('en-US', options));
        };

        updateDateTime();
        const intervalId = setInterval(updateDateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);


    return (
        <div className="">
            <div className='flex justify-between items-center mt-5 mb-14'>
                <div>
                    <h1 className='text-2xl font-bold '>Employee directory page</h1>
                    <p className='text-[#A09D9D] font-medium mt-2'>Manage and collaborate within your organization’s teams</p>
                </div>
                <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
                    {currentDateTime}
                </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Employee list</h2>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
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
                        {/* Search icon */}
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    {/* Filter icon button added here */}
                    <button
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Filter"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 9.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button className="flex items-center px-4 py-2 bg-[#b88b1b] text-white rounded-lg hover:bg-[#997417] transition-colors shadow-md cursor-pointer">
                        {/* Plus icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add employee
                    </button>
                </div>
            </div>

            {/* Employee Table */}
            {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No employees found matching your search.</div>
            ) : (
                <div className="overflow-x-auto shadow-md sm:rounded-lg rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        <thead className=" dark:bg-gray-700 ">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mobile no</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date of birth</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joining date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {currentEmployees.map(employee => (
                                <EmployeeRow key={employee.id} employee={employee} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
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
        </div>
    );
};

export default EmployeeListTable;
