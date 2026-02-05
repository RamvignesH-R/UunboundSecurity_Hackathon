import { useWorkflows, useDeleteWorkflow, useExecuteWorkflow } from "@/hooks/use-workflows";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit, Play, GitBranch, Calendar } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function WorkflowList() {
  const { data: workflows, isLoading } = useWorkflows();
  const deleteMutation = useDeleteWorkflow();
  const executeMutation = useExecuteWorkflow();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Workflow deleted", description: "The workflow has been permanently removed." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    }
  };

  const handleExecute = async (id: number) => {
    try {
      const execution = await executeMutation.mutateAsync({ id });
      toast({ title: "Workflow started", description: "Execution has begun successfully." });
      setLocation(`/executions/${execution.id}`);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white/5 w-48 rounded"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white/5 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Workflows</h1>
          <p className="text-muted-foreground mt-1">Design and manage your AI agent flows.</p>
        </div>
        <Link href="/workflows/new">
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Create Workflow
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workflows?.map((workflow) => (
          <Card key={workflow.id} className="glass-card border-0 flex flex-col hover:border-primary/20 transition-all duration-300 group">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                    onClick={() => handleExecute(workflow.id)}
                    title="Run Workflow"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Link href={`/workflows/${workflow.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This action cannot be undone. This will permanently delete the workflow and its history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(workflow.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{workflow.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3">
                {workflow.description || "No description provided."}
              </p>
              
              <div className="pt-4 border-t border-white/5 flex items-center text-xs text-muted-foreground mt-auto">
                <Calendar className="h-3 w-3 mr-2" />
                Created {workflow.createdAt ? format(new Date(workflow.createdAt), 'MMM d, yyyy') : 'Unknown'}
              </div>
            </CardContent>
          </Card>
        ))}

        {workflows?.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white">No workflows yet</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-sm mx-auto">Create your first agentic workflow to start automating tasks.</p>
            <Link href="/workflows/new">
              <Button>Create Workflow</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
