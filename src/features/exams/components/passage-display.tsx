"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Passage {
  id: string;
  title?: string | null;
  content: string;
  type: string;
  sourcePage?: number | null;
}

interface PassageDisplayProps {
  passage: Passage;
}

export function PassageDisplay({ passage }: PassageDisplayProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {passage.title ?? "Passage"}
          {passage.sourcePage && (
            <span className="ml-2 text-xs">(Page {passage.sourcePage})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {passage.content}
        </div>
      </CardContent>
    </Card>
  );
}
