"use client";

import React, { useEffect, useState } from "react";
import apiService from "@/app/lib/apiService";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; // Correct named import

export default function ShiftPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------------------------------------------------------------
   *  1. Get current employee → id
   * ------------------------------------------------------------- */
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const profile = await apiService.getEmployees(router);
        setEmployeeId(profile.id);
      } catch (err) {
        console.error("Failed to get employee ID", err);
        toast.error("Please log in again");
        router.replace("/login");
      }
    };
    fetchEmployee();
  }, [router]);

  /* -------------------------------------------------------------
   *  2. Fetch shift schedules
   * ------------------------------------------------------------- */
  useEffect(() => {
    if (!employeeId) return;

    const fetchShifts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getEmployeeShiftSchedules(employeeId, router);

        if (Array.isArray(data) && data.length) {
          const sorted = data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setShifts(sorted);
        } else {
          setShifts([]); // Empty → show warning in UI
        }
      } catch (err) {
        const msg = err.message || "Failed to load shifts";
        setError(msg);
        toast.error(msg);
        if (msg.toLowerCase().includes("unauthorized")) {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [employeeId, router]);

  /* -------------------------------------------------------------
   *  Helpers
   * ------------------------------------------------------------- */
  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    try {
      const [h, m] = timeStr.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "N/A";
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  /* -------------------------------------------------------------
   *  Render
   * ------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] rounded-lg bg-white p-6 shadow-md">
        <p className="text-gray-800 font-semibold">Loading shifts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] rounded-lg bg-white p-6 shadow-md">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm h-full flex flex-col">
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
        Your Shift Schedule
      </h2>

      <div className="flex-1 overflow-y-auto space-y-4">
        {shifts.length === 0 ? (
          /* ——— Warning Card (No Shifts) ——— */
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            {/* Warning Icon */}
            <div className="mb-4 p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Warning Message */}
            <p className="text-lg font-semibold text-yellow-800 mb-1">
              You have not been scheduled a shift.
            </p>
            <p className="text-sm text-yellow-600">
              Contact administrator for assistance.
            </p>
          </div>
        ) : (
          /* ——— Shift Cards ——— */
          shifts.map((shift) => (
            <div
              key={shift.id}
              className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-900">{shift.shift_name}</h4>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                  {formatDate(shift.date)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Start:</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {formatTime(shift.start_time)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">End:</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {formatTime(shift.end_time)}
                  </span>
                </div>
              </div>

              {shift.location && (
                <div className="mt-2 text-xs text-gray-600">
                  <strong>Location:</strong> {shift.location}
                </div>
              )}

              {shift.notes && (
                <div className="mt-2 text-xs italic text-gray-500">
                  <strong>Notes:</strong> {shift.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}