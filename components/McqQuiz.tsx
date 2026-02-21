"use client";

import { useState } from "react";
import type { MCQ } from "@/lib/types";
import Callout from "@/components/ui/Callout";

interface McqQuizProps {
  mcqs: MCQ[];
}

export default function McqQuiz({ mcqs }: McqQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = mcqs[currentIndex];
  const hasAnswered = selectedAnswer !== null;

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(optionIndex);
    if (optionIndex === question.correct) {
      setScore((s) => s + 1);
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
    return (
      <div className="py-12 text-center space-y-4">
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
        <button
          onClick={handleRestart}
          className="mt-4 text-[14px] text-notion-text underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          Restart quiz →
        </button>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-notion-muted tracking-[0.04em]">
          QUESTION {currentIndex + 1} OF {mcqs.length}
        </span>
        <span className="text-[12px] text-notion-muted">
          Score: {score}
        </span>
      </div>

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
          const isSelected = idx === selectedAnswer;
          const showCorrect = hasAnswered && isCorrect;
          const showWrong = hasAnswered && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
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
