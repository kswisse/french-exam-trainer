import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DashboardData } from "../services/dashboard";

interface SkillSummaryProps {
  title: string;
  skills: DashboardData["weakestSkills"];
}

export function SkillSummary({ title, skills }: SkillSummaryProps) {
  if (skills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete more exams to see skill breakdown.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{skill.name}</span>
              <span className="text-muted-foreground">{skill.accuracy}%</span>
            </div>
            <Progress value={skill.accuracy} />
            <div className="text-xs text-muted-foreground">
              {skill.correct}/{skill.total} questions correct
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
