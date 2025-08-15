"use client";
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/app/lib/supabase/client';
import apiService from '@/app/lib/apiService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const AddDocumentModal = ({ 
  isOpen, 
  onClose, 
  employees,
  currentEmployeeId,
  onDocumentAdded 
}) => {
  const supabase = createClient();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    file: null,
    targetEmployeeId: currentEmployeeId || ''
  });
  const [uploadMode, setUploadMode] = useState('me');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleUploadModeChange = (mode) => {
    setUploadMode(mode);
    setFormData(prev => ({
      ...prev,
      targetEmployeeId: mode === 'me' ? currentEmployeeId : ''
    }));
  };

  const uploadFileToSupabase = async (file, bucketName, folderPath) => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${folderPath}/${fileName}`;
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error(`Error uploading file to ${bucketName}:`, error);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.file) {
        throw new Error("Please select a file");
      }

      if (!formData.targetEmployeeId) {
        throw new Error("Please select an employee");
      }

      // 1. Upload file to Supabase
      const documentUrl = await uploadFileToSupabase(
        formData.file, 
        'documents', 
        'employee_documents'
      );

      // 2. Create document record using apiService
      await apiService.addEmployeeDocument(
        formData.targetEmployeeId,
        {
          name: formData.name,
          type: formData.type,
          url: documentUrl
        },
        router
      );

      toast.success("Document uploaded successfully!");
      onClose();
      onDocumentAdded();
      setFormData({
        name: '',
        type: '',
        file: null,
        targetEmployeeId: currentEmployeeId || ''
      });
      setUploadMode('me');
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error.message || "Document upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex gap-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-md transition-colors ${
                uploadMode === 'me' 
                  ? 'bg-[#b88b1b] text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => handleUploadModeChange('me')}
              disabled={!currentEmployeeId}
            >
              Upload to Me
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md transition-colors ${
                uploadMode === 'others' 
                  ? 'bg-[#b88b1b] text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => handleUploadModeChange('others')}
            >
              Upload to Others
            </button>
          </div>

          {uploadMode === 'others' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Employee
              </label>
              <select
                name="targetEmployeeId"
                className="w-full p-2 border rounded focus:ring-[#b88b1b] focus:border-[#b88b1b]"
                value={formData.targetEmployeeId}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Select Employee</option>
                {employees
                  .filter(emp => currentEmployeeId ? emp.id !== currentEmployeeId : true)
                  .map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
              </select>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Document Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border rounded focus:ring-[#b88b1b] focus:border-[#b88b1b]"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Document Type
            </label>
            <select
              name="type"
              className="w-full p-2 border rounded focus:ring-[#b88b1b] focus:border-[#b88b1b]"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select Type</option>
              <option value="Official documents">Official documents</option>
              <option value="Payslips">Payslips</option>
              <option value="Contracts">Contracts</option>
              <option value="Certificates">Certificates</option>
              <option value="IDs">IDs</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              File
            </label>
            <input
              type="file"
              className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-[#b88b1b] file:text-white
                hover:file:bg-[#8d6b14]"
              onChange={handleFileChange}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#b88b1b] text-white rounded hover:bg-[#8d6b14] transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDocumentModal;