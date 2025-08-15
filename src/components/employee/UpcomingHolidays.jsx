// components/UpcomingHolidaysSection.jsx
"use client"

import React, { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';

export default function UpcomingHolidaysSection() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createClient()

  useEffect(() => {
    const fetchUpcomingHolidays = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('holidays')
          .select('*')
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(5);

        if (error) {
          throw error;
        }
        setHolidays(data);
      } catch (err) {
        console.error('Error fetching upcoming holidays:', err.message);
        setError('Failed to load upcoming holidays.');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingHolidays();
  }, []);

  const formatOrdinalDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });

    let suffix;
    if (day > 3 && day < 21) suffix = 'th';
    else {
      switch (day % 10) {
        case 1: suffix = 'st'; break;
        case 2: suffix = 'nd'; break;
        case 3: suffix = 'rd'; break;
        default: suffix = 'th';
      }
    }
    return `${day}${suffix} ${month}`;
  };

  const calculateDaysLeft = (holidayDateString) => {
    const holidayDate = new Date(holidayDateString);
    const today = new Date();
    holidayDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = holidayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "1 day left";
    } else if (diffDays > 0) {
      return `${diffDays} days left`;
    }
    return "";
  };


  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Upcoming Holidays</h2>
      </div>

      {loading && <p className="text-gray-500 text-center py-4">Loading holidays...</p>}
      {error && <p className="text-red-500 text-center py-4">{error}</p>}
      {!loading && !error && holidays.length === 0 && (
        <p className="text-gray-500 text-center py-4">No upcoming holidays found.</p>
      )}

      <div className="flex-1 overflow-y-auto max-h-[300px]">
        {!loading && !error && holidays.length > 0 && (
          holidays.map(holiday => (
            <div key={holiday.id} className="flex items-center p-3 border-b border-gray-100 last:border-b-0">
              <div className="ml-4 flex-grow flex items-center justify-between w-full">
                <p className="text-sm font-medium text-gray-800 pr-2">{formatOrdinalDate(holiday.date)}</p>
                <p className="text-sm text-gray-600 flex-grow text-center">{holiday.name}</p>
                <span className="text-xs text-gray-500 pl-2">{calculateDaysLeft(holiday.date)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}