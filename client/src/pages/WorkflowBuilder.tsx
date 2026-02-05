import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateWorkflow, useUpdateWorkflow, useWorkflow } from "@/hooks/use-workflows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertWorkflowSchema, insertWorkflowStepSchema } from "@shared/schema";

// Form schema extending the shared schema for UI validation
const formSchema = insertWorkflowSchema.extend({
  steps: z.array(insertWorkflowStepSchema.omit({ workflowId: true }).extend({
    modelConfig: z.object({
      model: z.string().min(1, "Model is required"),
      temperature: z.coerce.number().min(0).max(1).optional(),
      provider: z.string().optional()
    }),
    retryPolicy: z.object({
      maxRetries: z.coerce.number().min(0),
      initialDelayMs: z.coerce.number().optional(),
      backoffMultiplier: z.coerce.number().optional()
    })
  })).min(1, "At least one step is required")
});

type FormData = z.infer<typeof formSchema>;

const PROVIDERS = ["openai", "anthropic", "gemini", "mistral"];
const MODELS = {
  openai: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
  gemini: ["gemini-pro", "gemini-1.5-pro"],
  mistral: ["mistral-large", "mistral-medium"]
};

export default function WorkflowBuilder() {
  const [, params] = useRoute("/workflows/:id");
  const isEditing = !!params?.id && params.id !== "new";
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: existingWorkflow, isLoading } = useWorkflow(isEditing ? parseInt(params!.id) : 0);
  const createMutation = useCreateWorkflow();
  const updateMutation = useUpdateWorkflow();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      steps: [
        {
          order: 1,
          promptTemplate: "",
          modelConfig: { model: "gpt-4o", temperature: 0.7, provider: "openai" },
          retryPolicy: { maxRetries: 3, initialDelayMs: 1000, backoffMultiplier: 2 }
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps"
  });

  useEffect(() => {
    if (existingWorkflow) {
      form.reset({
        name: existingWorkflow.name,
        description: existingWorkflow.description || "",
        steps: existingWorkflow.steps.map(step => ({
          ...step,
          // Ensure nested JSON objects are handled correctly
          modelConfig: step.modelConfig as any,
          retryPolicy: step.retryPolicy as any
        }))
      });
    }
  }, [existingWorkflow, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
           id: parseInt(params!.id),
           ...data
        });
        toast({ title: "Workflow updated", description: "Your changes have been saved." });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Workflow created", description: "New workflow has been created successfully." });
        setLocation("/workflows");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    }
  };

  if (isEditing && isLoading) return <div className="text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/workflows")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">{isEditing ? "Edit Workflow" : "New Workflow"}</h1>
            <p className="text-sm text-muted-foreground">Configure the execution steps for your agent.</p>
          </div>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={createMutation.isPending || updateMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
        >
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? "Update Workflow" : "Create Workflow"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Daily Digest Generator" className="bg-black/20 border-white/10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What does this workflow do?" className="bg-black/20 border-white/10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Execution Steps</h2>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="border-primary/20 hover:bg-primary/10 text-primary"
                onClick={() => append({ 
                  order: fields.length + 1,
                  promptTemplate: "", 
                  modelConfig: { model: "gpt-4o", temperature: 0.7, provider: "openai" },
                  retryPolicy: { maxRetries: 3, initialDelayMs: 1000, backoffMultiplier: 2 }
                })}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Step
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="glass-card border-0 relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-red-400"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                      {index + 1}
                    </span>
                    Step {index + 1}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`steps.${index}.modelConfig.provider`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-black/20 border-white/10">
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROVIDERS.map(p => (
                                <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`steps.${index}.modelConfig.model`}
                      render={({ field }) => {
                         const provider = form.watch(`steps.${index}.modelConfig.provider`) as keyof typeof MODELS;
                         const models = MODELS[provider] || [];
                         return (
                          <FormItem>
                            <FormLabel>Model</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-black/20 border-white/10">
                                  <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name={`steps.${index}.modelConfig.temperature`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" max="1" className="bg-black/20 border-white/10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`steps.${index}.promptTemplate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt Template</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter prompt... Use {{input}} for previous step output" 
                            className="bg-black/20 border-white/10 font-mono text-sm min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>Use variables like {"{{input}}"} or {"{{context.key}}"}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Hidden retry policy fields for now - just using defaults */}
                  <input type="hidden" {...form.register(`steps.${index}.order`, { value: index + 1 })} />
                </CardContent>
              </Card>
            ))}
          </div>
        </form>
      </Form>
    </div>
  );
}
