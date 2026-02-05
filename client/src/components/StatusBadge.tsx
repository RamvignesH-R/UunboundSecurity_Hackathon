import { cn } from "@/lib/utils";

type Status = 'pending' | 'running' | 'completed' | 'success' | 'failed' | 'retrying';

interface StatusBadgeProps {
  status: Status | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  
  return (
    <span
      className={cn(
        "status-badge",
        normalizedStatus === 'pending' && "status-badge-pending",
        normalizedStatus === 'running' && "status-badge-running",
        (normalizedStatus === 'completed' || normalizedStatus === 'success') && "status-badge-completed",
        normalizedStatus === 'failed' && "status-badge-failed",
        normalizedStatus === 'retrying' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        className
      )}
    >
      {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
    </span>
  );
}
