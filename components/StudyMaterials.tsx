"use client";

import { useState } from "react";
import Tabs from "@/components/ui/Tabs";
import Flashcards from "@/components/Flashcards";
import McqQuiz from "@/components/McqQuiz";
import RevisionSheet from "@/components/RevisionSheet";
import type { GenerateResponse } from "@/lib/types";

const TAB_IDS = {
  FLASHCARDS: "flashcards",
  MCQS: "mcqs",
  REVISION: "revision",
};

interface StudyMaterialsProps {
  data: GenerateResponse;
}

export default function StudyMaterials({ data }: StudyMaterialsProps) {
  const [activeTab, setActiveTab] = useState(TAB_IDS.FLASHCARDS);

  const tabs = [
    {
      id: TAB_IDS.FLASHCARDS,
      label: "Flashcards",
      count: data.flashcards.length,
    },
    { id: TAB_IDS.MCQS, label: "MCQs", count: data.mcqs.length },
    { id: TAB_IDS.REVISION, label: "Revision Sheet" },
  ];

  return (
    <div className="animate-fade-in space-y-0">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-2">
        {activeTab === TAB_IDS.FLASHCARDS && (
          <Flashcards flashcards={data.flashcards} />
        )}
        {activeTab === TAB_IDS.MCQS && <McqQuiz mcqs={data.mcqs} />}
        {activeTab === TAB_IDS.REVISION && (
          <RevisionSheet content={data.revision_sheet} />
        )}
      </div>
    </div>
  );
}
