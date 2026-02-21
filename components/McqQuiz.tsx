"use client";

import { useState, useMemo } from "react";
import type { MCQ } from "@/lib/types";
import Callout from "@/components/ui/Callout";
import ProgressBar from "@/components/ui/ProgressBar";

type SavedAnswer = { index: number; selectedOption: number; correct: boolean };

interface McqQuizProps {
  mcqs: MCQ[];
  studySetId?: string;
  savedMcqAnswers?: Map<number, SavedAnswer>;
  lastScore?: { correct: number; total: number };
  onProgressUpdate?: (
    update?: { type: "mcq"; index: number; selectedOption: number; correct: boolean }
  ) => void;
}

function getFirstUnansweredIndex(
  total: number,
  saved: Map<number, SavedAnswer>
): number {
  for (let i = 0; i < total; i++) if (!saved.has(i)) return i;
  return total;
}

export default function McqQuiz({
  mcqs,
  studySetId,
  savedMcqAnswers,
  lastScore,
  onProgressUpdate,
}: McqQuizProps) {
  const saved = savedMcqAnswers ?? new Map<number, SavedAnswer>();

  const { initialIndex, initialScore, initialFinished } = useMemo(() => {
    const correctCount = Array.from(saved.values()).filter((v) => v.correct).length;
    const firstUnanswered = getFirstUnansweredIndex(mcqs.length, saved);
    return {
      initialIndex: firstUnanswered < mcqs.length ? firstUnanswered : 0,
      initialScore: correctCount,
      initialFinished: saved.size > 0 && saved.size >= mcqs.length,
    };
  }, [mcqs.length, saved]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(initialScore);
  const [isFinished, setIsFinished] = useState(initialFinished);

  const question = mcqs[currentIndex];
  const savedForCurrent = saved.get(currentIndex);
  const hasAnswered = selectedAnswer !== null || savedForCurrent !== undefined;
  const displayedAnswer =
    selectedAnswer ?? savedForCurrent?.selectedOption ?? null;
  const displayedCorrect =
    displayedAnswer !== null
      ? savedForCurrent?.correct ?? displayedAnswer === question.correct
      : false;

  const handleSelectOption = async (optionIndex: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(optionIndex);
    const correct = optionIndex === question.correct;
    if (correct) setScore((s) => s + 1);

    onProgressUpdate?.({
      type: "mcq",
      index: currentIndex,
      selectedOption: optionIndex,
      correct,
    });
    if (studySetId) {
      try {
        const res = await fetch(`/api/study-sets/${studySetId}/progress`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "mcq",
            mcqIndex: currentIndex,
            selectedOption: optionIndex,
            correct,
          }),
        });
        if (res.ok) onProgressUpdate?.();
      } catch {
        // ignore
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const wrong = mcqs.length - score;
    return (
      <div className="py-12 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-[32px] font-bold text-notion-text">
            You scored {score} / {mcqs.length}
          </p>
          <p className="text-[15px] text-notion-muted">
            {score === mcqs.length
              ? "Perfect score! Excellent work."
              : score >= mcqs.length * 0.7
              ? "Great job! Keep reviewing the ones you missed."
              : "Keep studying and try again!"}
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <ProgressBar
            correct={score}
            wrong={wrong}
            total={mcqs.length}
            label="This run"
          />
        </div>
        <div className="text-center">
          <button
            onClick={handleRestart}
            className="text-[14px] text-notion-text underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Restart quiz →
          </button>
        </div>
      </div>
    );
  }

  const answeredSoFar = currentIndex + (hasAnswered ? 1 : 0);
  const wrongSoFar = answeredSoFar - score;

  return (
    <div className="py-6 space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-notion-muted tracking-[0.04em]">
          QUESTION {currentIndex + 1} OF {mcqs.length}
        </span>
        <div className="flex items-center gap-3">
          {lastScore !== undefined && (
            <span className="text-[12px] text-notion-muted">
              Last score: {lastScore.correct}/{lastScore.total}
            </span>
          )}
          <span className="text-[12px] text-notion-muted">
            Score: {score}
          </span>
        </div>
      </div>

      {/* Progress bar: this run so far */}
      {answeredSoFar > 0 && (
        <ProgressBar
          correct={score}
          wrong={wrongSoFar}
          total={mcqs.length}
          label="This run"
        />
      )}

      {/* Visual Element (if this question has a graph/diagram) */}
      {question.image_url && (
        <div className="border border-notion-border rounded-lg overflow-hidden bg-white">
          <img
            src={question.image_url}
            alt="Question visual reference"
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Question */}
      <p className="text-[17px] font-medium text-notion-text leading-relaxed">
        {question.question}
      </p>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const isCorrect = idx === question.correct;
          const isSelected = idx === displayedAnswer;
          const showCorrect = hasAnswered && isCorrect;
          const showWrong = hasAnswered && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              onClick={() => void handleSelectOption(idx)}
              disabled={hasAnswered}
              className={`w-full text-left px-4 py-3 border rounded-[6px] text-[15px] transition-colors duration-150 ${
                showCorrect
                  ? "border-notion-success bg-notion-success-bg border-l-[3px]"
                  : showWrong
                  ? "border-notion-danger bg-notion-danger-bg border-l-[3px]"
                  : hasAnswered
                  ? "border-notion-border text-notion-muted cursor-default"
                  : "border-notion-border hover:bg-notion-hover cursor-pointer"
              }`}
            >
              <span
                className={
                  showCorrect
                    ? "text-notion-success font-medium"
                    : showWrong
                    ? "text-notion-danger font-medium"
                    : "text-notion-text"
                }
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {hasAnswered && (
        <div className="animate-fade-in">
          <Callout>
            <p className="text-[13px] text-notion-muted font-medium mb-1">Explanation</p>
            <p className="text-[14px] text-notion-text leading-relaxed">
              {question.explanation}
            </p>
          </Callout>
        </div>
      )}

      {/* Next */}
      {hasAnswered && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleNext}
            className="text-[14px] text-notion-muted hover:text-notion-text transition-colors"
          >
            {currentIndex < mcqs.length - 1 ? "Next →" : "See results →"}
          </button>
        </div>
      )}
    </div>
  );
}
