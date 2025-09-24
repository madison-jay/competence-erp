"use client"

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faShoppingCart, faUserPlus, faChartLine } from '@fortawesome/free-solid-svg-icons';
import SalesOvertime from "@/components/sales/SalesOvertime";
import TopSellingProducts from "@/components/sales/TopSellingProducts";
import RecentOrders from "@/components/sales/RecentOrders";

const MetricCard = ({ title, value, change, icon, changeColor }) => {
    const getIconColor = (title) => {
        switch (title) {
            case 'Total revenue':
                return '#10B981'; // Green
            case 'Total orders':
                return '#3B82F6'; // Blue
            case 'New customers':
                return '#EF4444'; // Red
            case 'Conversion rate':
                return '#8B5CF6'; // Purple
            default:
                return '#6B7280'; // Gray
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between min-w-[200px] border border-gray-200">
            <div className="flex items-center mb-5">
                <FontAwesomeIcon icon={icon} className="text-gray-500 mr-2" style={{ color: getIconColor(title) }} />
                <h2 className="text-gray-600 font-medium">{title}</h2>
            </div>
            <div className="text-2xl font-bold text-black">{value}</div>
            <div className={`text-sm font-medium mt-1 ${changeColor}`}>
                {change}
            </div>
        </div>
    );
};

const SalesOverview = () => {
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [greeting, setGreeting] = useState('');

    const first_name = localStorage.getItem('first_name');

    useEffect(() => {
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
                hour12: true,
                timeZone: 'Africa/Lagos' // WAT (West Africa Time)
            };
            setCurrentDateTime(now.toLocaleString('en-US', options));
        };

        updateDateTimeAndGreeting();
        const intervalId = setInterval(updateDateTimeAndGreeting, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
            <div className='flex justify-between items-center mt-5 mb-14 flex-wrap gap-4'>
                <div>
                    <h1 className='text-2xl font-bold '>Overview</h1>
                    <p className='text-[#A09D9D] font-medium mt-2'>{greeting}, {first_name}</p>
                </div>
                <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
                    {currentDateTime}
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total revenue"
                    value="N 500,000,000"
                    change="+4.1%"
                    icon={faDollarSign}
                    changeColor="text-green-500"
                />
                <MetricCard
                    title="Total orders"
                    value="3,420 orders"
                    change="+1.5%"
                    icon={faShoppingCart}
                    changeColor="text-green-500"
                />
                <MetricCard
                    title="New customers"
                    value="420 new"
                    change="-3%"
                    icon={faUserPlus}
                    changeColor="text-red-500"
                />
                <MetricCard
                    title="Conversion rate"
                    value="5%"
                    change="+2.1%"
                    icon={faChartLine}
                    changeColor="text-green-500"
                />
            </div>
            <div className="flex flex-wrap gap-4 mt-8 items-stretch">
                <div className="flex-1 min-w-[500px] h-[400px]">
                    <SalesOvertime />
                </div>
                <div className="w-full md:w-1/4 min-w-[250px] h-[400px]">
                    <TopSellingProducts />
                </div>
            </div>
            <div className="mt-8">
                <RecentOrders />
            </div>
        </div>
    );
};

export default SalesOverview;