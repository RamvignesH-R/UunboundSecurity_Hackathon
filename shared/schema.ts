import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflowSteps = pgTable("workflow_steps", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  order: integer("order").notNull(),
  promptTemplate: text("prompt_template").notNull(),
  modelConfig: jsonb("model_config").$type<{
    model: string;
    temperature?: number;
    provider?: string;
  }>().notNull(),
  retryPolicy: jsonb("retry_policy").$type<{
    maxRetries: number;
    initialDelayMs?: number;
    backoffMultiplier?: number;
  }>().notNull(),
  completionCriteria: jsonb("completion_criteria").$type<{
    requiredFields?: string[];
  }>(),
});

export const executions = pgTable("executions", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  status: text("status", { enum: ["pending", "running", "completed", "failed"] }).notNull().default("pending"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const executionLogs = pgTable("execution_logs", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").notNull(),
  stepId: integer("step_id").notNull(),
  status: text("status", { enum: ["pending", "running", "success", "failed", "retrying"] }).notNull(),
  inputContext: jsonb("input_context"),
  outputContent: text("output_content"),
  error: text("error"),
  durationMs: integer("duration_ms"),
  attemptNumber: integer("attempt_number").default(1),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === RELATIONS ===

export const workflowsRelations = relations(workflows, ({ many }) => ({
  steps: many(workflowSteps),
  executions: many(executions),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowSteps.workflowId],
    references: [workflows.id],
  }),
}));

export const executionsRelations = relations(executions, ({ one, many }) => ({
  workflow: one(workflows, {
    fields: [executions.workflowId],
    references: [workflows.id],
  }),
  logs: many(executionLogs),
}));

export const executionLogsRelations = relations(executionLogs, ({ one }) => ({
  execution: one(executions, {
    fields: [executionLogs.executionId],
    references: [executions.id],
  }),
  step: one(workflowSteps, {
    fields: [executionLogs.stepId],
    references: [workflowSteps.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true, createdAt: true });
export const insertWorkflowStepSchema = createInsertSchema(workflowSteps).omit({ id: true });
export const insertExecutionSchema = createInsertSchema(executions).omit({ id: true, startedAt: true, completedAt: true });
export const insertExecutionLogSchema = createInsertSchema(executionLogs).omit({ id: true, timestamp: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Workflow = typeof workflows.$inferSelect;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type Execution = typeof executions.$inferSelect;
export type ExecutionLog = typeof executionLogs.$inferSelect;

export type CreateWorkflowRequest = z.infer<typeof insertWorkflowSchema> & {
  steps: z.infer<typeof insertWorkflowStepSchema>[];
};

export type UpdateWorkflowRequest = Partial<z.infer<typeof insertWorkflowSchema>> & {
  steps?: (Partial<z.infer<typeof insertWorkflowStepSchema>> & { id?: number })[];
};

export type ExecuteWorkflowRequest = {
  initialContext?: Record<string, any>;
};

export type ExecutionResponse = Execution & {
  workflowName?: string;
};

export type ExecutionDetailResponse = Execution & {
  logs: (ExecutionLog & { stepOrder?: number })[];
  workflow?: Workflow;
};

export type WorkflowDetailResponse = Workflow & {
  steps: WorkflowStep[];
};
