"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PdfUpload from "@/components/PdfUpload";
import LoadingState from "@/components/LoadingState";
import StudyMaterials from "@/components/StudyMaterials";
import SignInBanner from "@/components/SignInBanner";
import ErrorCallout from "@/components/ErrorCallout";
import Button from "@/components/ui/Button";
import type { GenerateResponse } from "@/lib/types";

function GenerateContent() {
  const searchParams = useSearchParams();
  const studySetId = searchParams.get("id");

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Check auth state
  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getUser().then(({ data }) =>
        setIsLoggedIn(!!data.user)
      );
    });
  }, []);

  // If an ID is passed, load that study set
  useEffect(() => {
    if (!studySetId) return;
    setIsLoading(true);
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient()
        .from("study_sets")
        .select("*")
        .eq("id", studySetId)
        .single()
        .then(({ data, error: err }) => {
          setIsLoading(false);
          if (err || !data) {
            setError("Could not load study set.");
          } else {
            setResult({
              flashcards: data.flashcards,
              mcqs: data.mcqs,
              revision_sheet: data.revision_sheet,
              studySetId: data.id,
              title: data.title,
            });
          }
        });
    });
  }, [studySetId]);

  const handleGenerate = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error: ${res.status}`);
      }

      const data: GenerateResponse = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-content mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-notion-text leading-tight">
          {result ? result.title : "New Study Set"}
        </h1>
        {!result && (
          <p className="text-[15px] text-notion-muted mt-1.5">
            Upload a PDF to generate flashcards, MCQs, and a revision sheet.
          </p>
        )}
      </div>

      {/* Sign in banner — only show when not logged in and no result yet */}
      {isLoggedIn === false && !result && (
        <div className="mb-6">
          <SignInBanner />
        </div>
      )}

      {/* Upload area — hide once we have results */}
      {!result && !isLoading && (
        <div className="space-y-5">
          <PdfUpload
            onFileSelect={setFile}
            selectedFile={file}
            disabled={isLoading}
          />

          {file && (
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="text-[14px] px-5 py-2.5"
            >
              Generate Study Materials
            </Button>
          )}

          {error && <ErrorCallout message={error} />}
        </div>
      )}

      {/* Loading state */}
      {isLoading && <LoadingState />}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Sign in banner after results for guests */}
          {isLoggedIn === false && (
            <SignInBanner />
          )}

          <StudyMaterials data={result} />

          {/* Reset button */}
          <div className="pt-4 border-t border-notion-border">
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setError(null);
              }}
              className="text-[13px] text-notion-muted hover:text-notion-text transition-colors underline underline-offset-2"
            >
              ← Generate a new study set
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="max-w-content mx-auto py-12 text-[15px] text-notion-muted">Loading...</div>}>
      <GenerateContent />
    </Suspense>
  );
}
