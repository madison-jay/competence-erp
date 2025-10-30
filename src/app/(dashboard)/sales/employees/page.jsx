"use client"

import React, { useState, useEffect } from "react"
import apiService from "@/app/lib/apiService";

const SalesEmployees = () => {
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [greeting, setGreeting] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const first_name = localStorage.getItem('first_name');

    const updateDateTimeAndGreeting = () => {
        const now = new Date();
        const hours = now.getHours();

        if (hours >= 5 && hours < 12) {
            setGreeting('Good Morning');
        } else if (hours >= 12 && hours < 18) {
            setGreeting('Good Afternoon');
        } else {
            setGreeting('Good Evening');
        }

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

    useEffect(() => {
        updateDateTimeAndGreeting();
        const intervalId = setInterval(updateDateTimeAndGreeting, 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const allEmployees = await apiService.getEmployees();
                // Filter only sales department employees
                const salesEmployees = allEmployees.filter(emp => emp.departments?.name === 'sales');
                setEmployees(salesEmployees);
            } catch (error) {
                console.error("Error fetching employees:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
        </tr>
    );

    return (
        <div>
            <div className='flex justify-between items-center mt-5 mb-14 flex-wrap gap-4'>
                <div>
                    <h1 className='text-2xl font-bold'>Sales Employees</h1>
                    <p className='text-[#A09D9D] font-medium mt-2'>{greeting}, {first_name}</p>
                </div>
                <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
                    {currentDateTime}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hire Date</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Leave Balance</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Shift</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <>
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </>
                        ) : employees.length > 0 ? (
                            employees.map((emp) => (
                                <tr key={emp.id} className="border-t">
                                    <td className="px-6 py-4 text-sm text-gray-900">{`${emp.first_name} ${emp.last_name}`}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{emp.position}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{emp.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{emp.phone_number || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{emp.employment_status}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{emp.hire_date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{emp.leave_balance}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{emp.shift_types?.name || 'N/A'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No sales employees found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SalesEmployees