"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

interface StudySetRow {
  id: string;
  title: string;
  created_at: string;
}

export default function DashboardPage() {
  const [studySets, setStudySets] = useState<StudySetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudySets = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("study_sets")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setStudySets(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudySets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this study set?");
    if (!confirmed) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("study_sets").delete().eq("id", id);
    setStudySets((prev) => prev.filter((s) => s.id !== id));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-content mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-notion-text leading-tight">
          My Study Sets
        </h1>
        <p className="text-[15px] text-notion-muted mt-1.5">
          All your generated study sets in one place.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-notion-card rounded-[6px] animate-pulse"
            />
          ))}
        </div>
      ) : studySets.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[15px] text-notion-muted">
            No study sets yet.{" "}
            <Link
              href="/generate"
              className="text-notion-text underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Generate your first one →
            </Link>
          </p>
        </div>
      ) : (
        <div className="divide-y divide-notion-border border border-notion-border rounded-lg overflow-hidden">
          {studySets.map((set) => (
            <div
              key={set.id}
              className="group flex items-center justify-between px-5 py-3.5 bg-white hover:bg-notion-hover transition-colors"
            >
              <Link
                href={`/generate?id=${set.id}`}
                className="flex-1 min-w-0 mr-4"
              >
                <span className="text-[15px] text-notion-text font-medium truncate block">
                  {set.title}
                </span>
              </Link>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[13px] text-notion-muted">
                  {formatDate(set.created_at)}
                </span>
                <button
                  onClick={() => handleDelete(set.id)}
                  className="opacity-0 group-hover:opacity-100 text-notion-muted hover:text-notion-danger transition-all"
                  aria-label="Delete study set"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
