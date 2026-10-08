"use client";
import { useEffect, useState } from "react";
import { getForm, updateForm, createQuestion, updateQuestion, deleteQuestion, Form, Question } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Plus, Settings, Eye, Trash2, Copy, Save, Share2, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "@/components/SortableItem";
const QUESTION_TYPES = [
  { id: "short_text", label: "Short Text", icon: "Aa" },
  { id: "long_text", label: "Long Text", icon: "¶" },
  { id: "multiple_choice", label: "Multiple Choice", icon: "◉" },
  { id: "dropdown", label: "Dropdown", icon: "▼" },
  { id: "email", label: "Email", icon: "@" },
  { id: "number", label: "Number", icon: "123" },
  { id: "yes_no", label: "Yes / No", icon: "Y/N" },
  { id: "rating", label: "Rating", icon: "★" },
];
import { Suspense } from "react";
function BuilderContent() {
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  useEffect(() => {
    loadForm();
  }, [formId]);
  const loadForm = async () => {
    try {
      const data = await getForm(formId);
      setForm(data);
      setQuestions(data.questions?.sort((a, b) => a.order - b.order) || []);
      if (data.questions && data.questions.length > 0) {
        setActiveQuestionId(data.questions[0].id);
      }
    } catch (error) {
      console.error("Failed to load form", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddQuestion = async (type: string) => {
    try {
      const payload: Partial<Question> = {
        type,
        text: "New Question",
        order: questions.length,
      };
      if (type === "multiple_choice" || type === "dropdown") {
        payload.options = JSON.stringify(["Option 1"]);
      }
      const newQ = await createQuestion(formId, payload);
      setQuestions([...questions, newQ]);
      setActiveQuestionId(newQ.id);
    } catch (error) {
      console.error("Failed to add question", error);
    }
  };
  const handleUpdateForm = async (updates: Partial<Form>) => {
    if (!form) return;
    setForm({ ...form, ...updates });
    try {
      await updateForm(formId, updates);
    } catch (error) {
      console.error("Failed to update form", error);
    }
  };
  const handleUpdateQuestion = async (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
    try {
      await updateQuestion(id, updates);
    } catch (error) {
      console.error("Failed to update question", error);
    }
  };
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteQuestion(id);
      const newQuestions = questions.filter((q) => q.id !== id);
      setQuestions(newQuestions);
      if (activeQuestionId === id) {
        setActiveQuestionId(newQuestions.length > 0 ? newQuestions[0].id : null);
      }
    } catch (error) {
      console.error("Failed to delete question", error);
    }
  };
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      setQuestions(newQuestions);
      try {
        for (let i = 0; i < newQuestions.length; i++) {
          if (newQuestions[i].order !== i) {
            await updateQuestion(newQuestions[i].id, { order: i });
            newQuestions[i].order = i;
          }
        }
      } catch (error) {
        console.error("Failed to update order", error);
      }
    }
  };
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  if (!form) return <div>Form not found</div>;
  const activeQuestion = questions.find((q) => q.id === activeQuestionId);
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
            <ArrowLeft size={18} />
          </Link>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleUpdateForm({ title: e.target.value })}
            className="rounded border-transparent bg-transparent px-2 py-1 text-lg font-medium text-gray-900 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-0 hover:bg-gray-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/forms/${form.id}`}
            target="_blank"
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <Eye size={16} /> Preview
          </Link>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            title="Copy shareable link"
          >
            {copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Share2 size={16} />} 
            {copied ? "Copied!" : "Share Link"}
          </button>
          <button
            onClick={() => handleUpdateForm({ is_published: !form.is_published })}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors ${
              form.is_published ? "bg-green-600 hover:bg-green-700" : "bg-black hover:bg-gray-800"
            }`}
          >
            {form.is_published ? "Published" : "Publish"}
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 flex-shrink-0 border-r bg-white flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Add Question</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-2">
              {QUESTION_TYPES.map((qt) => (
                <button
                  key={qt.id}
                  onClick={() => handleAddQuestion(qt.id)}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-4 text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                  <span className="text-xl font-bold">{qt.icon}</span>
                  <span className="text-xs font-medium text-center">{qt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-4 pb-32">
              {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-20 text-center">
                  <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                    <Plus size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Your form is empty</h3>
                  <p className="mt-1 text-sm text-gray-500">Add your first question from the left sidebar.</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {questions.map((q, index) => (
                        <SortableItem key={q.id} id={q.id} isActive={activeQuestionId === q.id}>
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setActiveQuestionId(q.id)}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                {index + 1}
                              </span>
                              <div className="truncate font-medium text-gray-900">
                                {q.text || "Untitled Question"}
                              </div>
                              {q.is_required && <span className="text-red-500 text-sm">*</span>}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                              className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
        <div className="w-80 flex-shrink-0 border-l bg-white flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Question Settings</h2>
            <Settings size={16} className="text-gray-400" />
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {activeQuestion ? (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Question Text</label>
                  <input
                    type="text"
                    value={activeQuestion.text}
                    onChange={(e) => handleUpdateQuestion(activeQuestion.id, { text: e.target.value })}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Enter question text"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <textarea
                    value={activeQuestion.description || ""}
                    onChange={(e) => handleUpdateQuestion(activeQuestion.id, { description: e.target.value })}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Add a description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-b py-4 border-gray-100">
                  <label className="text-sm font-medium text-gray-700">Required</label>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={activeQuestion.is_required}
                      onChange={(e) => handleUpdateQuestion(activeQuestion.id, { is_required: e.target.checked })}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black/20"></div>
                  </label>
                </div>
                {(activeQuestion.type === "multiple_choice" || activeQuestion.type === "dropdown") && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Options</label>
                    <div className="space-y-2">
                      {(JSON.parse(activeQuestion.options || "[]")).map((opt: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const opts = JSON.parse(activeQuestion.options || "[]");
                              opts[idx] = e.target.value;
                              handleUpdateQuestion(activeQuestion.id, { options: JSON.stringify(opts) });
                            }}
                            className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const opts = JSON.parse(activeQuestion.options || "[]");
                              opts.splice(idx, 1);
                              handleUpdateQuestion(activeQuestion.id, { options: JSON.stringify(opts) });
                            }}
                            className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const opts = JSON.parse(activeQuestion.options || "[]");
                          opts.push(`Option ${opts.length + 1}`);
                          handleUpdateQuestion(activeQuestion.id, { options: JSON.stringify(opts) });
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 p-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Plus size={16} /> Add Option
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-gray-400">
                Select a question to view settings
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Builder() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>}>
      <BuilderContent />
    </Suspense>
  );
}
