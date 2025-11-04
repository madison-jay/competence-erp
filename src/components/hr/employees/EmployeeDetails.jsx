// components/hr/employees/EmployeeDetails.jsx
"use client";

import React, { useState, useEffect } from "react";
import apiService from "@/app/lib/apiService";

const DEFAULT_AVATAR = "/default-profile.png";

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).replace(/(\w+) (\d+), (\d+)/, "$2 $1 $3") : "—";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n ?? 0);

const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

// Skeleton Components
const SkeletonAvatar = () => (
  <div className="w-20 h-20 bg-gray-300 rounded-full animate-pulse" />
);

const SkeletonText = ({ width = "w-32", height = "h-5" }) => (
  <div className={`bg-gray-200 rounded ${width} ${height} animate-pulse`} />
);

const SkeletonLine = () => <SkeletonText width="w-full" height="h-4" />;

const SkeletonCard = () => (
  <div className="bg-white p-3 rounded-lg shadow-sm animate-pulse">
    <SkeletonText width="w-16" height="h-3" />
    <SkeletonText width="w-20" height="h-6" />
  </div>
);

const EmployeeDetailModal = ({ isOpen, onClose, employee: rawEmployee, router }) => {
  const [currentData, setCurrentData] = useState(null);        // salary + current month
  const [paymentHistory, setPaymentHistory] = useState([]);    // full payroll history
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load current month salary + details
  useEffect(() => {
    if (!isOpen || !rawEmployee?.id) return;

    const loadCurrent = async () => {
      setLoadingCurrent(true);
      try {
        const data = await apiService.getEmployeePaymentById(rawEmployee.id, router);
        setCurrentData(data[0] ?? null);
      } catch (e) {
        console.error("Failed to load current employee data:", e);
      } finally {
        setLoadingCurrent(false);
      }
    };
    loadCurrent();
  }, [isOpen, rawEmployee?.id, router]);

  // Load full payment history
  useEffect(() => {
    if (!isOpen || !rawEmployee?.id) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const data = await apiService.getEmployeePayroll(rawEmployee.id, router);
        setPaymentHistory(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load payment history:", e);
        setPaymentHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [isOpen, rawEmployee?.id, router]);

  if (!isOpen || !rawEmployee) return null;

  const details = currentData?.["month-yearemployee_details"] ?? rawEmployee;
  const salary = currentData?.salary ?? {};
  const fullName = `${details.first_name ?? ""} ${details.last_name ?? ""}`.trim();

  const isLoading = loadingCurrent || loadingHistory;

  return (
    <div
      className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 hover:text-red-600 text-3xl z-10"
        >
          ×
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#b88b1b] to-[#d4a53b] text-white p-6 rounded-t-2xl">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <SkeletonAvatar />
              <div className="space-y-2">
                <SkeletonText width="w-48" height="h-8" />
                <SkeletonText width="w-36" height="h-5" />
                <SkeletonText width="w-32" height="h-4" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <img
                src={details.avatar_url || DEFAULT_AVATAR}
                alt={fullName}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
              <div>
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <p className="text-sm opacity-90">{details.email}</p>
                <p className="text-xs opacity-80 mt-1">
                  {rawEmployee.position || "N/A"} • {capitalize(details.department || "N/A")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#b88b1b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <SkeletonText width="w-20" height="h-4" />
                    <SkeletonLine />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Address:</span>
                  <p className="font-semibold text-gray-800">
                    {`${rawEmployee.address || ""}, ${rawEmployee.city || ""}, ${rawEmployee.state || ""}, ${rawEmployee.country || ""}`}
                    {rawEmployee.zip_code && ` - ${rawEmployee.zip_code}`}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <p className="font-semibold text-gray-800">{rawEmployee.phone_number || "—"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Date of Birth:</span>
                  <p className="font-semibold text-gray-800">{formatDate(rawEmployee.date_of_birth)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Marital Status:</span>
                  <p className="font-semibold text-gray-800">{rawEmployee.marital_status || "—"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Hire Date:</span>
                  <p className="font-semibold text-gray-800">{formatDate(rawEmployee.hire_date)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <p className="font-semibold text-gray-800">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        rawEmployee.employment_status === "active"
                          ? "bg-green-100 text-green-800"
                          : rawEmployee.employment_status === "on leave"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {capitalize(rawEmployee.employment_status)}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Guarantor */}
          {(rawEmployee.guarantor_name || rawEmployee.guarantor_phone_number) && !isLoading && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#b88b1b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Guarantor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <p className="font-semibold text-gray-800">{rawEmployee.guarantor_name || "—"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <p className="font-semibold text-gray-800">{rawEmployee.guarantor_phone_number || "—"}</p>
                </div>
              </div>
            </section>
          )}

          {/* Salary */}
          {isLoading ? (
            <section className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse mr-2" />
                <SkeletonText width="w-48" height="h-6" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </section>
          ) : salary.base_salary !== undefined ? (
            <section className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Current Salary Package
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">Base</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(salary.base_salary)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">Bonus</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(salary.bonus)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">Incentives</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(salary.incentives)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-green-300">
                  <p className="text-xs text-gray-600">Gross</p>
                  <p className="text-xl font-bold text-green-800">
                    {formatCurrency(
                      Number(salary.base_salary ?? 0) +
                        Number(salary.bonus ?? 0) +
                        Number(salary.incentives ?? 0)
                    )}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {/* Payment History */}
          {loadingHistory ? (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#b88b1b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Payment History
              </h3>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <SkeletonText width="w-40" height="h-5" />
                        <SkeletonText width="w-56" height="h-4" />
                      </div>
                      <div className="text-right space-y-1">
                        <SkeletonText width="w-24" height="h-6" />
                        <SkeletonText width="w-16" height="h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : paymentHistory.length > 0 ? (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#b88b1b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Payment History
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {paymentHistory.map((p, i) => (
                  <div
                    key={p.id ?? i}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {formatDate(p.payment_date)} • {p.month_year || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Gross: {formatCurrency(p.gross_salary)} | Deductions: {formatCurrency(p.total_deductions)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-700">{formatCurrency(p.net_salary)}</p>
                        <p className="text-xs text-gray-500">Net Pay</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : !loadingHistory ? (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#b88b1b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Payment History
              </h3>
              <p className="text-gray-500 italic">No payment history available.</p>
            </section>
          ) : null}

          {/* Documents */}
          {rawEmployee.document_urls?.length > 0 && !isLoading && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Documents</h3>
              <div className="flex flex-wrap gap-2">
                {rawEmployee.document_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Document {i + 1}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;