"use client";

import React, { useState, useEffect } from "react";
import InventoryTable from "@/components/inventory/management/InventoryManagementTable";
import { InventoryCard } from "@/components/inventory/management/InventoryCard";
import { faDollarSign, faBoxOpen, faExclamationTriangle, faBan } from "@fortawesome/free-solid-svg-icons";

export default function InventoryOrders() {
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [greeting, setGreeting] = useState('');

    const first_name = localStorage.getItem('first_name');

    const cardData = [
        { title: 'Total stock value', value: '₦2,000,000', borderColor: "border-4 border-solid border-green-100", textColor: "text-green-800", icon: faDollarSign },
        { title: 'In stock products', value: '1,000', borderColor: "border-4 border-solid border-blue-100", textColor: "text-blue-800", icon: faBoxOpen },
        { title: 'Low stock products', value: '100', borderColor: "border-4 border-solid border-yellow-100", textColor: "text-yellow-800", icon: faExclamationTriangle },
        { title: 'Out of stock products', value: '22', borderColor: "border-4 border-solid border-red-100", textColor: "text-red-800", icon: faBan },
    ];

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

    return (
        <div>
            <div className='flex justify-between items-center mt-5 mb-14 flex-wrap gap-4'>
                <div>
                    <h1 className='text-2xl font-bold '>Inventory management</h1>
                    <p className='text-[#A09D9D] font-medium mt-2'>{greeting}, {first_name}</p>
                </div>
                <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
                    {currentDateTime}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-14">
              {cardData.map((card, index) => (
                <InventoryCard 
                    key={index} 
                    title={card.title} 
                    value={card.value} 
                    borderColor={card.borderColor}
                    textColor={card.textColor}
                    icon={card.icon}
                />
              ))}
            </div>

            <div>
                <InventoryTable />
            </div>
        </div>
    )
}