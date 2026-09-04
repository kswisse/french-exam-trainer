import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SectionResult } from "@/types/scoring";

interface SectionPerformanceProps {
  sections: SectionResult[];
}

export function SectionPerformance({ sections }: SectionPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Section Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => (
          <div key={section.sectionId} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {section.sectionTitle}
              </span>
              <span className="text-sm text-muted-foreground">
                {section.score}/{section.totalPossible} ({section.percentage.toFixed(0)}%)
              </span>
            </div>
            <Progress value={section.percentage} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
