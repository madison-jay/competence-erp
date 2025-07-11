"use client"

import React, { useState, useEffect, useMemo } from 'react';

// Default avatar for image fallbacks
const DEFAULT_AVATAR = 'https://placehold.co/40x40/cccccc/000000?text=';

// Helper function to generate a simple UUID-like string
const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const NIGERIAN_FIRST_NAMES = [
    "Chinedu", "Fatima", "Oluwaseun", "Aisha", "Emeka", "Zainab", "Tunde", "Amaka",
    "Mohammed", "Ngozi", "David", "Blessing", "Kunle", "Funke", "Segun"
];
const NIGERIAN_LAST_NAMES = [
    "Okoro", "Abdullahi", "Adekunle", "Musa", "Nwachukwu", "Aliyu", "Oladipo", "Chukwu",
    "Ibrahim", "Nwosu", "Akpan", "Eze", "Sani", "Bello", "Okafor"
];

const DEPARTMENTS = [
    "Sales", "Warehouse", "HR", "IT", "Installer", "Loader", "Driver"
];

const POSITIONS = ["Employee"];

const FAKE_EMPLOYEES = Array.from({ length: 20 }, (_) => {
    const firstName = NIGERIAN_FIRST_NAMES[Math.floor(Math.random() * NIGERIAN_FIRST_NAMES.length)];
    const lastName = NIGERIAN_LAST_NAMES[Math.floor(Math.random() * NIGERIAN_LAST_NAMES.length)];
    const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
    const position = POSITIONS[0];

    return {
        id: generateUuid(),
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        department: department,
        position: position,
    };
});

// Generate fake attendance records for the last 3 months
const generateFakeAttendance = () => {
    const records = [];
    const today = new Date();
    // Generate records for the last 90 days (approx 3 months) for each employee
    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const recordDate = date.toISOString().split('T')[0];

        FAKE_EMPLOYEES.forEach(employee => {
            let status;
            let checkInTime = null;
            let checkOutTime = null;

            // Randomly assign attendance status
            const random = Math.random();
            if (random < 0.8) { // 80% chance of being present
                status = 'Present';
                const checkInHour = Math.floor(Math.random() * 2) + 8; // 08-09 AM
                const checkInMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
                checkInTime = `${String(checkInHour).padStart(2, '0')}:${checkInMinute}`;

                const checkOutHour = Math.floor(Math.random() * 2) + 17; // 05-06 PM
                const checkOutMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
                checkOutTime = `${String(checkOutHour).padStart(2, '0')}:${checkOutMinute}`;

                // Simulate late check-in or early departure occasionally
                if (Math.random() < 0.1) { // 10% chance of being late
                    status = 'Late';
                    checkInTime = `09:${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}`; // 09:01-09:30
                } else if (Math.random() < 0.05) { // 5% chance of early departure
                    status = 'Early Departure';
                    checkOutTime = `16:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}`; // 16:00-16:59
                }

            } else if (random < 0.9) { // 10% chance of being absent
                status = 'Absent';
            } else { // 10% chance of being on leave
                status = 'On Leave';
            }

            records.push({
                id: generateUuid(),
                employeeId: employee.id,
                date: recordDate,
                checkInTime: checkInTime,
                checkOutTime: checkOutTime,
                status: status,
            });
        });
    }
    return records;
};

const FAKE_ATTENDANCE_RECORDS = generateFakeAttendance();


// Helper function to format dates as "DD of Mon YYYY"
const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options).replace(/(\w+) (\d+), (\d+)/, '$2 of $1 $3');
};

// Component for a single attendance record row
const AttendanceRow = ({ record, employee }) => {
    const [imgSrc, setImgSrc] = useState(employee.avatar || DEFAULT_AVATAR);

    // Handle image loading errors, falling back to default avatar
    const handleImageError = () => {
        setImgSrc(DEFAULT_AVATAR);
    };

    // Determine status badge color based on attendance status
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'present':
                return 'bg-green-100 text-green-800';
            case 'absent':
                return 'bg-red-100 text-red-800';
            case 'late':
                return 'bg-orange-100 text-orange-800';
            case 'early departure':
                return 'bg-purple-100 text-purple-800';
            case 'on leave':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <tr className="hover:bg-gray-50">
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
                        <div className="text-sm font-medium text-gray-900">{`${employee.first_name} ${employee.last_name}`}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                </div>
            </td>
            {/* Department */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.department || 'N/A'}
            </td>
            {/* Position */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.position || 'N/A'}
            </td>
            {/* Date */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(record.date)}
            </td>
            {/* Check-in Time */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.checkInTime || '—'}
            </td>
            {/* Check-out Time */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.checkOutTime || '—'}
            </td>
            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                </span>
            </td>
        </tr>
    );
};

const AttendanceRecordTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterByDate, setFilterByDate] = useState('all'); // 'all', 'today', 'yesterday', 'last7days', 'last30days', 'custom'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Number of items per page
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [displayMode, setDisplayMode] = useState('table'); // 'table' or 'calendar'
    const [currentMonth, setCurrentMonth] = useState(new Date()); // For calendar view
    // New state for attendance summary
    const [attendanceSummary, setAttendanceSummary] = useState({
        present: 0,
        absent: 0,
        late: 0, // Added
        onLeave: 0, // Added
        earlyDeparture: 0, // Added
        others: 0, // Now represents a true 'other' category if any new statuses are added
    });


    // Map employee IDs to employee objects for easy lookup
    const employeeMap = useMemo(() => {
        return FAKE_EMPLOYEES.reduce((map, emp) => {
            map[emp.id] = emp;
            return map;
        }, {});
    }, []);

    // Filter attendance records based on search term and date filters
    const filteredAttendanceRecords = useMemo(() => {
        let filtered = FAKE_ATTENDANCE_RECORDS;

        // 1. Apply date filter (for table view) or month filter (for calendar view)
        if (displayMode === 'table') {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const last7Days = new Date(today);
            last7Days.setDate(today.getDate() - 7);
            const last30Days = new Date(today);
            last30Days.setDate(today.getDate() - 30);

            filtered = filtered.filter(record => {
                const recordDate = new Date(record.date);
                recordDate.setHours(0, 0, 0, 0); // Normalize to start of day

                switch (filterByDate) {
                    case 'today':
                        return recordDate.toDateString() === today.toDateString();
                    case 'yesterday':
                        return recordDate.toDateString() === yesterday.toDateString();
                    case 'last7days':
                        return recordDate >= last7Days && recordDate <= today;
                    case 'last30days':
                        return recordDate >= last30Days && recordDate <= today;
                    case 'custom':
                        if (customStartDate && customEndDate) {
                            const start = new Date(customStartDate);
                            const end = new Date(customEndDate);
                            start.setHours(0, 0, 0, 0);
                            end.setHours(23, 59, 59, 999); // End of day
                            return recordDate >= start && recordDate <= end;
                        }
                        return true; // If custom dates are not set, show all
                    case 'all':
                    default:
                        return true;
                }
            });
        } else if (displayMode === 'calendar') {
            // Filter for the current month displayed in the calendar
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth(); // 0-indexed

            filtered = filtered.filter(record => {
                const recordDate = new Date(record.date);
                return recordDate.getFullYear() === year && recordDate.getMonth() === month;
            });
        }


        // 2. Apply search term filter
        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(record => {
                const employee = employeeMap[record.employeeId];
                if (!employee) return false; // Should not happen with valid data

                return (
                    employee.first_name.toLowerCase().includes(lowercasedSearchTerm) ||
                    employee.last_name.toLowerCase().includes(lowercasedSearchTerm) ||
                    employee.email.toLowerCase().includes(lowercasedSearchTerm) ||
                    employee.department?.toLowerCase().includes(lowercasedSearchTerm)
                );
            });
        }

        return filtered;
    }, [FAKE_ATTENDANCE_RECORDS, searchTerm, filterByDate, customStartDate, customEndDate, employeeMap, displayMode, currentMonth]);

    // Calculate attendance summary whenever filteredAttendanceRecords changes
    useEffect(() => {
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0; // New count
        let onLeaveCount = 0; // New count
        let earlyDepartureCount = 0; // New count
        let othersCount = 0; // This will now truly capture statuses not explicitly handled

        filteredAttendanceRecords.forEach(record => {
            switch (record.status) {
                case 'Present':
                    presentCount++;
                    break;
                case 'Absent':
                    absentCount++;
                    break;
                case 'Late':
                    lateCount++;
                    break;
                case 'On Leave':
                    onLeaveCount++;
                    break;
                case 'Early Departure':
                    earlyDepartureCount++;
                    break;
                default:
                    othersCount++; // For any other unexpected statuses
                    break;
            }
        });

        setAttendanceSummary({
            present: presentCount,
            absent: absentCount,
            late: lateCount,
            onLeave: onLeaveCount,
            earlyDeparture: earlyDepartureCount,
            others: othersCount,
        });
    }, [filteredAttendanceRecords]);


    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAttendanceRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAttendanceRecords.length / itemsPerPage);

    // Change page handler
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Generate pagination numbers with "..."
    const renderPaginationNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Number of page buttons to show around the current page

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

    // Calendar specific functions
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.
    };

    const handleMonthChange = (offset) => {
        setCurrentMonth(prevMonth => {
            const newMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + offset, 1);
            return newMonth;
        });
        setCurrentPage(1); // Reset page when month changes
    };

    const getStatusColorForCalendar = (percentage) => {
        if (percentage >= 80) {
            return 'bg-green-500';
        } else if (percentage >= 50) {
            return 'bg-orange-500';
        } else if (percentage > 0) {
            return 'bg-red-500';
        }
        return 'bg-gray-300'; // No data or 0% attendance
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month); // Day of week for the 1st of the month (0=Sun, 1=Mon)

        const calendarDays = [];
        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="p-2 text-center border rounded-md border-gray-200"></div>);
        }

        // Add actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            // Find all attendance records for this specific day
            const dailyRecords = filteredAttendanceRecords.filter(record => record.date === dateString);

            let totalEmployeesWithRecords = dailyRecords.length;
            let employeesAttended = dailyRecords.filter(rec =>
                rec.status === 'Present' || rec.status === 'Late' || rec.status === 'Early Departure'
            ).length;

            let attendancePercentage = 0;
            if (totalEmployeesWithRecords > 0) {
                attendancePercentage = Math.round((employeesAttended / totalEmployeesWithRecords) * 100);
            }

            calendarDays.push(
                <div
                    key={`day-${day}`}
                    className={`px-2 py-3 text-center border rounded-md border-gray-200 flex flex-col items-center justify-center
                                ${getStatusColorForCalendar(attendancePercentage)} text-white`}
                    title={dailyRecords.length > 0 ? dailyRecords.map(rec => `${employeeMap[rec.employeeId]?.first_name} (${employeeMap[rec.employeeId]?.department}): ${rec.status}`).join('\n') : 'No records'}
                >
                    <span className="font-semibold text-sm">{day}</span>
                    {totalEmployeesWithRecords > 0 ? (
                        <div className="text-sm mt-1">
                            <span className="font-bold">{attendancePercentage}%</span> - {totalEmployeesWithRecords}
                        </div>
                    ) : (
                        <span className="text-xs mt-1 text-gray-700">N/A</span> // For days with no records, show N/A
                    )}
                </div>
            );
        }

        return (
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => handleMonthChange(-1)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-[#b88b1b] hover:text-white transition-all">&lt; Prev</button>
                    <h3 className="text-lg font-semibold">
                        {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => handleMonthChange(1)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-[#b88b1b] hover:text-white transition-all">Next &gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-sm text-center font-medium text-gray-700 mb-2">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays}
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>&ge; 80% Present</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-1"></span>50% - 79% Present</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>&lt; 50% Present</div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-gray-300 mr-1"></span>No Data</div>
                </div>
            </div>
        );
    };


    return (
        <div>
            <div className="">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-5 mb-14">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Attendance Records</h1>
                        <p className="text-[#A09D9D] font-medium mt-2 text-sm">View and manage employee attendance records</p>
                    </div>
                    <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D] text-sm mt-4 sm:mt-0'>
                        {currentDateTime}
                    </span>
                </div>

                {/* View Mode Toggle */}
                <div className="flex justify-end mb-6 space-x-2">
                    <button
                        onClick={() => setDisplayMode('table')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors
                            ${displayMode === 'table' ? 'bg-[#b88b1b] text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Table View
                    </button>
                    <button
                        onClick={() => setDisplayMode('calendar')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors
                            ${displayMode === 'calendar' ? 'bg-[#b88b1b] text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Calendar View
                    </button>
                </div>

                {/* Controls Section (Search and Filters) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">Attendance List</h2>
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto gap-3 overflow-x-auto py-2 px-2">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search employee..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b88b1b] min-w-28"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to first page on new search
                                }}
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>

                        {/* Date Filter Dropdown (only visible in table view) */}
                        {displayMode === 'table' && (
                            <select
                                value={filterByDate}
                                onChange={(e) => {
                                    setFilterByDate(e.target.value);
                                    setCurrentPage(1); // Reset to first page on new filter
                                    if (e.target.value !== 'custom') {
                                        setCustomStartDate('');
                                        setCustomEndDate('');
                                    }
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b88b1b] w-full sm:w-auto"
                            >
                                <option value="all">All Dates</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        )}

                        {/* Custom Date Range Inputs (only visible in table view) */}
                        {displayMode === 'table' && filterByDate === 'custom' && (
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => {
                                        setCustomStartDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                                />
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => {
                                        setCustomEndDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Attendance Summary Section */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"> {/* Adjusted grid for 5 columns */}
                    <div className="bg-green-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-700">Present</p>
                            <p className="text-2xl font-bold text-green-800">{attendanceSummary.present}</p>
                        </div>
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-700">Absent</p>
                            <p className="text-2xl font-bold text-red-800">{attendanceSummary.absent}</p>
                        </div>
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 12a9 9 0 0118 0z"></path></svg>
                    </div>
                    {/* New summary cards for Late, On Leave, Early Departure */}
                    <div className="bg-orange-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-700">Late</p>
                            <p className="text-2xl font-bold text-orange-800">{attendanceSummary.late}</p>
                        </div>
                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700">On Leave</p>
                            <p className="text-2xl font-bold text-blue-800">{attendanceSummary.onLeave}</p>
                        </div>
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-700">Early Departure</p>
                            <p className="text-2xl font-bold text-purple-800">{attendanceSummary.earlyDeparture}</p>
                        </div>
                        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                    </div>
                    {attendanceSummary.others > 0 && ( // Only show if there are actual "others"
                         <div className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Other Statuses</p>
                                <p className="text-2xl font-bold text-gray-800">{attendanceSummary.others}</p>
                            </div>
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    )}
                </div>

                {/* Conditional Rendering based on displayMode */}
                {displayMode === 'table' ? (
                    filteredAttendanceRecords.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No attendance records found matching your criteria.</div>
                    ) : (
                        <div className="overflow-x-auto shadow-md sm:rounded-lg rounded-lg border border-gray-200 table-container">
                            <table className="min-w-full divide-y divide-gray-200 bg-white">
                                <thead>
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentItems.map(record => (
                                        <AttendanceRow key={record.id} record={record} employee={employeeMap[record.employeeId]} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    // Calendar View
                    renderCalendar()
                )}


                {/* Pagination Controls (only visible in table view) */}
                {displayMode === 'table' && filteredAttendanceRecords.length > 0 && (
                    <div className="flex justify-center items-center mt-6 space-x-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Previous
                        </button>
                        {renderPaginationNumbers()}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceRecordTable;