"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => setUser(data.user));
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => setUser(session?.user ?? null)
      );
      return () => listener?.subscription.unsubscribe();
    });
  }, []);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";
  const initial = firstName?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="h-12 bg-white border-b border-notion-border flex items-center px-5 justify-between md:pl-[calc(240px+20px)]">
      <button
        className="md:hidden text-notion-muted hover:text-notion-text transition-colors"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={18} strokeWidth={1.5} />
      </button>
      <div className="flex-1 md:flex-none" />
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-notion-muted hidden sm:block">{firstName}</span>
            <div className="w-7 h-7 rounded-full bg-notion-card border border-notion-border flex items-center justify-center text-[12px] font-semibold text-notion-text">
              {initial}
            </div>
          </div>
        ) : (
          <Link
            href="/auth/sign-in"
            className="text-[14px] text-notion-muted hover:text-notion-text transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
