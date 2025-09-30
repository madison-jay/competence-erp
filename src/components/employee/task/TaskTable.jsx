import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
// import ViewTaskModal from './ViewTaskModal';

const TasksTable = ({ tasks, searchTerm, onViewTask, onUpdateTask, loading, error }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Safe filtering with null checks
  const filteredTasks = (tasks ?? []).filter(task => {
    if (!task) return false;
    
    const searchLower = searchTerm.toLowerCase();
    
    const titleMatch = task.title?.toLowerCase().includes(searchLower) || false;
    const assignedFirstNameMatch = task.assigned_to?.first_name?.toLowerCase().includes(searchLower) || false;
    const assignedLastNameMatch = task.assigned_to?.last_name?.toLowerCase().includes(searchLower) || false;
    const statusMatch = task.status?.toLowerCase().includes(searchLower) || false;
    
    return titleMatch || assignedFirstNameMatch || assignedLastNameMatch || statusMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) return 'text-red-500 bg-red-100';
    
    const safeStatus = status || 'Unknown';
    
    switch (safeStatus) {
      case 'Completed':
        return 'text-green-500 bg-green-100';
      case 'In Progress':
      case 'In-progress':
        return 'text-yellow-500 bg-yellow-100';
      case 'Pending':
        return 'text-blue-500 bg-blue-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div className="overflow-x-auto bg-white rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned by</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="animate-pulse">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned by</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.title || 'Untitled Task'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.created_by?.first_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(task.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(task.end_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.priority, false)}`}>
                      {task.priority || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status, task.isOverdue)}`}>
                      {task.isOverdue ? 'Overdue' : (task.status || 'Unknown')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onViewTask(task)} 
                        className="text-gray-500 hover:text-indigo-900"
                        title="View task"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(task)} 
                        className="text-gray-500 hover:text-indigo-900"
                        title="Edit task"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                      {task.status === 'Completed' && (
                        <button className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md">
                          Completed
                        </button>
                      )}
                      {task.status !== 'Completed' && (
                        <button className="px-3 py-1 text-sm font-medium text-white bg-[#b88b1b] rounded-md">
                          Submit now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'No tasks match your search.' : 'No tasks found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          task={selectedTask}
          onUpdateTask={onUpdateTask}
        />
      )}
    </>
  );
};

export default TasksTable;