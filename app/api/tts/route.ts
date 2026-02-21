import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const maxDuration = 60;

const TTS_MODEL = "fal-ai/qwen-3-tts/voice-design/1.7b";
const MAX_TEXT_LENGTH = 4000;
const DEFAULT_PROMPT = "Speak the content clearly and naturally.";

function plainTextFromMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const key = process.env.FAL_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Text-to-speech is not configured." },
        { status: 503 }
      );
    }

    fal.config({ credentials: key });

    let body: { text?: unknown; prompt?: unknown; language?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const rawText =
      typeof body.text === "string" ? body.text.trim() : "";
    if (!rawText) {
      return NextResponse.json(
        { error: "Missing required field: text." },
        { status: 400 }
      );
    }

    const textPlain = plainTextFromMarkdown(rawText);
    const text =
      textPlain.length > MAX_TEXT_LENGTH
        ? textPlain.slice(0, MAX_TEXT_LENGTH)
        : textPlain;
    if (!text) {
      return NextResponse.json(
        { error: "No text content to speak after removing formatting." },
        { status: 400 }
      );
    }

    const prompt =
      typeof body.prompt === "string" && body.prompt.trim()
        ? body.prompt.trim()
        : DEFAULT_PROMPT;
    const language =
      typeof body.language === "string" && body.language
        ? body.language
        : "Auto";

    const result = await fal.subscribe(TTS_MODEL, {
      input: {
        text,
        prompt,
        language,
      },
    });

    const audio = (result.data as { audio?: { url?: string; duration?: number; content_type?: string } })
      ?.audio;
    if (!audio?.url) {
      return NextResponse.json(
        { error: "Text-to-speech failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: audio.url,
      duration: audio.duration,
      content_type: audio.content_type,
    });
  } catch (err) {
    console.error("[TTS]", err);
    return NextResponse.json(
      { error: "Text-to-speech failed. Please try again." },
      { status: 500 }
    );
  }
}
