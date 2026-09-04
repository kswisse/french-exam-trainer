import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { QuestionSnapshot } from "@/types/attempt";
import type { ExamResultDataAttempt } from "../services/results-types";

function getCorrectAnswerLabel(snapshot: QuestionSnapshot): string {
  switch (snapshot.type) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE": {
      const correct = snapshot.options.find((o) => o.isCorrect);
      return correct ? `${correct.label}. ${correct.text}` : "N/A";
    }
    case "SHORT_TEXT":
      return snapshot.answers
        .filter((a) => a.isAcceptable)
        .map((a) => a.text)
        .join(" / ");
    case "FILL_BLANK":
      return snapshot.answers
        .filter((a) => a.isAcceptable)
        .map((a) => a.text)
        .join(" / ");
    case "MATCHING": {
      const correct = snapshot.answers.find((a) => a.isAcceptable);
      if (!correct) return "N/A";
      try {
        const pairs = JSON.parse(correct.text) as Record<string, string>;
        return Object.entries(pairs)
          .map(([k, v]) => `${k} → ${v}`)
          .join(", ");
      } catch {
        return correct.text;
      }
    }
    case "WRITING":
      return "Not graded (writing)";
  }
}

function getUserAnswerLabel(
  snapshot: QuestionSnapshot,
  selectedOptionId?: string | null,
  textAnswer?: string | null,
): string {
  if (!selectedOptionId && !textAnswer) return "Not answered";

  switch (snapshot.type) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE": {
      if (!selectedOptionId) return "Not answered";
      const selected = snapshot.options.find((o) => o.id === selectedOptionId);
      return selected
        ? `${selected.label}. ${selected.text}`
        : selectedOptionId;
    }
    case "SHORT_TEXT":
      return textAnswer || "Not answered";
    case "FILL_BLANK": {
      if (!textAnswer) return "Not answered";
      try {
        const answers = JSON.parse(textAnswer) as string[];
        return answers.join(", ");
      } catch {
        return textAnswer;
      }
    }
    case "MATCHING": {
      if (!textAnswer) return "Not answered";
      try {
        const pairs = JSON.parse(textAnswer) as Record<string, string>;
        return Object.entries(pairs)
          .map(([k, v]) => `${k} → ${v}`)
          .join(", ");
      } catch {
        return textAnswer;
      }
    }
    case "WRITING":
      return textAnswer || "Not answered";
  }
}

function formatMistakeCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface QuestionReviewDetailProps {
  snapshot: QuestionSnapshot;
  questionAttempt: ExamResultDataAttempt["questionAttempts"][number];
}

export function QuestionReviewDetail({
  snapshot,
  questionAttempt,
}: QuestionReviewDetailProps) {
  const isCorrect = questionAttempt.isCorrect;
  const isWriting = snapshot.type === "WRITING";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base">
            Question {questionAttempt.question.number}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                isWriting
                  ? "secondary"
                  : isCorrect
                    ? "default"
                    : "destructive"
              }
            >
              {isWriting
                ? "Not graded"
                : isCorrect
                  ? "Correct"
                  : "Incorrect"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {snapshot.points} pt{snapshot.points !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Question</p>
          <p className="mt-1 text-foreground">{snapshot.text}</p>
        </div>

        {snapshot.instructions && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Instructions
            </p>
            <p className="mt-1 text-sm text-foreground">
              {snapshot.instructions}
            </p>
          </div>
        )}

        {(snapshot.type === "MULTIPLE_CHOICE" ||
          snapshot.type === "TRUE_FALSE") && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Options</p>
            <div className="mt-2 space-y-2">
              {snapshot.options.map((option) => {
                const isSelected =
                  option.id === questionAttempt.selectedOptionId;
                const isCorrectOption = option.isCorrect;
                return (
                  <div
                    key={option.id}
                    className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                      isCorrectOption
                        ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
                        : isSelected && !isCorrectOption
                          ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
                          : ""
                    }`}
                  >
                    <span className="font-medium">{option.label}.</span>
                    <span className="flex-1">{option.text}</span>
                    {isCorrectOption && (
                      <Badge variant="default" className="text-xs">
                        Correct
                      </Badge>
                    )}
                    {isSelected && !isCorrectOption && (
                      <Badge variant="destructive" className="text-xs">
                        Your answer
                      </Badge>
                    )}
                    {isSelected && isCorrectOption && (
                      <Badge variant="default" className="text-xs">
                        Your answer
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {snapshot.type !== "MULTIPLE_CHOICE" &&
          snapshot.type !== "TRUE_FALSE" && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Your answer
                </p>
                <p className="mt-1 text-foreground">
                  {getUserAnswerLabel(
                    snapshot,
                    questionAttempt.selectedOptionId,
                    questionAttempt.textAnswer,
                  )}
                </p>
              </div>

              {!isWriting && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Correct answer
                  </p>
                  <p className="mt-1 text-foreground">
                    {getCorrectAnswerLabel(snapshot)}
                  </p>
                </div>
              )}
            </div>
          )}

        {questionAttempt.mistake && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Mistake Category
              </p>
              <p className="mt-1 text-foreground">
                {formatMistakeCategory(questionAttempt.mistake.category)}
              </p>
            </div>
            {questionAttempt.mistake.explanation && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Explanation
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {questionAttempt.mistake.explanation}
                </p>
              </div>
            )}
          </>
        )}

        {snapshot.skills.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Skills Tested
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {snapshot.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill.name}
                    {skill.category ? ` (${skill.category})` : ""}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
