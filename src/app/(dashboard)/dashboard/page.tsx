import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/features/dashboard/services/dashboard";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

export default async function DashboardPageWrapper() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  return <DashboardPage data={data} />;
}
