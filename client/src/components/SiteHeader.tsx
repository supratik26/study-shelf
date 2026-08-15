import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { BookOpen, Loader2, LogOut, Menu, Upload, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const navigation = [
  { href: "/", label: "Library" },
  { href: "/upload", label: "Upload" },
  { href: "/my-notes", label: "My Notes" },
];

export default function SiteHeader() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("You have been signed out.");
    } catch {
      toast.error("We could not sign you out. Please try again.");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#171b4f]/15 bg-[#f7f1e3]/95 backdrop-blur-md">
      <div className="container flex h-18 items-center justify-between gap-5">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#171b4f] text-[#f7f1e3] transition-transform duration-200 group-hover:scale-105">
            <BookOpen className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span className="leading-none"><span className="block text-lg font-semibold tracking-[-0.045em] text-[#171b4f]">Study Shelf</span><span className="mt-1 block text-[0.54rem] font-semibold uppercase tracking-[0.16em] text-[#171b4f]/53">Study archive</span></span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navigation.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors",
                location === item.href
                  ? "bg-[#171b4f] text-[#f7f1e3]"
                  : "text-[#171b4f]/72 hover:bg-[#171b4f]/7 hover:text-[#171b4f]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#171b4f]/7 px-3 py-2 text-xs text-[#171b4f]/62"><Loader2 className="h-3.5 w-3.5 animate-spin" />Opening shelf</span>
          ) : isAuthenticated ? (
            <>
              <span className="max-w-32 truncate text-sm text-[#171b4f]/75">{user?.name || "Member"}</span>
              <button className="editorial-text-button" onClick={() => void handleLogout()}>
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <button className="editorial-button editorial-button--amber" onClick={startLogin}>
              Sign in to study
            </button>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-[#171b4f]/16 text-[#171b4f] md:hidden"
          onClick={() => setIsOpen(open => !open)}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-[#171b4f]/12 bg-[#f7f1e3] px-4 pb-5 pt-3 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
            {navigation.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-base",
                  location === item.href ? "bg-[#171b4f] text-[#f7f1e3]" : "text-[#171b4f] hover:bg-[#171b4f]/7",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-[#171b4f]/12 pt-3">
              {isAuthenticated ? (
                <button className="editorial-text-button w-full justify-center" onClick={() => void handleLogout()}>
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out {user?.name ? `(${user.name})` : ""}
                </button>
              ) : (
                <button className="editorial-button editorial-button--amber w-full justify-center" onClick={startLogin}>
                  <Upload className="h-4 w-4" />
                  Sign in to study
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
