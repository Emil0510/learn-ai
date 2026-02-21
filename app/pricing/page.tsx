import Link from "next/link";
import Button from "@/components/ui/Button";
import { Check, Zap } from "lucide-react";

const features = [
  "Unlimited PDF uploads",
  "15 flashcards per study set",
  "10 multiple choice questions",
  "Full AI-written revision sheet",
  "Permanent storage of all study sets",
  "Priority AI processing",
];

export const metadata = {
  title: "Pricing — StudyFlash AI",
  description: "Simple, affordable pricing to supercharge your studying.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal nav */}
      <header className="h-12 border-b border-notion-border flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-5 h-5 bg-notion-text rounded flex items-center justify-center">
            <Zap size={12} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-[14px] font-semibold text-notion-text">StudyFlash AI</span>
        </Link>
        <Link
          href="/auth/sign-in"
          className="text-[14px] text-notion-muted hover:text-notion-text transition-colors"
        >
          Sign in
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-pricing mx-auto w-full">
          <div className="text-center mb-10">
            <h1 className="text-[32px] font-bold text-notion-text mb-3">
              Simple pricing.
            </h1>
            <p className="text-[15px] text-notion-muted">
              Everything you need to ace your exams.
            </p>
          </div>

          {/* Pricing card */}
          <div className="border border-notion-border rounded-lg p-8 bg-white">
            {/* Plan name */}
            <p className="text-[12px] text-notion-muted tracking-[0.06em] uppercase font-medium mb-4">
              Pro
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[48px] font-bold text-notion-text leading-none">$7</span>
              <span className="text-[15px] text-notion-muted">/month</span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check
                    size={15}
                    className="text-notion-success mt-0.5 shrink-0"
                    strokeWidth={2.5}
                  />
                  <span className="text-[15px] text-notion-text">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="border-t border-notion-border mb-6" />

            {/* CTA */}
            <Button className="w-full py-2.5 text-[15px]">
              Start Free Trial
            </Button>

            <p className="mt-4 text-[13px] text-notion-muted text-center">
              14-day free trial. No credit card required.
            </p>
          </div>

          {/* Free tier note */}
          <div className="mt-6 text-center">
            <p className="text-[13px] text-notion-muted">
              Just want to try it?{" "}
              <Link
                href="/generate"
                className="text-notion-text underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Generate without signing in →
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-notion-border py-5 px-6 text-center">
        <p className="text-[12px] text-notion-muted">
          © {new Date().getFullYear()} StudyFlash AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
