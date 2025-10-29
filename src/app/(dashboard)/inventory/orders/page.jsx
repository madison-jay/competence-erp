"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OrderListTable from "@/components/inventory/orders/OrderListTable";
import { StatCard } from "@/components/inventory/orders/OrderListCard";
import apiService from "@/app/lib/apiService";

export default function InventoryOrders() {
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [greeting, setGreeting] = useState('');
    const [orders, setOrders] = useState([]); // State to store orders
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); // State for error handling
    const router = useRouter();
    const first_name = localStorage.getItem('first_name');

    // Calculate stats from orders
    const calculateStats = (orders) => {
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => ['unpaid', 'processing'].includes(order.status)).length;
        const completedOrders = orders.filter(order => ['completed', 'delivered'].includes(order.status)).length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });

        return [
            { title: "Total Orders", count: `${totalOrders} orders`, color: "blue", icon: "📦" },
            { title: "Pending Orders", count: `${pendingOrders} orders`, color: "orange", icon: "⏳" },
            { title: "Completed Orders", count: `${completedOrders} orders`, color: "green", icon: "✅" },
            { title: "Total Revenue", count: totalRevenue, color: "purple", icon: "₦" }
        ];
    };

    // Fetch orders function
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await apiService.getOrders(router);
            const orderData = response?.data || []; // Extract the 'data' array from response
            setOrders(orderData);
            setError(null);
        } catch (err) {
            console.error("Error fetching orders:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch orders on component mount and set up polling
    useEffect(() => {
        fetchOrders(); // Initial fetch

        // Polling for live updates every 30 seconds
        const intervalId = setInterval(fetchOrders, 30000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [router]);

    // Update greeting and datetime
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
                hour12: true
            };
            setCurrentDateTime(now.toLocaleString('en-US', options));
        };

        updateDateTimeAndGreeting();
        const intervalId = setInterval(updateDateTimeAndGreeting, 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Compute stats based on orders
    const cardData = calculateStats(orders);

    return (
        <div>
            <div className='flex justify-between items-center mt-5 mb-14 flex-wrap gap-4'>
                <div>
                    <h1 className='text-2xl font-bold'>Orders</h1>
                    <p className='text-[#A09D9D] font-medium mt-2'>{greeting}, {first_name}</p>
                </div>
                <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
                    {currentDateTime}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
                {cardData.map((card, index) => (
                    <StatCard
                        key={index}
                        title={card.title}
                        count={card.count}
                        color={card.color}
                        icon={card.icon}
                    />
                ))}
            </div>

            <div>
                {loading ? (
                    <p>Loading orders...</p>
                ) : error ? (
                    <p className="text-red-500">Error: {error}</p>
                ) : (
                    <OrderListTable orders={orders} />
                )}
            </div>
        </div>
    );
}