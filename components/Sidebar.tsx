"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, LayoutDashboard, CreditCard, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/generate", label: "Generate", icon: Zap },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabaseRef.current = supabase;
      supabase.auth.getUser().then(({ data }) => setUser(data.user));
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => setUser(session?.user ?? null)
      );
      return () => listener?.subscription.unsubscribe();
    });
  }, []);

  const handleSignOut = async () => {
    if (supabaseRef.current) {
      await supabaseRef.current.auth.signOut();
    }
    window.location.href = "/";
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";
  const initial = firstName?.[0]?.toUpperCase() ?? "?";

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <Zap size={14} className="text-notion-sidebar" strokeWidth={2} />
          </div>
          <span className="text-[14px] font-semibold text-white">PrePify</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[14px] transition-colors duration-150 ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        {user ? (
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[12px] font-semibold text-white shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{firstName}</p>
              <button
                onClick={handleSignOut}
                className="text-[11px] text-white/50 hover:text-white/80 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/auth/sign-in"
            className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-[13px] text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-notion-sidebar h-screen fixed left-0 top-0 z-30">
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 h-full w-60 bg-notion-sidebar flex flex-col">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
