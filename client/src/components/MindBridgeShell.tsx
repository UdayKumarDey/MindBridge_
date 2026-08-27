import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CloudSun,
  Compass,
  HeartHandshake,
  LayoutDashboard,
  MapPin,
  LogOut,
  Menu,
  MessageCircleHeart,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const links = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/chat", label: "Companion", icon: MessageCircleHeart },
  { href: "/library", label: "Reflect", icon: BookOpen },
  { href: "/connect", label: "Connect", icon: MapPin },
  { href: "/support", label: "Support", icon: HeartHandshake },
];

export function MindBridgeMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group" aria-label="MindBridge home">
      <span className="grid size-9 place-items-center rounded-[14px] bg-[#5B6EE1] text-white shadow-[0_10px_20px_-12px_rgba(91,110,225,0.9)] transition-transform duration-200 group-hover:-rotate-3">
        <CloudSun className="size-[19px]" strokeWidth={2.2} />
      </span>
      {!compact && <span className="font-display text-[1.28rem] font-extrabold tracking-[-0.035em] text-[#2D3142]">MindBridge</span>}
    </Link>
  );
}

export default function MindBridgeShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-[#FAFAF8] mindbridge-grid" />;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] mindbridge-grid px-5 py-8 sm:grid sm:place-items-center">
        <div className="mx-auto w-full max-w-md rounded-[28px] border border-[#E8E8E2] bg-white p-8 text-center soft-shadow sm:p-10">
          <div className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl bg-[#EEF0FF] text-[#5B6EE1]">
            <ShieldCheck className="size-7" />
          </div>
          <p className="font-display text-2xl font-extrabold tracking-[-0.035em] text-[#2D3142]">Your space is ready when you are.</p>
          <p className="mt-3 text-sm leading-6 text-[#6B7280]">Sign in to keep your check-ins and reflections connected across visits.</p>
          <Button onClick={() => startLogin()} className="mt-7 h-12 w-full rounded-xl bg-[#5B6EE1] font-semibold hover:bg-[#4C5FCB]">
            Continue securely
          </Button>
          <Link href="/" className="mt-5 inline-block text-sm font-semibold text-[#5B6EE1] hover:underline">Return home</Link>
        </div>
      </main>
    );
  }

  const current = links.find(link => link.href === location)?.label ?? "MindBridge";
  const userInitial = user.name?.slice(0, 1).toUpperCase() ?? "M";

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2D3142] lg:flex">
      <aside className="hidden w-[252px] shrink-0 flex-col border-r border-[#E8E8E2] bg-white px-4 py-5 lg:flex">
        <MindBridgeMark />
        <div className="mt-10 space-y-1">
          <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9AA0B2]">Your space</p>
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cn(
              "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
              location === href ? "bg-[#EEF0FF] text-[#4E61D8]" : "text-[#697083] hover:bg-[#F6F6F3] hover:text-[#2D3142]"
            )}>
              <Icon className="size-[18px]" strokeWidth={2} />
              {label}
            </Link>
          ))}
        </div>
        <div className="mt-auto rounded-2xl bg-[#FFF7EF] p-4">
          <div className="flex items-center gap-2 text-[#A85B12]">
            <ShieldCheck className="size-4" />
            <span className="text-xs font-bold">Need immediate support?</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#73542F]">You are not alone. A clear next step is always close by.</p>
          <Link href="/support" className="mt-3 inline-flex text-xs font-bold text-[#A85B12] hover:underline">Open support guidance</Link>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl px-2 py-2">
          <span className="grid size-9 place-items-center rounded-full bg-[#E5EFE7] text-sm font-bold text-[#4D7B5B]">{userInitial}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#2D3142]">{user.name || "MindBridge member"}</p>
            <button onClick={() => logout()} className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#7B8192] hover:text-[#5B6EE1]"><LogOut className="size-3" /> Sign out</button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#E8E8E2] bg-[#FAFAF8]/90 px-5 backdrop-blur lg:px-9">
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setMenuOpen(true)} className="grid size-10 place-items-center rounded-xl text-[#5B6EE1] hover:bg-[#EEF0FF]" aria-label="Open navigation"><Menu className="size-5" /></button>
            <MindBridgeMark compact />
          </div>
          <div className="hidden lg:block">
            <p className="font-display text-[1.15rem] font-extrabold tracking-[-0.025em]">{current}</p>
            <p className="text-xs text-[#7B8192]">A quiet place to notice what is here.</p>
          </div>
          <Link href="/support" className="inline-flex items-center gap-2 rounded-xl border border-[#F0D8B2] bg-white px-3 py-2 text-xs font-bold text-[#A85B12] transition-colors hover:bg-[#FFF7EF]">
            <ShieldCheck className="size-3.5" /> Support now
          </Link>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-6 sm:px-7 lg:px-9 lg:py-8">{children}</main>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-[#2D3142]/30" onClick={() => setMenuOpen(false)} aria-label="Close navigation overlay" />
          <nav className="relative flex h-full w-[290px] flex-col bg-white p-5 soft-shadow">
            <div className="flex items-center justify-between"><MindBridgeMark /><button onClick={() => setMenuOpen(false)} className="grid size-10 place-items-center rounded-xl hover:bg-[#F6F6F3]" aria-label="Close navigation"><X className="size-5" /></button></div>
            <div className="mt-9 space-y-1">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={cn("flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold", location === href ? "bg-[#EEF0FF] text-[#4E61D8]" : "text-[#697083]")}><Icon className="size-[18px]" />{label}</Link>)}</div>
            <div className="mt-auto border-t border-[#EFEFEA] pt-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#E5EFE7] text-sm font-bold text-[#4D7B5B]">{userInitial}</span><span className="min-w-0 flex-1 truncate text-sm font-bold">{user.name || "MindBridge member"}</span></div><button onClick={() => logout()} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#697083]"><LogOut className="size-4" /> Sign out</button></div>
          </nav>
        </div>
      )}
    </div>
  );
}
