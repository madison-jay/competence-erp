// RecentOrders.js
import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const RecentOrders = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const orders = [
        {
            id: "#1234",
            product: ["Dining table", "Chair", "Table"],
            date: "Jul 12, 2025 - 12:30PM",
            price: "N100,000",
            payment: "Transfer",
            status: "Shipped to customer",
        },
        {
            id: "#5467",
            product: ["Sofa sets", "Cushion"],
            date: "Aug 24, 2025 - 10:00 AM",
            price: "N200,000",
            payment: "Card",
            status: "Inventory arrangement",
        },
        {
            id: "#6598",
            product: ["Coffee table", "Stool"],
            date: "Aug 28, 2025 - 3:23 PM",
            price: "N80,000",
            payment: "Card",
            status: "Ready for dispatch",
        },
        {
            id: "#9465",
            product: ["Office table", "Desk"],
            date: "Sep 02, 2025 - 5:25 PM",
            price: "N100,000",
            payment: "Cash",
            status: "In transit",
        },
        {
            id: "#0475",
            product: ["Outdoor furniture", "Chair", "Table"],
            date: "Sep 10, 2025 - 8:00 AM",
            price: "N500,000",
            payment: "Transfer",
            status: "Pending",
        },
        {
            id: "#9607",
            product: ["Office chair", "Stool"],
            date: "Sep 25, 2025 - 9:10 AM",
            price: "N400,000",
            payment: "Card",
            status: "Inventory arrangement",
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'text-yellow-500';
            case 'Inventory arrangement':
                return 'text-orange-500';
            case 'Ready for dispatch':
                return 'text-blue-500';
            case 'In transit':
                return 'text-purple-500';
            case 'Shipped to customer':
                return 'text-green-500';
            default:
                return 'text-gray-500';
        }
    };

    const formatProductDisplay = (products) => {
        if (products.length > 1) {
            return `${products[0]} +${products.length - 1}`;
        }
        return products[0];
    };

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.price.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.payment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Recent Order</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <table className="w-full text-left table-auto">
                <thead>
                    <tr className="text-gray-600 text-sm border-b border-gray-300">
                        <th className="pb-5 pt-3">Order ID</th>
                        <th className="pb-5 pt-3">Product</th>
                        <th className="pb-5 pt-3">Order date</th>
                        <th className="pb-5 pt-3">Price</th>
                        <th className="pb-5 pt-3 text-center">Payment</th>
                        <th className="pb-5 pt-3 text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                            <tr key={index} className="border-b border-gray-300">
                                <td className="py-5">{order.id}</td>
                                <td className="py-5">{formatProductDisplay(order.product)}</td>
                                <td className="py-5">{order.date}</td>
                                <td className="py-5">{order.price}</td>
                                <td className="py-5 text-center">{order.payment}</td>
                                <td className="py-5 text-center">
                                    <span className={getStatusColor(order.status)}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-5"></td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="py-4 text-center text-gray-500">
                                No orders found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RecentOrders;