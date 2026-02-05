import { useExecutions } from "@/hooks/use-workflows";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Activity, Clock, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExecutionList() {
  const { data: executions, isLoading } = useExecutions();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-white/5" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg bg-white/5" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Execution History</h1>
        <p className="text-muted-foreground mt-1">Track and monitor workflow runs.</p>
      </div>

      <div className="rounded-xl border border-white/5 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-muted-foreground">
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Workflow</th>
                <th className="px-6 py-4 font-medium">Started At</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {executions?.map((execution) => {
                const duration = execution.completedAt && execution.startedAt
                  ? Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000) + 's'
                  : execution.status === 'running' ? 'Running...' : '-';

                return (
                  <tr key={execution.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <StatusBadge status={execution.status} />
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      <Link href={`/executions/${execution.id}`} className="hover:text-primary transition-colors">
                         {execution.workflowName || `Workflow #${execution.workflowId}`}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {execution.startedAt ? format(new Date(execution.startedAt), 'MMM d, HH:mm:ss') : '-'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono">
                      {duration}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                      #{execution.id}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/executions/${execution.id}`} className="text-primary hover:text-primary/80 font-medium">
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {executions?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No executions found. Run a workflow to see history here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
