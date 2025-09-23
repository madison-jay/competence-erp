import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const InventoryCard = ({ title, count, borderColor, textColor, icon }) => {
    return (
        <div className={`rounded-lg p-6 shadow-md ${borderColor} ${textColor}`}>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FontAwesomeIcon icon={icon} className="mr-2" />
                {title}
            </h3>
            <p className="text-3xl font-bold">{count} items</p>
        </div>
    );
};