// app/shift/page.jsx   (or wherever you keep the page)
"use client";

import React, { useEffect, useState } from "react";
import apiService from "@/app/lib/apiService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
   *  2. Fetch shift schedules with the new endpoint
   * ------------------------------------------------------------- */
  useEffect(() => {
    if (!employeeId) return;

    const fetchShifts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getEmployeeShiftSchedules(employeeId, router);

        if (Array.isArray(data) && data.length) {
          // sort newest first
          const sorted = data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setShifts(sorted);
        } else {
          setShifts([]);
          toast.info("No upcoming shifts found.");
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
          <div className="text-center text-gray-500 py-10">
            <p className="mb-2">No shifts scheduled.</p>
            <p className="text-sm">Check back later or contact HR.</p>
          </div>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift.id}
              className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50"
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