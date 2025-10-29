"use client"

import React, { useState, useMemo, useEffect } from 'react';
import apiService from '@/app/lib/apiService';
import { createClient } from '@/app/lib/supabase/client';
import { Toaster, toast } from 'react-hot-toast';

const supabase = createClient();

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(12)].map((_, index) => (
      <td key={index} className="px-4 py-2 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
    ))}
  </tr>
);

const formatValue = (val) => {
  if (!val) return 'N/A';
  if (val.min !== undefined && val.max !== undefined) {
    return `${val.min} - ${val.max}`;
  }
  if (val.value !== undefined) {
    if (typeof val.value === 'boolean') {
      return val.value ? 'True' : 'False';
    }
    return val.value;
  }
  return 'N/A';
};

const EmployeeAssignmentsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    kpi_id: '',
    employee_id: '',
    period_start: '',
    period_end: '',
    target_value: {},
    status: 'Assigned',
    submitted_value: {},
    evidence_url: '',
    review_comments: '',
  });
  const [kpiType, setKpiType] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [kpis, setKpis] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [kpisData, employeesData, assignmentsData] = await Promise.all([
          apiService.getKPITemplates(),
          apiService.getEmployees(),
          apiService.getEmployeeKPIAssignments(),
        ]);
        setKpis(kpisData || []);
        setEmployees(employeesData || []);
        setAssignments(assignmentsData || []);
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.kpi_id) {
      const template = kpis.find((t) => t.kpi_id === formData.kpi_id);
      if (template) {
        setKpiType(template.target_type);
      }
    } else {
      setKpiType('');
    }
  }, [formData.kpi_id, kpis]);

  const getKPIDetails = (kpiId) => {
    if (!kpis || !Array.isArray(kpis)) return { title: 'N/A', description: 'N/A' };
    const template = kpis.find((t) => t.kpi_id === kpiId);
    return template
      ? { title: template.title || 'N/A', description: template.description || 'No description' }
      : { title: 'N/A', description: 'N/A' };
  };

  const getEmployeeName = (employeeId) => {
    if (!employees || !Array.isArray(employees)) return 'N/A';
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'N/A';
  };

  const filteredAssignments = useMemo(() => {
    if (!searchQuery) return assignments;
    const query = searchQuery.toLowerCase();
    return assignments.filter((assignment) => {
      const { title, description } = getKPIDetails(assignment.kpi_id);
      const employeeName = getEmployeeName(assignment.employee_id);
      const reviewerName = getEmployeeName(assignment.reviewed_by);
      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        employeeName.toLowerCase().includes(query) ||
        assignment.status.toLowerCase().includes(query) ||
        reviewerName.toLowerCase().includes(query)
      );
    });
  }, [assignments, searchQuery, kpis, employees]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      kpi_id: kpis[0]?.kpi_id || '',
      employee_id: employees[0]?.id || '',
      period_start: '',
      period_end: '',
      target_value: {},
      status: 'Assigned',
      submitted_value: {},
      evidence_url: '',
      review_comments: '',
    });
    setShowModal(true);
  };

  const openEditModal = (assignment) => {
    setModalMode('edit');
    setSelectedAssignment(assignment);
    setFormData({
      kpi_id: assignment.kpi_id || '',
      employee_id: assignment.employee_id || '',
      period_start: assignment.period_start || '',
      period_end: assignment.period_end || '',
      target_value: assignment.target_value || {},
      status: assignment.status || 'Assigned',
      submitted_value: assignment.submitted_value || {},
      evidence_url: assignment.evidence_url || '',
      review_comments: assignment.review_comments || '',
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [field, sub] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [sub]: kpiType === 'boolean' && sub === 'value'
            ? value === 'true'
            : (['numeric', 'percentage', 'min', 'max'].includes(sub) || ['numeric', 'percentage'].includes(kpiType)
              ? parseFloat(value) || undefined
              : value),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const renderValueInput = (name, val, onChangeHandler) => {
    if (!kpiType) return <p className="text-sm text-gray-500">Select a KPI first</p>;
    switch (kpiType) {
      case 'numeric':
      case 'percentage':
        return (
          <input
            type="number"
            step="0.01"
            name={`${name}.value`}
            value={val.value ?? ''}
            onChange={onChangeHandler}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
            disabled={isLoading}
          />
        );
      case 'boolean':
        return (
          <select
            name={`${name}.value`}
            value={String(val.value ?? '')}
            onChange={onChangeHandler}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
            disabled={isLoading}
          >
            <option value="" disabled>Select</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      case 'text':
        return (
          <input
            type="text"
            name={`${name}.value`}
            value={val.value ?? ''}
            onChange={onChangeHandler}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
            disabled={isLoading}
          />
        );
      case 'range':
        return (
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              name={`${name}.min`}
              value={val.min ?? ''}
              onChange={onChangeHandler}
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
              disabled={isLoading}
            />
            <input
              type="number"
              step="0.01"
              name={`${name}.max`}
              value={val.max ?? ''}
              onChange={onChangeHandler}
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
              disabled={isLoading}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let data = {
        kpi_id: formData.kpi_id,
        employee_id: formData.employee_id,
        period_start: formData.period_start,
        period_end: formData.period_end,
        target_value: formData.target_value,
      };
      if (modalMode === 'create') {
        const newAssignment = await apiService.createEmployeeKPIAssignment(data);
        setAssignments([...assignments, newAssignment]);
        toast.success('Employee Assignment created successfully');
      } else {
        data = {
          ...data,
          status: formData.status,
          submitted_value: formData.submitted_value,
          evidence_url: formData.evidence_url || null,
          review_comments: formData.review_comments || null,
        };
        const updatedAssignment = await apiService.updateEmployeeKPIAssignment(selectedAssignment.id, data);
        setAssignments(assignments.map((a) =>
          a.id === selectedAssignment.id ? updatedAssignment : a
        ));
        toast.success('Employee Assignment updated successfully');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    setIsLoading(true);
    try {
      await apiService.deleteEmployeeKPIAssignment(assignmentId);
      setAssignments(assignments.filter((a) => a.id !== assignmentId));
      setDeleteConfirm(null);
      toast.success('Employee Assignment deleted successfully');
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="flex justify-between items-center mb-3 gap-5 flex-wrap">
        <h2 className="text-xl font-semibold">Employee KPI Assignments</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by KPI, employee, status..."
            value={searchQuery}
            onChange={handleSearch}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
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
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">KPI Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Employee</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Period Start</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Period End</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Target Value</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Submitted Value</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Evidence</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Reviewed By</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Review Comments</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : currentItems.length > 0 ? (
              currentItems.map((assignment) => {
                const { title, description } = getKPIDetails(assignment.kpi_id);
                return (
                  <tr key={assignment.id} className="hover:bg-gray-50 even:bg-gray-50/50">
                    <td className="px-4 py-2 border-t border-gray-200">{title}</td>
                    <td className="px-4 py-2 border-t border-gray-200 text-xs text-gray-600 max-w-xs truncate" title={description}>
                      {description}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-200">{getEmployeeName(assignment.employee_id)}</td>
                    <td className="px-4 py-2 border-t border-gray-200">{assignment.period_start || 'N/A'}</td>
                    <td className="px-4 py-2 border-t border-gray-200">{assignment.period_end || 'N/A'}</td>
                    <td className="px-4 py-2 border-t border-gray-200">{formatValue(assignment.target_value)}</td>
                    <td className="px-4 py-2 border-t border-gray-200">{assignment.status || 'N/A'}</td>
                    <td className="px-4 py-2 border-t border-gray-200">{formatValue(assignment.submitted_value)}</td>
                    <td className="px-4 py-2 border-t border-gray-200">
                      {assignment.evidence_url ? (
                        <a href={assignment.evidence_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          View Evidence
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td className="px-4 py-2 border-t border-gray-200">{getEmployeeName(assignment.reviewed_by)}</td>
                    <td className="px-4 py-2 border-t border-gray-200">{assignment.review_comments || 'N/A'}</td>
                    <td className="px-4 py-2 border-t border-gray-200 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(assignment)}
                        className="mr-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(assignment.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
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
                <td colSpan="12" className="px-4 py-2 text-center text-gray-500">
                  No employee assignments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && filteredAssignments.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1 ? 'bg-[#b88b1b] text-white' : 'bg-gray-200 text-gray-700'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-semibold mb-4">
              {modalMode === 'create' ? 'Create Employee Assignment' : 'Edit Employee Assignment'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">KPI</label>
                <select
                  name="kpi_id"
                  value={formData.kpi_id}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  required
                  disabled={isLoading}
                >
                  <option value="" disabled>Select KPI</option>
                  {kpis.map((template) => (
                    <option key={template.kpi_id} value={template.kpi_id}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Employee</label>
                <select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  required
                  disabled={isLoading}
                >
                  <option value="" disabled>Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Period Start</label>
                <input
                  type="date"
                  name="period_start"
                  value={formData.period_start}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Period End</label>
                <input
                  type="date"
                  name="period_end"
                  value={formData.period_end}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Target Value</label>
                {renderValueInput('target_value', formData.target_value, handleFormChange)}
              </div>
              {modalMode === 'edit' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                      disabled={isLoading}
                    >
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Submitted Value</label>
                    {renderValueInput('submitted_value', formData.submitted_value, handleFormChange)}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Evidence URL</label>
                    <input
                      type="url"
                      name="evidence_url"
                      value={formData.evidence_url}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                      disabled={isLoading}
                      placeholder="https://example.com/evidence"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Review Comments</label>
                    <textarea
                      name="review_comments"
                      value={formData.review_comments}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#b88b1b] text-white rounded-md hover:bg-[#a07a17] disabled:opacity-50 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    modalMode === 'create' ? 'Create' : 'Update'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete this employee assignment?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EmployeeAssignmentsTable;