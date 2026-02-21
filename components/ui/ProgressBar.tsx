"use client";

interface ProgressBarProps {
  correct: number;
  wrong: number;
  total: number;
  label?: string;
  showCounts?: boolean;
  className?: string;
}

export default function ProgressBar({
  correct,
  wrong,
  total,
  label,
  showCounts = true,
  className = "",
}: ProgressBarProps) {
  const answered = correct + wrong;
  const correctPct = total > 0 ? (correct / total) * 100 : 0;
  const wrongPct = total > 0 ? (wrong / total) * 100 : 0;
  const unansweredPct = total > 0 ? ((total - answered) / total) * 100 : 100;

  return (
    <div className={className}>
      {(label || showCounts) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-[12px] font-medium text-notion-muted">
              {label}
            </span>
          )}
          {showCounts && (
            <span className="text-[12px] text-notion-muted">
              <span className="text-notion-success">{correct} correct</span>
              {" · "}
              <span className="text-notion-danger">{wrong} wrong</span>
              {answered < total && (
                <> · {total - answered} not yet answered</>
              )}
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-notion-border overflow-hidden flex">
        {correct > 0 && (
          <div
            className="h-full bg-notion-success transition-all duration-300"
            style={{ width: `${correctPct}%` }}
            title={`${correct} correct`}
          />
        )}
        {wrong > 0 && (
          <div
            className="h-full bg-notion-danger transition-all duration-300"
            style={{ width: `${wrongPct}%` }}
            title={`${wrong} wrong`}
          />
        )}
        {answered < total && (
          <div
            className="h-full bg-notion-hover flex-1 transition-all duration-300"
            style={{ width: `${unansweredPct}%` }}
            title={`${total - answered} not answered`}
          />
        )}
      </div>
    </div>
  );
}
