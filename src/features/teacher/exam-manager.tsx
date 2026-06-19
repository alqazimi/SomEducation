"use client";

import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { ClipboardCheck, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { DragHandle, reorderDropClass } from "@/components/ui/drag-handle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import { getOrderUpdates } from "@/lib/reorder";
import { cn } from "@/lib/utils";

type DeleteTarget =
  | { type: "exam"; examId: Id<"exams"> }
  | { type: "question"; questionId: Id<"examQuestions"> }
  | null;

type QuestionDraft = {
  questionText: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  explanation: string;
};

function createOptionId() {
  return `opt_${Math.random().toString(36).slice(2, 10)}`;
}

function emptyQuestionDraft(): QuestionDraft {
  const a = createOptionId();
  const b = createOptionId();
  const c = createOptionId();
  const d = createOptionId();
  return {
    questionText: "",
    options: [
      { id: a, text: "" },
      { id: b, text: "" },
      { id: c, text: "" },
      { id: d, text: "" },
    ],
    correctOptionId: a,
    explanation: "",
  };
}

function QuestionFormPanel({
  draft,
  onChange,
  onSave,
  onCancel,
  saveLabel,
}: {
  draft: QuestionDraft;
  onChange: (draft: QuestionDraft) => void;
  onSave: () => void;
  onCancel?: () => void;
  saveLabel: string;
}) {
  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-4">
      <div className="space-y-4">
        <div>
          <Label>Question</Label>
          <Textarea
            value={draft.questionText}
            onChange={(e) =>
              onChange({ ...draft, questionText: e.target.value })
            }
            rows={2}
            className="mt-2 bg-white"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label>Answer Options</Label>
          {draft.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correctOption-${option.id}`}
                checked={draft.correctOptionId === option.id}
                onChange={() =>
                  onChange({ ...draft, correctOptionId: option.id })
                }
              />
              <Input
                value={option.text}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    options: draft.options.map((o, i) =>
                      i === index ? { ...o, text: e.target.value } : o
                    ),
                  })
                }
                placeholder={`Option ${index + 1}`}
                className="bg-white"
              />
            </div>
          ))}
          <p className="text-xs text-slate-500">
            Select the radio button for the correct answer.
          </p>
        </div>
        <div>
          <Label>Explanation (shown after submit)</Label>
          <Textarea
            value={draft.explanation}
            onChange={(e) =>
              onChange({ ...draft, explanation: e.target.value })
            }
            rows={2}
            className="mt-2 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave}>
            {saveLabel}
          </Button>
          {onCancel && (
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExamManager({
  courseId,
  modules,
}: {
  courseId: Id<"courses">;
  modules: Array<{
    _id: Id<"modules">;
    title: string;
    exams: Array<{
      _id: Id<"exams">;
      title: string;
      passingScore: number;
      maxAttempts: number;
      timeLimitMinutes?: number;
      order: number;
    }>;
  }>;
}) {
  const exams = useQuery(api.exams.listByCourse, { courseId });
  const createExam = useMutation(api.exams.create);
  const updateExam = useMutation(api.exams.update);
  const removeExam = useMutation(api.exams.remove);
  const addQuestion = useMutation(api.exams.addQuestion);
  const updateQuestion = useMutation(api.exams.updateQuestion);
  const removeQuestion = useMutation(api.exams.removeQuestion);

  const [selectedModuleId, setSelectedModuleId] = useState<Id<"modules"> | "">(
    ""
  );
  const [examTitle, setExamTitle] = useState("");
  const [editingExamTitle, setEditingExamTitle] = useState("");
  const [editingExamDescription, setEditingExamDescription] = useState("");
  const [passingScore, setPassingScore] = useState("70");
  const [maxAttempts, setMaxAttempts] = useState("3");
  const [timeLimit, setTimeLimit] = useState("");
  const [editingExamId, setEditingExamId] = useState<Id<"exams"> | null>(null);
  const [questionDraft, setQuestionDraft] =
    useState<QuestionDraft>(emptyQuestionDraft);
  const [editingQuestionId, setEditingQuestionId] =
    useState<Id<"examQuestions"> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reorderingExams, setReorderingExams] = useState(false);
  const [reorderingQuestionsExamId, setReorderingQuestionsExamId] =
    useState<Id<"exams"> | null>(null);
  const [questionDrag, setQuestionDrag] = useState<{
    examId: Id<"exams">;
    fromIndex: number;
  } | null>(null);
  const [questionDropIndex, setQuestionDropIndex] = useState<number | null>(
    null
  );

  const editingExam = exams?.find((e) => e._id === editingExamId);

  const handleExamReorder = useCallback(
    async (
      reordered: NonNullable<typeof exams>
    ) => {
      const updates = getOrderUpdates(reordered);
      if (updates.length === 0) return;

      setReorderingExams(true);
      try {
        await Promise.all(
          updates.map(({ item, order }) =>
            updateExam({ examId: item._id, order })
          )
        );
        toast.success("Exam order updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to reorder");
      } finally {
        setReorderingExams(false);
      }
    },
    [updateExam]
  );

  const examDrag = useDragReorder({
    items: exams ?? [],
    onReorder: handleExamReorder,
    disabled: reorderingExams || !exams?.length,
  });

  async function handleQuestionReorder(
    examId: Id<"exams">,
    questions: NonNullable<typeof editingExam>["questions"],
    fromIndex: number,
    toIndex: number
  ) {
    if (fromIndex === toIndex) return;

    const reordered = [...questions];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const updates = getOrderUpdates(reordered);
    if (updates.length === 0) return;

    setReorderingQuestionsExamId(examId);
    try {
      await Promise.all(
        updates.map(({ item, order }) =>
          updateQuestion({ questionId: item._id, order })
        )
      );
      toast.success("Question order updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reorder");
    } finally {
      setReorderingQuestionsExamId(null);
    }
  }

  function resetQuestionDrag() {
    setQuestionDrag(null);
    setQuestionDropIndex(null);
  }

  async function handleCreateExam() {
    if (!selectedModuleId || !examTitle.trim()) {
      toast.error("Select a module and enter an exam title");
      return;
    }
    try {
      const examId = await createExam({
        moduleId: selectedModuleId,
        title: examTitle.trim(),
        passingScore: Number(passingScore),
        maxAttempts: Number(maxAttempts),
        timeLimitMinutes: timeLimit.trim() ? Number(timeLimit) : undefined,
      });
      setExamTitle("");
      setEditingExamId(examId);
      toast.success("Exam created — add questions below");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  async function handleSaveExamSettings() {
    if (!editingExamId || !editingExamTitle.trim()) {
      toast.error("Exam title is required");
      return;
    }
    try {
      await updateExam({
        examId: editingExamId,
        title: editingExamTitle.trim(),
        description: editingExamDescription.trim() || undefined,
        passingScore: Number(passingScore),
        maxAttempts: Number(maxAttempts),
        timeLimitMinutes: timeLimit.trim() ? Number(timeLimit) : undefined,
      });
      toast.success("Exam saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === "exam") {
        await removeExam({ examId: deleteTarget.examId });
        if (editingExamId === deleteTarget.examId) {
          setEditingExamId(null);
          setEditingQuestionId(null);
          setQuestionDraft(emptyQuestionDraft());
        }
        toast.success("Exam deleted");
      } else {
        await removeQuestion({ questionId: deleteTarget.questionId });
        if (editingQuestionId === deleteTarget.questionId) resetQuestionForm();
        toast.success("Question deleted");
      }
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  function startEditQuestion(question: {
    _id: Id<"examQuestions">;
    questionText: string;
    options: Array<{ id: string; text: string }>;
    correctOptionId: string;
    explanation?: string;
  }) {
    setEditingQuestionId(question._id);
    setQuestionDraft({
      questionText: question.questionText,
      options: question.options,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation ?? "",
    });
  }

  function resetQuestionForm() {
    setEditingQuestionId(null);
    setQuestionDraft(emptyQuestionDraft());
  }

  async function handleSaveQuestion() {
    if (!editingExamId) {
      toast.error("Select an exam first");
      return;
    }
    if (!questionDraft.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (questionDraft.options.some((o) => !o.text.trim())) {
      toast.error("Fill in all answer options");
      return;
    }

    try {
      if (editingQuestionId) {
        await updateQuestion({
          questionId: editingQuestionId,
          questionText: questionDraft.questionText,
          options: questionDraft.options.map((o) => ({
            id: o.id,
            text: o.text.trim(),
          })),
          correctOptionId: questionDraft.correctOptionId,
          explanation: questionDraft.explanation || undefined,
        });
        toast.success("Question updated");
      } else {
        await addQuestion({
          examId: editingExamId,
          questionText: questionDraft.questionText,
          options: questionDraft.options.map((o) => ({
            id: o.id,
            text: o.text.trim(),
          })),
          correctOptionId: questionDraft.correctOptionId,
          explanation: questionDraft.explanation || undefined,
        });
        toast.success("Question added");
      }
      resetQuestionForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  }

  async function handleDeleteQuestion(questionId: Id<"examQuestions">) {
    setDeleteTarget({ type: "question", questionId });
  }

  function selectExam(exam: NonNullable<typeof exams>[number]) {
    setEditingExamId(exam._id);
    setEditingExamTitle(exam.title);
    setEditingExamDescription(exam.description ?? "");
    setPassingScore(String(exam.passingScore));
    setMaxAttempts(String(exam.maxAttempts));
    setTimeLimit(exam.timeLimitMinutes ? String(exam.timeLimitMinutes) : "");
    resetQuestionForm();
  }

  if (exams === undefined) {
    return <p className="text-sm text-slate-500">Loading exams...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-white p-5">
        <h3 className="font-medium text-slate-900">Create Module Exam</h3>
        <p className="mt-1 text-sm text-slate-500">
          Add Coursera-style quizzes at the end of each module. Drag exams and
          questions by the grip handle to reorder them.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Module</Label>
            <select
              className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
              value={selectedModuleId}
              onChange={(e) =>
                setSelectedModuleId(e.target.value as Id<"modules">)
              }
            >
              <option value="">Select module</option>
              {modules.map((mod) => (
                <option key={mod._id} value={mod._id}>
                  {mod.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Exam Title</Label>
            <Input
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="Module 1 Practice Quiz"
              className="mt-2"
            />
          </div>
        </div>
        <Button className="mt-4 gap-2" onClick={handleCreateExam}>
          <Plus className="h-4 w-4" />
          Add Exam
        </Button>
      </div>

      <div className="space-y-4">
        {exams.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-slate-500">
            No exams yet. Create one to let students test their knowledge.
          </p>
        ) : (
          exams.map((exam, examIndex) => (
            <div
              key={exam._id}
              className={cn(
                "rounded-lg border border-border bg-white p-5 transition-shadow",
                reorderDropClass(
                  examDrag.isDropTarget(examIndex),
                  examDrag.isDragging(examIndex)
                )
              )}
              onDragOver={examDrag.onDragOver(examIndex)}
              onDrop={examDrag.onDrop(examIndex)}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <DragHandle
                    draggable={!reorderingExams}
                    onDragStart={examDrag.onDragStart(examIndex)}
                    onDragEnd={examDrag.onDragEnd}
                    label="Drag to reorder exam"
                    className="mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-brand-600" />
                      <h4 className="font-medium text-slate-900">{exam.title}</h4>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {exam.questions.length} questions · Pass{" "}
                      {exam.passingScore}% ·{" "}
                      {exam.maxAttempts === 0
                        ? "Unlimited attempts"
                        : `${exam.maxAttempts} attempts`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={editingExamId === exam._id ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectExam(exam)}
                  >
                    {editingExamId === exam._id ? "Editing" : "Manage"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDeleteTarget({ type: "exam", examId: exam._id })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingExamId === exam._id && (
                <div className="mt-5 space-y-5 border-t border-border pt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Exam Title</Label>
                      <Input
                        value={editingExamTitle}
                        onChange={(e) => setEditingExamTitle(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Description (optional)</Label>
                      <Textarea
                        value={editingExamDescription}
                        onChange={(e) =>
                          setEditingExamDescription(e.target.value)
                        }
                        rows={2}
                        placeholder="Brief instructions for students before they start"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label>Passing Score (%)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={passingScore}
                        onChange={(e) => setPassingScore(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Max Attempts (0 = unlimited)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={maxAttempts}
                        onChange={(e) => setMaxAttempts(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Time Limit (minutes, optional)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        placeholder="No limit"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSaveExamSettings}>
                    Save Exam
                  </Button>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h5 className="text-sm font-semibold text-slate-800">
                        Questions
                      </h5>
                      {!editingQuestionId && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => {
                            resetQuestionForm();
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Question
                        </Button>
                      )}
                    </div>
                    <ul className="mt-3 space-y-3">
                      {exam.questions.length === 0 && !editingQuestionId ? (
                        <li className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-slate-500">
                          No questions yet. Click Add Question to create one.
                        </li>
                      ) : (
                        exam.questions.map((q, index) => (
                          <li
                            key={q._id}
                            className={cn(
                              "space-y-3",
                              reorderDropClass(
                                questionDrag?.examId === exam._id &&
                                  questionDropIndex === index &&
                                  questionDrag.fromIndex !== index,
                                questionDrag?.examId === exam._id &&
                                  questionDrag.fromIndex === index
                              )
                            )}
                            onDragOver={(event) => {
                              if (
                                questionDrag?.examId !== exam._id ||
                                reorderingQuestionsExamId === exam._id
                              ) {
                                return;
                              }
                              event.preventDefault();
                              event.dataTransfer.dropEffect = "move";
                              setQuestionDropIndex(index);
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              if (
                                !questionDrag ||
                                questionDrag.examId !== exam._id ||
                                reorderingQuestionsExamId === exam._id
                              ) {
                                resetQuestionDrag();
                                return;
                              }
                              void handleQuestionReorder(
                                exam._id,
                                exam.questions,
                                questionDrag.fromIndex,
                                index
                              );
                              resetQuestionDrag();
                            }}
                          >
                            <div
                              className={cn(
                                "flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2 text-sm",
                                editingQuestionId === q._id
                                  ? "border border-brand-300 bg-brand-50/30"
                                  : "bg-slate-50"
                              )}
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                <DragHandle
                                  draggable={
                                    !questionDrag &&
                                    reorderingQuestionsExamId !== exam._id &&
                                    !editingQuestionId
                                  }
                                  onDragStart={(event) => {
                                    setQuestionDrag({
                                      examId: exam._id,
                                      fromIndex: index,
                                    });
                                    setQuestionDropIndex(index);
                                    event.dataTransfer.effectAllowed = "move";
                                  }}
                                  onDragEnd={resetQuestionDrag}
                                  label="Drag to reorder question"
                                />
                                <span className="min-w-0">
                                  {index + 1}. {q.questionText}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant={
                                    editingQuestionId === q._id
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    editingQuestionId === q._id
                                      ? resetQuestionForm()
                                      : startEditQuestion(q)
                                  }
                                >
                                  {editingQuestionId === q._id ? "Close" : "Edit"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteQuestion(q._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                            {editingQuestionId === q._id && (
                              <QuestionFormPanel
                                draft={questionDraft}
                                onChange={setQuestionDraft}
                                onSave={() => void handleSaveQuestion()}
                                onCancel={resetQuestionForm}
                                saveLabel="Save Question"
                              />
                            )}
                          </li>
                        ))
                      )}
                    </ul>

                    {!editingQuestionId && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-slate-800">
                          New question
                        </p>
                        <QuestionFormPanel
                          draft={questionDraft}
                          onChange={setQuestionDraft}
                          onSave={() => void handleSaveQuestion()}
                          saveLabel="Add Question"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {editingExam && editingExam.questions.length > 0 && (
        <Badge variant="secondary" className="text-xs">
          Students need {editingExam.passingScore}% to pass this exam
        </Badge>
      )}

      <ConfirmDialog
        open={deleteTarget?.type === "exam"}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete exam?"
        description="This exam and all its questions will be permanently removed."
        confirmLabel="Delete Exam"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <ConfirmDialog
        open={deleteTarget?.type === "question"}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete question?"
        description="This question will be permanently removed from the exam."
        confirmLabel="Delete Question"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  );
}
