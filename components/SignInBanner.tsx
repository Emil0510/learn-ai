import Link from "next/link";

export default function SignInBanner() {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-notion-card border border-notion-border rounded-[6px] text-[13px]">
      <span className="text-notion-muted">
        Sign in to save your results and access them later.
      </span>
      <Link
        href="/auth/sign-in"
        className="ml-4 text-notion-text font-medium underline underline-offset-2 shrink-0 hover:opacity-70 transition-opacity"
      >
        Sign in →
      </Link>
    </div>
  );
}
