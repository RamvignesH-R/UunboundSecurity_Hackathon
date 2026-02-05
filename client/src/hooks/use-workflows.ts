import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateWorkflowInput, type UpdateWorkflowInput, type ExecuteWorkflowInput } from "@shared/routes";

// ============================================
// WORKFLOW HOOKS
// ============================================

export function useWorkflows() {
  return useQuery({
    queryKey: [api.workflows.list.path],
    queryFn: async () => {
      const res = await fetch(api.workflows.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch workflows");
      return api.workflows.list.responses[200].parse(await res.json());
    },
  });
}

export function useWorkflow(id: number) {
  return useQuery({
    queryKey: [api.workflows.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.workflows.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch workflow");
      return api.workflows.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWorkflowInput) => {
      const res = await fetch(api.workflows.create.path, {
        method: api.workflows.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.workflows.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create workflow");
      }
      return api.workflows.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.workflows.list.path] }),
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateWorkflowInput) => {
      const url = buildUrl(api.workflows.update.path, { id });
      const res = await fetch(url, {
        method: api.workflows.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.workflows.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error("Workflow not found");
        throw new Error("Failed to update workflow");
      }
      return api.workflows.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.workflows.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.workflows.get.path] });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.workflows.delete.path, { id });
      const res = await fetch(url, { method: api.workflows.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete workflow");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.workflows.list.path] }),
  });
}

export function useExecuteWorkflow() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data?: ExecuteWorkflowInput }) => {
      const url = buildUrl(api.workflows.execute.path, { id });
      const res = await fetch(url, {
        method: api.workflows.execute.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {}),
        credentials: "include",
      });
      if (!res.ok) {
         if (res.status === 404) throw new Error("Workflow not found");
         throw new Error("Failed to start execution");
      }
      return api.workflows.execute.responses[201].parse(await res.json());
    },
  });
}

// ============================================
// EXECUTION HOOKS
// ============================================

export function useExecutions() {
  return useQuery({
    queryKey: [api.executions.list.path],
    queryFn: async () => {
      const res = await fetch(api.executions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch executions");
      return api.executions.list.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Poll for live updates on list
  });
}

export function useExecution(id: number) {
  return useQuery({
    queryKey: [api.executions.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.executions.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch execution");
      return api.executions.get.responses[200].parse(await res.json());
    },
    refetchInterval: (query) => {
        const data = query.state.data;
        if (data && (data.status === 'running' || data.status === 'pending')) {
            return 1000; // Poll faster for running executions
        }
        return false;
    },
    enabled: !!id,
  });
}
