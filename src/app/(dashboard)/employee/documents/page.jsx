"use client"
import React, { useState, useEffect } from 'react';
import apiService from '@/app/lib/apiService';
import DocumentsSummary from '@/components/employee/documents/DocumentsSummary';
import DocumentsTable from '@/components/employee/documents/DocumentsTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await apiService.getEmployeeDocuments();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || doc.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = [
    { name: 'Official documents', count: 10 },
    { name: 'Payalips', count: 20 },
    { name: 'Contracts', count: 15 },
    { name: 'Certificates', count: 12 },
    { name: 'IDs', count: 8 },
    { name: 'Uploaded by me', count: 28 }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      
      <DocumentsSummary 
        categories={categories} 
        activeFilter={filter}
        onFilterChange={setFilter}
      />
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recently Added</h3>
          <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            <FontAwesomeIcon icon={faUpload} /> 
            <span>Upload Document</span>
          </button>
        </div>
        
        <DocumentsTable documents={filteredDocuments} loading={loading} />
      </div>
    </div>
  );
};

export default DocumentsPage;