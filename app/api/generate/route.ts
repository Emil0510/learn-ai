import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const maxDuration = 60; // Allow 60 seconds for long AI calls

const MAX_PAGES = 10;
const MAX_FLASHCARDS = 50;
const MAX_MCQS = 30;
const MIN_FLASHCARDS = 15;
const MIN_MCQS = 8;

function parseJsonResponse(rawContent: string): unknown {
  let s = rawContent
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?\s*```\s*$/i, "")
    .trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last > first) s = s.slice(first, last + 1);
  s = s.replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(s);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer.slice(0, 5).toString("ascii").startsWith("%PDF")) {
      return NextResponse.json(
        { error: "The file doesn't appear to be a valid PDF." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const supabaseService = createServiceClient();

    const base64Images: string[] = [];
    const timestamp = Date.now();

    try {
      const { pdf } = await import("pdf-to-img");
      const document = await pdf(buffer, { scale: 1.0 });
      let pageIndex = 0;

      for await (const image of document) {
        const base64 = Buffer.from(image).toString("base64");
        base64Images.push(`data:image/png;base64,${base64}`);
        pageIndex++;
        if (pageIndex >= MAX_PAGES) break;
      }

      if (base64Images.length === 0) {
        return NextResponse.json(
          { error: "Could not process PDF pages. Please try again." },
          { status: 422 }
        );
      }
    } catch (err) {
      console.error("PDF to image conversion error:", err);
      return NextResponse.json(
        { error: "Could not process PDF. Please try again." },
        { status: 422 }
      );
    }

    const title = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
    const pageCount = base64Images.length;

    const fileName = `${timestamp}-${file.name.replace(/\s+/g, "_")}`;
    const { data: pdfUploadData } = await supabaseService.storage
      .from("pdfs")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    const { data: pdfUrlData } = supabaseService.storage
      .from("pdfs")
      .getPublicUrl(fileName);
    const pdfUrl = pdfUploadData ? pdfUrlData.publicUrl : null;

    // Agent 1: flashcards + MCQs (comprehensive coverage of essential parts)
    const callAgent1 = async () => {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.4,
        max_tokens: 8000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert study assistant. Your job is to create comprehensive study materials that cover ALL essential parts of the document. For every major section, key definition, main concept, important figure or diagram, and takeaway, create at least one flashcard and at least one MCQ when the content supports it. Prioritize full coverage of the material: do not skip important topics. Return only valid JSON.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are viewing ${pageCount} page(s) of educational content. Produce study materials that COVER ALL ESSENTIAL PARTS of the PDF.

Return a JSON object with exactly these keys:
{
  "flashcards": [ { "question": "...", "answer": "..." } ],
  "mcqs": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": 0,
      "explanation": "..."
    }
  ]
}

Coverage rules (important):
- Cover every major section and subsection. For each distinct topic or concept, create at least 1–2 flashcards and at least 1 MCQ.
- Include all key definitions, formulas, and terms.
- Include main ideas, conclusions, and takeaways from the text.
- For any graphs, charts, diagrams, or tables: create at least one flashcard and one MCQ that test understanding of that visual.
- Aim for at least ${MIN_FLASHCARDS} flashcards and at least ${MIN_MCQS} MCQs. Use up to ${MAX_FLASHCARDS} flashcards and ${MAX_MCQS} MCQs when the material is dense so nothing essential is missed.
- correct is the index (0–3) of the correct option in options.
- Analyze all pages thoroughly. Return only raw JSON, no markdown.`,
              },
              ...base64Images.map((dataUrl) => ({
                type: "image_url" as const,
                image_url: { url: dataUrl, detail: "low" as const },
              })),
            ],
          },
        ],
      });

      let raw = completion.choices[0]?.message?.content ?? "";
      const parsed = parseJsonResponse(raw) as { flashcards?: unknown[]; mcqs?: unknown[] };
      const flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
      const mcqs = Array.isArray(parsed.mcqs) ? parsed.mcqs : [];

      const boundedFlashcards = flashcards.slice(0, MAX_FLASHCARDS).filter(
        (c): c is { question: string; answer: string } =>
          typeof c === "object" && c !== null && "question" in c && "answer" in c
      );
      const boundedMcqs = mcqs.slice(0, MAX_MCQS).filter(
        (m): m is { question: string; options: string[]; correct: number; explanation: string } =>
          typeof m === "object" &&
          m !== null &&
          "question" in m &&
          Array.isArray((m as { options?: unknown }).options) &&
          "correct" in m &&
          "explanation" in m
      );

      return {
        flashcards: boundedFlashcards.length >= MIN_FLASHCARDS ? boundedFlashcards : boundedFlashcards,
        mcqs: boundedMcqs.length >= MIN_MCQS ? boundedMcqs : boundedMcqs,
      };
    };

    // Agent 2: conspect (markdown outline)
    const callAgent2 = async () => {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert study assistant. Given PDF pages, produce a conspect (structured outline/summary) in markdown. Use headings (##, ###), bullet points, and key facts. This will be used for revision and later exported to Notion. Return a JSON object with a single key 'conspect' whose value is the markdown string.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Based on the following ${pageCount} page(s) of educational content, produce a **conspect** (structured outline/summary) in markdown. Use ## and ### headings, bullet points, and key facts. Suitable for revision and future export to Notion. Return only a JSON object: { "conspect": "..." } with the markdown inside the string.`,
              },
              ...base64Images.map((dataUrl) => ({
                type: "image_url" as const,
                image_url: { url: dataUrl, detail: "low" as const },
              })),
            ],
          },
        ],
      });

      let raw = completion.choices[0]?.message?.content ?? "";
      const parsed = parseJsonResponse(raw) as { conspect?: string };
      const conspect =
        typeof parsed.conspect === "string" && parsed.conspect.trim()
          ? parsed.conspect.trim()
          : "";
      return { conspect };
    };

    const [agent1Result, agent2Result] = await Promise.all([
      callAgent1(),
      callAgent2(),
    ]);

    const { flashcards, mcqs } = agent1Result;
    const { conspect } = agent2Result;

    if (flashcards.length === 0 || mcqs.length === 0) {
      return NextResponse.json(
        { error: "The AI returned too few flashcards or MCQs. Please try again." },
        { status: 500 }
      );
    }

    const { data: studySet, error: dbError } = await supabase
      .from("study_sets")
      .insert({
        user_id: user?.id ?? null,
        title,
        pdf_url: pdfUrl,
        flashcards,
        mcqs,
        revision_sheet: conspect,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return NextResponse.json({
      flashcards,
      mcqs,
      conspect,
      studySetId: studySet?.id ?? null,
      title,
    });
  } catch (err: unknown) {
    console.error("Generate API error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
