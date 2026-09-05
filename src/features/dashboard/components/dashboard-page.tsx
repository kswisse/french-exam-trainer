import { RecentExamCard } from "./recent-exam-card";
import { PerformanceCard } from "./performance-card";
import { SkillSummary } from "./skill-summary";
import { RecentMistakes } from "./recent-mistakes";
import { AvailableExams } from "./available-exams";
import { DashboardData } from "../services/dashboard";

interface DashboardPageProps {
  data: DashboardData;
}

export function DashboardPage({ data }: DashboardPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to your French exam practice hub.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentExamCard recentAttempt={data.recentAttempt} />
        <PerformanceCard performance={data.performance} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SkillSummary title="Weakest Skills" skills={data.weakestSkills} />
        <SkillSummary title="Strongest Skills" skills={data.strongestSkills} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentMistakes recentMistakes={data.recentMistakes} />
        <AvailableExams availableExams={data.availableExams} />
      </div>
    </div>
  );
}
