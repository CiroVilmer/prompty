// ─── Domain types ─────────────────────────────────────────────────────────────

export interface Prompt {
  id: string;
  title: string;
  content: string;
  model: string;
  variables: Record<string, string>;
  optimizationScore?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ─── API request / response shapes ───────────────────────────────────────────

export interface CreatePromptBody {
  title: string;
  content: string;
  model: string;
  variables?: Record<string, string>;
  tags?: string[];
}

export interface UpdatePromptBody extends Partial<CreatePromptBody> {}

export interface OptimizeRequestBody {
  promptId: string;
  /** Target model to optimise for */
  model?: string;
  /** Optional few-shot examples to guide DSPy */
  examples?: Array<{ input: string; expectedOutput: string }>;
}

export interface OptimizeResponse {
  promptId: string;
  optimizedContent: string;
  optimizationScore: number;
  reasoning: string;
}

// ─── API utility types ────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
