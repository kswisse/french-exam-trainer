"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImportStepStatus } from "../types";

interface ImportProgressProps {
  importId: string;
  onStatusChange?: (status: string) => void;
}

interface StepInfo {
  name: string;
  label: string;
  status: ImportStepStatus;
  error?: string | null;
}

export function ImportProgress({
  importId,
  onStatusChange,
}: ImportProgressProps) {
  const [steps, setSteps] = useState<StepInfo[]>([
    { name: "extraction", label: "Text Extraction", status: "PENDING" },
    { name: "ocr", label: "OCR Processing", status: "N_A" },
    { name: "ai_parsing", label: "AI Parsing", status: "PENDING" },
  ]);
  const [importStatus, setImportStatus] = useState<string>("PENDING");

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/imports/${importId}`);
        if (!res.ok) return;

        const data = await res.json();
        setImportStatus(data.status);

        setSteps((prev) =>
          prev.map((step) => ({
            ...step,
            status: data[`${step.name}Status`] || step.status,
            error: data[`${step.name}Error`] || null,
          }))
        );

        if (onStatusChange) {
          onStatusChange(data.status);
        }

        if (
          data.status === "COMPLETED" ||
          data.status === "APPROVED" ||
          data.status === "FAILED" ||
          data.status === "REJECTED"
        ) {
          clearInterval(intervalId);
        }
      } catch {
        // Silently retry on next interval
      }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 2000);

    return () => clearInterval(intervalId);
  }, [importId, onStatusChange]);

  const getStepIcon = (status: ImportStepStatus) => {
    switch (status) {
      case "RUNNING":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "N_A":
        return <Circle className="h-5 w-5 text-muted-foreground/30" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepLabel = (status: ImportStepStatus) => {
    switch (status) {
      case "RUNNING":
        return "In progress...";
      case "COMPLETED":
        return "Completed";
      case "FAILED":
        return "Failed";
      case "N_A":
        return "Skipped";
      default:
        return "Pending";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Processing Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.name} className="space-y-2">
              <div className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.status === "N_A" && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getStepLabel(step.status)}
                  </p>
                </div>
              </div>
              {step.error && (
                <p className="text-xs text-red-600 ml-8">{step.error}</p>
              )}
            </div>
          ))}

          <div className="pt-2 border-t">
            <div className="flex items-center gap-3">
              {importStatus === "COMPLETED" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : importStatus === "FAILED" ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Ready for Review</p>
                <p className="text-xs text-muted-foreground">
                  {importStatus === "COMPLETED"
                    ? "Review and approve the import"
                    : importStatus === "FAILED"
                      ? "Pipeline failed — retry or fix issues"
                      : "Waiting for pipeline to complete"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
