import { useExecution } from "@/hooks/use-workflows";
import { useRoute, Link } from "wouter";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, Terminal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ExecutionDetail() {
  const [, params] = useRoute("/executions/:id");
  const id = parseInt(params!.id);
  const { data: execution, isLoading } = useExecution(id);

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (!execution) return <div className="text-white">Execution not found</div>;

  const sortedLogs = execution.logs.sort((a, b) => (a.stepId - b.stepId) || (a.id - b.id));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/executions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
             {execution.workflow?.name || "Workflow Execution"}
             <StatusBadge status={execution.status} className="text-sm" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">ID: {execution.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Timeline/Steps */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="glass-card border-0">
             <CardHeader>
               <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Timeline</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="relative border-l border-white/10 ml-3 space-y-8 pl-8 py-2">
                   {sortedLogs.map((log, idx) => (
                     <div key={log.id} className="relative">
                        <span className={cn(
                          "absolute -left-[39px] top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center bg-background",
                          log.status === 'success' ? "border-emerald-500 text-emerald-500" : 
                          log.status === 'failed' ? "border-red-500 text-red-500" :
                          log.status === 'running' ? "border-blue-500 text-blue-500 animate-pulse" :
                          "border-white/20 text-white/20"
                        )}>
                          {log.status === 'success' && <CheckCircle className="h-3 w-3" />}
                          {log.status === 'failed' && <AlertTriangle className="h-3 w-3" />}
                          {log.status === 'running' && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                        </span>
                        
                        <div className="flex flex-col">
                           <span className="text-sm font-medium text-white">Step {log.stepOrder || idx + 1}</span>
                           <span className="text-xs text-muted-foreground mt-1">
                             {log.durationMs ? `${log.durationMs}ms` : 'Pending...'}
                           </span>
                           <StatusBadge status={log.status} className="w-fit mt-2 scale-90 origin-left" />
                        </div>
                     </div>
                   ))}
                </div>
             </CardContent>
           </Card>
        </div>

        {/* Right Column: Logs/Output */}
        <div className="lg:col-span-2 space-y-6">
           {sortedLogs.map((log, idx) => (
             <Card key={log.id} className={cn(
               "glass-card border-0 overflow-hidden transition-all",
               log.status === 'running' && "ring-1 ring-blue-500/50"
             )}>
               <CardHeader className="bg-black/20 border-b border-white/5 py-3 px-4 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium text-white">Step {log.stepOrder || idx + 1} Output</span>
                 </div>
                 <span className="text-xs text-muted-foreground font-mono">
                   {log.timestamp ? format(new Date(log.timestamp), 'HH:mm:ss.SSS') : ''}
                 </span>
               </CardHeader>
               <CardContent className="p-0">
                 {log.inputContext && (
                   <div className="border-b border-white/5 p-4 bg-white/[0.02]">
                     <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Input Context</span>
                     <pre className="font-mono text-xs text-blue-200 overflow-x-auto">
                       {JSON.stringify(log.inputContext, null, 2)}
                     </pre>
                   </div>
                 )}
                 
                 <div className="p-4">
                   {log.error ? (
                     <div className="text-red-400 font-mono text-sm bg-red-950/20 p-3 rounded border border-red-900/50">
                       <span className="font-bold block mb-1">Error:</span>
                       {log.error}
                     </div>
                   ) : log.outputContent ? (
                     <div className="prose prose-invert prose-sm max-w-none">
                        <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap bg-transparent p-0 m-0 border-0">
                          {log.outputContent}
                        </pre>
                     </div>
                   ) : (
                     <span className="text-muted-foreground italic text-sm">Waiting for output...</span>
                   )}
                 </div>
               </CardContent>
             </Card>
           ))}
        </div>
      </div>
    </div>
  );
}
