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
  model?: string;
  examples?: Array<{ input: string; expectedOutput: string }>;
}

export interface OptimizeResponse {
  promptId: string;
  optimizedContent: string;
  optimizationScore: number;
  reasoning: string;
}

// ─── MELI Listing Optimization (FastAPI backend) ─────────────────────────────

export interface AuditRequest {
  weak_title: string;
  weak_description: string;
  weak_attributes: Record<string, string>;
  category: string;
  trending_keywords: string[];
}

export interface AuditResponse {
  missing_critical_attributes: string[];
  title_issues: string[];
  description_issues: string[];
  missing_keywords: string[];
  priority_fixes: string[];
}

export interface GenerateRequest {
  weak_title: string;
  weak_description: string;
  weak_attributes: Record<string, string>;
  category: string;
  trending_keywords: string[];
  audit_diagnosis: Record<string, unknown>;
}

export interface GenerateResponse {
  title: string;
  description: string;
  attributes: Record<string, string>;
}

export interface ImagePromptRequest {
  product_specs: Record<string, string>;
  category: string;
  reference_image_urls: string[];
}

export interface ImagePromptResponse {
  image_generation_prompt: string;
  aspect_ratio: string;
  style_notes: string;
  generated_image_url: string | null;
}

export interface CompareRequest {
  weak_title: string;
  weak_description: string;
  weak_attributes: Record<string, string>;
  category: string;
  trending_keywords: string[];
  audit_diagnosis?: Record<string, unknown> | null;
  include_scores: boolean;
}

export interface GeneratorOutput {
  title: string;
  description: string;
  attributes: Record<string, string>;
  score: number | null;
  latency_ms: number;
  error: string | null;
}

export interface CompareResponse {
  raw_llm: GeneratorOutput;
  prompty_baseline: GeneratorOutput;
  prompty_optimized: GeneratorOutput;
  judge_reasoning_optimized: string | null;
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
