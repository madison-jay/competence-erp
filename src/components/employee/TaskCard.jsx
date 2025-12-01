import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TaskCard = ({ title, value, icon, iconColor = "text-gray-600", bgColor = "bg-white", textColor = "text-gray-900" }) => {  
    return (
        <div className={`${bgColor} px-5 py-7 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`${textColor} font-semibold text-lg`}>{title}</h3>
                <FontAwesomeIcon 
                    icon={icon} 
                    className={`${iconColor} text-xl`} 
                />
            </div>
            <p className={`${textColor} text-3xl font-bold`}>{value}</p>
        </div>
    );
};

export default TaskCard;