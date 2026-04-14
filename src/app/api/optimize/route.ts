import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { OptimizeRequestBody, OptimizeResponse, ApiSuccess, ApiError } from "@/types";

/**
 * POST /api/optimize
 *
 * Runs a DSPy-style optimisation pass on an existing prompt.
 * Today this calls the Anthropic API directly; wire up DSPy / a Python
 * micro-service when you need multi-step teleprompter optimisation.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiSuccess<OptimizeResponse> | ApiError>> {
  try {
    const body = (await request.json()) as Partial<OptimizeRequestBody>;

    if (!body.promptId?.trim()) {
      return NextResponse.json(
        { error: "promptId is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured." },
        { status: 503 }
      );
    }

    // TODO: fetch the original prompt content from DB using body.promptId

    // Stub optimisation response — replace with a real Anthropic / DSPy call
    const result: OptimizeResponse = {
      promptId: body.promptId,
      optimizedContent:
        "<!-- Optimised prompt will appear here after wiring up Anthropic / DSPy -->",
      optimizationScore: 0,
      reasoning: "Stub — no optimisation performed yet.",
    };

    // TODO: persist the updated prompt + score to DB

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/optimize]", err);
    return NextResponse.json(
      { error: "Optimisation failed." },
      { status: 500 }
    );
  }
}
