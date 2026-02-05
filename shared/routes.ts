import { z } from 'zod';
import { 
  insertWorkflowSchema, 
  insertWorkflowStepSchema,
  insertExecutionSchema,
  workflows,
  workflowSteps,
  executions,
  executionLogs
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  workflows: {
    list: {
      method: 'GET' as const,
      path: '/api/workflows',
      responses: {
        200: z.array(z.custom<typeof workflows.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/workflows/:id',
      responses: {
        200: z.custom<typeof workflows.$inferSelect & { steps: typeof workflowSteps.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/workflows',
      input: insertWorkflowSchema.extend({
        steps: z.array(insertWorkflowStepSchema.omit({ workflowId: true })),
      }),
      responses: {
        201: z.custom<typeof workflows.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/workflows/:id',
      input: insertWorkflowSchema.partial().extend({
        steps: z.array(insertWorkflowStepSchema.omit({ workflowId: true }).extend({ id: z.number().optional() })).optional(),
      }),
      responses: {
        200: z.custom<typeof workflows.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/workflows/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    execute: {
      method: 'POST' as const,
      path: '/api/workflows/:id/execute',
      input: z.object({
        initialContext: z.record(z.any()).optional(),
      }),
      responses: {
        201: z.custom<typeof executions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  executions: {
    list: {
      method: 'GET' as const,
      path: '/api/executions',
      responses: {
        200: z.array(z.custom<typeof executions.$inferSelect & { workflowName?: string }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/executions/:id',
      responses: {
        200: z.custom<typeof executions.$inferSelect & { logs: typeof executionLogs.$inferSelect[], workflow?: typeof workflows.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE EXPORTS
// ============================================
export type CreateWorkflowInput = z.infer<typeof api.workflows.create.input>;
export type UpdateWorkflowInput = z.infer<typeof api.workflows.update.input>;
export type ExecuteWorkflowInput = z.infer<typeof api.workflows.execute.input>;
