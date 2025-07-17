"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PayslipConfirmationModal from '@/components/hr/payroll/PaySlipConfirmationModal';
import toast from 'react-hot-toast';
import { EditPayrollModal } from '@/components/hr/payroll/PaySlipEditModal';

// Mock Data
const mockEmployees = [
    {
        id: '1',
        name: 'John Doe',
        title: 'Artistic Designer',
        isReadyForPayroll: true,
        workDays: 20,
        grossSalary: 180000,
        bonusPrice: 0,
        incentives: 0,
        compensationPrice: 0,
        timesAbsent: 2,
        deductions: [
            { id: 'salary-advance', name: 'Salary advance', price: 10000, isChecked: false },
            { id: 'indiscipline', name: 'Indiscipline', price: 5000, isChecked: true },
            { id: 'indecent-dressing', name: 'Indecent dressing', price: 7500, isChecked: true },
            { id: 'late-resumption', name: 'Late resumption', price: 2000, isChecked: false },
            { id: 'early-closure', name: 'Early closure', price: 0, isChecked: false },
            { id: 'loss-of-property', name: "Loss of company's property", price: 15000, isChecked: false },
            { id: 'damages', name: 'Damages', price: 8000, isChecked: false },
            { id: 'others', name: 'Others', price: 0, isChecked: false },
        ],
    },
    {
        id: '2',
        name: 'Jane Smith',
        title: 'Marketing Specialist',
        isReadyForPayroll: true,
        workDays: 22,
        grossSalary: 200000,
        bonusPrice: 5000,
        incentives: 2000,
        compensationPrice: 0,
        timesAbsent: 0,
        deductions: [
            { id: 'salary-advance', name: 'Salary advance', price: 10000, isChecked: true },
            { id: 'indiscipline', name: 'Indiscipline', price: 5000, isChecked: false },
            { id: 'indecent-dressing', name: 'Indecent dressing', price: 7500, isChecked: false },
            { id: 'late-resumption', name: 'Late resumption', price: 2000, isChecked: true },
            { id: 'early-closure', name: 'Early closure', price: 0, isChecked: false },
            { id: 'loss-of-property', name: "Loss of company's property", price: 15000, isChecked: false },
            { id: 'damages', name: 'Damages', price: 8000, isChecked: false },
            { id: 'others', name: 'Others', price: 0, isChecked: false },
        ],
    },
    {
        id: '3',
        name: 'Peter Jones',
        title: 'Software Engineer',
        isReadyForPayroll: true,
        workDays: 21,
        grossSalary: 250000,
        bonusPrice: 0,
        incentives: 0,
        compensationPrice: 10000,
        timesAbsent: 1,
        deductions: [
            { id: 'salary-advance', name: 'Salary advance', price: 10000, isChecked: false },
            { id: 'indiscipline', name: 'Indiscipline', price: 5000, isChecked: true },
            { id: 'indecent-dressing', name: 'Indecent dressing', price: 7500, isChecked: true },
            { id: 'late-resumption', name: 'Late resumption', price: 2000, isChecked: false },
            { id: 'early-closure', name: 'Early closure', price: 0, isChecked: false },
            { id: 'loss-of-property', name: "Loss of company's property", price: 15000, isChecked: false },
            { id: 'damages', name: 'Damages', price: 8000, isChecked: false },
            { id: 'others', name: 'Others', price: 0, isChecked: false },
        ],
    },
    {
        id: '4',
        name: 'Alice Brown',
        title: 'HR Manager',
        isReadyForPayroll: false,
        workDays: 18,
        grossSalary: 150000,
        bonusPrice: 0,
        incentives: 0,
        compensationPrice: 0,
        timesAbsent: 0,
        deductions: [
            { id: 'salary-advance', name: 'Salary advance', price: 10000, isChecked: false },
            { id: 'indiscipline', name: 'Indiscipline', price: 5000, isChecked: false },
            { id: 'indecent-dressing', name: 'Indecent dressing', price: 7500, isChecked: false },
            { id: 'late-resumption', name: 'Late resumption', price: 2000, isChecked: false },
            { id: 'early-closure', name: 'Early closure', price: 0, isChecked: false },
            { id: 'loss-of-property', name: "Loss of company's property", price: 15000, isChecked: false },
            { id: 'damages', name: 'Damages', price: 8000, isChecked: false },
            { id: 'others', name: 'Others', price: 0, isChecked: false },
        ],
    },
    {
        id: '5',
        name: 'Michael Green',
        title: 'Project Manager',
        isReadyForPayroll: true,
        workDays: 20,
        grossSalary: 220000,
        bonusPrice: 10000,
        incentives: 5000,
        compensationPrice: 0,
        timesAbsent: 0,
        deductions: [
            { id: 'salary-advance', name: 'Salary advance', price: 10000, isChecked: true },
            { id: 'indiscipline', name: 'Indiscipline', price: 5000, isChecked: true },
            { id: 'indecent-dressing', name: 'Indecent dressing', price: 7500, isChecked: false },
            { id: 'late-resumption', name: 'Late resumption', price: 2000, isChecked: false },
            { id: 'early-closure', name: 'Early closure', price: 0, isChecked: false },
            { id: 'loss-of-property', name: "Loss of company's property", price: 15000, isChecked: false },
            { id: 'damages', name: 'Damages', price: 8000, isChecked: false },
            { id: 'others', name: 'Others', price: 0, isChecked: false },
        ],
    },
    {
        id: '6',
        name: 'Sarah White',
        title: 'Data Analyst',
        isReadyForPayroll: true,
        workDays: 20,
        grossSalary: 190000,
        bonusPrice: 0,
        incentives: 0,
        compensationPrice: 0,
        timesAbsent: 3,
        deductions: [
            { id: 'salary-advance', name: 'Salary advance', price: 10000, isChecked: false },
            { id: 'indiscipline', name: 'Indiscipline', price: 5000, isChecked: true },
            { id: 'indecent-dressing', name: 'Indecent dressing', price: 7500, isChecked: true },
            { id: 'late-resumption', name: 'Late resumption', price: 2000, isChecked: false },
            { id: 'early-closure', name: 'Early closure', price: 0, isChecked: false },
            { id: 'loss-of-property', name: "Loss of company's property", price: 15000, isChecked: false },
            { id: 'damages', name: 'Damages', price: 8000, isChecked: false },
            { id: 'others', name: 'Others', price: 0, isChecked: false },
        ],
    },
    {
        id: '7',
        name: 'David Black',
        title: 'UX Designer',
        isReadyForPayroll: true,
        workDays: 20,
        grossSalary: 175000,
        bonusPrice: 0,
        incentives: 0,
        compensationPrice: 0,
        timesAbsent: 0,
        deductions: [
            { id: 'salary-advance', name: 'Salary advance', price: 10000, isChecked: false },
            { id: 'indiscipline', name: 'Indiscipline', price: 5000, isChecked: false },
            { id: 'indecent-dressing', name: 'Indecent dressing', price: 7500, isChecked: false },
            { id: 'late-resumption', name: 'Late resumption', price: 2000, isChecked: false },
            { id: 'early-closure', name: 'Early closure', price: 0, isChecked: false },
            { id: 'loss-of-property', name: "Loss of company's property", price: 15000, isChecked: false },
            { id: 'damages', name: 'Damages', price: 8000, isChecked: false },
            { id: 'others', name: 'Others', price: 0, isChecked: false },
        ],
    },
    {
        id: '8',
        name: 'Emily Chen',
        title: 'Product Manager',
        isReadyForPayroll: true,
        workDays: 20,
        grossSalary: 230000,
        bonusPrice: 15000,
        incentives: 0,
        compensationPrice: 5000,
        timesAbsent: 0,
        deductions: [
            { id: 'salary-advance', name: 'Salary advance', price: 10000, isChecked: true },
            { id: 'indiscipline', name: 'Indiscipline', price: 5000, isChecked: true },
            { id: 'indecent-dressing', name: 'Indecent dressing', price: 7500, isChecked: true },
            { id: 'late-resumption', name: 'Late resumption', price: 2000, isChecked: false },
            { id: 'early-closure', name: 'Early closure', price: 0, isChecked: false },
            { id: 'loss-of-property', name: "Loss of company's property", price: 15000, isChecked: false },
            { id: 'damages', name: 'Damages', price: 8000, isChecked: false },
            { id: 'others', name: 'Others', price: 0, isChecked: false },
        ],
    },
    {
        id: '9',
        name: 'Chris Lee',
        title: 'Financial Analyst',
        isReadyForPayroll: true,
        workDays: 20,
        grossSalary: 210000,
        bonusPrice: 0,
        incentives: 0,
        compensationPrice: 0,
        timesAbsent: 0,
        deductions: [
            { id: 'salary-advance', name: 'Salary advance', price: 10000, isChecked: false },
            { id: 'indiscipline', name: 'Indiscipline', price: 5000, isChecked: false },
            { id: 'indecent-dressing', name: 'Indecent dressing', price: 7500, isChecked: false },
            { id: 'late-resumption', name: 'Late resumption', price: 2000, isChecked: false },
            { id: 'early-closure', name: 'Early closure', price: 0, isChecked: false },
            { id: 'loss-of-property', name: "Loss of company's property", price: 15000, isChecked: false },
            { id: 'damages', name: 'Damages', price: 8000, isChecked: false },
            { id: 'others', name: 'Others', price: 0, isChecked: false },
        ],
    },
    {
        id: '10',
        name: 'Olivia Kim',
        title: 'Content Writer',
        isReadyForPayroll: true,
        workDays: 20,
        grossSalary: 160000,
        bonusPrice: 0,
        incentives: 0,
        compensationPrice: 0,
        timesAbsent: 1,
        deductions: [
            { id: 'salary-advance', name: 'Salary advance', price: 10000, isChecked: false },
            { id: 'indiscipline', name: 'Indiscipline', price: 5000, isChecked: true },
            { id: 'indecent-dressing', name: 'Indecent dressing', price: 7500, isChecked: true },
            { id: 'late-resumption', name: 'Late resumption', price: 2000, isChecked: false },
            { id: 'early-closure', name: 'Early closure', price: 0, isChecked: false },
            { id: 'loss-of-property', name: "Loss of company's property", price: 15000, isChecked: false },
            { id: 'damages', name: 'Damages', price: 8000, isChecked: false },
            { id: 'others', name: 'Others', price: 0, isChecked: false },
        ],
    },
];

const ABSENTISM_COST_PER_DAY = 3000;

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};


const PreparePayroll = () => {
    const [employees, setEmployees] = useState(mockEmployees);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || null);
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Renamed for clarity
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false); // New state for payslip modal
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDepartment = selectedDepartment === '' || employee.title.toLowerCase().includes(selectedDepartment.toLowerCase());
            const matchesStatus = selectedStatus === '' || (selectedStatus === 'Ready' && employee.isReadyForPayroll) || (selectedStatus === 'Pending' && !employee.isReadyForPayroll);
            return matchesSearch && matchesDepartment && matchesStatus;
        });
    }, [employees, searchTerm, selectedDepartment, selectedStatus]);

    const selectedEmployee = useMemo(() => {
        const employee = employees.find(emp => emp.id === selectedEmployeeId);
        if (employee) {
            const updatedDeductions = employee.deductions.map(ded =>
                ded.id === 'absentism' ? { ...ded, price: employee.timesAbsent * ABSENTISM_COST_PER_DAY } : ded
            );
            if (!updatedDeductions.find(ded => ded.id === 'absentism')) {
                updatedDeductions.push({ id: 'absentism', name: 'Absentism', price: employee.timesAbsent * ABSENTISM_COST_PER_DAY, isChecked: employee.timesAbsent > 0 });
            }
            return { ...employee, deductions: updatedDeductions };
        }
        return null;
    }, [employees, selectedEmployeeId]);

    const readyForPayrollCount = useMemo(() => {
        return employees.filter(emp => emp.isReadyForPayroll).length;
    }, [employees]);

    const handleEmployeeSelect = (id) => {
        setSelectedEmployeeId(id);
    };

    const handleEmployeeReadinessChange = (id) => {
        setEmployees(prevEmployees =>
            prevEmployees.map(emp =>
                emp.id === id ? { ...emp, isReadyForPayroll: !emp.isReadyForPayroll } : emp
            )
        );
    };

    const handleDeductionToggle = useCallback((deductionId) => {
        if (selectedEmployee) {
            setEmployees(prevEmployees =>
                prevEmployees.map(emp =>
                    emp.id === selectedEmployee.id
                        ? {
                            ...emp,
                            deductions: emp.deductions.map(ded =>
                                ded.id === deductionId ? { ...ded, isChecked: !ded.isChecked } : ded
                            ),
                        }
                        : emp
                )
            );
        }
    }, [selectedEmployee]);

    const handleDeselectAll = () => {
        setEmployees(prevEmployees =>
            prevEmployees.map(emp => ({ ...emp, isReadyForPayroll: false }))
        );
    };

    const handleOpenEditPayrollModal = () => {
        if (selectedEmployee && selectedEmployee.isReadyForPayroll) {
            setIsEditModalOpen(true);
        } else {
            toast.info('Please mark the employee as "Ready" to edit payroll.');
        }
    };

    const handleCloseEditPayrollModal = () => {
        setIsEditModalOpen(false);
    };

    const handleOpenPayslipModal = () => {
        if (selectedEmployee && selectedEmployee.isReadyForPayroll) {
            setIsPayslipModalOpen(true);
        } else {
            toast.info('Please mark the employee as "Ready" to view the payslip.');
        }
    };

    const handleClosePayslipModal = () => {
        setIsPayslipModalOpen(false);
    };

    const handleConfirmPayslip = () => {
        toast.success(`Payslip for ${selectedEmployee.name} confirmed and generated!`);
        setIsPayslipModalOpen(false);
    };


    const handleSaveDeductions = useCallback((employeeId, newDeductions, bonusPrice, incentives, compensationPrice, timesAbsent) => {
        setEmployees(prevEmployees =>
            prevEmployees.map(emp =>
                emp.id === employeeId
                    ? {
                        ...emp,
                        deductions: newDeductions.some(d => d.id === 'absentism')
                            ? newDeductions
                            : [...newDeductions, { id: 'absentism', name: 'Absentism', price: timesAbsent * ABSENTISM_COST_PER_DAY, isChecked: timesAbsent > 0 }],
                        bonusPrice,
                        incentives,
                        compensationPrice,
                        timesAbsent,
                    }
                    : emp
            )
        );
    }, []);

    useEffect(() => {
        if (!selectedEmployeeId && employees.length > 0) {
            setSelectedEmployeeId(employees[0].id);
        } else if (selectedEmployeeId && !employees.find(emp => emp.id === selectedEmployeeId)) {
            setSelectedEmployeeId(employees.length > 0 ? employees[0].id : null);
        }
    }, [employees, selectedEmployeeId]);

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
                hour12: true
            };
            setCurrentDateTime(now.toLocaleString('en-US', options));
        };

        updateDateTime();
        const intervalId = setInterval(updateDateTime, 1000);

        return () => clearInterval(intervalId);
    }, []);


    return (
        <div className="max-w-[1400px] mx-auto p-4">
            <div className='flex justify-between items-center mt-5 mb-14 flex-wrap gap-4'>
                <div>
                    <h1 className='text-2xl font-bold '>Confirm and review employees</h1>
                    <p className='text-[#A09D9D] font-medium mt-2'>Manage and collaborate within your organization’s teams</p>
                </div>
                <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
                    {currentDateTime}
                </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-1/3">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b88b1b] w-full sm:w-auto"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                        <option value="">All Dept</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Engineering">Engineering</option>
                        <option value="HR">HR</option>
                        <option value="Project">Project</option>
                        <option value="Data">Data</option>
                        <option value="UX">UX</option>
                        <option value="Product">Product</option>
                        <option value="Financial">Financial</option>
                        <option value="Content">Content</option>
                    </select>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b88b1b] w-full sm:w-auto"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Ready">Ready</option>
                        <option value="Pending">Pending</option>
                    </select>
                    <button
                        onClick={handleOpenPayslipModal} // Changed this to open the new modal
                        className={`px-6 py-2 bg-[#b88b1b] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b] focus:ring-opacity-75 w-full sm:w-auto
                            ${(selectedEmployee && selectedEmployee.isReadyForPayroll) ? 'hover:bg-[#a37a1a]' : 'opacity-50 cursor-not-allowed'}`
                        }
                        disabled={!selectedEmployee || !selectedEmployee.isReadyForPayroll}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/2 xl:w-2/5 bg-white rounded-xl shadow-lg p-6 max-h-[820px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Employee ready for payroll</h2>
                            <p className="text-sm text-gray-500">
                                {readyForPayrollCount} out of {employees.length} employees are ready for payroll
                            </p>
                        </div>
                        <button
                            onClick={handleDeselectAll}
                            className="text-[#b88b1b] font-medium hover:text-[#a37a1a] transition-colors"
                        >
                            Deselect all
                        </button>
                    </div>

                    <div className="space-y-3 min-h-[400px] overflow-y-auto pr-2">
                        {filteredEmployees.map((employee) => (
                            <div
                                key={employee.id}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                                ${selectedEmployeeId === employee.id ? 'bg-yellow-50 border border-yellow-300' : 'bg-gray-50 hover:bg-gray-100'}
                                `}
                                onClick={() => handleEmployeeSelect(employee.id)}
                            >
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-[#b88b1b] rounded focus:ring-[#b88b1b] mr-3"
                                    checked={employee.isReadyForPayroll}
                                    onChange={() => handleEmployeeReadinessChange(employee.id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm mr-3">
                                    {employee.name.charAt(0)}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-900">{employee.name}</p>
                                    <p className="text-sm text-gray-500">{employee.title}</p>
                                </div>
                                {employee.isReadyForPayroll && (
                                    <span className="px-3 py-1 text-xs font-medium text-[#b88b1b] bg-yellow-100 rounded-full">
                                        Ready
                                    </span>
                                )}
                            </div>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <p className="text-center text-gray-500 py-10">No employees found matching your search criteria.</p>
                        )}
                    </div>
                </div>

                <div className="w-full lg:w-1/2 xl:w-3/5 bg-white rounded-xl shadow-lg p-6">
                    {selectedEmployee ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg mr-4">
                                        {selectedEmployee.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{selectedEmployee.name}</h3>
                                        <p className="text-sm text-gray-500">{selectedEmployee.title}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleOpenEditPayrollModal}
                                    className={`px-6 py-2 bg-[#b88b1b] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#b88b1b] focus:ring-opacity-75
                                        ${selectedEmployee.isReadyForPayroll ? 'hover:bg-[#a37a1a]' : 'opacity-50 cursor-not-allowed'}`
                                    }
                                    disabled={!selectedEmployee.isReadyForPayroll}
                                >
                                    Edit Payroll
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <label htmlFor="work-days" className="block text-sm font-medium text-gray-700 mb-2">
                                        Work days
                                    </label>
                                    <select
                                        id="work-days"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b88b1b]"
                                        value={selectedEmployee.workDays}
                                        onChange={(e) => {
                                            setEmployees(prevEmployees =>
                                                prevEmployees.map(emp =>
                                                    emp.id === selectedEmployee.id
                                                        ? { ...emp, workDays: parseInt(e.target.value) }
                                                        : emp
                                                )
                                            );
                                        }}
                                    >
                                        {[...Array(30).keys()].map(i => (
                                            <option key={i + 1} value={i + 1}>{i + 1} total working days</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="block text-sm font-medium text-gray-700 mb-2">Gross salary</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(selectedEmployee.grossSalary)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="block text-sm font-medium text-gray-700 mb-2">Bonus Price</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(selectedEmployee.bonusPrice)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="block text-sm font-medium text-gray-700 mb-2">Incentives</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(selectedEmployee.incentives)}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="block text-sm font-medium text-gray-700 mb-2">Compensation Price</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(selectedEmployee.compensationPrice)}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-3">Deductions</p>
                                <div className="space-y-2">
                                    <label key="absentism" className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-[#b88b1b] rounded focus:ring-[#b88b1b]"
                                            checked={selectedEmployee.deductions.find(d => d.id === 'absentism')?.isChecked || false}
                                            onChange={() => handleDeductionToggle('absentism')}
                                        />
                                        <span className="ml-3 text-gray-700">
                                            Absentism ({selectedEmployee.timesAbsent} days)
                                            <span className="text-gray-500 text-sm ml-2">
                                                ({formatCurrency(selectedEmployee.timesAbsent * ABSENTISM_COST_PER_DAY)})
                                            </span>
                                        </span>
                                    </label>
                                    {selectedEmployee.deductions.filter(ded => ded.id !== 'absentism').map((deduction) => (
                                        <label key={deduction.id} className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-[#b88b1b] rounded focus:ring-[#b88b1b]"
                                                checked={deduction.isChecked}
                                                onChange={() => handleDeductionToggle(deduction.id)}
                                            />
                                            <span className="ml-3 text-gray-700">
                                                {deduction.name}
                                                {deduction.price > 0 && (
                                                    <span className="text-gray-500 text-sm ml-2">
                                                        ({formatCurrency(deduction.price)})
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500">
                            Select an employee to view details.
                        </div>
                    )}
                </div>
            </div>
            <EditPayrollModal
                employee={selectedEmployee}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditPayrollModal}
                onSave={handleSaveDeductions}
            />
            <PayslipConfirmationModal
                employee={selectedEmployee}
                isOpen={isPayslipModalOpen}
                onClose={handleClosePayslipModal}
                onConfirm={handleConfirmPayslip}
            />
        </div>
    );
};

export default PreparePayroll;