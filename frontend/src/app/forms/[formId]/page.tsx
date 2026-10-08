"use client";
import { useEffect, useState, useRef } from "react";
import { getForm, submitResponse, Form, Answer } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Suspense } from "react";
function FormRespondentContent() {
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<any>(null);
  useEffect(() => {
    loadForm();
  }, [formId]);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);
  const loadForm = async () => {
    try {
      const data = await getForm(formId);
      setForm(data);
    } catch (error) {
      console.error("Failed to load form", error);
    } finally {
      setLoading(false);
    }
  };
  const handleNext = () => {
    if (!form || !form.questions) return;
    const currentQ = form.questions[currentIndex];
    if (currentQ.is_required && !answers[currentQ.id]) {
      alert("This question is required");
      return;
    }
    if (currentIndex < form.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };
  const handleSubmit = async () => {
    if (!form || !form.questions) return;
    for (const q of form.questions) {
      if (q.is_required && !answers[q.id]) {
        alert(`Question "${q.text}" is required.`);
        setCurrentIndex(form.questions.findIndex(qu => qu.id === q.id));
        return;
      }
    }
    try {
      const formattedAnswers: Answer[] = Object.keys(answers).map(qId => ({
        question_id: qId,
        value: answers[qId]
      }));
      await submitResponse(formId, formattedAnswers);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit form", error);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };
  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-card"><div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div></div>;
  }
  if (!form || !form.questions || form.questions.length === 0) {
    return <div className="flex h-screen items-center justify-center"><h1 className="text-2xl">Form not found or has no questions</h1></div>;
  }
  if (submitted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F9F9] font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-white">
            <Check size={32} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Thank you!</h1>
          <p className="mt-2 text-lg text-muted-foreground">Your response has been recorded.</p>
        </motion.div>
      </div>
    );
  }
  const currentQuestion = form.questions[currentIndex];
  const progress = ((currentIndex) / form.questions.length) * 100;
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-card font-sans">
      <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full z-50">
        <motion.div 
          className="h-full bg-primary text-primary-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 md:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-3xl"
          >
            <div className="flex items-start gap-4">
              <span className="flex items-center text-xl font-bold text-foreground mt-1">
                {currentIndex + 1}
                <svg className="ml-1 w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
              </span>
              <div className="flex-1">
                <h2 className="text-2xl md:text-4xl font-semibold text-foreground mb-2 leading-tight">
                  {currentQuestion.text}
                  {currentQuestion.is_required && <span className="text-red-500 ml-2">*</span>}
                </h2>
                {currentQuestion.description && (
                  <p className="text-lg text-muted-foreground mb-8">{currentQuestion.description}</p>
                )}
                <div className="mt-8">
                  {currentQuestion.type === "short_text" || currentQuestion.type === "email" || currentQuestion.type === "number" ? (
                    <input
                      ref={inputRef}
                      type={currentQuestion.type === "email" ? "email" : currentQuestion.type === "number" ? "number" : "text"}
                      className="w-full border-b border-black/30 bg-transparent py-2 text-2xl md:text-3xl text-foreground placeholder-gray-300 focus:border-black focus:outline-none transition-colors"
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                      onKeyDown={handleKeyDown}
                    />
                  ) : currentQuestion.type === "long_text" ? (
                    <textarea
                      ref={inputRef}
                      className="w-full border-b border-black/30 bg-transparent py-2 text-2xl md:text-3xl text-foreground placeholder-gray-300 focus:border-black focus:outline-none transition-colors resize-none overflow-hidden"
                      placeholder="Type your answer here..."
                      rows={3}
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) handleNext();
                      }}
                    />
                  ) : currentQuestion.type === "multiple_choice" || currentQuestion.type === "dropdown" ? (
                    <div className="flex flex-col gap-3">
                      {(JSON.parse(currentQuestion.options || "[]")).map((option: string, idx: number) => {
                        const isSelected = answers[currentQuestion.id] === option;
                        const letter = String.fromCharCode(65 + idx);
                        return (
                          <button
                            key={option}
                            onClick={() => {
                              setAnswers({ ...answers, [currentQuestion.id]: option });
                              setTimeout(handleNext, 300);
                            }}
                            className={`flex items-center w-full max-w-md rounded-md border p-3 text-left transition-all ${
                              isSelected 
                                ? "border-black bg-primary text-primary-foreground/5" 
                                : "border-border bg-background/50 hover:bg-muted"
                            }`}
                          >
                            <span className={`mr-4 flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                              isSelected ? "bg-primary text-primary-foreground text-white" : "border border-border text-muted-foreground bg-card"
                            }`}>
                              {letter}
                            </span>
                            <span className="text-lg text-foreground">{option}</span>
                            {isSelected && <Check size={20} className="ml-auto text-foreground" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : currentQuestion.type === "yes_no" ? (
                    <div className="flex flex-col gap-3">
                      {["Yes", "No"].map((option, idx) => {
                        const isSelected = answers[currentQuestion.id] === option;
                        const letter = idx === 0 ? "Y" : "N";
                        return (
                          <button
                            key={option}
                            onClick={() => {
                              setAnswers({ ...answers, [currentQuestion.id]: option });
                              setTimeout(handleNext, 300);
                            }}
                            className={`flex items-center w-full max-w-md rounded-md border p-3 text-left transition-all ${
                              isSelected 
                                ? "border-black bg-primary text-primary-foreground/5" 
                                : "border-border bg-background/50 hover:bg-muted"
                            }`}
                          >
                            <span className={`mr-4 flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                              isSelected ? "bg-primary text-primary-foreground text-white" : "border border-border text-muted-foreground bg-card"
                            }`}>
                              {letter}
                            </span>
                            <span className="text-lg text-foreground">{option}</span>
                            {isSelected && <Check size={20} className="ml-auto text-foreground" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : currentQuestion.type === "rating" ? (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            setAnswers({ ...answers, [currentQuestion.id]: num.toString() });
                            setTimeout(handleNext, 300);
                          }}
                          className={`flex h-14 w-14 items-center justify-center rounded-md border text-xl font-medium transition-all ${
                            answers[currentQuestion.id] === num.toString()
                              ? "border-black bg-primary text-primary-foreground text-white scale-110"
                              : "border-border bg-background text-gray-600 hover:bg-muted"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <button
                    onClick={handleNext}
                    className="flex items-center justify-center rounded bg-primary text-primary-foreground px-6 py-2.5 text-lg font-bold text-white transition-transform hover:scale-105 active:scale-95"
                  >
                    OK <Check size={20} className="ml-2" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    press <strong>Enter ↵</strong>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="fixed bottom-0 right-0 p-4 flex gap-2 z-50">
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className={`flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground/10 transition-colors ${currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary text-primary-foreground/20"}`}
        >
          <ChevronUp size={24} className="text-foreground" />
        </button>
        <button 
          onClick={handleNext}
          className="flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground transition-colors hover:bg-primary text-primary-foreground/80"
        >
          <ChevronDown size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}
export default function FormRespondent() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-card"><div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div></div>}>
      <FormRespondentContent />
    </Suspense>
  );
}
