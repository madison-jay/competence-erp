// components/PayslipTemplate.jsx
import React from "react";

export default function PayslipTemplate({ employee, payment }) {
    if (!payment || !employee) {
        return (
            <div id="payslip" className="bg-white p-8 w-[210mm] min-h-[297mm] mx-auto text-sm">
                <p className="text-center text-gray-500 py-20">Loading payslip data...</p>
            </div>
        );
    }

    const monthYearRaw = payment.month_year || "2026-01";
    const [year, month] = monthYearRaw.split("-");
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthYear = `${monthNames[parseInt(month) - 1]} ${year}`;

    const employeeName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim() || "Employee Name";
    const employeeId = employee.employee_id || employee.id || "XXXXXX";

    const paidDays = payment.paid_days ?? 30;
    const lossOfPayDays = payment.loss_of_pay_days ?? 0;
    const payDate = payment.payment_date
        ? new Date(payment.payment_date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "01 Jan 2026";

    const gross = Number(payment.gross_salary || 0);
    const deductionsTotal = Number(payment.total_deductions || 0);
    const net = Number(payment.net_salary || gross - deductionsTotal);
    const bonus = Number(payment.bonus || 0);

    const formatNGN = (amt) =>
        Number(amt).toLocaleString("en-NG", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

    const amountInWords = net === 0
        ? "Nigerian Naira Zero Only"
        : `Two Million Naira Only`;

    return (
        <div
            id="payslip"
            className="bg-white px-8 py-16 w-[210mm] min-h-[297mm] mx-auto text-sm font-sans border border-gray-200 shadow-sm"
            style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <img
                    src="/madisonjayng_logo.png"
                    alt="Company Logo"
                    className="w-32 h-auto object-contain"
                    width={100}
                    height={100}
                />

                <div className="text-right">
                    <h1 className="text-xl font-semibold">Payslip For the Month</h1>
                    <p className="text-lg mt-1">{monthYear}</p>
                </div>
            </div>

            {/* Company Info */}
            <div className="mb-12 space-y-2">
                <h2 className="text-base font-semibold">
                    MadisonJay Nigeria Limited
                </h2>
                <div className="text-gray-700 text-sm leading-relaxed">
                    <p>13, Alhaji Kanike Close,
                        <br />Off Awolowo Road,
                        <br />Ikoyi - Lagos,
                        <br /> Nigeria</p>
                </div>
            </div>

            {/* Employee Pay Summary */}
            <div className="mb-12">
                <h2 className="text-base font-semibold mb-3 border-b">
                    Employee Payment Summary
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 text-gray-800">
                    <div className="space-y-3">
                        <p><span className="font-medium">Employee Name :</span> {employeeName}</p>
                        <p><span className="font-medium">Employee ID :</span> {employeeId}</p>
                    </div>

                    <div className="space-y-3">
                        <p><span className="font-medium">Pay Period :</span> {monthYear}</p>
                        {/* <p><span className="font-medium">Paid Days :</span> {paidDays}</p>
                        <p><span className="font-medium">Loss of Pay Days :</span> {lossOfPayDays}</p> */}
                        <p><span className="font-medium">Pay Date :</span> {payDate}</p>
                    </div>
                </div>
            </div>

            {/* Income Details */}
            <div>
                <h2 className="text-base font-semibold mb-5">
                    Income Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Earnings – now using real data only */}
                    <div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="pb-2 font-semibold">Earnings</th>
                                    <th className="pb-2 font-semibold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-800 space-y-3">
                                <tr className="border-b py-2">
                                    <td className="py-1">Gross Salary</td>
                                    <td className="py-1 text-right">₦{formatNGN(gross)}</td>
                                </tr>

                                {bonus > 0 && (
                                    <tr className="border-b py-2">
                                        <td className="py-1">Bonus</td>
                                        <td className="py-1 text-right">₦{formatNGN(bonus)}</td>
                                    </tr>
                                )}

                                <tr className="font-medium">
                                    <td className="pt-3">Gross Earnings</td>
                                    <td className="pt-3 text-right">₦{formatNGN(gross + bonus)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Deductions – unchanged */}
                    <div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="pb-2 font-semibold">Deductions</th>
                                    <th className="pb-2 font-semibold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-800 space-y-3">
                                {payment.deductions?.length > 0 ? (
                                    payment.deductions.map((ded, idx) => {
                                        const amt =
                                            ded.calculated_amount ||
                                            (ded.default_charge?.penalty_fee || 0) * (ded.instances || 1) - (ded.pardoned_fee || 0);

                                        return (
                                            <tr key={ded.id || idx} className="border-b">
                                                <td className="py-1">
                                                    {ded.default_charge?.charge_name || ded.reason || "Other Deduction"}
                                                </td>
                                                <td className="py-1 text-right">₦{formatNGN(amt)}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td className="py-1 italic text-gray-500" colSpan={2}>
                                            No deductions this period
                                        </td>
                                    </tr>
                                )}

                                <tr className="font-medium">
                                    <td className="pt-3">Total Deductions</td>
                                    <td className="pt-3 text-right">₦{formatNGN(deductionsTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Net Payable */}
                <div className="mt-16">
                    <div className="max-w-md mx-auto bg-gray-300 py-6">
                        {/* Net Payable row */}
                        <div className="grid grid-cols-2 gap-4 text-lg font-semibold text-gray-900">
                            <div className="text-right">Total Net Payable :</div>
                            <div className="text-left">₦{formatNGN(net)}</div>
                        </div>

                        {/* Amount in words row */}
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-gray-700">
                            <div className="text-right">Amount in words :</div>
                            <div className="text-left font-medium">{amountInWords}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}