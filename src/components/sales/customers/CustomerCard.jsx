// CustomerCard.jsx
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CustomerCard = ({ title, value, icon, bgColor, textColor }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md p-4 flex flex-col justify-between min-w-[200px] ${bgColor} border border-gray-200`}>
            <div className="flex items-center mb-5">
                <FontAwesomeIcon icon={icon} className={`mr-2 ${textColor}`} />
                <h2 className={`text-gray-600 font-medium ${textColor}`}>{title}</h2>
            </div>
            <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
        </div>
    );
};

export default CustomerCard;