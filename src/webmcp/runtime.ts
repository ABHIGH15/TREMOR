/**
 * WebMCP Runtime & Polyfill Layer
 * Uses official @mcp-b/global standard polyfill (created by Alex Nahas, WebMCP Challenge Judge)
 * providing canonical W3C / Chrome WebMCP standard (document.modelContext / navigator.modelContext)
 */
import { initializeWebModelContext } from '@mcp-b/global';
import { PendingReviewFlag } from '../types/dataset';

export interface WebMCPToolInputSchema {
  type: string;
  properties: Record<string, {
    type: string;
    description: string;
    enum?: string[];
    items?: { type: string; description?: string };
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
  status: 'success' | 'error' | 'pending_human' | 'human_action';
}

type ActivityLogListener = (logItem: WebMCPActivityLogItem) => void;
type ToolRegisteredListener = (tools: WebMCPToolDefinition[]) => void;
type FlagsChangedListener = (flags: PendingReviewFlag[]) => void;
type FlagConfirmedListener = (flag: PendingReviewFlag) => void;

class WebMCPRuntimeManager {
  private registeredTools: Map<string, WebMCPToolDefinition> = new Map();
  private activityListeners: Set<ActivityLogListener> = new Set();
  private toolListeners: Set<ToolRegisteredListener> = new Set();
  private pendingFlags: Map<string, PendingReviewFlag> = new Map();
  private flagListeners: Set<FlagsChangedListener> = new Set();
  private flagConfirmedListeners: Set<FlagConfirmedListener> = new Set();
  private savedSimulateTool: WebMCPToolDefinition | null = null;
  private toolAbortControllers: Map<string, AbortController> = new Map();

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
      console.warn('⚠️ [WebMCP] Polyfill initialization notice:', err);
    }

    // Expose runtime helpers on global window object safely (never mutating read-only document.modelContext)
    try {
      (window as any).__tremor_webMCP = this;
      (window as any).tremorWebMCP = {
        getTools: () => this.getTools(),
        executeTool: (name: string, input: any) => this.executeTool(name, input),
      };
    } catch (err) {
      // Safe fallback
    }
  }

  public async registerTool(tool: WebMCPToolDefinition): Promise<void> {
    this.registeredTools.set(tool.name, tool);
    if (tool.name === 'simulate_change_impact') {
      this.savedSimulateTool = tool;
    }

    const abortController = new AbortController();
    this.toolAbortControllers.set(tool.name, abortController);

    const toolPayload = {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      execute: async (input: any) => {
        return this.executeTool(tool.name, input);
      },
    };

    // 1. Register on document.modelContext (Canonical W3C / @mcp-b/global standard with AbortSignal)
    try {
      const doc = typeof document !== 'undefined' ? (document as any) : null;
      if (doc?.modelContext?.registerTool && typeof doc.modelContext.registerTool === 'function') {
        await doc.modelContext.registerTool(toolPayload, { signal: abortController.signal });
        console.log(`🛠️ [WebMCP Standard] Registered '${tool.name}' on document.modelContext`);
      }
    } catch (err) {
      console.warn(`[WebMCP Standard] Register notice for '${tool.name}' on document.modelContext:`, err);
    }

    // 2. Register on navigator.modelContext if separate
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      const doc = typeof document !== 'undefined' ? (document as any) : null;
      if (
        nav?.modelContext?.registerTool &&
        typeof nav.modelContext.registerTool === 'function' &&
        nav.modelContext !== doc?.modelContext
      ) {
        await nav.modelContext.registerTool(toolPayload, { signal: abortController.signal });
        console.log(`🛠️ [WebMCP Standard] Registered '${tool.name}' on navigator.modelContext`);
      }
    } catch (err) {
      console.warn(`[WebMCP Standard] Register notice for '${tool.name}' on navigator.modelContext:`, err);
    }

    this.notifyToolListeners();
  }

  public async unregisterTool(name: string): Promise<void> {
    this.registeredTools.delete(name);

    // Standard W3C WebMCP: abort signal unregisters tool from modelContext
    const controller = this.toolAbortControllers.get(name);
    if (controller) {
      controller.abort();
      this.toolAbortControllers.delete(name);
    }

    try {
      const doc = typeof document !== 'undefined' ? (document as any) : null;
      if (doc?.modelContext?.unregisterTool && typeof doc.modelContext.unregisterTool === 'function') {
        await doc.modelContext.unregisterTool(name);
      }
    } catch (err) {
      // ignore
    }

    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
      const doc = typeof document !== 'undefined' ? (document as any) : null;
      if (
        nav?.modelContext?.unregisterTool &&
        typeof nav.modelContext.unregisterTool === 'function' &&
        nav.modelContext !== doc?.modelContext
      ) {
        await nav.modelContext.unregisterTool(name);
      }
    } catch (err) {
      // ignore
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
    const isUnregisteredFromAgent = !this.registeredTools.has(name);
    const tool = this.registeredTools.get(name) || (name === 'simulate_change_impact' ? this.savedSimulateTool : undefined);
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
      console.log(`⚡ [WebMCP Execution] ${isUnregisteredFromAgent ? 'Human Override' : 'Agent'} invoked ${name} with:`, input);
      const result = await tool.execute(input);
      const durationMs = Math.round(performance.now() - startTime);

      let preview = result.content?.[0]?.text
        ? result.content[0].text.substring(0, 120) + (result.content[0].text.length > 120 ? '...' : '')
        : 'Executed successfully';

      if (isUnregisteredFromAgent) {
        preview = `[Human Cockpit Override] ${preview}`;
      }

      this.notifyActivity({
        id: Math.random().toString(36).substring(2, 9),
        timestamp,
        toolName: name,
        input,
        outputPreview: preview,
        durationMs,
        status: result.isError ? 'error' : name === 'flag_for_review' ? 'pending_human' : 'success',
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

  // --- Trust Layer / Human Review Methods ---
  public addPendingFlag(flag: PendingReviewFlag): void {
    this.pendingFlags.set(flag.id, flag);
    this.notifyFlagListeners();

    // Tool Lifecycle: dynamically unregister simulate_change_impact while pending human review exists
    if (this.registeredTools.has('simulate_change_impact')) {
      const toolToSave = this.registeredTools.get('simulate_change_impact');
      if (toolToSave) this.savedSimulateTool = toolToSave;
      this.unregisterTool('simulate_change_impact');

      this.notifyActivity({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toTimeString().split(' ')[0],
        toolName: 'TOOL_LIFECYCLE',
        input: { tool: 'simulate_change_impact', action: 'UNREGISTER' },
        outputPreview: `🔒 Locked: 'simulate_change_impact' unregistered while pending human review is unresolved`,
        durationMs: 0,
        status: 'human_action',
      });
    }
  }

  public confirmFlagByHuman(flagId: string, reviewer = 'Human Reviewer (Devin Patel)'): boolean {
    const flag = this.pendingFlags.get(flagId);
    if (!flag) return false;

    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];

    flag.status = 'CONFIRMED';
    flag.resolved_at = timestamp;
    flag.resolved_by = reviewer;
    this.pendingFlags.set(flagId, flag);
    this.notifyFlagListeners();

    // Broadcast Human Action Event to Activity Stream
    this.notifyActivity({
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      toolName: 'HUMAN_APPROVAL_GATE',
      input: { flag_id: flagId, module: flag.module, action: 'CONFIRM' },
      outputPreview: `✅ Human Engineer (${reviewer}) CONFIRMED & APPROVED change for '${flag.module}'`,
      durationMs: 0,
      status: 'human_action',
    });

    // Tool Lifecycle: re-register simulate_change_impact if all pending flags are resolved
    const remainingPending = Array.from(this.pendingFlags.values()).filter(f => f.status === 'PENDING');
    if (remainingPending.length === 0 && this.savedSimulateTool && !this.registeredTools.has('simulate_change_impact')) {
      this.registerTool(this.savedSimulateTool);
      this.notifyActivity({
        id: Math.random().toString(36).substring(2, 9),
        timestamp,
        toolName: 'TOOL_LIFECYCLE',
        input: { tool: 'simulate_change_impact', action: 'RE_REGISTER' },
        outputPreview: `🔓 Unlocked: 'simulate_change_impact' re-registered after human review resolution`,
        durationMs: 0,
        status: 'human_action',
      });
    }

    // Trigger counterfactual replay listeners
    this.flagConfirmedListeners.forEach(fn => fn(flag));

    return true;
  }

  public dismissFlagByHuman(flagId: string, reviewer = 'Human Reviewer (Devin Patel)'): boolean {
    const flag = this.pendingFlags.get(flagId);
    if (!flag) return false;

    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];

    flag.status = 'DISMISSED';
    flag.resolved_at = timestamp;
    flag.resolved_by = reviewer;
    this.pendingFlags.set(flagId, flag);
    this.notifyFlagListeners();

    // Broadcast Human Action Event to Activity Stream
    this.notifyActivity({
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      toolName: 'HUMAN_APPROVAL_GATE',
      input: { flag_id: flagId, module: flag.module, action: 'DISMISS' },
      outputPreview: `❌ Human Engineer (${reviewer}) REJECTED & DISMISSED change for '${flag.module}'`,
      durationMs: 0,
      status: 'human_action',
    });

    // Tool Lifecycle: re-register simulate_change_impact if all pending flags are resolved
    const remainingPending = Array.from(this.pendingFlags.values()).filter(f => f.status === 'PENDING');
    if (remainingPending.length === 0 && this.savedSimulateTool && !this.registeredTools.has('simulate_change_impact')) {
      this.registerTool(this.savedSimulateTool);
      this.notifyActivity({
        id: Math.random().toString(36).substring(2, 9),
        timestamp,
        toolName: 'TOOL_LIFECYCLE',
        input: { tool: 'simulate_change_impact', action: 'RE_REGISTER' },
        outputPreview: `🔓 Unlocked: 'simulate_change_impact' re-registered after human review resolution`,
        durationMs: 0,
        status: 'human_action',
      });
    }

    return true;
  }

  public getPendingFlags(): PendingReviewFlag[] {
    return Array.from(this.pendingFlags.values());
  }

  public onFlagConfirmed(listener: FlagConfirmedListener): () => void {
    this.flagConfirmedListeners.add(listener);
    return () => this.flagConfirmedListeners.delete(listener);
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

  public onFlagsChanged(listener: FlagsChangedListener): () => void {
    this.flagListeners.add(listener);
    listener(this.getPendingFlags());
    return () => this.flagListeners.delete(listener);
  }

  private notifyActivity(item: WebMCPActivityLogItem) {
    this.activityListeners.forEach(fn => fn(item));
  }

  private notifyToolListeners() {
    const list = this.getTools();
    this.toolListeners.forEach(fn => fn(list));
  }

  private notifyFlagListeners() {
    const list = this.getPendingFlags();
    this.flagListeners.forEach(fn => fn(list));
  }
}

export const webMCPRegistry = new WebMCPRuntimeManager();
