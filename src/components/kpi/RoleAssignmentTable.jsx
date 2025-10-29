"use client"

import React, { useState, useMemo, useEffect } from 'react';
import apiService from '@/app/lib/apiService';
import { createClient } from '@/app/lib/supabase/client';
import { Toaster, toast } from 'react-hot-toast';

const supabase = createClient();

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, index) => (
      <td key={index} className="p-4 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
    ))}
  </tr>
);

const RoleAssignmentsTable = ({ roleAssignments = [], kpiTemplates = [], loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    kpi_id: '',
    role: '',
    department_id: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase.from('departments').select('id, name');
      if (error) {
        console.error('Error fetching departments:', error.message);
        toast.error('Failed to load departments');
      } else {
        setDepartments(data || []);
      }
    };
    fetchDepartments();
  }, []);

  const getKPIDetails = (kpiId) => {
    if (!kpiTemplates || !Array.isArray(kpiTemplates)) return { title: 'N/A', description: 'N/A' };
    const template = kpiTemplates.find((t) => t.kpi_id === kpiId);
    return template
      ? { title: template.title || 'N/A', description: template.description || 'No description' }
      : { title: 'N/A', description: 'N/A' };
  };

  const getDepartmentName = (deptId) => {
    if (!departments || !Array.isArray(departments)) return 'N/A';
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : 'N/A';
  };

  // Filter assignments (includes title, description, role, department)
  const filteredAssignments = useMemo(() => {
    if (!searchQuery) return roleAssignments;
    const query = searchQuery.toLowerCase();
    return roleAssignments.filter((assignment) => {
      const { title, description } = getKPIDetails(assignment.kpi_id);
      const role = assignment.role || '';
      const dept = getDepartmentName(assignment.department_id);
      return (
        title.toLowerCase().includes(query) ||
        (description && description.toLowerCase().includes(query)) ||
        role.toLowerCase().includes(query) ||
        dept.toLowerCase().includes(query)
      );
    });
  }, [roleAssignments, searchQuery, kpiTemplates, departments]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      kpi_id: kpiTemplates[0]?.kpi_id || '',
      role: '',
      department_id: '',
    });
    setShowModal(true);
  };

  const openEditModal = (assignment) => {
    setModalMode('edit');
    setSelectedAssignment(assignment);
    setFormData({
      kpi_id: assignment.kpi_id || '',
      role: assignment.role || '',
      department_id: assignment.department_id || '',
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (modalMode === 'create') {
        const data = {
          kpi_id: formData.kpi_id,
          role: formData.role || null,
          department_id: formData.department_id || null,
        };
        const newAssignment = await apiService.createKPIRoleAssignment(data);
        roleAssignments.push(newAssignment);
        toast.success('Role Assignment created successfully');
      } else {
        // ONLY send role & department_id on update
        const data = {
          role: formData.role || null,
          department_id: formData.department_id || null,
        };
        await apiService.updateKPIRoleAssignment(selectedAssignment.assignment_id, data);
        const updated = roleAssignments.map((a) =>
          a.assignment_id === selectedAssignment.assignment_id ? { ...a, ...data } : a
        );
        roleAssignments.length = 0;
        roleAssignments.push(...updated);
        toast.success('Role Assignment updated successfully');
      }
      setShowModal(false);
    } catch (err) {
      let message = err.message || 'An error occurred';
      if (err.message?.includes('extra_forbidden')) {
        message = 'Cannot change KPI after creation.';
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    setIsLoading(true);
    try {
      await apiService.deleteKPIRoleAssignment(assignmentId);
      const updated = roleAssignments.filter((a) => a.assignment_id !== assignmentId);
      roleAssignments.length = 0;
      roleAssignments.push(...updated);
      setDeleteConfirm(null);
      toast.success('Role Assignment deleted successfully');
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-5 gap-5 flex-wrap">
        <h2 className="text-xl font-semibold">KPI Role Assignments</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by KPI, role, dept, or description..."
            value={searchQuery}
            onChange={handleSearch}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b] w-64"
            disabled={isLoading}
          />
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#b88b1b] text-white rounded-md hover:bg-[#a07a17] disabled:opacity-50"
            disabled={isLoading}
          >
            Create Assignment
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-gray-700">KPI Title</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Description</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Role</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Department</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Created At</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : currentItems.length > 0 ? (
              currentItems.map((assignment) => {
                const { title, description } = getKPIDetails(assignment.kpi_id);
                return (
                  <tr key={assignment.assignment_id} className="hover:bg-gray-50 even:bg-gray-50/50">
                    <td className="p-4 border-t border-gray-200 font-medium">{title}</td>
                    <td className="p-4 border-t border-gray-200 text-xs text-gray-600 max-w-xs">
                      <div className="truncate" title={description}>
                        {description}
                      </div>
                    </td>
                    <td className="p-4 border-t border-gray-200">{assignment.role || 'N/A'}</td>
                    <td className="p-4 border-t border-gray-200">{getDepartmentName(assignment.department_id)}</td>
                    <td className="p-4 border-t border-gray-200 text-xs">
                      {assignment.created_at ? new Date(assignment.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 border-t border-gray-200 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(assignment)}
                        className="mr-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(assignment.assignment_id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No role assignments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredAssignments.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="p-4 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex space-x-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-[#b88b1b] text-white' : 'bg-gray-200 text-gray-700'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="p-4 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {modalMode === 'create' ? 'Create Role Assignment' : 'Edit Role Assignment'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">KPI</label>
                <select
                  name="kpi_id"
                  value={formData.kpi_id}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  required
                  disabled={modalMode === 'edit' || isLoading}  // ← Disabled in edit
                >
                  <option value="" disabled>Select KPI</option>
                  {kpiTemplates.map((template) => (
                    <option key={template.kpi_id} value={template.kpi_id}>
                      {template.title} — {template.description?.slice(0, 50)}{template.description?.length > 50 ? '...' : ''}
                    </option>
                  ))}
                </select>
                {modalMode === 'edit' && (
                  <p className="text-xs text-gray-500 mt-1">KPI cannot be changed after creation.</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  disabled={isLoading}
                >
                  <option value="">None</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department (Optional)</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  disabled={isLoading}
                >
                  <option value="">None</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="p-4 bg-[#b88b1b] text-white rounded-md hover:bg-[#a07a17] disabled:opacity-50 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : modalMode === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete this role assignment?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="p-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="p-4 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RoleAssignmentsTable;