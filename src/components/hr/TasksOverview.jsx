"use client";

import React, { useState, useEffect } from 'react';
import apiService from '@/app/lib/apiService';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCircleCheck, faHourglassHalf, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

const DEFAULT_AVATAR = 'https://placehold.co/40x40/cccccc/000000?text=T';

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'urgent':   return 'bg-red-100 text-red-800';
    case 'high':     return 'bg-orange-100 text-orange-800';
    case 'medium':   return 'bg-yellow-100 text-yellow-700';
    case 'low':      return 'bg-green-100 text-green-700';
    default:         return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIconAndColor = (status, isOverdue) => {
  if (isOverdue) {
    return { icon: faTriangleExclamation, color: 'text-red-600' };
  }
  switch (status) {
    case 'Pending':      return { icon: faClock, color: 'text-yellow-600' };
    case 'In Progress':  return { icon: faHourglassHalf, color: 'text-indigo-600' };
    case 'Completed':    return { icon: faCircleCheck, color: 'text-green-600' };
    default:             return { icon: faClock, color: 'text-gray-600' };
  }
};

const TaskOverview = () => {
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Real-time Clock
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
    const id = setInterval(updateDateTime, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const allTasks = await apiService.getTasks(router);

        if (!allTasks || allTasks.length === 0) {
          setTasks([]);
          return;
        }

        const processed = allTasks
          .map(task => {
            const dueDate = task.end_date ? new Date(task.end_date) : null;
            const now = new Date();
            const isOverdue = dueDate && dueDate < now && task.status !== 'Completed';

            const primaryAssignee = task.task_assignments?.[0]?.employees || null;

            return {
              ...task,
              isOverdue,
              assignee: primaryAssignee ? {
                name: `${primaryAssignee.first_name || ''} ${primaryAssignee.last_name || ''}`.trim() || 'Unassigned',
                email: primaryAssignee.email || '—',
                avatar: primaryAssignee.avatar_url || DEFAULT_AVATAR,
              } : {
                name: 'Unassigned',
                email: '—',
                avatar: DEFAULT_AVATAR,
              }
            };
          })
          .filter(task => task.status !== 'Cancelled')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // newest first
          .slice(0, 10); // limit to 10

        setTasks(processed);
      } catch (err) {
        console.error('Failed to load tasks for dashboard:', err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [router]);

  // Summary counts
  const summary = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => t.isOverdue).length,
  };

  const SkeletonRow = () => (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10 rounded-full bg-gray-300 animate-pulse"></div>
          <div className="ml-4">
            <div className="h-4 bg-gray-300 rounded w-40 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-300 rounded w-28 animate-pulse"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 w-20 bg-gray-300 rounded-full animate-pulse"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
      </td>
    </tr>
  );

  return (
    <div className="relative bg-white rounded-lg border-[0.5px] border-solid border-[#DDD9D9] shadow-sm p-6 my-8" style={{ maxHeight: '540px', overflowY: 'auto' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Task Overview</h1>
          {summary.total > 0 && (
            <div className="flex flex-wrap gap-4 text-xs mt-2">
              <span className="text-gray-600">Pending: <strong>{summary.pending}</strong></span>
              <span className="text-gray-600">In Progress: <strong>{summary.inProgress}</strong></span>
              <span className="text-gray-600">Completed: <strong>{summary.completed}</strong></span>
              {summary.overdue > 0 && (
                <span className="text-red-600 font-medium">Overdue: <strong>{summary.overdue}</strong></span>
              )}
            </div>
          )}
        </div>
        <span className="rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D] text-sm mt-4 sm:mt-0">
          {currentDateTime}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md sm:rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task / Assignee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No tasks available.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const { icon: StatusIcon, color: statusColor } = getStatusIconAndColor(task.status, task.isOverdue);
                const dueDate = task.end_date ? new Date(task.end_date) : null;
                const formattedDue = dueDate
                  ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '—';

                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 rounded-full overflow-hidden">
                          <img
                            className="h-full w-full object-cover rounded-full"
                            src={task.assignee.avatar}
                            alt=""
                            onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500">{task.assignee.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <FontAwesomeIcon icon={StatusIcon} className={`mr-2 h-4 w-4 ${statusColor}`} />
                        <span className={task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}>
                          {task.isOverdue ? 'Overdue' : task.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.isOverdue ? <span className="text-red-600 font-medium">{formattedDue}</span> : formattedDue}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* See All Link */}
      <div className="mt-6 text-right">
        <button
          onClick={() => router.push('/humanResources/tasks')} // Adjust path if different
          className="text-[#000000] font-medium hover:underline text-sm"
        >
          See all tasks
        </button>
      </div>
    </div>
  );
};

export default TaskOverview;