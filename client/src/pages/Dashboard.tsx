import { useWorkflows, useExecutions } from "@/hooks/use-workflows";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, ArrowRight, Activity, GitBranch, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: workflows, isLoading: loadingWorkflows } = useWorkflows();
  const { data: executions, isLoading: loadingExecutions } = useExecutions();

  const stats = [
    { 
      name: 'Total Workflows', 
      value: workflows?.length || 0, 
      icon: GitBranch,
      color: 'text-blue-400' 
    },
    { 
      name: 'Active Runs', 
      value: executions?.filter(e => e.status === 'running').length || 0, 
      icon: Activity,
      color: 'text-amber-400' 
    },
    { 
      name: 'Success Rate', 
      value: executions && executions.length > 0 
        ? `${Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)}%` 
        : '0%', 
      icon: CheckCircle,
      color: 'text-emerald-400' 
    },
  ];

  if (loadingWorkflows || loadingExecutions) {
    return (
      <div className="space-y-8 p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
           {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/5" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Overview of your AI agent workflows.</p>
        </div>
        <Link href="/workflows/new">
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-card overflow-hidden rounded-xl p-6 relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <stat.icon className={`h-24 w-24 ${stat.color}`} />
            </div>
            <dt className="truncate text-sm font-medium text-muted-foreground">{stat.name}</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-white">{stat.value}</dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Workflows */}
        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent Workflows</CardTitle>
              <CardDescription>Your most recently created templates</CardDescription>
            </div>
            <Link href="/workflows" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflows?.slice(0, 5).map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-colors border border-white/5 group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <GitBranch className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{workflow.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{workflow.description || "No description"}</p>
                  </div>
                </div>
                <Link href={`/workflows/${workflow.id}`}>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
                  </Button>
                </Link>
              </div>
            ))}
            {(!workflows || workflows.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">No workflows created yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Executions */}
        <Card className="glass-card border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest execution runs</CardDescription>
            </div>
            <Link href="/executions" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View history <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {executions?.slice(0, 5).map((execution) => (
              <Link key={execution.id} href={`/executions/${execution.id}`}>
                <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-colors border border-white/5 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                      <Play className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{execution.workflowName || `Workflow #${execution.workflowId}`}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <StatusBadge status={execution.status} />
                         <span className="text-xs text-muted-foreground">
                            {execution.startedAt && new Date(execution.startedAt).toLocaleDateString()}
                         </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
            {(!executions || executions.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">No executions yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
