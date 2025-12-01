// AssignmentForm.jsx (or .tsx)
import { useState, useEffect } from "react";
import apiService from "@/app/lib/apiService";
import toast from "react-hot-toast";

export default function AssignmentForm({ moduleId, onSuccess }) {
  const [assignmentType, setAssignmentType] = useState("all"); // default to "all"
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch departments
    const fetchDepts = async () => {
      try {
        const { data } = await supabase.from("departments").select("id, name");
        setDepartments(data || []);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let payload;

    if (assignmentType === "all") {
      payload = { assignment_type: "all" };
    } else if (assignmentType === "department") {
      if (!departmentId) {
        toast.error("Please select a department");
        setLoading(false);
        return;
      }
      payload = {
        assignment_type: "department",
        department_id: departmentId,
      };
    } else if (assignmentType === "role") {
      if (!role) {
        toast.error("Please select a role");
        setLoading(false);
        return;
      }
      payload = {
        assignment_type: "role",
        role: role,
      };
    }

    try {
      await apiService.createAssignment(moduleId, payload);
      toast.success("Module assigned successfully");
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to assign module");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assignment Type
        </label>
        <select
          value={assignmentType}
          onChange={(e) => {
            setAssignmentType(e.target.value);
            setDepartmentId("");
            setRole("");
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4a53b]"
        >
          <option value="all">All Employees</option>
          <option value="department">Specific Department</option>
          <option value="role">Specific Role</option>
        </select>
      </div>

      {assignmentType === "department" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {assignmentType === "role" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Select Role</option>
            <option value="user">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[#d4a53b] text-white rounded-lg hover:bg-[#c49632] disabled:opacity-70"
        >
          {loading ? "Assigning..." : "Assign Module"}
        </button>
      </div>
    </form>
  );
}