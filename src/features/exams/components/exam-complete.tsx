"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExamCompleteProps {
  attemptId: string;
}

export function ExamComplete({ attemptId }: ExamCompleteProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/results/${attemptId}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [attemptId, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Exam Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your exam has been submitted successfully. Redirecting to results...
          </p>
          <Button onClick={() => router.push(`/results/${attemptId}`)}>
            View Results
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
