"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { ExtractedQuestion } from "./extracted-question";
import { EditQuestionDialog } from "./edit-question-dialog";
import { ImportStatusBadge, ImportStepBadge } from "./import-status-badge";
import type { ImportDetail, ExtractedQuestion as EQ } from "../types";

export function ImportReview({
  importData,
}: {
  importData: ImportDetail;
}) {
  const router = useRouter();
  const [parsedExam, setParsedExam] = useState(importData.parsedExam);
  const [editingQuestion, setEditingQuestion] = useState<{
    sectionIndex: number;
    questionIndex: number;
    question: EQ;
  } | null>(null);
  const [loading, setLoading] = useState<"approve" | "reject" | "retry" | null>(
    null
  );

  const isEditable =
    importData.status === "COMPLETED" || importData.status === "REJECTED";

  const lowConfidenceCount = parsedExam?.sections.reduce(
    (acc, s) =>
      acc +
      s.questions.filter((q) => (q as any).confidence !== undefined && (q as any).confidence < 0.7).length,
    0
  ) || 0;

  const handleApprove = async () => {
    setLoading("approve");
    try {
      const res = await fetch(`/api/imports/${importData.id}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading("reject");
    try {
      const res = await fetch(`/api/imports/${importData.id}/reject`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to reject");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleRetry = async () => {
    setLoading("retry");
    try {
      const res = await fetch(`/api/imports/${importData.id}/retry`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to retry");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleEditSave = (updated: EQ) => {
    if (!parsedExam || !editingQuestion) return;
    const { sectionIndex, questionIndex } = editingQuestion;
    const newSections = [...parsedExam.sections];
    const newQuestions = [...newSections[sectionIndex].questions];
    newQuestions[questionIndex] = updated as any;
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      questions: newQuestions as any,
    };
    setParsedExam({ ...parsedExam, sections: newSections as any });
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (sectionIndex: number, questionIndex: number) => {
    if (!parsedExam) return;
    const newSections = [...parsedExam.sections];
    const newQuestions = [...newSections[sectionIndex].questions];
    newQuestions.splice(questionIndex, 1);
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      questions: newQuestions as any,
    };
    setParsedExam({ ...parsedExam, sections: newSections as any });
  };

  const totalQuestions =
    parsedExam?.sections.reduce((acc, s) => acc + s.questions.length, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {importData.document.filename}
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalQuestions} questions across{" "}
              {parsedExam?.sections.length || 0} sections
            </p>
          </div>
        </div>
        <ImportStatusBadge status={importData.status as any} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Processing Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Extraction
              </p>
              <ImportStepBadge status={importData.extractionStatus as any} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">OCR</p>
              <ImportStepBadge status={importData.ocrStatus as any} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                AI Parsing
              </p>
              <ImportStepBadge status={importData.aiParsingStatus as any} />
            </div>
            {importData.aiConfidence != null && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  AI Confidence
                </p>
                <p className="text-sm">
                  {Math.round(importData.aiConfidence * 100)}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {lowConfidenceCount > 0 && (
        <Card className="border-amber-300 bg-amber-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              {lowConfidenceCount} question{lowConfidenceCount !== 1 ? "s" : ""}{" "}
              flagged with low confidence. Review these carefully before
              approving.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        {isEditable && (
          <>
            <Button
              onClick={handleApprove}
              disabled={loading !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {loading === "approve" ? "Approving..." : "Approve & Create Exam"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading !== null}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {loading === "reject" ? "Rejecting..." : "Reject"}
            </Button>
          </>
        )}
        {!isEditable && importData.status === "FAILED" && (
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={loading !== null}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading === "retry" ? "Retrying..." : "Retry Processing"}
          </Button>
        )}
      </div>

      {parsedExam && (
        <Tabs defaultValue="sections">
          <TabsList>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="json">Raw JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-6 mt-4">
            {parsedExam.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {section.instructions && (
                    <p className="text-sm text-muted-foreground">
                      {section.instructions}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  {section.questions.map((q, qIdx) => (
                    <ExtractedQuestion
                      key={qIdx}
                      question={q}
                      sectionIndex={sIdx}
                      isLowConfidence={
                        (q as any).confidence !== undefined &&
                        (q as any).confidence < 0.7
                      }
                      onEdit={() =>
                        setEditingQuestion({
                          sectionIndex: sIdx,
                          questionIndex: qIdx,
                          question: q,
                        })
                      }
                      onDelete={() => handleDeleteQuestion(sIdx, qIdx)}
                    />
                  ))}
                </div>
                {sIdx < parsedExam.sections.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="json" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <pre className="text-xs overflow-x-auto font-mono whitespace-pre-wrap">
                  {JSON.stringify(parsedExam, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!parsedExam && importData.status === "COMPLETED" && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No parsed exam data available. The extraction may have failed.
            </p>
          </CardContent>
        </Card>
      )}

      {editingQuestion && (
        <EditQuestionDialog
          question={editingQuestion.question}
          open={true}
          onOpenChange={(open) => !open && setEditingQuestion(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
