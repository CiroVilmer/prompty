import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prompt, CreatePromptBody, ApiSuccess, ApiError } from "@/types";

// ─── GET /api/prompts ─────────────────────────────────────────────────────────
export async function GET(
  _request: NextRequest
): Promise<NextResponse<ApiSuccess<Prompt[]> | ApiError>> {
  try {
    // TODO: query db — e.g. await db.prompt.findMany({ where: { userId } })
    const prompts: Prompt[] = [];

    return NextResponse.json({ data: prompts }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/prompts]", err);
    return NextResponse.json(
      { error: "Failed to fetch prompts." },
      { status: 500 }
    );
  }
}

// ─── POST /api/prompts ────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiSuccess<Prompt> | ApiError>> {
  try {
    const body = (await request.json()) as Partial<CreatePromptBody>;

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "title is required." },
        { status: 400 }
      );
    }
    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: "content is required." },
        { status: 400 }
      );
    }
    if (!body.model?.trim()) {
      return NextResponse.json(
        { error: "model is required." },
        { status: 400 }
      );
    }

    // TODO: persist to DB
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title: body.title,
      content: body.content,
      model: body.model,
      variables: body.variables ?? {},
      tags: body.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ data: newPrompt }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/prompts]", err);
    return NextResponse.json(
      { error: "Failed to create prompt." },
      { status: 500 }
    );
  }
}
