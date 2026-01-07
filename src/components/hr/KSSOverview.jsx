'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCheckCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

export default function KSSOverview({ modules = [], loading, error }) {
  const router = useRouter();

  const handleSeeAllClick = () => {
    router.push('/kss');
  };

  // Show only the latest 8 modules
  const modulesToDisplay = modules.slice(0, 8);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 my-8">
      <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Knowledge Sharing System</h2>
        <button
          onClick={handleSeeAllClick}
          className="text-[#A09D9D] text-sm font-medium hover:text-black transition-all cursor-pointer rounded-md px-3 py-1"
        >
          See all
        </button>
      </div>

      <div className="space-y-4" style={{ maxHeight: '540px', overflowY: 'auto' }}>
        {loading ? (
          <div key="loading" className="text-center text-gray-500 p-8">Loading modules...</div>
        ) : error ? (
          <div key="error" className="text-center text-red-500 p-8">Error: {error}</div>
        ) : modulesToDisplay.length > 0 ? (
          modulesToDisplay.map((module) => {
            const stats = module.progressStats || {};
            const hasProgress = stats.totalAssignedEmployees > 0;

            return (
              <div
                key={module.id}
                className="flex items-start p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
              >
                {/* Placeholder for module "icon" – you can replace with actual image if available */}
                <div className="w-12 h-12 bg-[#d4a53b] rounded-full flex items-center justify-center mr-4 shrink-0">
                  <span className="text-white font-bold text-lg">
                    {module.title.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {module.title}
                  </p>
                  {module.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {module.description}
                    </p>
                  )}

                  {/* Progress indicators if the module has assignments */}
                  {hasProgress && (
                    <div className="mt-3 flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faUsers} className="text-yellow-700" />
                        <span>{stats.totalAssignedEmployees} assigned</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                        <span>
                          {stats.moduleCompleted || 0} completed ({stats.moduleCompletionPercent || 0}%)
                        </span>
                      </div>
                      {stats.quizCompleted > 0 && (
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-700" />
                          <span>
                            {stats.quizPassed}/{stats.quizCompleted} passed
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Simple lesson count */}
                  <p className="text-xs text-gray-500 mt-2">
                    {module.lessons?.length || 0} lesson{module.lessons?.length !== 1 ? 's' : ''}
                    {module.questions?.length > 0 && ` • ${module.questions.length} quiz question${module.questions.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div key="empty" className="text-center text-gray-500 p-8">
            No training modules available.
          </div>
        )}
      </div>
    </div>
  );
}