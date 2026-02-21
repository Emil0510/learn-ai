import { AlertCircle } from "lucide-react";

interface ErrorCalloutProps {
  message: string;
}

export default function ErrorCallout({ message }: ErrorCalloutProps) {
  return (
    <div className="flex gap-3 px-4 py-3 bg-notion-danger-bg border border-notion-danger rounded-[6px]">
      <AlertCircle
        size={16}
        className="text-notion-danger mt-0.5 shrink-0"
        strokeWidth={1.5}
      />
      <p className="text-[14px] text-notion-text leading-relaxed">{message}</p>
    </div>
  );
}
