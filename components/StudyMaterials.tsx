"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Tabs from "@/components/ui/Tabs";
import Flashcards from "@/components/Flashcards";
import McqQuiz from "@/components/McqQuiz";
import RevisionSheet from "@/components/RevisionSheet";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import type { GenerateResponse, StudyProgress } from "@/lib/types";

export type ProgressUpdate =
  | { type: "flashcard"; index: number; correct: boolean }
  | { type: "mcq"; index: number; selectedOption: number; correct: boolean };

const TAB_IDS = {
  FLASHCARDS: "flashcards",
  MCQS: "mcqs",
  CONSPECT: "conspect",
  PROGRESS: "progress",
};

interface StudyMaterialsProps {
  data: GenerateResponse;
  studySetId?: string;
}

export default function StudyMaterials({ data, studySetId }: StudyMaterialsProps) {
  const [activeTab, setActiveTab] = useState(TAB_IDS.FLASHCARDS);
  const [progress, setProgress] = useState<StudyProgress>({
    flashcardProgress: [],
    mcqProgress: [],
  });
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  const fetchProgress = useCallback(() => {
    if (!studySetId) return;
    fetch(`/api/study-sets/${studySetId}/progress`, { credentials: "include" })
      .then((res) => res.json())
      .then((p: StudyProgress) => {
        setProgress((prev) => {
          const serverEmpty =
            (p.flashcardProgress?.length ?? 0) === 0 &&
            (p.mcqProgress?.length ?? 0) === 0;
          const hasLocal =
            (prev.flashcardProgress?.length ?? 0) > 0 ||
            (prev.mcqProgress?.length ?? 0) > 0;
          if (serverEmpty && hasLocal) return prev;
          return p;
        });
      })
      .catch(() => {});
  }, [studySetId]);

  const handleProgressUpdate = useCallback(
    (update?: ProgressUpdate) => {
      if (update) {
        setProgress((prev) => {
          if (update.type === "flashcard") {
            const existing = prev.flashcardProgress.filter((p) => p.index !== update.index);
            return {
              ...prev,
              flashcardProgress: [...existing, { index: update.index, correct: update.correct }],
            };
          }
          return {
            ...prev,
            mcqProgress: [
              ...prev.mcqProgress,
              {
                index: update.index,
                selectedOption: update.selectedOption,
                correct: update.correct,
              },
            ],
          };
        });
      } else {
        fetchProgress();
      }
    },
    [fetchProgress]
  );

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    if ((activeTab === TAB_IDS.PROGRESS || activeTab === TAB_IDS.MCQS) && studySetId)
      fetchProgress();
  }, [activeTab, studySetId, fetchProgress]);

  const conspectContent = data.conspect ?? (data as { revision_sheet?: string }).revision_sheet ?? "";

  const tabs = [
    {
      id: TAB_IDS.FLASHCARDS,
      label: "Flashcards",
      count: data.flashcards.length,
    },
    { id: TAB_IDS.MCQS, label: "MCQs", count: data.mcqs.length },
    { id: TAB_IDS.CONSPECT, label: "Conspect" },
    { id: TAB_IDS.PROGRESS, label: "Progress" },
  ];

  const flashcardCorrect = progress.flashcardProgress.filter((p) => p.correct).length;
  const flashcardWrong = progress.flashcardProgress.filter((p) => !p.correct).length;
  const mcqLatestByIndex = new Map(
    progress.mcqProgress.map((p) => [p.index, p])
  );
  const mcqCorrectCount = progress.mcqProgress.length
    ? Array.from(mcqLatestByIndex.values()).filter((p) => p.correct).length
    : 0;
  const mcqWrongCount = mcqLatestByIndex.size - mcqCorrectCount;
  const mcqTotalForScore = data.mcqs.length;

  const hasFlashcardProgress = progress.flashcardProgress.length > 0;
  const hasMcqProgress = mcqLatestByIndex.size > 0;

  const handleCreateVoice = useCallback(async () => {
    if (!conspectContent.trim()) return;
    setTtsLoading(true);
    setTtsError(null);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: conspectContent,
          language: "Auto",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setTtsError(json?.error ?? "Something went wrong.");
        return;
      }
      setTtsAudioUrl(json.url ?? null);
    } catch {
      setTtsError("Something went wrong. Please try again.");
    } finally {
      setTtsLoading(false);
    }
  }, [conspectContent]);

  return (
    <div className="animate-fade-in space-y-0">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-2">
        {activeTab === TAB_IDS.FLASHCARDS && (
          <Flashcards
            flashcards={data.flashcards}
            studySetId={studySetId}
            progress={progress.flashcardProgress}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
        {activeTab === TAB_IDS.MCQS && (
          <McqQuiz
            mcqs={data.mcqs}
            studySetId={studySetId}
            savedMcqAnswers={mcqLatestByIndex}
            lastScore={
              mcqTotalForScore > 0 && mcqLatestByIndex.size > 0
                ? { correct: mcqCorrectCount, total: mcqTotalForScore }
                : undefined
            }
            onProgressUpdate={handleProgressUpdate}
          />
        )}
        {activeTab === TAB_IDS.CONSPECT && (
          <div>
            <RevisionSheet content={conspectContent} />
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-notion-border bg-notion-card px-4 py-3 text-[13px] text-notion-muted">
              <div className="relative h-6 w-6 shrink-0">
                <Image
                  src="/notion-icon.png"
                  alt="Notion"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span>Export to Notion</span>
            </div>
            <div className="mt-4 space-y-3">
              <Button
                type="button"
                onClick={handleCreateVoice}
                disabled={ttsLoading || !conspectContent.trim()}
              >
                {ttsLoading ? "Creating voice…" : "Create voice"}
              </Button>
              {ttsLoading && (
                <p className="text-[13px] text-notion-muted">
                  Creating voice… This may take a moment.
                </p>
              )}
              {ttsError && (
                <p className="text-[13px] text-notion-danger">{ttsError}</p>
              )}
              {ttsAudioUrl && !ttsLoading && (
                <div className="rounded-lg border border-notion-border bg-notion-card p-3">
                  <p className="text-[12px] text-notion-muted mb-2">Generated audio</p>
                  <audio src={ttsAudioUrl} controls className="w-full max-w-md" />
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === TAB_IDS.PROGRESS && (
          <div className="py-6">
            <h2 className="text-[18px] font-semibold text-notion-text mb-4">
              Study progress
            </h2>
            {!studySetId && (
              <p className="text-[14px] text-notion-muted mb-6">
                Sign in to save and view your progress for this study set.
              </p>
            )}
            <div className="space-y-6 max-w-xl">
              {data.flashcards.length > 0 && (
                <ProgressBar
                  correct={flashcardCorrect}
                  wrong={flashcardWrong}
                  total={data.flashcards.length}
                  label="Flashcards"
                />
              )}
              {mcqTotalForScore > 0 && (
                <ProgressBar
                  correct={mcqCorrectCount}
                  wrong={mcqWrongCount}
                  total={mcqTotalForScore}
                  label="Quiz (last run)"
                />
              )}
            </div>
            {studySetId && !hasFlashcardProgress && !hasMcqProgress && (
              <p className="text-[14px] text-notion-muted mt-6">
                No answers yet. Use the Flashcards and MCQs tabs to start
                studying; your correct and wrong answers will appear above.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
