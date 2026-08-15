import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { startExternalGoogleSignIn } from "@/lib/externalAuth";
import { useExternalUploadAccess } from "@/lib/externalNotes";
import { isExternalDeployment } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Loader2, LogOut, Menu, Upload, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const logoUrl = "/manus-storage/study-shelf-logo_65280ab1.png";
const navigation = [{ href: "/", label: "Explore" }, { href: "/upload", label: "Upload" }, { href: "/my-notes", label: "My Notes" }];

export default function SiteHeader() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [signInPending, setSignInPending] = useState(false);
  const { user, loading, isAuthenticated, logout } = useAuth();
  const externalUploadAccess = useExternalUploadAccess(isAuthenticated);
  const canUpload = !isExternalDeployment || externalUploadAccess.data === true;
  const visibleNavigation = canUpload ? navigation : navigation.filter(item => item.href !== "/upload");
  const handleLogout = async () => {
    try { await logout(); toast.success("You have been signed out."); }
    catch { toast.error("We could not sign you out. Please try again."); }
  };
  const handleSignIn = async () => {
    if (!isExternalDeployment) { startLogin(); return; }
    setSignInPending(true);
    try { await startExternalGoogleSignIn(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "We could not open Google Sign-In. Please try again."); setSignInPending(false); }
  };

  return (
    <header className="site-header archive-header sticky top-0 z-40 backdrop-blur-md">
      <div className="container flex h-19 items-center justify-between gap-5">
        <Link href="/" className="archive-brand group flex items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="archive-brand-mark site-logo-icon grid h-11 w-11 place-items-center"><img src={logoUrl} alt="" /></span>
          <span className="site-logo-copy leading-none"><span className="archive-brand-name block">Study Shelf</span><span className="archive-brand-subtitle mt-1 block">Study archive</span></span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {visibleNavigation.map(item => <Link key={item.href} href={item.href} className={cn("archive-nav-link", location === item.href && "archive-nav-link--active")}>{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {loading ? <span className="inline-flex items-center gap-2 text-xs text-[#151c4a]/62"><Loader2 className="h-3.5 w-3.5 animate-spin" />Opening shelf</span> : isAuthenticated ? <><span className="max-w-32 truncate text-sm font-semibold text-[#151c4a]/75">{user?.name || "Member"}</span><button className="editorial-text-button" onClick={() => void handleLogout()}><LogOut className="h-3.5 w-3.5" />Sign out</button></> : <button className="editorial-button editorial-button--amber" onClick={() => void handleSignIn()} disabled={signInPending}>{signInPending ? <><Loader2 className="h-4 w-4 animate-spin" />Opening Google…</> : "Sign in to study"}</button>}
        </div>
        <button className={cn("site-menu-button grid h-10 w-10 place-items-center rounded-full border border-[#151c4a]/20 text-[#151c4a] md:hidden", isOpen && "site-menu-button--open")} onClick={() => setIsOpen(open => !open)} aria-label={isOpen ? "Close navigation" : "Open navigation"} aria-expanded={isOpen}>{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {isOpen && <div className="site-mobile-menu border-t border-[#151c4a]/12 px-4 pb-5 pt-3 md:hidden"><nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">{visibleNavigation.map(item => <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={cn("site-mobile-menu-item rounded-xl px-4 py-3 text-base font-semibold", location === item.href ? "bg-[#151c4a] text-[#fffaf0]" : "text-[#151c4a] hover:bg-[#151c4a]/7")}>{item.label}</Link>)}<div className="mt-2 border-t border-[#151c4a]/12 pt-3">{isAuthenticated ? <button className="editorial-text-button w-full justify-center" onClick={() => void handleLogout()}><LogOut className="h-3.5 w-3.5" />Sign out {user?.name ? `(${user.name})` : ""}</button> : <button className="editorial-button editorial-button--amber w-full justify-center" onClick={() => void handleSignIn()} disabled={signInPending}>{signInPending ? <><Loader2 className="h-4 w-4 animate-spin" />Opening Google…</> : <><Upload className="h-4 w-4" />Sign in to study</>}</button>}</div></nav></div>}
    </header>
  );
}
