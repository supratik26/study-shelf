// Study Shelf reminder watcher: browser notifications are opt-in; in-app notices remain available when permission is unavailable.
import { useAuth } from "@/_core/hooks/useAuth";
import { supabase, isExternalDeployment } from "@/lib/supabase";
import { useEffect } from "react";
import { toast } from "sonner";

const deliveredKey = "study-shelf-delivered-reminders-v1";

function deliveredIds() {
  try { const value = JSON.parse(sessionStorage.getItem(deliveredKey) || "[]"); return new Set(Array.isArray(value) ? value : []); } catch { return new Set<string>(); }
}

function recordDelivery(id: string) {
  const current = deliveredIds(); current.add(id);
  try { sessionStorage.setItem(deliveredKey, JSON.stringify(Array.from(current).slice(-100))); } catch { /* optional enhancement only */ }
}

export async function requestStudyNotifications() {
  if (!("Notification" in window)) throw new Error("This browser does not support device notifications.");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Device notifications remain off. You can still see reminders in Study Space.");
  return permission;
}

export default function ReminderNotifier() {
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isExternalDeployment || !isAuthenticated || !user?.id) return;
    let active = true;
    const check = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase.from("note_reminders").select("id,title,reminder_at").eq("user_id", String(user.id)).eq("is_done", false).lte("reminder_at", now).order("reminder_at", { ascending: true });
      if (!active || !data?.length) return;
      const delivered = deliveredIds();
      for (const reminder of data) {
        if (delivered.has(reminder.id)) continue;
        recordDelivery(reminder.id);
        toast(`Revision reminder: ${reminder.title}`, { description: "Open Study Space when you are ready to mark it complete." });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            const registration = await navigator.serviceWorker?.ready;
            if (registration) await registration.showNotification("Study Shelf reminder", { body: reminder.title, icon: "/study-shelf-icon.svg", tag: `study-shelf-${reminder.id}` });
            else new Notification("Study Shelf reminder", { body: reminder.title });
          } catch { /* toast already provides the in-app fallback */ }
        }
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 60_000);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [isAuthenticated, user?.id]);
  return null;
}
