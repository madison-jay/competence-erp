"use client"

import React, { useState, useMemo } from 'react';
import apiService from '@/app/lib/apiService';
import { toast } from 'react-hot-toast';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, index) => (
      <td key={index} className="p-4 border-t border-gray-200">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
    ))}
  </tr>
);

const KPITemplatesTable = ({ kpiTemplates, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    weight: 0,
    target_type: 'numeric',
    target_value: { value: 0 },
    active: true, // Default to true as per schema
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Filter templates
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return kpiTemplates;
    return kpiTemplates.filter((template) =>
      [template.title, template.description || ''].some((field) =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [kpiTemplates, searchQuery]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

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
      title: '',
      description: '',
      weight: 0,
      target_type: 'numeric',
      target_value: { value: 0 },
      active: true, // Default to true
    });
    setShowModal(true);
  };

  const openEditModal = (template) => {
    setModalMode('edit');
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      description: template.description || '',
      weight: template.weight,
      target_type: template.target_type,
      target_value: template.target_value || { value: 0 },
      active: template.active !== false, // Default to true if undefined
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'active') {
      setFormData((prev) => ({ ...prev, active: checked }));
    } else if (name === 'target_value') {
      setFormData((prev) => ({
        ...prev,
        target_value: { value: prev.target_type === 'text' ? value : parseFloat(value) || 0 },
      }));
    } else if (name === 'target_min' || name === 'target_max') {
      setFormData((prev) => ({
        ...prev,
        target_value: {
          ...prev.target_value,
          [name === 'target_min' ? 'min' : 'max']: parseFloat(value) || 0,
        },
      }));
    } else if (name === 'target_type') {
      setFormData((prev) => ({
        ...prev,
        target_type: value,
        target_value:
          value === 'range'
            ? { min: 0, max: 0 }
            : value === 'boolean'
            ? { value: false }
            : { value: value === 'text' ? '' : 0 },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate range: min <= max
      if (formData.target_type === 'range' && formData.target_value.min > formData.target_value.max) {
        throw new Error('Minimum value must be less than or equal to maximum value');
      }
      // Validate percentage: 0 <= value <= 100
      if (formData.target_type === 'percentage' && (formData.target_value.value < 0 || formData.target_value.value > 100)) {
        throw new Error('Percentage value must be between 0 and 100');
      }
      if (modalMode === 'create') {
        const newTemplate = await apiService.createKPITemplate(formData);
        kpiTemplates.push(newTemplate);
        toast.success('KPI Template created successfully');
      } else {
        await apiService.updateKPITemplate(selectedTemplate.kpi_id, formData);
        const updatedTemplates = kpiTemplates.map((t) =>
          t.kpi_id === selectedTemplate.kpi_id ? { ...t, ...formData } : t
        );
        kpiTemplates.length = 0;
        kpiTemplates.push(...updatedTemplates);
        toast.success('KPI Template updated successfully');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (templateId) => {
    setIsLoading(true);
    try {
      await apiService.deleteKPITemplate(templateId);
      const updatedTemplates = kpiTemplates.filter((t) => t.kpi_id !== templateId);
      kpiTemplates.length = 0;
      kpiTemplates.push(...updatedTemplates);
      setDeleteConfirm(null);
      toast.success('KPI Template deleted successfully');
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Format target_value for display in table
  const formatTargetValue = (template) => {
    const { target_type, target_value } = template;
    if (!target_value) return 'N/A';
    if (target_type === 'range') {
      return `${target_value.min} - ${target_value.max}`;
    }
    return target_value.value !== undefined ? target_value.value.toString() : 'N/A';
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-3 gap-5 flex-wrap">
        <h2 className="text-xl font-semibold">KPI Templates</h2>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by title or description..."
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
            Create Template
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Title</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Description</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Weight</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Target Type</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Target Value</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Active</th>
              <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, index) => <SkeletonRow key={index} />)
            ) : currentItems.length > 0 ? (
              currentItems.map((template) => (
                <tr key={template.kpi_id} className="hover:bg-gray-50 even:bg-gray-50/50">
                  <td className="p-4 border-t border-gray-200 whitespace-nowrap">{template.title}</td>
                  <td className="p-4 border-t border-gray-200 whitespace-nowrap">{template.description || 'N/A'}</td>
                  <td className="p-4 border-t border-gray-200 whitespace-nowrap">{template.weight}</td>
                  <td className="p-4 border-t border-gray-200 whitespace-nowrap">{template.target_type}</td>
                  <td className="p-4 border-t border-gray-200 whitespace-nowrap">{formatTargetValue(template)}</td>
                  <td className="p-4 border-t border-gray-200 whitespace-nowrap">{template.active ? 'Yes' : 'No'}</td>
                  <td className="p-4 border-t border-gray-200 whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(template)}
                      className="mr-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(template.kpi_id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No KPI templates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!loading && filteredTemplates.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="p-4 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
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
            className="p-4 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-semibold mb-4">
              {modalMode === 'create' ? 'Create KPI Template' : 'Edit KPI Template'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleFormChange}
                  step="0.01"
                  min="0"
                  max="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Type</label>
                <select
                  name="target_type"
                  value={formData.target_type}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                  required
                  disabled={isLoading}
                >
                  <option value="numeric">Numeric</option>
                  <option value="percentage">Percentage</option>
                  <option value="boolean">Boolean</option>
                  <option value="text">Text</option>
                  <option value="range">Range</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Value</label>
                {formData.target_type === 'range' ? (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min</label>
                      <input
                        type="number"
                        name="target_min"
                        value={formData.target_value.min || 0}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max</label>
                      <input
                        type="number"
                        name="target_max"
                        value={formData.target_value.max || 0}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ) : formData.target_type === 'boolean' ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="target_value"
                      checked={formData.target_value.value || false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          target_value: { value: e.target.checked },
                        }))
                      }
                      className="mr-2"
                      disabled={isLoading}
                    />
                    <span className="text-sm font-medium text-gray-700">Value</span>
                  </label>
                ) : (
                  <input
                    type={formData.target_type === 'text' ? 'text' : 'number'}
                    name="target_value"
                    value={formData.target_value.value || ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                    required
                    disabled={isLoading}
                    placeholder={formData.target_type === 'text' ? 'Enter text value' : 'Enter numeric value'}
                  />
                )}
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleFormChange}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
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
            <p className="mb-4">Are you sure you want to delete this KPI template?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="p-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="p-4 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center"
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

export default KPITemplatesTable;