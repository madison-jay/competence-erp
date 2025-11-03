// components/kss/LessonForm.jsx
"use client";

import { useState } from "react";
import apiService from "@/app/lib/apiService";
import { useRouter } from "next/navigation";

export default function LessonForm({ moduleId, initialData, onSuccess }) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [youtubeLink, setYoutubeLink] = useState(initialData?.youtube_link ?? "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      module_id: moduleId,
      title,
      description,
      youtube_link: youtubeLink || null,
    };

    try {
      if (initialData?.id) {
        await apiService.updateLesson(initialData.id, payload, router);
      } else {
        await apiService.createLesson(payload, router);
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
        <label className="block text-sm font-medium text-gray-700">Title *</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b88b1b] focus:ring-[#b88b1b] sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b88b1b] focus:ring-[#b88b1b] sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">YouTube Link</label>
        <input
          type="url"
          value={youtubeLink}
          onChange={(e) => setYoutubeLink(e.target.value)}
          placeholder="https://youtube.com/…"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#b88b1b] focus:ring-[#b88b1b] sm:text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[#b88b1b] px-4 py-2 text-white hover:bg-[#a57a17] disabled:opacity-70"
      >
        {loading ? "Saving…" : initialData?.id ? "Update Lesson" : "Create Lesson"}
      </button>
    </form>
  );
}