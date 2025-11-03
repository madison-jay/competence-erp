// app/kss/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/app/lib/apiService";
import ModuleForm from "@/components/kss/ModuleForm";
import LessonForm from "@/components/kss/LessonForm";
import toast from "react-hot-toast";

const CustomModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        {children}
        <button
          onClick={onClose}
          className="mt-4 w-full rounded bg-gray-500 py-2 text-white hover:bg-gray-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="animate-pulse space-y-3 rounded-lg border p-5 bg-white">
    <div className="h-6 w-3/4 rounded bg-gray-200"></div>
    <div className="h-4 w-full rounded bg-gray-200"></div>
    <div className="h-4 w-5/6 rounded bg-gray-200"></div>
  </div>
);

export default function KSS() {
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState("");
  const [openModuleId, setOpenModuleId] = useState(null); // Tracks which module is open

  // Modal state
  const [modModal, setModModal] = useState(false);
  const [lesModal, setLesModal] = useState(false);
  const [delModal, setDelModal] = useState(false);
  const [selModule, setSelModule] = useState(null);
  const [selLesson, setSelLesson] = useState(null);
  const [delType, setDelType] = useState(null);

  // Clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const opts = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setNow(d.toLocaleString("en-US", opts));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch + sort
  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await apiService.getModules(router);
      if (!data) throw new Error("No data returned");

      const sortedModules = [...data].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      const withSortedLessons = sortedModules.map((mod) => ({
        ...mod,
        lessons: [...(mod.lessons || [])].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        ),
      }));

      setModules(withSortedLessons);
      setError(null);
    } catch (e) {
      setError(e.message ?? "Failed to load modules");
      toast.error(e.message ?? "Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [router]);

  // Toggle accordion
  const toggleModule = (moduleId) => {
    setOpenModuleId((prev) => (prev === moduleId ? null : moduleId));
  };

  // CRUD Handlers
  const openCreateModule = () => {
    setSelModule(null);
    setModModal(true);
  };
  const openEditModule = (m) => {
    setSelModule(m);
    setModModal(true);
  };
  const openCreateLesson = (m) => {
    setSelModule(m);
    setSelLesson(null);
    setLesModal(true);
  };
  const openEditLesson = (l) => {
    setSelLesson(l);
    setLesModal(true);
  };
  const openDelete = (item, type) => {
    setSelModule(item.module ?? item);
    setSelLesson(type === "lesson" ? item : null);
    setDelType(type);
    setDelModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (delType === "module") {
        await apiService.deleteModule(selModule.id, router);
        toast.success("Module deleted");
      } else {
        await apiService.deleteLesson(selLesson.id, router);
        toast.success("Lesson deleted");
      }
      await fetchAll();
    } catch (e) {
      toast.error(e.message ?? "Delete failed");
    } finally {
      setDelModal(false);
    }
  };

  const afterSave = async () => {
    setModModal(false);
    setLesModal(false);
    toast.success(
      selModule?.id
        ? "Module updated"
        : selLesson?.id
          ? "Lesson updated"
          : "Created successfully"
    );
    await fetchAll();
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-14 mt-5">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Sharing System</h1>
          <p className="mt-2 text-gray-500 font-medium">
            Manage training modules and lessons
          </p>
        </div>
        <span className="rounded-[20px] border border-gray-300 px-3 py-2 text-gray-500">
          {now}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <div className="rounded bg-red-50 p-4 text-center text-red-700">
            {error}
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No modules yet.</p>
            <button
              onClick={openCreateModule}
              className="mt-4 rounded bg-[#d4a53b] px-6 py-2 text-white hover:bg-[#c49632] transition"
            >
              Create First Module
            </button>
          </div>
        ) : (
          modules.map((mod, modIdx) => {
            const isOpen = openModuleId === mod.id;

            return (
              <div
                key={mod.id}
                className="overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Accordion Header */}
                {/* Accordion Header – NOW SAFE */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleModule(mod.id)}
                  onKeyDown={(e) => e.key === "Enter" && toggleModule(mod.id)}
                  className="w-full text-left bg-gradient-to-r from-[#d4a53b] to-[#e6c070] p-5 text-white hover:from-[#c49632] hover:to-[#d4a53b] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#b88b1b] focus:ring-offset-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg
                        className={`h-5 w-5 transform transition-transform ${isOpen ? "rotate-90" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div>
                        <h3 className="text-lg font-bold">
                          Module {modIdx + 1}: {mod.title}
                        </h3>
                        <p className="text-sm opacity-90">{mod.description}</p>
                      </div>
                    </div>

                    {/* Real buttons – NOT nested */}
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModule(mod)}
                        className="rounded bg-white px-4 py-1.5 text-sm font-medium text-[#b88b1b] hover:bg-gray-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDelete(mod, "module")}
                        className="rounded bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Accordion Body – Collapsible */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="bg-gray-50 p-5 border-t">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-semibold text-gray-700">
                        Lessons ({mod.lessons?.length ?? 0})
                      </h4>
                      <button
                        onClick={() => openCreateLesson(mod)}
                        className="text-sm font-medium text-[#b88b1b] hover:underline"
                      >
                        + Add Lesson
                      </button>
                    </div>

                    {mod.lessons?.length ? (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {mod.lessons.map((les, lesIdx) => (
                          <div
                            key={les.id}
                            className="flex-shrink-0 w-64 rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-shadow"
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <span className="font-bold text-[#b88b1b] text-sm">
                                {modIdx + 1}.{lesIdx + 1}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openEditLesson(les)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => openDelete(les, "lesson")}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <h5 className="text-sm font-medium text-gray-900">
                              {les.title}
                            </h5>
                            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                              {les.description}
                            </p>
                            {les.youtube_link && (
                              <a
                                href={les.youtube_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center text-xs text-blue-600 hover:underline"
                              >
                                Watch Video
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="italic text-sm text-gray-500">
                        No lessons yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating + Button */}
      {!loading && modules.length > 0 && (
        <button
          onClick={openCreateModule}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#d4a53b] text-3xl text-white shadow-lg hover:bg-[#c49632] transition"
        >
          +
        </button>
      )}

      {/* Modals */}
      <CustomModal isOpen={modModal} onClose={() => setModModal(false)}>
        <h3 className="mb-4 text-xl font-bold text-gray-900">
          {selModule ? "Update Module" : "Create New Module"}
        </h3>
        <ModuleForm initialData={selModule} onSuccess={afterSave} />
      </CustomModal>

      <CustomModal isOpen={lesModal} onClose={() => setLesModal(false)}>
        <h3 className="mb-4 text-xl font-bold text-gray-900">
          {selLesson ? "Update" : "Create"} Lesson
          {selModule &&
            ` – Module ${modules.findIndex((m) => m.id === selModule.id) + 1
            }`}
        </h3>
        <LessonForm
          moduleId={selModule?.id}
          initialData={selLesson}
          onSuccess={afterSave}
        />
      </CustomModal>

      <CustomModal isOpen={delModal} onClose={() => setDelModal(false)}>
        <h3 className="mb-2 text-xl font-bold text-red-600">Confirm Delete</h3>
        <p className="text-gray-700">
          Are you sure you want to delete this{" "}
          <strong>{delType}</strong>?
        </p>
        <p className="mt-2 font-medium text-gray-900">
          {(delType === "module" ? selModule?.title : selLesson?.title) ?? ""}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={confirmDelete}
            className="flex-1 rounded bg-red-500 py-2 text-white hover:bg-red-600 transition"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setDelModal(false)}
            className="flex-1 rounded bg-gray-500 py-2 text-white hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </CustomModal>
    </div>
  );
}