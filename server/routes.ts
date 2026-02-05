import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { WorkflowStep } from "@shared/schema";

// Simple in-memory execution engine logic (for MVP)
// In a real app, this would be a separate worker process or queue
async function executeWorkflowBackground(executionId: number, workflowId: number, initialContext: any) {
  console.log(`Starting execution ${executionId} for workflow ${workflowId}`);

  try {
    const workflow = await storage.getWorkflow(workflowId);
    if (!workflow) {
      await storage.updateExecutionStatus(executionId, "failed", new Date());
      return;
    }
    await storage.updateExecutionStatus(executionId, "running");

    let context = { ...initialContext };

    for (const step of workflow.steps) {
      console.log(`Executing step ${step.id} (Order: ${step.order})`);
      const startTime = Date.now();

      const log = await storage.createExecutionLog({
        executionId,
        stepId: step.id,
        status: "running",
        inputContext: context,
        attemptNumber: 1
      });
      try {
        // SIMULATE AI EXECUTION
        // Here we would call the actual AI provider (Unbound, OpenAI, etc.)
        const result = await executeStep(step, context);

        await storage.updateExecutionLog(log.id, {
          status: "success",
          outputContent: result.output,
          durationMs: Date.now() - startTime
        });

        // Update context with result
        // context = { ...context, ...result.contextUpdates }; // If we want to merge
        // context[step.id] = result.output; // Or store by step ID

      } catch (error: any) {
        console.error(`Step ${step.id} failed:`, error);
        await storage.updateExecutionLog(log.id, {
          status: "failed",
          error: error.message || "Unknown error",
          durationMs: Date.now() - startTime
        });

        // Check retry policy or stop
        await storage.updateExecutionStatus(executionId, "failed", new Date());
        return; // Stop execution
      }
    }
    await storage.updateExecutionStatus(executionId, "completed", new Date());
    console.log(`Execution ${executionId} completed successfully`);
  } catch (error) {
    console.error(`Execution ${executionId} crashed:`, error);
    await storage.updateExecutionStatus(executionId, "failed", new Date());
  }
}

// ────────────────────────────────────────────────
//               ← ONLY THIS FUNCTION CHANGED →
async function executeStep(step: WorkflowStep, context: any): Promise<{ output: string }> {
  // Simulate network delay (keeping original behavior for now)
  await new Promise(resolve => setTimeout(resolve, 1500));

  const config = step.modelConfig as any;
  const prompt = step.promptTemplate;

  // Replace template variables very simply (you can improve this later)
  let finalPrompt = prompt;
  if (context && typeof context === "object") {
    for (const [key, value] of Object.entries(context)) {
      finalPrompt = finalPrompt.replace(`{{${key}}}`, String(value));
    }
  }

  if (config.provider === 'unbound') {
    if (!process.env.UNBOUND_API_KEY) {
      throw new Error("UNBOUND_API_KEY is not set in environment variables");
    }

    try {
      const response = await fetch("https://api.getunbound.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.UNBOUND_API_KEY}`,
        },
        body: JSON.stringify({
          model: config.model,           // e.g. "kimi-k2p5" or "kimi-k2-instruct-0905"
          messages: [
            { role: "user", content: finalPrompt }
          ],
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens ?? 2048,
          // You can add top_p, presence_penalty, etc. later if needed
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Unbound API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const output = data.choices?.[0]?.message?.content?.trim() || "";

      return { output };
    } catch (err) {
      console.error("Unbound API call failed:", err);
      throw err;
    }
  } 
  else {
    // Keep original mock behavior for all other providers
    return { output: `[Mock AI Response] Processed: ${finalPrompt}` };
  }
}
// ────────────────────────────────────────────────

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Workflows
  app.get(api.workflows.list.path, async (req, res) => {
    const workflows = await storage.getWorkflows();
    res.json(workflows);
  });
  app.get(api.workflows.get.path, async (req, res) => {
    const workflow = await storage.getWorkflow(Number(req.params.id));
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    res.json(workflow);
  });
  app.post(api.workflows.create.path, async (req, res) => {
    try {
      const input = api.workflows.create.input.parse(req.body);
      const workflow = await storage.createWorkflow(input);
      res.status(201).json(workflow);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });
  app.put(api.workflows.update.path, async (req, res) => {
    try {
      const input = api.workflows.update.input.parse(req.body);
      const workflow = await storage.updateWorkflow(Number(req.params.id), input);
      res.json(workflow);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });
  app.delete(api.workflows.delete.path, async (req, res) => {
    await storage.deleteWorkflow(Number(req.params.id));
    res.sendStatus(204);
  });
  // Execute
  app.post(api.workflows.execute.path, async (req, res) => {
    const workflowId = Number(req.params.id);
    const input = api.workflows.execute.input.parse(req.body);

    // Create pending execution record
    const execution = await storage.createExecution({
      workflowId,
      status: "pending"
    });

    // Trigger background execution
    executeWorkflowBackground(execution.id, workflowId, input.initialContext || {});

    res.status(201).json(execution);
  });
  // Executions
  app.get(api.executions.list.path, async (req, res) => {
    const executions = await storage.getExecutions();
    res.json(executions);
  });
  app.get(api.executions.get.path, async (req, res) => {
    const execution = await storage.getExecution(Number(req.params.id));
    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }
    res.json(execution);
  });
  // Seeding
  if (process.env.NODE_ENV !== "production") {
    const existing = await storage.getWorkflows();
    if (existing.length === 0) {
      console.log("Seeding database...");
      await storage.createWorkflow({
        name: "Demo Agent Workflow",
        description: "A simple example workflow with 3 steps.",
        steps: [
          {
            order: 1,
            promptTemplate: "Analyze the following text: {{input}}",
            modelConfig: { model: "kimi-k2p5", provider: "unbound" },
            retryPolicy: { maxRetries: 3 }
          },
          {
            order: 2,
            promptTemplate: "Extract key entities from analysis",
            modelConfig: { model: "kimi-k2p5", provider: "unbound" },
            retryPolicy: { maxRetries: 3 }
          },
          {
            order: 3,
            promptTemplate: "Generate a summary report",
            modelConfig: { model: "kimi-k2-instruct-0905", provider: "unbound" },
            retryPolicy: { maxRetries: 3 }
          }
        ]
      });
    }
  }
  return httpServer;
}