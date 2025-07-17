// components/PayslipConfirmationModal.jsx
import React, { useMemo } from 'react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

const PayslipConfirmationModal = ({ employee, isOpen, onClose, onConfirm }) => {
    if (!isOpen || !employee) return null;

    const totalDeductions = useMemo(() => {
        return employee.deductions.reduce((sum, ded) => sum + (ded.isChecked ? ded.price : 0), 0);
    }, [employee.deductions]);

    const totalIncome = useMemo(() => {
        return employee.grossSalary + employee.bonusPrice + employee.incentives + employee.compensationPrice;
    }, [employee]);

    const netSalary = totalIncome - totalDeductions;

    return (
        <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-lg p-8 transform transition-all duration-300 scale-100 opacity-100">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
                    Confirm Payslip for <span className="text-[#b88b1b]">{employee.name}</span>
                </h2>

                <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-800 flex justify-between">
                        <span>Gross Salary:</span>
                        <span>{formatCurrency(employee.grossSalary)}</span>
                    </p>
                    <p className="text-md text-gray-700 flex justify-between">
                        <span>Bonus:</span>
                        <span>{formatCurrency(employee.bonusPrice)}</span>
                    </p>
                    <p className="text-md text-gray-700 flex justify-between">
                        <span>Incentives:</span>
                        <span>{formatCurrency(employee.incentives)}</span>
                    </p>
                    <p className="text-md text-gray-700 flex justify-between">
                        <span>Compensation:</span>
                        <span>{formatCurrency(employee.compensationPrice)}</span>
                    </p>
                    <hr className="my-3 border-gray-200" />
                    <p className="text-xl font-bold text-gray-900 flex justify-between">
                        <span>Total Income:</span>
                        <span>{formatCurrency(totalIncome)}</span>
                    </p>
                </div>

                <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Deductions</h3>
                    {employee.deductions.filter(ded => ded.isChecked).length > 0 ? (
                        employee.deductions.filter(ded => ded.isChecked).map(deduction => (
                            <p key={deduction.id} className="text-md text-gray-700 flex justify-between">
                                <span>{deduction.name}:</span>
                                <span className="text-red-600">{formatCurrency(deduction.price)}</span>
                            </p>
                        ))
                    ) : (
                        <p className="text-md text-gray-500">No deductions applied.</p>
                    )}
                    <hr className="my-3 border-gray-200" />
                    <p className="text-xl font-bold text-gray-900 flex justify-between">
                        <span>Total Deductions:</span>
                        <span className="text-red-600">{formatCurrency(totalDeductions)}</span>
                    </p>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Net Salary:</span>
                        <span className="text-xl font-bold text-green-600">{formatCurrency(netSalary)}</span>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-[#b88b1b] text-white font-semibold rounded-lg shadow-md hover:bg-[#a37a1a] focus:outline-none focus:ring-2 focus:ring-[#b88b1b] focus:ring-opacity-75 transition-all duration-200"
                    >
                        Confirm and Generate Payslip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayslipConfirmationModal;