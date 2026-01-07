import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import apiService from "@/app/lib/apiService";
import { createClient } from '@/app/lib/supabase/client';

const supabase = createClient();

const DEFAULT_PROPERTY_ITEMS = [
  "Laptop / Computer",
  "Access Card / ID Badge",
  "Keys (Office / Desk)",
  "Company Mobile Phone",
  "Uniform / PPE",
  "Documents / Files",
  "Company Credit Card",
  "Security Tokens"
];

const STAGES = [
  "Upload Resignation Notice",
  "Set Last Working Day",
  "Upload Exit Interview",
  "Confirm Property Return",
  "Upload Final Pay Details",
  "Complete Termination"
];

const TerminateEmployeeModal = ({ isOpen, onClose, employee, onEmployeeDeleted, router }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  // Stage 1: Resignation Notice
  const [resignationFile, setResignationFile] = useState(null);
  const [resignationUrl, setResignationUrl] = useState('');
  const [resignationSaved, setResignationSaved] = useState(false);

  // Stage 2: Last Working Day
  const [lastWorkingDay, setLastWorkingDay] = useState('');

  // Stage 3: Exit Interview
  const [exitInterviewFile, setExitInterviewFile] = useState(null);
  const [exitInterviewUrl, setExitInterviewUrl] = useState('');
  const [exitInterviewSaved, setExitInterviewSaved] = useState(false);

  // Stage 4: Property Return
  const [propertyItems, setPropertyItems] = useState(() =>
    DEFAULT_PROPERTY_ITEMS.map(item => ({ name: item, returned: false }))
  );
  const [newItemName, setNewItemName] = useState('');

  // Stage 5: Final Pay Details
  const [finalPayFile, setFinalPayFile] = useState(null);
  const [finalPayUrl, setFinalPayUrl] = useState('');
  const [finalPaySaved, setFinalPaySaved] = useState(false);

  useEffect(() => {
    if (!employee?.id) return;

    const key = `termination_${employee.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      setResignationUrl(data.resignationUrl || '');
      setResignationSaved(!!data.resignationUrl);
      setLastWorkingDay(data.lastWorkingDay || '');
      setExitInterviewUrl(data.exitInterviewUrl || '');
      setExitInterviewSaved(!!data.exitInterviewUrl);
      setFinalPayUrl(data.finalPayUrl || '');
      setFinalPaySaved(!!data.finalPayUrl);
      if (data.propertyItems) setPropertyItems(data.propertyItems);

      // Restore furthest legitimate stage
      let stage = 0;
      if (data.resignationUrl) stage = 1;
      if (data.lastWorkingDay) stage = 2;
      if (data.exitInterviewUrl) stage = 3;
      if (stage >= 3) stage = 4;
      if (data.finalPayUrl) stage = 5;
      setCurrentStage(Math.min(stage, 5));
    }
  }, [employee?.id]);

  // Save to localStorage on changes
  useEffect(() => {
    if (!employee?.id) return;

    const key = `termination_${employee.id}`;
    const dataToSave = {
      resignationUrl,
      lastWorkingDay,
      exitInterviewUrl,
      finalPayUrl,
      propertyItems
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
  }, [resignationUrl, lastWorkingDay, exitInterviewUrl, finalPayUrl, propertyItems, employee?.id]);

  const uploadFileToSupabase = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `employee_documents/${employee.id}/${fileName}`;

    const { error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveDocument = async (file, setUrl, setSaved, docName) => {
    if (!file) return toast.error("No file selected.");

    try {
      setIsLoading(true);
      const url = await uploadFileToSupabase(file);
      setUrl(url);
      setSaved(true);
      toast.success(`${docName} uploaded successfully`);
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePropertyReturned = (index) => {
    setPropertyItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, returned: !item.returned } : item
      )
    );
  };

  const addNewPropertyItem = () => {
    if (newItemName.trim()) {
      setPropertyItems(prev => [...prev, { name: newItemName.trim(), returned: false }]);
      setNewItemName('');
    }
  };

  const handleFinalTermination = async () => {
    if (!resignationSaved) return toast.error("Resignation notice is required");
    if (!lastWorkingDay) return toast.error("Last working day is required");
    if (!exitInterviewSaved) return toast.error("Exit interview document required");
    if (!finalPaySaved) return toast.error("Final pay document required");

    setIsLoading(true);
    try {
      await apiService.deleteEmployee(employee.id, router);
      toast.success('Employee terminated successfully');
      localStorage.removeItem(`termination_${employee.id}`);
      onEmployeeDeleted();
      onClose();
    } catch (err) {
      toast.error('Termination failed');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStage = () => {
    if (currentStage < STAGES.length - 1) {
      setCurrentStage(prev => prev + 1);
    }
  };

  const prevStage = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1);
    }
  };

  const canGoNext = () => {
    switch (currentStage) {
      case 0: return resignationSaved;
      case 1: return !!lastWorkingDay;
      case 2: return exitInterviewSaved;
      case 3: return true; // property return has no strict requirement
      case 4: return finalPaySaved;
      default: return true;
    }
  };

  const progress = ((currentStage + 1) / STAGES.length) * 100;

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90%] mx-auto max-h-[90vh] overflow-y-scroll">
        <div className="border-b border-gray-200 px-8 py-6">
          <h2 className="text-2xl font-light tracking-[1px] text-black">
            Employee Termination Process
          </h2>
          <p className="text-gray-600 mt-1">
            {employee.first_name} {employee.last_name}
          </p>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-black h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-500">
              {STAGES.map((stage, i) => (
                <span
                  key={i}
                  className={i <= currentStage ? "font-medium text-black" : "text-gray-500"}
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 min-h-[200px] flex flex-col">
          {/* Stage 0: Resignation Notice */}
          {currentStage === 0 && (
            <section className="flex-1">
              <h3 className="text-xl font-semibold text-black mb-6">
                1. Resignation Notice <span className="text-red-600">*</span>
              </h3>
              <div className="space-y-4 max-w-lg">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResignationFile(e.target.files[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-white file:text-black file:font-medium"
                />
                <button
                  onClick={() => handleSaveDocument(resignationFile, setResignationUrl, setResignationSaved, "Resignation Notice")}
                  disabled={isLoading || !resignationFile}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {resignationSaved ? 'Re-upload / Replace' : 'Upload & Save'}
                </button>
                {resignationUrl && (
                  <p className="text-sm">
                    <a href={resignationUrl} target="_blank" rel="noopener noreferrer" className="text-black underline">
                      View current file
                    </a>
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Stage 1: Last Working Day */}
          {currentStage === 1 && (
            <section className="flex-1">
              <h3 className="text-xl font-semibold text-black mb-6">
                2. Employee Last Working Day <span className="text-red-600">*</span>
              </h3>
              <div className="max-w-md">
                <input
                  type="date"
                  value={lastWorkingDay}
                  onChange={(e) => setLastWorkingDay(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </section>
          )}

          {/* Stage 2: Exit Interview */}
          {currentStage === 2 && (
            <section className="flex-1">
              <h3 className="text-xl font-semibold text-black mb-6">
                3. Employee Exit Interview Summary Report <span className="text-red-600">*</span>
              </h3>
              <div className="space-y-4 max-w-lg">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setExitInterviewFile(e.target.files[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-white file:text-black file:font-medium"
                />
                <button
                  onClick={() => handleSaveDocument(exitInterviewFile, setExitInterviewUrl, setExitInterviewSaved, "Exit Interview")}
                  disabled={isLoading || !exitInterviewFile}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {exitInterviewSaved ? 'Re-upload / Replace' : 'Upload & Save'}
                </button>
                {exitInterviewUrl && (
                  <p className="text-sm">
                    <a href={exitInterviewUrl} target="_blank" rel="noopener noreferrer" className="text-black underline">
                      View current file
                    </a>
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Stage 3: Property Return */}
          {currentStage === 3 && (
            <section className="flex-1">
              <h3 className="text-xl font-semibold text-black mb-6">
                4. Company Property to be Returned
              </h3>
              <div className="space-y-3 max-w-2xl">
                {propertyItems.map((item, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
                    <input
                      type="checkbox"
                      checked={item.returned}
                      onChange={() => togglePropertyReturned(index)}
                      className="w-5 h-5 text-black border-gray-400 rounded focus:ring-black"
                    />
                    <span className={item.returned ? "line-through text-gray-500" : "text-gray-800"}>
                      {item.name}
                    </span>
                  </label>
                ))}

                <div className="mt-8 flex gap-3">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNewPropertyItem()}
                    placeholder="Add custom item..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={addNewPropertyItem}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Add
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Stage 4: Final Pay Details */}
          {currentStage === 4 && (
            <section className="flex-1">
              <h3 className="text-xl font-semibold text-black mb-6">
                5. Information of Final Pay, Benefits, Pensions etc. <span className="text-red-600">*</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Include salary, bonus, leave encashment, benefits, pensions, etc.
              </p>
              <div className="space-y-4 max-w-lg">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xlsx"
                  onChange={(e) => setFinalPayFile(e.target.files[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-white file:text-black file:font-medium"
                />
                <button
                  onClick={() => handleSaveDocument(finalPayFile, setFinalPayUrl, setFinalPaySaved, "Final Pay Details")}
                  disabled={isLoading || !finalPayFile}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {finalPaySaved ? 'Re-upload / Replace' : 'Upload & Save'}
                </button>
                {finalPayUrl && (
                  <p className="text-sm">
                    <a href={finalPayUrl} target="_blank" rel="noopener noreferrer" className="text-black underline">
                      View current file
                    </a>
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Stage 5: Final Confirmation */}
          {currentStage === 5 && (
            <section className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
              <div className="text-7xl">✅</div>
              <h3 className="text-2xl font-bold text-black">
                Ready to Complete Termination
              </h3>
              <p className="text-gray-600 max-w-md">
                You’ve completed all required steps. Click below to finalize the termination.
              </p>
            </section>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200 px-8 py-6 flex justify-between">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-400 text-black rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <div className="flex gap-4">
            {currentStage > 0 && (
              <button
                onClick={prevStage}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-400 text-black rounded-lg hover:bg-gray-100 transition"
              >
                Previous
              </button>
            )}

            {currentStage < 5 ? (
              <button
                onClick={nextStage}
                disabled={isLoading || !canGoNext()}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleFinalTermination}
                disabled={isLoading}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Processing...' : 'Complete Termination'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminateEmployeeModal;