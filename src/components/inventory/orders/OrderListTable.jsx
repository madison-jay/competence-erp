"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye, faEdit, faTrash, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import apiService from '@/app/lib/apiService';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 8;
const goldColor = '#b88b1b';

export default function OrderListTable({ orders }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredOrders, setFilteredOrders] = useState(orders);
    const [customerNames, setCustomerNames] = useState({}); // Store customer names
    const router = useRouter();

    // Fetch customer names for orders
    const fetchCustomerNames = async () => {
        try {
            const customers = await apiService.getCustomers(router);
            const customerMap = customers?.data?.reduce((map, customer) => {
                map[customer.customer_id] = customer.name || 'Unknown';
                return map;
            }, {}) || {};
            setCustomerNames(customerMap);
        } catch (err) {
            console.error("Error fetching customers:", err.message);
        }
    };

    useEffect(() => {
        fetchCustomerNames(); // Fetch customer names on mount
    }, []);

    useEffect(() => {
        const results = orders.filter(order =>
            Object.values({
                order_number: order.order_number,
                customer: customerNames[order.customer_id] || '',
                product: order.order_details?.map(detail => detail.product_id.name).join(', ') || '',
                price: order.total_amount?.toString(),
                date: new Date(order.created_at).toLocaleDateString(),
                status: order.status
            }).some(value =>
                value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFilteredOrders(results);
        setCurrentPage(1);
    }, [searchTerm, orders, customerNames]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return 'text-green-500';
            case 'unpaid':
            case 'processing':
                return 'text-yellow-500';
            case 'cancelled':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const renderPaginationNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 7;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(
                <span
                    key="1"
                    className="px-3 py-1 rounded-md border border-gray-300 cursor-pointer"
                    onClick={() => setCurrentPage(1)}
                >
                    1
                </span>
            );
            if (startPage > 2) {
                pageNumbers.push(
                    <span key="ellipsis-start" className="px-3 py-1 rounded-md border border-gray-300">
                        ...
                    </span>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <span
                    key={i}
                    className={`px-3 py-1 rounded-md border border-gray-300 cursor-pointer ${currentPage === i ? 'text-white font-medium' : 'text-gray-600'}`}
                    style={currentPage === i ? { backgroundColor: goldColor } : {}}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </span>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(
                    <span key="ellipsis-end" className="px-3 py-1 rounded-md border border-gray-300">
                        ...
                    </span>
                );
            }
            pageNumbers.push(
                <span
                    key={totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 cursor-pointer"
                    onClick={() => setCurrentPage(totalPages)}
                >
                    {totalPages}
                </span>
            );
        }

        return pageNumbers;
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold flex-shrink-0">Order List</h2>
                <div className="flex w-full sm:w-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search orders"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product(s)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentOrders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            currentOrders.map((order) => (
                                <tr key={order.order_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customerNames[order.customer_id] || 'Loading...'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.order_details?.map(detail => detail.product_id.name).join(', ') || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.total_amount?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={getStatusColor(order.status)}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center space-x-4 text-gray-500">
                                            <button className="hover:text-gray-700 transition-colors duration-200" aria-label="View">
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                            <button className="hover:text-green-700 transition-colors duration-200" aria-label="Edit">
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className="hover:text-red-700 transition-colors duration-200" aria-label="Delete">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            <div className="flex justify-center items-center gap-2">
                <button
                    className="flex items-center justify-center p-2 rounded-md border border-gray-300 disabled:opacity-50"
                    style={{ backgroundColor: goldColor }}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                >
                    <FontAwesomeIcon icon={faAngleLeft} className="text-white" />
                </button>
                <div className="flex gap-2 text-sm font-medium">
                    {renderPaginationNumbers()}
                </div>
                <button
                    className="flex items-center justify-center p-2 rounded-md border border-gray-300 disabled:opacity-50"
                    style={{ backgroundColor: goldColor }}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                >
                    <FontAwesomeIcon icon={faAngleRight} className="text-white" />
                </button>
            </div>
        </div>
    );
}