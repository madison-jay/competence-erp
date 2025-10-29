"use client"

import React, { useState, useEffect } from 'react';
import apiService from '@/app/lib/apiService';
import { useRouter } from 'next/navigation';
import KPITemplatesTable from '@/components/kpi/KpiTemplateTable';
import RoleAssignmentsTable from '@/components/kpi/RoleAssignmentTable';
import EmployeeAssignmentsTable from '@/components/kpi/EmployeeAssignmentTable';

const KPIDashboard = () => {
  const router = useRouter();
  const [kpiTemplates, setKpiTemplates] = useState([]);
  const [roleAssignments, setRoleAssignments] = useState([]);
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('KPI Templates');
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const templates = await apiService.getKPITemplates(router);
        setKpiTemplates(templates || []);
        const roles = await apiService.getKPIRoleAssignments();
        setRoleAssignments(roles || []);
        const employees = await apiService.getEmployeeKPIAssignments();
        setEmployeeAssignments(employees || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setCurrentDateTime(now.toLocaleString('en-US', options));
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const tabs = [
    { name: 'KPI Templates', content: <KPITemplatesTable kpiTemplates={kpiTemplates} loading={loading} /> },
    { name: 'Role Assignments', content: <RoleAssignmentsTable roleAssignments={roleAssignments} kpiTemplates={kpiTemplates} loading={loading} /> },
    { name: 'Employee Assignments', content: <EmployeeAssignmentsTable employeeAssignments={employeeAssignments} loading={loading} /> },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-center mt-5 mb-14 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">HR KPI Dashboard</h1>
          <p className="text-gray-500 font-medium mt-2">Manage KPI templates, role assignments, and employee assignments</p>
        </div>
        <span className="rounded-[20px] px-3 py-2 border border-gray-300 text-gray-500">
          {currentDateTime}
        </span>
      </div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`${
                activeTab === tab.name
                  ? 'border-[#b88b1b] text-[#b88b1b]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {error ? (
          <div className="text-center py-10 text-red-500">Error: {error}</div>
        ) : (
          tabs.find((tab) => tab.name === activeTab)?.content
        )}
      </div>
    </div>
  );
};

export default KPIDashboard;