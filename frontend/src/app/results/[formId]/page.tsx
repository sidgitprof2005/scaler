"use client";

import { useEffect, useState } from "react";
import { getForm, getResponses, Form, Response } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Inbox, Download } from "lucide-react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Suspense } from "react";

function ResultsContent() {
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  useEffect(() => {
    Promise.all([getForm(formId), getResponses(formId)])
      .then(([formData, responsesData]) => {
        setForm(formData);
        setResponses(responsesData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [formId]);

  const handleExportCSV = () => {
    if (!form || !responses) return;
    const questions = form.questions || [];
    
    // Headers
    const headers = ["Submitted At", ...questions.map((q) => q.text.replace(/"/g, '""'))];
    
    // Rows
    const rows = responses.map((resp) => {
      const row = [format(new Date(resp.submitted_at), "yyyy-MM-dd HH:mm:ss")];
      questions.forEach((q) => {
        const answer = resp.answers.find((a) => a.question_id === q.id);
        const value = answer ? answer.value.replace(/"/g, '""') : "";
        row.push(`"${value}"`);
      });
      return row.join(",");
    });

    const csvContent = [headers.map(h => `"${h}"`).join(","), ...rows].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${form.title || 'Form'}-results.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!form) return <div>Form not found</div>;

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">{form.title} - Results</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{responses.length} {responses.length === 1 ? "Response" : "Responses"}</span>
          <button 
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-white flex flex-col">
          <div className="p-4 border-b font-medium text-gray-700">Submissions</div>
          <div className="flex-1 overflow-y-auto">
            {responses.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Inbox size={32} className="mb-2 opacity-20" />
                No responses yet
              </div>
            ) : (
              responses.map((resp, idx) => (
                <button
                  key={resp.id}
                  onClick={() => setSelectedResponse(resp)}
                  className={`w-full text-left p-4 border-b transition-colors ${
                    selectedResponse?.id === resp.id ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="font-medium text-gray-900">Response #{responses.length - idx}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(new Date(resp.submitted_at), "MMM d, yyyy h:mm a")}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {selectedResponse ? (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8">
              <div className="mb-8 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Response Details</h2>
                <p className="text-gray-500 text-sm mt-1">Submitted on {format(new Date(selectedResponse.submitted_at), "PPP 'at' p")}</p>
              </div>

              <div className="space-y-8">
                {form.questions?.map((q) => {
                  const answer = selectedResponse.answers.find(a => a.question_id === q.id);
                  return (
                    <div key={q.id}>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">{q.text}</h3>
                      <div className="text-gray-700 bg-gray-50 p-4 rounded-md border text-lg">
                        {answer?.value || <span className="text-gray-400 italic">No answer provided</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              {responses.length > 0 ? "Select a response to view details" : "Waiting for responses..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>}>
      <ResultsContent />
    </Suspense>
  );
}
