import React from 'react';

const DashboardCard = ({ title, value, change, changeType, link, changedetails }) => {
    const changeColorClass = changeType === 'increase' ? 'text-green-500' : 'text-red-500';

    const bgColorClass = changeType === 'increase' ? 'bg-green-100' : 'bg-red-100';
    const borderColorClass = changeType === 'increase' ? 'border-green-300' : 'border-red-300';

    const changeIcon = changeType === 'increase' ? (
        <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
    ) : (
        <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
    );

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex w-auto md:min-w-[350px] flex-grow flex-col justify-between h-full">
            <h3 className="text-gray-600 text-sm font-medium mb-4">{title}</h3>

            <div className="flex items-end mb-6">
                <p className="text-3xl font-bold text-gray-900 mr-2">{value}</p>
                <span className={`text-xs font-semibold flex items-center rounded-full px-2 py-1 ${changeColorClass} ${bgColorClass} border ${borderColorClass}`}>
                    {change}
                    {changeIcon}
                </span>
            </div>

            <div className="flex justify-between items-center mt-auto border border-solid border-[#A09D9D] rounded-lg py-[8px] px-3 text-[#A09D9D] bg-[#F9F7F7] gap-6">
                <p className="text-gray-500 text-xs font-semibold">{changedetails}</p>
                <a href={link} className="text-sm hover:text-black transition-all font-bold flex items-center">
                    See details
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                </a>
            </div>
        </div>
    );
};

export default DashboardCard;
