"use client";

import ReactMarkdown from "react-markdown";

interface RevisionSheetProps {
  content: string;
}

export default function RevisionSheet({ content }: RevisionSheetProps) {
  return (
    <div className="py-6">
      <div className="revision-prose max-w-content">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-[24px] font-bold text-notion-text mt-6 mb-3">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-[18px] font-semibold text-notion-text mt-5 mb-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-[16px] font-semibold text-notion-text mt-4 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-[15px] text-notion-text leading-relaxed mb-3">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-[15px] text-notion-text leading-relaxed">
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-notion-text">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-notion-muted">{children}</em>
            ),
            code: ({ children }) => (
              <code className="text-[13px] bg-notion-card border border-notion-border rounded px-1.5 py-0.5 font-mono">
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-[3px] border-notion-border pl-4 text-notion-muted my-3">
                {children}
              </blockquote>
            ),
            hr: () => <hr className="border-notion-border my-5" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
