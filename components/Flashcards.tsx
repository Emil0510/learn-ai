"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/types";

interface FlashcardsProps {
  flashcards: Flashcard[];
}

export default function Flashcards({ flashcards }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = flashcards[currentIndex];

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

  return (
    <div className="py-6 space-y-6">
      {/* Card */}
      <div
        className={`flip-card w-full h-52 ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped((f) => !f)}
        role="button"
        aria-label="Click to flip card"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsFlipped((f) => !f);
        }}
      >
        <div className="flip-card-inner w-full h-full">
          {/* Front */}
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
          {/* Back */}
          <div className="flip-card-back bg-notion-card border border-notion-border rounded-lg p-8 flex flex-col justify-center">
            <p className="text-[11px] text-notion-muted tracking-[0.06em] uppercase mb-3 font-medium">
              Answer
            </p>
            <p className="text-[17px] text-notion-text font-medium leading-relaxed">
              {card.answer}
            </p>
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

      {/* Hint */}
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
