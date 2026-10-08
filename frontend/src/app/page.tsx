"use client";
import { useEffect, useState } from "react";
import { Form, getForms, createForm, deleteForm } from "@/lib/api";
import Link from "next/link";
import { Plus, Trash2, Edit2, BarChart2, Eye, Share2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
export default function Home() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/forms/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  useEffect(() => {
    loadForms();
  }, []);
  const loadForms = async () => {
    try {
      const data = await getForms();
      setForms(data);
    } catch (error) {
      console.error("Failed to load forms", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateForm = async () => {
    try {
      const newForm = await createForm("Untitled Form");
      setForms([...forms, newForm]);
      window.location.href = `/builder/${newForm.id}`;
    } catch (error) {
      console.error("Failed to create form", error);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      await deleteForm(id);
      setForms(forms.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Failed to delete form", error);
    }
  };
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Workspace</h1>
          <button
            onClick={handleCreateForm}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            Create new form
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div
              key={form.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      form.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {form.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <h3 className="mb-1 truncate text-lg font-semibold text-gray-900">
                  {form.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Created {format(new Date(form.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex space-x-2">
                  <Link
                    href={`/builder/${form.id}`}
                    className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                    title="Edit Builder"
                  >
                    <Edit2 size={18} />
                  </Link>
                  {form.is_published && (
                    <>
                      <Link
                        href={`/forms/${form.id}`}
                        target="_blank"
                        className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                        title="View Form"
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        onClick={() => handleCopyLink(form.id)}
                        className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-green-600 transition-colors"
                        title="Copy shareable link"
                      >
                        {copiedId === form.id ? <CheckCircle2 size={18} className="text-green-600" /> : <Share2 size={18} />}
                      </button>
                    </>
                  )}
                  <Link
                    href={`/results/${form.id}`}
                    className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                    title="View Results"
                  >
                    <BarChart2 size={18} />
                  </Link>
                </div>
                <button
                  onClick={() => handleDelete(form.id)}
                  className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {forms.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-transparent py-16">
              <div className="mb-4 rounded-full bg-gray-100 p-3 text-gray-400">
                <Plus size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No forms yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new form.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
