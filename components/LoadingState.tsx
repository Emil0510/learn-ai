"use client";

import { useEffect, useState } from "react";

const steps = [
  "Reading document",
  "Extracting key concepts",
  "Generating flashcards",
  "Building quiz questions",
  "Writing revision sheet",
  "Almost done",
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);

    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(dotInterval);
    };
  }, []);

  return (
    <div className="py-12 text-center">
      <p className="text-[15px] text-notion-text font-medium animate-fade-in">
        {steps[currentStep]}
        <span className="text-notion-muted">{dots}</span>
      </p>
      <p className="text-[13px] text-notion-muted mt-2">
        This usually takes 15–30 seconds
      </p>
    </div>
  );
}
