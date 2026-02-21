import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const maxDuration = 60; // Allow 60 seconds for long AI calls

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse the multipart form ──────────────────────────────────────────
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

    // ── 2. Convert PDF pages to images ───────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate PDF magic bytes (%PDF header)
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

    // Use service role client for storage uploads (bypasses RLS)
    const supabaseService = createServiceClient();

    const base64Images: string[] = [];
    const timestamp = Date.now();
    const maxPages = 5;

    try {
      // Dynamically import pdf-to-img (ESM-only package)
      const { pdf } = await import("pdf-to-img");
      
      // Convert PDF to images
      const document = await pdf(buffer, { scale: 1.0 });
      let pageIndex = 0;

      for await (const image of document) {
        // Convert raw image buffer to base64 data URL (no upload needed)
        const base64 = Buffer.from(image).toString("base64");
        base64Images.push(`data:image/png;base64,${base64}`);

        pageIndex++;
        if (pageIndex >= maxPages) break;
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

    // ── 3. Derive a title from the file name ─────────────────────────────────
    const title = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");

    // ── 4. Upload original PDF to Supabase Storage ───────────────────────────
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

    // ── 5. Call OpenAI Vision API ────────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.4,
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content:
            "You are an expert study assistant. Given educational content from PDF pages (including text, graphs, diagrams, and charts), you generate high-quality study materials in valid JSON format only. Never include markdown code blocks or extra text. Return only raw JSON.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Based on the following educational content pages, generate comprehensive study materials.

Return a JSON object with exactly this structure:
{
  "flashcards": [
    {"question": "...", "answer": "..."}
  ],
  "mcqs": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": 0,
      "explanation": "..."
    }
  ],
  "revision_sheet": "... (markdown formatted summary with headings, bullet points, key facts)"
}

Rules:
- Generate exactly 15 flashcards covering key concepts
- Generate exactly 10 MCQs testing understanding
- The revision sheet should be a comprehensive markdown summary with ## headings and bullet points
- correct field in MCQs is the index (0-3) of the correct option
- Focus on the most important concepts, definitions, facts, and visual data interpretations
- Analyze all pages thoroughly, including any graphs, charts, diagrams, tables, and visual data`,
            },
            // Send page images as base64 data URLs (no external download needed)
            ...base64Images.map((dataUrl) => ({
              type: "image_url" as const,
              image_url: { url: dataUrl, detail: "low" as const },
            })),
          ],
        },
      ],
    });

    // ── 6. Parse the JSON response ────────────────────────────────────────────
    let rawContent = completion.choices[0]?.message?.content ?? "";

    // Strip markdown code block wrappers if present
    rawContent = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json(
        {
          error:
            "The AI returned an unexpected response. Please try again.",
        },
        { status: 500 }
      );
    }

    const { flashcards, mcqs, revision_sheet } = parsed;

    if (!Array.isArray(flashcards) || !Array.isArray(mcqs) || !revision_sheet) {
      return NextResponse.json(
        { error: "Invalid AI response structure. Please try again." },
        { status: 500 }
      );
    }

    // ── 7. Save to Supabase ───────────────────────────────────────────────────
    const { data: studySet, error: dbError } = await supabase
      .from("study_sets")
      .insert({
        user_id: user?.id ?? null,
        title,
        pdf_url: pdfUrl,
        flashcards,
        mcqs,
        revision_sheet,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Still return results even if save fails
    }

    // ── 8. Return ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      flashcards,
      mcqs,
      revision_sheet,
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
