// components/kss/ModuleForm.jsx
"use client";

import { useState } from "react";
import apiService from "@/app/lib/apiService";
import { useRouter } from "next/navigation";

export default function ModuleForm({ initialData, onSuccess }) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { title, description };

    try {
      if (initialData?.id) {
        await apiService.updateModule(initialData.id, payload, router);
      } else {
        await apiService.createModule(payload, router);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-md font-medium text-gray-700 mb-2">Title *</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 px-2 py-4 border border-solid shadow-sm focus:border-[#b88b1b] focus:ring-[#b88b1b]"
        />
      </div>

      <div>
        <label className="block text-md font-medium text-gray-700 mb-2">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 px-2 py-4 border border-solid shadow-sm focus:border-[#b88b1b] focus:ring-[#b88b1b]"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[#b88b1b] px-4 py-2 text-white hover:bg-[#a57a17] disabled:opacity-70"
      >
        {loading ? "Saving…" : initialData?.id ? "Update Module" : "Create Module"}
      </button>
    </form>
  );
}