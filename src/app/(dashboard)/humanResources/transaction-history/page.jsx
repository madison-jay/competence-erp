"use client";

import React, { useState, useEffect } from "react";
import apiService from "@/app/lib/apiService";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTimes, faDownload } from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import PayslipTemplate from "@/components/Paysliptemplate";


export default function PaymentPage() {
    const router = useRouter();
    const [allPayments, setAllPayments] = useState([]);
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [defaultCharges, setDefaultCharges] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [greeting, setGreeting] = useState('');

    const first_name = typeof window !== 'undefined' ? localStorage.getItem('first_name') : '';
    const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

    const downloadPayslip = async (payment) => {
        setSelectedPayment(payment);

        setTimeout(async () => {
            const element = document.getElementById("payslip");

            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");

            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, width, height);

            pdf.save(`Payslip-${payment.month_year}.pdf`);
        }, 300);
    };




    useEffect(() => {
        const updateDateTimeAndGreeting = () => {
            const now = new Date();
            const hours = now.getHours();

            if (hours >= 5 && hours < 12) {
                setGreeting('Good Morning');
            } else if (hours >= 12 && hours < 18) {
                setGreeting('Good Afternoon');
            } else {
                setGreeting('Good Evening');
            }

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

        updateDateTimeAndGreeting();
        const intervalId = setInterval(updateDateTimeAndGreeting, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const fetchEmployeeAndPayments = async () => {
            try {
                setLoading(true);

                const employees = await apiService.getEmployees(router);

                const employee = employees.find(emp => emp.user_id === userId);

                if (!employee) {
                    throw new Error("No employee data found");
                }

                setEmployeeData(employee);

                let payments = [];

                try {
                    payments = await apiService.getEmployeePayroll(employee.id, router) || [];
                } catch (apiError) {
                    console.error("Error with employee.id parameter:", apiError);
                }

                try {
                    const charges = await apiService.getDefaultCharges(router);
                    setDefaultCharges(charges || []);
                } catch (chargesError) {
                    console.error("Error fetching default charges:", chargesError);
                }

                setAllPayments(payments);
                setError(null);

            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to fetch payment history: " + error.message);
                setAllPayments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeAndPayments();
    }, [router]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleViewDetails = async (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);

        if (payment.deductions && payment.deductions.length > 0 && !payment.deductions[0].default_charge) {
            setDetailsLoading(true);
            try {
                const detailedDeductions = await Promise.all(
                    payment.deductions.map(async (deduction) => {
                        const charge = defaultCharges.find(c => c.id === deduction.default_charge_id);
                        return {
                            ...deduction,
                            default_charge: charge
                        };
                    })
                );

                setSelectedPayment({
                    ...payment,
                    deductions: detailedDeductions
                });
            } catch (error) {
                console.error("Error fetching deduction details:", error);
            } finally {
                setDetailsLoading(false);
            }
        }
    };

    const calculateDeductionAmount = (deduction) => {
        if (!deduction.default_charge) return 0;

        const penaltyFee = deduction.default_charge.penalty_fee || 0;
        const instances = deduction.instances || 1;
        const pardonedFee = deduction.pardoned_fee || 0;

        return (penaltyFee * instances) - pardonedFee;
    };

    const SkeletonLoader = () => (
        <div>
            <div>
                <div className='flex justify-between items-center mt-5 mb-10 flex-wrap gap-4'>
                    <div>
                        <h1 className='text-2xl font-bold '>Payment History</h1>
                        {loading ? (
                            <div className="animate-pulse mt-2">
                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                            </div>
                        ) : (
                            <p className='text-[#A09D9D] font-medium mt-2'>{greeting}, {first_name}</p>
                        )}
                    </div>
                    <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
                        {currentDateTime}
                    </span>
                </div>
                {/* Payment Table Skeleton */}
                <div>
                    <div className="h-7 bg-gray-300 rounded w-40 mb-6 animate-pulse"></div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <th key={item} className="px-6 py-3">
                                            <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[1, 2, 3, 4, 5].map((row) => (
                                    <tr key={row}>
                                        {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                                            <td key={cell} className="px-6 py-4">
                                                <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    // Payment Details Modal
    const PaymentDetailsModal = ({ payment, onClose, loading }) => {
        if (!payment) return null;

        return (
            <div className="fixed inset-0 bg-[#000000aa] bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h3 className="text-xl font-semibold">
                            Payment Details - {payment.month_year}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading details...</p>
                            </div>
                        ) : (
                            <>
                                {/* Salary Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <p className="text-sm font-medium text-green-800 mb-2">Gross Salary</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {formatCurrency(payment.gross_salary)}
                                        </p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                        <p className="text-sm font-medium text-red-800 mb-2">Total Deductions</p>
                                        <p className="text-2xl font-bold text-red-900">
                                            {formatCurrency(payment.total_deductions)}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <p className="text-sm font-medium text-blue-800 mb-2">Net Salary</p>
                                        <p className="text-2xl font-bold text-blue-900">
                                            {formatCurrency(payment.net_salary)}
                                        </p>
                                    </div>
                                </div>

                                {/* Deductions Breakdown */}
                                {payment.deductions && payment.deductions.length > 0 ? (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold mb-4">Deductions Breakdown</h4>
                                        <div className="space-y-3">
                                            {payment.deductions.map((deduction, index) => {
                                                const charge = deduction.default_charge;
                                                const amount = calculateDeductionAmount(deduction);

                                                return (
                                                    <div key={deduction.id || index} className="border rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {charge?.charge_name || "Unknown Charge"}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {deduction.reason || "No reason provided"}
                                                                </p>
                                                            </div>
                                                            <p className="text-red-600 font-semibold">
                                                                {formatCurrency(amount)}
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Instances:</span> {deduction.instances}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Fee per Instance:</span> {formatCurrency(charge?.penalty_fee || 0)}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Pardoned Amount:</span> {formatCurrency(deduction.pardoned_fee || 0)}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Status:</span>
                                                                <span className={`ml-1 px-2 py-1 text-xs rounded-full ${deduction.status === 'paid'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {deduction.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border rounded-lg">
                                        <p className="text-gray-500">No deductions for this payment period</p>
                                    </div>
                                )}

                                {/* Calculation Summary */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold mb-3">Calculation Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Gross Salary:</span>
                                            <span>{formatCurrency(payment.gross_salary)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Deductions:</span>
                                            <span className="text-red-600">-{formatCurrency(payment.total_deductions)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 font-semibold">
                                            <span>Net Salary:</span>
                                            <span className="text-green-600">{formatCurrency(payment.net_salary)}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <SkeletonLoader />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                    <div className="text-red-500 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-lg font-medium mt-4">Error</h3>
                        <p className="mt-2">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div>
                <div className='flex justify-between items-center mt-5 mb-10 flex-wrap gap-4'>
                    <div>
                        <h1 className='text-2xl font-bold '>Payment History</h1>
                        {loading ? (
                            <div className="animate-pulse mt-2">
                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                            </div>
                        ) : (
                            <p className='text-[#A09D9D] font-medium mt-2'>{greeting}, {first_name}</p>
                        )}
                    </div>
                    <span className='rounded-[20px] px-3 py-2 border-[0.5px] border-solid border-[#DDD9D9] text-[#A09D9D]'>
                        {currentDateTime}
                    </span>
                </div>
                {/* Payment Details Table */}
                <div>
                    {allPayments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Period
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Gross Salary
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Deductions
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Net Salary
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {allPayments.map((payment, index) => (
                                        <tr key={payment.id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {payment.month_year || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.payment_date ? formatDate(payment.payment_date) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(payment.gross_salary || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                                {formatCurrency(payment.total_deductions || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                {formatCurrency(payment.net_salary || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : payment.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex flex-nowrap space-x-4 items-center justify-center mt-2">
                                                <button
                                                    onClick={() => handleViewDetails(payment)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                    title="View payment details"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>

                                                <button
                                                    onClick={() => downloadPayslip(payment)}
                                                    className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                                >
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </button>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="2" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                                            Totals:
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {formatCurrency(allPayments.reduce((sum, payment) => sum + (payment.gross_salary || 0), 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                            {formatCurrency(allPayments.reduce((sum, payment) => sum + (payment.total_deductions || 0), 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                            {formatCurrency(allPayments.reduce((sum, payment) => sum + (payment.net_salary || 0), 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* Empty for status column */}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* Empty for actions column */}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-600 mt-4">No Payment Records Found</h3>
                            <p className="text-gray-500">No payment records available for your account.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Details Modal */}
            {showDetailsModal && (
                <PaymentDetailsModal
                    payment={selectedPayment}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedPayment(null);
                    }}
                    loading={detailsLoading}
                />
            )}
            <div className="fixed left-[-9999px] top-0">
                <PayslipTemplate
                    employee={employeeData}
                    payment={selectedPayment}
                />
            </div>

        </div>
    );
}