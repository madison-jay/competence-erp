"use client";

import React, { useEffect, useState } from "react";
import apiService from "@/app/lib/apiService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ShiftPage = () => {
    const router = useRouter();
    const [shiftData, setShiftData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployeeShiftDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const currentEmployee = await apiService.getEmployees();

                if (currentEmployee && currentEmployee.shift_types) {
                    setShiftData(currentEmployee.shift_types);
                } else {
                    setShiftData(null);
                    toast.info("No shift assigned yet.");
                }

            } catch (err) {
                console.error("Error fetching employee shift details:", err);
                setError(`Failed to load shift information: ${err.message || 'An unexpected error occurred.'}`);
                toast.error(`Failed to load shift information: ${err.message || 'An unexpected error occurred.'}`);
                if (err.message.includes("not found") || err.message.includes("unauthorized")) {
                    router.replace('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeShiftDetails();
    }, [router]);

    const formatTime = (timeString) => {
        if (!timeString) {
            return 'N/A';
        }

        try {
            const [hours, minutes] = timeString.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0);

            const options = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };

            return date.toLocaleTimeString('en-US', options);
        } catch (e) {
            console.error("Invalid time format:", timeString, e);
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[200px] text-gray-800 font-semibold bg-white rounded-lg shadow-md p-6">
                <p>Loading....</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full min-h-[200px] text-red-500 font-semibold bg-white rounded-lg shadow-md p-6">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm h-full flex flex-col">
            <h2 className="text-xl text-center font-semibold text-gray-800">Your Assigned Shifts</h2>

            <div className="flex-1">
                {shiftData ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Shift Name:</span>
                            <span className="text-gray-900 font-semibold">{shiftData.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Start Time:</span>
                            <span className="text-gray-900 font-semibold">
                                {formatTime(shiftData.start_time)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">End Time:</span>
                            <span className="text-gray-900 font-semibold">
                                {formatTime(shiftData.end_time)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <p className="mb-2">You currently do not have an assigned shift.</p>
                        <p className="text-sm">Please contact your manager or HR for more information.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftPage;