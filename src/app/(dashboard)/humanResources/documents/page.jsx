"use client";
import React, { useState, useEffect } from 'react';
import apiService from '@/app/lib/apiService';
import DocumentsSummary from '@/components/employee/documents/DocumentsSummary';
import DocumentsTable from '@/components/employee/documents/DocumentsTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import AddDocumentModal from '@/components/employee/documents/AddDocumentModal';

const DocumentsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [authUserId, setAuthUserId] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const router = useRouter();

  // Get user ID from localStorage (same as MyProfile)
  useEffect(() => {
    const storedAuthUserId = localStorage.getItem("user_id");
    if (storedAuthUserId) {
      setAuthUserId(storedAuthUserId);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Fetch current employee and all employees
  useEffect(() => {
    const fetchData = async () => {
      if (!authUserId) return;

      setLoading(true);
      try {
        // Fetch all employees first
        const allEmployees = await apiService.getEmployees(router);
        setEmployees(allEmployees);

        // Find current employee from the list (same as MyProfile)
        const foundEmployee = allEmployees.find(emp => emp.user_id === authUserId);
        if (foundEmployee) {
          setCurrentEmployee(foundEmployee);
        } else {
          console.error("Employee record not found for this user ID");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUserId, router]);

  // Current date/time display (same as MyProfile)
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
        hour12: true
      };
      setCurrentDateTime(now.toLocaleString('en-US', options));
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDocumentAdded = async () => {
    setLoading(true);
    try {
      const allEmployees = await apiService.getEmployees(router);
      setEmployees(allEmployees);

      // Refresh current employee data
      const foundEmployee = allEmployees.find(emp => emp.user_id === authUserId);
      if (foundEmployee) {
        setCurrentEmployee(foundEmployee);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = employees
    .flatMap(employee => 
      (employee.employee_documents || []).map(doc => ({
        ...doc,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        employeeId: employee.id
      }))
    )
    .filter(doc => {
      if (!doc.name || !doc.category) return false;
      
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || doc.category === filter;
      return matchesSearch && matchesFilter;
    });

  const categories = [
    { name: 'all', count: filteredDocuments.length },
    { name: 'Official documents', count: filteredDocuments.filter(d => d.category === 'Official documents').length },
    { name: 'Payslips', count: filteredDocuments.filter(d => d.category === 'Payslips').length },
    { name: 'Contracts', count: filteredDocuments.filter(d => d.category === 'Contracts').length },
    { name: 'Certificates', count: filteredDocuments.filter(d => d.category === 'Certificates').length },
    { name: 'IDs', count: filteredDocuments.filter(d => d.category === 'IDs').length }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-1/2 text-xl text-gray-600">Loading documents...</div>;
  }

  return (
    <div>
      <div className='flex justify-between items-center mt-5 mb-14 flex-wrap gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Employee Documents</h1>
          <p className='text-[#A09D9D] font-medium mt-2'>View and manage employee documents</p>
        </div>
        <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
          {currentDateTime}
        </span>
      </div>

      <DocumentsSummary
        categories={categories}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recently Added</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="flex items-center gap-2 bg-[#b88b1b] text-white px-4 py-2 rounded-md hover:bg-[#8d6b14] transition-colors"
              onClick={() => setIsUploadModalOpen(true)}
              disabled={!currentEmployee}
            >
              <FontAwesomeIcon icon={faUpload} />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        <DocumentsTable 
          documents={filteredDocuments} 
          loading={loading} 
        />
      </div>

      {currentEmployee && (
        <AddDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          employees={employees}
          currentEmployeeId={currentEmployee.id}
          onDocumentAdded={handleDocumentAdded}
        />
      )}
    </div>
  );
};

export default DocumentsPage;