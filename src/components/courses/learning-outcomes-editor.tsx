"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_OUTCOMES = 12;

type LearningOutcomesEditorProps = {
  outcomes: string[];
  onChange: (outcomes: string[]) => void;
  className?: string;
};

export function LearningOutcomesEditor({
  outcomes,
  onChange,
  className,
}: LearningOutcomesEditorProps) {
  function updateOutcome(index: number, value: string) {
    const next = [...outcomes];
    next[index] = value;
    onChange(next);
  }

  function addOutcome() {
    if (outcomes.length >= MAX_OUTCOMES) return;
    onChange([...outcomes, ""]);
  }

  function removeOutcome(index: number) {
    onChange(outcomes.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <Label>What students will learn</Label>
        <p className="mt-1 text-sm text-slate-500">
          Add short bullet points shown before students buy — like Coursera (e.g.
          &quot;Build a website&quot;, &quot;Use React hooks&quot;).
        </p>
      </div>

      <div className="space-y-2">
        {outcomes.map((outcome, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={outcome}
              onChange={(e) => updateOutcome(index, e.target.value)}
              placeholder={`Learning outcome ${index + 1}`}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => removeOutcome(index)}
              aria-label="Remove outcome"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {outcomes.length < MAX_OUTCOMES && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={addOutcome}
        >
          <Plus className="h-4 w-4" />
          Add learning outcome
        </Button>
      )}
    </div>
  );
}

export function normalizeLearningOutcomes(outcomes: string[]) {
  return outcomes.map((item) => item.trim()).filter(Boolean);
}
