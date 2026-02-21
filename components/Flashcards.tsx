"use client";

import { useState } from "react";
import type { FlashcardProgressItem } from "@/lib/types";
import ProgressBar from "@/components/ui/ProgressBar";

interface FlashcardsProps {
  flashcards: Array<{ question: string; answer: string }>;
  studySetId?: string;
  progress?: FlashcardProgressItem[];
  onProgressUpdate?: (update?: { type: "flashcard"; index: number; correct: boolean }) => void;
}

export default function Flashcards({
  flashcards,
  studySetId,
  progress = [],
  onProgressUpdate,
}: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [localCorrect, setLocalCorrect] = useState<Record<number, boolean>>({});

  const card = flashcards[currentIndex];
  const progressByIndex = new Map(progress.map((p) => [p.index, p.correct]));
  const resolvedCorrect = (i: number) => localCorrect[i] ?? progressByIndex.get(i);
  const totalCorrect = flashcards.filter((_, i) => resolvedCorrect(i) === true).length;
  const totalWrong = flashcards.filter((_, i) => resolvedCorrect(i) === false).length;
  const hasAnyProgress = progress.length > 0 || Object.keys(localCorrect).length > 0;

  const goToPrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((i) => Math.max(0, i - 1)), 100);
  };

  const goToNext = () => {
    setIsFlipped(false);
    setTimeout(
      () => setCurrentIndex((i) => Math.min(flashcards.length - 1, i + 1)),
      100
    );
  };

  const recordAnswer = async (correct: boolean) => {
    setLocalCorrect((prev) => ({ ...prev, [currentIndex]: correct }));
    onProgressUpdate?.({ type: "flashcard", index: currentIndex, correct });
    if (studySetId) {
      try {
        const res = await fetch(`/api/study-sets/${studySetId}/progress`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "flashcard",
            flashcardIndex: currentIndex,
            correct,
          }),
        });
        if (res.ok) onProgressUpdate?.();
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="py-6 space-y-6">
      {studySetId && hasAnyProgress && (
        <div className="mb-4">
          <ProgressBar
            correct={totalCorrect}
            wrong={totalWrong}
            total={flashcards.length}
            label="Flashcard progress"
          />
        </div>
      )}

      {/* Card */}
      <div
        className={`flip-card w-full h-52 ${isFlipped ? "flipped" : ""}`}
        onClick={() => !isFlipped && setIsFlipped(true)}
        role="button"
        aria-label="Click to flip card"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            if (!isFlipped) setIsFlipped(true);
          }
        }}
      >
        <div className="flip-card-inner w-full h-full">
          <div className="flip-card-front bg-white border border-notion-border rounded-lg p-8 flex flex-col justify-center">
            <p className="text-[11px] text-notion-muted tracking-[0.06em] uppercase mb-3 font-medium">
              Question
            </p>
            <p className="text-[17px] text-notion-text font-medium leading-relaxed">
              {card.question}
            </p>
            <p className="text-[12px] text-notion-muted mt-6">
              Click to reveal answer
            </p>
          </div>
          <div className="flip-card-back bg-notion-card border border-notion-border rounded-lg p-8 flex flex-col justify-center">
            <p className="text-[11px] text-notion-muted tracking-[0.06em] uppercase mb-3 font-medium">
              Answer
            </p>
            <p className="text-[17px] text-notion-text font-medium leading-relaxed">
              {card.answer}
            </p>
            {studySetId && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    recordAnswer(true);
                  }}
                  className="text-[13px] px-3 py-1.5 rounded-md border border-notion-success text-notion-success hover:bg-notion-success/10 transition-colors"
                >
                  Got it
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    recordAnswer(false);
                  }}
                  className="text-[13px] px-3 py-1.5 rounded-md border border-notion-danger text-notion-danger hover:bg-notion-danger/10 transition-colors"
                >
                  Not yet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="text-[14px] text-notion-muted hover:text-notion-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <span className="text-[13px] text-notion-muted">
          {currentIndex + 1} / {flashcards.length}
        </span>

        <button
          onClick={goToNext}
          disabled={currentIndex === flashcards.length - 1}
          className="text-[14px] text-notion-muted hover:text-notion-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      <p className="text-center text-[12px] text-notion-muted">
        {currentIndex + 1 === flashcards.length
          ? "You've reviewed all cards!"
          : `${flashcards.length - currentIndex - 1} card${
              flashcards.length - currentIndex - 1 === 1 ? "" : "s"
            } remaining`}
      </p>
    </div>
  );
}
