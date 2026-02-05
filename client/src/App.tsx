import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/Sidebar";

// Pages
import Dashboard from "@/pages/Dashboard";
import WorkflowList from "@/pages/WorkflowList";
import WorkflowBuilder from "@/pages/WorkflowBuilder";
import ExecutionList from "@/pages/ExecutionList";
import ExecutionDetail from "@/pages/ExecutionDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/workflows" component={WorkflowList} />
      <Route path="/workflows/new" component={WorkflowBuilder} />
      <Route path="/workflows/:id" component={WorkflowBuilder} />
      <Route path="/executions" component={ExecutionList} />
      <Route path="/executions/:id" component={ExecutionDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <main className="lg:pl-72 min-h-screen">
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
              <Router />
            </div>
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
