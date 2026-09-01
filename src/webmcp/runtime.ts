/**
 * WebMCP Runtime & Polyfill Layer
 * Implements the W3C / Chrome WebMCP standard (document.modelContext / navigator.modelContext)
 */

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

class WebMCPRegistry {
  private tools: Map<string, WebMCPToolDefinition> = new Map();
  private activityListeners: Set<ActivityLogListener> = new Set();
  private toolListeners: Set<ToolRegisteredListener> = new Set();

  constructor() {
    this.initPolyfill();
  }

  private initPolyfill() {
    if (typeof window === 'undefined') return;

    const self = this;
    const modelContextObj = {
      registerTool: async (tool: WebMCPToolDefinition) => {
        return self.registerTool(tool);
      },
      unregisterTool: async (name: string) => {
        return self.unregisterTool(name);
      },
      getTools: () => {
        return self.getTools();
      },
      executeTool: async (name: string, input: any) => {
        return self.executeTool(name, input);
      }
    };

    // Polyfill window.modelContext, document.modelContext, and navigator.modelContext
    const doc = document as any;
    const nav = navigator as any;
    const win = window as any;

    if (!doc.modelContext) {
      doc.modelContext = modelContextObj;
    }
    if (!nav.modelContext) {
      nav.modelContext = modelContextObj;
    }
    if (!win.modelContext) {
      win.modelContext = modelContextObj;
    }

    console.log('✅ [WebMCP Registry] Initialized document.modelContext & navigator.modelContext');
  }

  public async registerTool(tool: WebMCPToolDefinition): Promise<void> {
    this.tools.set(tool.name, tool);
    console.log(`🛠️ [WebMCP] Registered tool: ${tool.name} - ${tool.description}`);
    this.notifyToolListeners();
  }

  public async unregisterTool(name: string): Promise<void> {
    this.tools.delete(name);
    console.log(`🗑️ [WebMCP] Unregistered tool: ${name}`);
    this.notifyToolListeners();
  }

  public getTools(): WebMCPToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public getTool(name: string): WebMCPToolDefinition | undefined {
    return this.tools.get(name);
  }

  public async executeTool(name: string, input: any): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    const tool = this.tools.get(name);
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
      console.log(`⚡ [WebMCP] Executing ${name} with input:`, input);
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

export const webMCPRegistry = new WebMCPRegistry();
