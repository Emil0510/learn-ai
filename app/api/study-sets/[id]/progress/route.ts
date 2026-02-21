import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { StudyProgress } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const studySetId = params.id;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ flashcardProgress: [], mcqProgress: [] } as StudyProgress);
  }

  const [flashcardRes, mcqRes] = await Promise.all([
    supabase
      .from("flashcard_answers")
      .select("flashcard_index, correct")
      .eq("study_set_id", studySetId)
      .eq("user_id", user.id)
      .order("flashcard_index", { ascending: true }),
    supabase
      .from("mcq_answers")
      .select("mcq_index, selected_option, correct")
      .eq("study_set_id", studySetId)
      .eq("user_id", user.id)
      .order("attempted_at", { ascending: false }),
  ]);

  const flashcardProgress = (flashcardRes.data ?? []).map((r) => ({
    index: r.flashcard_index,
    correct: r.correct,
  }));

  const mcqByIndex = new Map<number, { index: number; selectedOption: number; correct: boolean }>();
  for (const r of mcqRes.data ?? []) {
    if (!mcqByIndex.has(r.mcq_index)) {
      mcqByIndex.set(r.mcq_index, {
        index: r.mcq_index,
        selectedOption: r.selected_option,
        correct: r.correct,
      });
    }
  }
  const mcqProgress = Array.from(mcqByIndex.values()).sort((a, b) => a.index - b.index);

  return NextResponse.json({
    flashcardProgress,
    mcqProgress,
  } as StudyProgress);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const studySetId = params.id;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to save progress" }, { status: 401 });
  }

  let body: {
    type: "flashcard" | "mcq";
    flashcardIndex?: number;
    mcqIndex?: number;
    correct?: boolean;
    selectedOption?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.type === "flashcard") {
    const flashcardIndex = body.flashcardIndex;
    const correct = body.correct;
    if (typeof flashcardIndex !== "number" || typeof correct !== "boolean") {
      return NextResponse.json(
        { error: "flashcardIndex and correct required for type flashcard" },
        { status: 400 }
      );
    }
    const { error } = await supabase.from("flashcard_answers").upsert(
      {
        study_set_id: studySetId,
        user_id: user.id,
        flashcard_index: flashcardIndex,
        correct,
        attempted_at: new Date().toISOString(),
      },
      {
        onConflict: "study_set_id,user_id,flashcard_index",
      }
    );
    if (error) {
      console.error("flashcard_answers upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.type === "mcq") {
    const mcqIndex = body.mcqIndex;
    const selectedOption = body.selectedOption;
    const correct = body.correct;
    if (
      typeof mcqIndex !== "number" ||
      typeof selectedOption !== "number" ||
      typeof correct !== "boolean"
    ) {
      return NextResponse.json(
        { error: "mcqIndex, selectedOption, and correct required for type mcq" },
        { status: 400 }
      );
    }
    const { error } = await supabase.from("mcq_answers").insert({
      study_set_id: studySetId,
      user_id: user.id,
      mcq_index: mcqIndex,
      selected_option: selectedOption,
      correct,
      attempted_at: new Date().toISOString(),
    });
    if (error) {
      console.error("mcq_answers insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "type must be flashcard or mcq" }, { status: 400 });
}
