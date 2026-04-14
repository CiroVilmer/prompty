import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prompt, UpdatePromptBody, ApiSuccess, ApiError } from "@/types";

type Params = { params: Promise<{ id: string }> };

// ─── GET /api/prompts/[id] ────────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiSuccess<Prompt> | ApiError>> {
  try {
    const { id } = await params;

    // TODO: query DB — e.g. await db.prompt.findUnique({ where: { id } })
    void id;
    const prompt: Prompt | null = null;

    if (!prompt) {
      return NextResponse.json(
        { error: `Prompt ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: prompt }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/prompts/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch prompt." },
      { status: 500 }
    );
  }
}

// ─── PUT /api/prompts/[id] ────────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiSuccess<Prompt> | ApiError>> {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<UpdatePromptBody>;

    // TODO: verify ownership + update in DB
    void id;
    void body;

    return NextResponse.json(
      { error: `Prompt ${id} not found.` },
      { status: 404 }
    );
  } catch (err) {
    console.error("[PUT /api/prompts/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update prompt." },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/prompts/[id] ─────────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiSuccess<{ id: string }> | ApiError>> {
  try {
    const { id } = await params;

    // TODO: verify ownership + delete from DB
    void id;

    return NextResponse.json(
      { error: `Prompt ${id} not found.` },
      { status: 404 }
    );
  } catch (err) {
    console.error("[DELETE /api/prompts/[id]]", err);
    return NextResponse.json(
      { error: "Failed to delete prompt." },
      { status: 500 }
    );
  }
}
