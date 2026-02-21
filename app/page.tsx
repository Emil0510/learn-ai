import Link from "next/link";
import { Brain, FileText, Zap } from "lucide-react";
import Button from "@/components/ui/Button";

const features = [
  {
    icon: FileText,
    title: "Upload any PDF",
    description:
      "Lecture notes, textbook chapters, research papers — any educational PDF works.",
  },
  {
    icon: Brain,
    title: "AI-powered study materials",
    description:
      "GPT-4o reads your content and generates flashcards, MCQs, and a full revision sheet.",
  },
  {
    icon: Zap,
    title: "Ready in seconds",
    description:
      "No manual work. Your entire study set is generated and ready to review instantly.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal top nav */}
      <header className="h-12 border-b border-notion-border flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-notion-text rounded flex items-center justify-center">
            <Zap size={12} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-[14px] font-semibold text-notion-text">StudyFlash AI</span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/pricing"
            className="text-[14px] text-notion-muted hover:text-notion-text transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/auth/sign-in"
            className="text-[14px] text-notion-muted hover:text-notion-text transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-landing mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-notion-border bg-notion-card text-[12px] text-notion-muted mb-8 tracking-[0.04em]">
            <Zap size={11} strokeWidth={1.5} />
            Powered by GPT-4o
          </div>

          <h1 className="text-[42px] sm:text-[52px] font-bold text-notion-text leading-[1.1] tracking-tight mb-5">
            Turn any PDF into
            <br />a study set.
          </h1>
          <p className="text-[17px] text-notion-muted leading-relaxed max-w-[480px] mx-auto mb-10">
            Upload your notes or textbook. Get flashcards, MCQs, and a
            revision sheet instantly.
          </p>

          <Link href="/generate">
            <Button size="md" className="px-6 py-2.5 text-[15px]">
              Get started for free
            </Button>
          </Link>

          {/* Features */}
          <div className="mt-20 text-left space-y-0 divide-y divide-notion-border border border-notion-border rounded-lg overflow-hidden max-w-[520px] mx-auto">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 px-5 py-4 bg-white hover:bg-notion-hover transition-colors">
                <div className="mt-0.5 shrink-0">
                  <Icon size={16} className="text-notion-muted" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-notion-text mb-0.5">{title}</p>
                  <p className="text-[14px] text-notion-muted leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-notion-border py-5 px-6 text-center">
        <p className="text-[12px] text-notion-muted">
          © {new Date().getFullYear()} StudyFlash AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

