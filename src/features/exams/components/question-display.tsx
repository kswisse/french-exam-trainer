"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { QuestionSnapshot } from "@/types/attempt";
import { PassageDisplay } from "./passage-display";
import { McQuestion } from "./mc-question";
import { TfQuestion } from "./tf-question";
import { ShortTextQuestion } from "./short-text-question";
import { FillBlankQuestion } from "./fill-blank-question";
import { MatchingQuestion } from "./matching-question";
import { WritingQuestion } from "./writing-question";

interface Passage {
  id: string;
  title?: string | null;
  content: string;
  type: string;
  sourcePage?: number | null;
}

interface Answer {
  selectedOptionId?: string;
  textAnswer?: string;
}

interface QuestionDisplayProps {
  question: QuestionSnapshot;
  questionNumber: number;
  totalQuestions: number;
  passage?: Passage | null;
  answer?: Answer;
  isMarkedForReview: boolean;
  onAnswerChange: (answer: Answer) => void;
  onToggleMark: () => void;
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  passage,
  answer,
  isMarkedForReview,
  onAnswerChange,
  onToggleMark,
}: QuestionDisplayProps) {
  const handleSelectOption = (optionId: string) => {
    onAnswerChange({ selectedOptionId: optionId });
  };

  const handleTextChange = (text: string) => {
    onAnswerChange({ textAnswer: text });
  };

  const renderQuestion = () => {
    switch (question.type) {
      case "MULTIPLE_CHOICE":
        return (
          <McQuestion
            options={question.options}
            selectedOptionId={answer?.selectedOptionId}
            onSelect={handleSelectOption}
          />
        );
      case "TRUE_FALSE":
        return (
          <TfQuestion
            options={question.options}
            selectedOptionId={answer?.selectedOptionId}
            onSelect={handleSelectOption}
          />
        );
      case "SHORT_TEXT":
        return (
          <ShortTextQuestion
            value={answer?.textAnswer}
            onChange={handleTextChange}
          />
        );
      case "FILL_BLANK":
        return (
          <FillBlankQuestion
            answers={question.answers}
            value={answer?.textAnswer}
            onChange={handleTextChange}
          />
        );
      case "MATCHING":
        return (
          <MatchingQuestion
            answers={question.answers}
            value={answer?.textAnswer}
            onChange={handleTextChange}
          />
        );
      case "WRITING":
        return (
          <WritingQuestion
            value={answer?.textAnswer}
            onChange={handleTextChange}
          />
        );
      default:
        return <p className="text-muted-foreground">Unknown question type</p>;
    }
  };

  return (
    <div className="space-y-4">
      {passage && <PassageDisplay passage={passage} />}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {questionNumber} of {totalQuestions}
                </span>
                <Badge variant="outline">{question.points} pts</Badge>
                {question.difficulty && (
                  <Badge variant="secondary">{question.difficulty}</Badge>
                )}
              </div>
              <CardTitle className="text-base">{question.text}</CardTitle>
              {question.instructions && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {question.instructions}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMark}
              title={isMarkedForReview ? "Remove mark" : "Mark for review"}
            >
              {isMarkedForReview ? (
                <BookmarkCheck className="h-5 w-5 text-amber-500" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderQuestion()}</CardContent>
      </Card>
    </div>
  );
}
