// components/employee/leave/LeaveSummaryCard.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const LeaveSummaryCard = ({ title, count, icon, iconColor, backgroundColor }) => {
    return (
        <div className={`
            ${backgroundColor} 
            rounded-xl 
            shadow-md 
            px-5
            py-7 
            flex 
            items-center 
            justify-between 
            transition-all 
            duration-300 
            hover:shadow-lg
            border-b-4 
            ${iconColor.replace('text-', 'border-')}
        `}>
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{count}</h3>
            </div>
            <div className={`p-3 rounded-full ${iconColor} bg-white/50 shadow-inner`}>
                <FontAwesomeIcon icon={icon} className="h-6 w-6" />
            </div>
        </div>
    );
};

export default LeaveSummaryCard;