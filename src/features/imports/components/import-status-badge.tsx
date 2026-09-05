import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ImportStatus, ImportStepStatus } from "../types";

const STATUS_CONFIG: Record<
  ImportStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  PROCESSING: { label: "Processing", variant: "default" },
  COMPLETED: { label: "Ready for Review", variant: "default" },
  APPROVED: { label: "Approved", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  FAILED: { label: "Failed", variant: "destructive" },
};

const STEP_STATUS_CONFIG: Record<
  ImportStepStatus,
  { label: string; className?: string }
> = {
  PENDING: { label: "Pending" },
  RUNNING: { label: "Running", className: "text-blue-600" },
  COMPLETED: { label: "Completed", className: "text-green-600" },
  FAILED: { label: "Failed", className: "text-red-600" },
  N_A: { label: "N/A", className: "text-muted-foreground" },
};

export function ImportStatusBadge({
  status,
  className,
}: {
  status: ImportStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

export function ImportStepBadge({
  status,
  className,
}: {
  status: ImportStepStatus;
  className?: string;
}) {
  const config = STEP_STATUS_CONFIG[status] || STEP_STATUS_CONFIG.PENDING;
  return (
    <span className={cn("text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  );
}
