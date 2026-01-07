'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardCard from '@/components/hr/DashboardCard';
import TaskOverview from '@/components/hr/TasksOverview';
import KSSOverview from '@/components/hr/KSSOverview';
import apiService from '@/app/lib/apiService';
import { useRouter } from 'next/navigation';

const isPending = (item) => item.status && item.status.toLowerCase() === 'pending';

export default function HRManagerDashboardPage() {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Employees
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [prevTotalEmployees, setPrevTotalEmployees] = useState(0);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Leaves
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState(0);
  const [allLeaves, setAllLeaves] = useState(0);
  const [loadingLeaves, setLoadingLeaves] = useState(true);

  // Tasks
  const [totalTasks, setTotalTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Live Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const opts = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      };
      setCurrentDateTime(now.toLocaleString('en-US', opts));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const todayISO = now.toISOString().split('T')[0]; // e.g., 2025-11-11

      // === Employees ===
      setLoadingEmployees(true);
      try {
        const employees = await apiService.getEmployees(router);
        const active = employees.filter(e => e.employment_status?.toLowerCase() !== 'terminated');
        setTotalEmployees(active.length);

        const newHires = active.filter(e => {
          const d = new Date(e.created_at);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        setPrevTotalEmployees(active.length - newHires.length);
      } catch (e) {
        console.error('Employees error:', e);
      } finally {
        setLoadingEmployees(false);
      }

      // === Leaves ===
      setLoadingLeaves(true);
      try {
        const leaves = await apiService.getLeaves(router);
        setAllLeaves(leaves.length);
        setPendingLeaveRequests(leaves.filter(isPending).length);
      } catch (e) {
        console.error('Leaves error:', e);
      } finally {
        setLoadingLeaves(false);
      }

      // === Tasks ===
      setLoadingTasks(true);
      try {
        const tasks = await apiService.getTasks(router);
        setTotalTasks(tasks.length);
        setPendingTasks(tasks.filter(isPending).length);
      } catch (e) {
        console.error('Tasks error:', e);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchData();
  }, [router]);

  // Employee change
  const empChange = totalEmployees - prevTotalEmployees;
  const empPct = prevTotalEmployees
    ? ((empChange / prevTotalEmployees) * 100).toFixed(2)
    : totalEmployees > 0 ? 100 : 0;
  const empType = empChange >= 0 ? 'increase' : 'decrease';
  const empDetail = empChange >= 0 ? `+${empChange} since last month` : `${empChange} since last month`;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center my-5 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">HR Dashboard</h1>
          <p className="text-[#A09D9D] font-medium mt-2">Welcome to Competence dashboard</p>
        </div>
        <span className="rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]">
          {currentDateTime}
        </span>
      </div>

      {/* Cards */}
      <div className="flex justify-between flex-wrap gap-6 p-4 rounded-lg border border-gray-200 shadow-sm">
        <DashboardCard
          title="Total Employee"
          value={loadingEmployees ? '-' : totalEmployees}
          change={loadingEmployees ? '...' : `${empType === 'increase' ? '+' : ''}${empPct}%`}
          changeType={empType}
          link="/humanResources/employees"
          changedetails={loadingEmployees ? '...' : empDetail}
        />

        <DashboardCard
          title="Pending Tasks"
          value={loadingTasks ? '-' : pendingTasks}
          change={loadingTasks ? '...' : ''}
          changeType="none"
          link="/humanResources/tasks"
          changedetails={loadingTasks ? '...' : `Total Tasks Assigned: ${totalTasks}`}
        />

        <DashboardCard
          title="Pending Leave Requests"
          value={loadingLeaves ? '-' : pendingLeaveRequests}
          change={loadingLeaves ? '...' : ''}
          changeType="none"
          link="/humanResources/leave"
          changedetails={loadingLeaves ? '...' : `Total Leaves Requested: ${allLeaves}`}
        />
      </div>

      {/* Tables */}
      <div className="flex flex-wrap lg:flex-nowrap gap-6 w-full">
        <div className="w-full lg:w-3/5">
          <TaskOverview />
        </div>
        <div className="w-full lg:w-2/5">
          <KSSOverview />
        </div>
      </div>
    </div>
  );
}