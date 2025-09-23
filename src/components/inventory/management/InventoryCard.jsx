import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const InventoryCard = ({ title, value, borderColor, textColor, icon }) => (
    <div className={`bg-white rounded-xl p-6 shadow-md ${borderColor}`}>
        <h3 className={`text-sm font-medium mb-2 pb-3 flex items-center ${textColor}`}>
            <FontAwesomeIcon icon={icon} className="mr-2" />
            {title}
        </h3>
        <p className={`text-2xl sm:text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
);