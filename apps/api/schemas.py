from pydantic import BaseModel, Field
from typing import Optional


class AuditRequest(BaseModel):
    weak_title: str
    weak_description: str
    weak_attributes: dict = Field(default_factory=dict)
    category: str = "notebooks"
    trending_keywords: list[str] = Field(default_factory=list)


class AuditResponse(BaseModel):
    missing_critical_attributes: list[str]
    title_issues: list[str]
    description_issues: list[str]
    missing_keywords: list[str]
    priority_fixes: list[str]


class GenerateRequest(BaseModel):
    weak_title: str
    weak_description: str
    weak_attributes: dict = Field(default_factory=dict)
    category: str = "notebooks"
    trending_keywords: list[str] = Field(default_factory=list)
    audit_diagnosis: dict


class GenerateResponse(BaseModel):
    title: str
    description: str
    attributes: dict


class ImagePromptRequest(BaseModel):
    product_specs: dict
    category: str = "notebooks"
    reference_image_urls: list[str] = Field(default_factory=list)


class ImagePromptResponse(BaseModel):
    image_generation_prompt: str
    aspect_ratio: str
    style_notes: str
    generated_image_url: Optional[str] = None


class CompareRequest(BaseModel):
    weak_title: str
    weak_description: str
    weak_attributes: dict = Field(default_factory=dict)
    category: str = "notebooks"
    trending_keywords: list[str] = Field(default_factory=list)
    # Pre-computed audit diagnosis. If absent, /api/compare runs the
    # auditor itself (slower but simpler for callers).
    audit_diagnosis: dict | None = None
    # Whether to run the judge on each output. Costs ~15-20s extra.
    include_scores: bool = True


class GeneratorOutput(BaseModel):
    title: str
    description: str
    attributes: dict
    score: float | None = None  # None if include_scores=False
    latency_ms: int
    error: str | None = None


class CompareResponse(BaseModel):
    raw_llm: GeneratorOutput
    prompty_baseline: GeneratorOutput
    prompty_optimized: GeneratorOutput
    judge_reasoning_optimized: str | None = None


class DegradeRequest(BaseModel):
    product_specs: str
    category: str = "notebooks"


class DegradeResponse(BaseModel):
    weak_title: str
    weak_description: str
