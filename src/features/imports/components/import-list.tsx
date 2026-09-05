"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ImportStatusBadge } from "./import-status-badge";
import type { ImportWithDocument } from "../types";

export function ImportList({
  imports,
}: {
  imports: ImportWithDocument[];
}) {
  if (imports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">
          No imports yet
        </h2>
        <p className="mt-2 text-muted-foreground">
          Upload a document to get started with the import process.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {imports.map((item) => (
        <Card key={item.id} className="transition-colors hover:bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {item.document.filename}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <ImportStatusBadge status={item.status as any} />
                <Link href={`/imports/${item.id}`}>
                  <Button variant="ghost" size="sm">
                    Review
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
