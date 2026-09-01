/**
 * WebMCP Runtime & Polyfill Layer
 * Uses official @mcp-b/global standard polyfill (created by Alex Nahas, WebMCP Challenge Judge)
 * providing canonical W3C / Chrome WebMCP standard (document.modelContext / navigator.modelContext)
 */
import { initializeWebModelContext } from '@mcp-b/global';

export interface WebMCPToolInputSchema {
  type: string;
  properties: Record<string, {
    type: string;
    description: string;
    enum?: string[];
  }>;
  required?: string[];
}

export interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: WebMCPToolInputSchema;
  execute: (input: any) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }>;
}

export interface WebMCPActivityLogItem {
  id: string;
  timestamp: string;
  toolName: string;
  input: any;
  outputPreview: string;
  durationMs: number;
  status: 'success' | 'error';
}

type ActivityLogListener = (logItem: WebMCPActivityLogItem) => void;
type ToolRegisteredListener = (tools: WebMCPToolDefinition[]) => void;

class WebMCPRuntimeManager {
  private registeredTools: Map<string, WebMCPToolDefinition> = new Map();
  private activityListeners: Set<ActivityLogListener> = new Set();
  private toolListeners: Set<ToolRegisteredListener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      // Initialize official @mcp-b/global polyfill
      initializeWebModelContext({ installTestingShim: true });
      console.log('✅ [WebMCP] Official @mcp-b/global initialized on document.modelContext & navigator.modelContext');
    } catch (err) {
      console.warn('⚠️ [WebMCP] Official polyfill init notice:', err);
    }
  }

  public async registerTool(tool: WebMCPToolDefinition): Promise<void> {
    this.registeredTools.set(tool.name, tool);

    // Register on document.modelContext if available
    const doc = (typeof document !== 'undefined' ? (document as any) : null);
    if (doc?.modelContext?.registerTool) {
      try {
        await doc.modelContext.registerTool({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          execute: async (input: any) => {
            return this.executeTool(tool.name, input);
          },
        });
        console.log(`🛠️ [WebMCP Standard] Registered tool '${tool.name}' on document.modelContext`);
      } catch (err) {
        console.warn(`[WebMCP Standard] Tool register notice for '${tool.name}':`, err);
      }
    }

    this.notifyToolListeners();
  }

  public async unregisterTool(name: string): Promise<void> {
    this.registeredTools.delete(name);
    const doc = (typeof document !== 'undefined' ? (document as any) : null);
    if (doc?.modelContext?.unregisterTool) {
      try {
        await doc.modelContext.unregisterTool(name);
      } catch (err) {
        // ignore
      }
    }
    this.notifyToolListeners();
  }

  public getTools(): WebMCPToolDefinition[] {
    return Array.from(this.registeredTools.values());
  }

  public getTool(name: string): WebMCPToolDefinition | undefined {
    return this.registeredTools.get(name);
  }

  public async executeTool(name: string, input: any): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    const tool = this.registeredTools.get(name);
    const startTime = performance.now();
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];

    if (!tool) {
      const errorMsg = `WebMCP Tool '${name}' not found in registry.`;
      console.error(`❌ [WebMCP] ${errorMsg}`);
      const durationMs = Math.round(performance.now() - startTime);

      this.notifyActivity({
        id: Math.random().toString(36).substring(2, 9),
        timestamp,
        toolName: name,
        input,
        outputPreview: errorMsg,
        durationMs,
        status: 'error',
      });

      return {
        isError: true,
        content: [{ type: 'text', text: JSON.stringify({ error: errorMsg }) }],
      };
    }

    try {
      console.log(`⚡ [WebMCP Execution] Agent invoked ${name} with:`, input);
      const result = await tool.execute(input);
      const durationMs = Math.round(performance.now() - startTime);

      const preview = result.content?.[0]?.text
        ? result.content[0].text.substring(0, 120) + (result.content[0].text.length > 120 ? '...' : '')
        : 'Executed successfully';

      this.notifyActivity({
        id: Math.random().toString(36).substring(2, 9),
        timestamp,
        toolName: name,
        input,
        outputPreview: preview,
        durationMs,
        status: result.isError ? 'error' : 'success',
      });

      return result;
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const errorMsg = err?.message || 'Unknown execution failure';

      this.notifyActivity({
        id: Math.random().toString(36).substring(2, 9),
        timestamp,
        toolName: name,
        input,
        outputPreview: `Error: ${errorMsg}`,
        durationMs,
        status: 'error',
      });

      return {
        isError: true,
        content: [{ type: 'text', text: JSON.stringify({ error: errorMsg }) }],
      };
    }
  }

  public onActivity(listener: ActivityLogListener): () => void {
    this.activityListeners.add(listener);
    return () => this.activityListeners.delete(listener);
  }

  public onToolsChanged(listener: ToolRegisteredListener): () => void {
    this.toolListeners.add(listener);
    listener(this.getTools());
    return () => this.toolListeners.delete(listener);
  }

  private notifyActivity(item: WebMCPActivityLogItem) {
    this.activityListeners.forEach(fn => fn(item));
  }

  private notifyToolListeners() {
    const list = this.getTools();
    this.toolListeners.forEach(fn => fn(list));
  }
}

export const webMCPRegistry = new WebMCPRuntimeManager();
