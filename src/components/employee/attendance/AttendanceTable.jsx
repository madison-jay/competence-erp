import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faTimesCircle,
  faCalendarTimes,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

const getStatusStyles = (status) => {
  switch (status) {
    case 'Present':
      return { bg: 'bg-green-100', text: 'text-green-800', icon: faCheckCircle };
    case 'Late':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: faExclamationCircle };
    case 'Absent':
      return { bg: 'bg-red-100', text: 'text-red-800', icon: faTimesCircle };
    case 'Early Departure':
      return { bg: 'bg-purple-100', text: 'text-purple-800', icon: faClock };
    case 'On Leave':
      return { bg: 'bg-blue-100', text: 'text-blue-800', icon: faCalendarTimes };
    case 'Weekend':
      return { bg: 'bg-gray-100', text: 'text-gray-600', icon: faCalendarTimes };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', icon: null };
  }
};

const AttendanceTable = ({ data }) => {
  return (
    <div className="rounded-xl shadow-md overflow-hidden border border-solid border-[#DDD9D9]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Day</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Clock in</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Clock out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hours worked</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, idx) => {
              const { bg, text, icon } = getStatusStyles(row.status);
              return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.day}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.clockIn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.clockOut}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.hoursWorked}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
                      {icon && <FontAwesomeIcon icon={icon} className="h-3 w-3" />}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{row.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;