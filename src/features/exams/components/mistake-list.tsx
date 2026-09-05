"use client";

import { MistakeCard } from "./mistake-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MistakeWithRelations } from "@/features/exams/services/mistakes";

interface MistakeListProps {
  mistakes: MistakeWithRelations[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onCategoryChange?: (mistakeId: string, category: string) => void;
}

export function MistakeList({
  mistakes,
  total,
  page,
  limit,
  onPageChange,
  onCategoryChange,
}: MistakeListProps) {
  const totalPages = Math.ceil(total / limit);

  if (mistakes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No mistakes found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {mistakes.map((mistake) => (
          <MistakeCard
            key={mistake.id}
            mistake={mistake}
            onCategoryChange={onCategoryChange}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}