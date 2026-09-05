"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, AlertCircle } from "lucide-react";

const DIFFICULTY_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const TYPE_OPTIONS = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "SHORT_TEXT", label: "Short Text" },
  { value: "FILL_BLANK", label: "Fill in the Blank" },
  { value: "MATCHING", label: "Matching" },
  { value: "WRITING", label: "Writing" },
];

interface Skill {
  id: string;
  name: string;
  category?: string | null;
}

interface PracticeSetupProps {
  skills: Skill[];
}

export function PracticeSetup({ skills }: PracticeSetupProps) {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(10);
  const [skillId, setSkillId] = useState<string>("ALL");
  const [difficulty, setDifficulty] = useState<string>("ALL");
  const [type, setType] = useState<string>("ALL");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartPractice() {
    setIsStarting(true);
    setError(null);
    try {
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionCount,
          skillId: skillId === "ALL" ? undefined : skillId || undefined,
          difficulty: difficulty === "ALL" ? undefined : difficulty || undefined,
          type: type === "ALL" ? undefined : type || undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create practice session");
      }
      const data = await response.json();
      router.push(`/practice/${data.attempt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsStarting(false);
    }
  }

  async function handleStartMistakes() {
    setIsStarting(true);
    setError(null);
    try {
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionCount,
          mode: "MISTAKES",
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create mistake practice session");
      }
      const data = await response.json();
      router.push(`/practice/${data.attempt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Practice Mode</h1>
        <p className="mt-2 text-muted-foreground">
          Customize your practice session or review your past mistakes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Settings</CardTitle>
          <CardDescription>
            Configure your practice session parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="questionCount">Number of Questions</Label>
            <Input
              id="questionCount"
              type="number"
              min={1}
              max={50}
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-32"
            />
          </div>

          <div className="space-y-2">
            <Label>Skill</Label>
            <Select value={skillId} onValueChange={setSkillId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All skills</SelectItem>
                {skills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name}
                    {skill.category ? ` (${skill.category})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All difficulties</SelectItem>
                {DIFFICULTY_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleStartPractice}
              disabled={isStarting}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              {isStarting ? "Starting..." : "Start Practice"}
            </Button>
            <Button
              variant="outline"
              onClick={handleStartMistakes}
              disabled={isStarting}
            >
              {isStarting ? "Starting..." : "Practice My Mistakes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
