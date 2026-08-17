// Study Shelf archival assistant: a compact, compositor-friendly Goluu drawer available across study routes.
import { useAuth } from "@/_core/hooks/useAuth";
import { isExternalDeployment, supabase } from "@/lib/supabase";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const welcome: Message = {
  role: "assistant",
  content: "Hi, I’m Goluu. I can help you plan a study session, unpack a concept, or make better use of Study Shelf.",
};

const prompts = ["Plan a 45-minute study session", "How should I revise from notes?", "Help me understand a difficult concept"];

async function getAccessToken() {
  if (!isExternalDeployment) return undefined;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

export default function GoluuChat() {
  const { isAuthenticated, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  async function send(question?: string) {
    const content = (question ?? input).trim();
    if (!content || isSending || !isAuthenticated) return;
    const outgoing: Message = { role: "user", content: content.slice(0, 1_200) };
    const history = messages.slice(-6);
    setMessages(current => [...current, outgoing]);
    setInput("");
    setIsSending(true);

    try {
      const token = await getAccessToken();
      const response = await fetch("/api/goluu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: outgoing.content, history }),
      });
      const payload = await response.json() as { answer?: string; error?: string };
      const answer = payload.answer;
      if (!response.ok || !answer) throw new Error(payload.error || "Goluu could not answer right now.");
      setMessages(current => [...current, { role: "assistant", content: answer }]);
    } catch (error) {
      setMessages(current => [...current, { role: "assistant", content: error instanceof Error ? error.message : "Goluu could not answer right now. Please try again shortly." }]);
    } finally {
      setIsSending(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }

  return <div className="goluu-root">
    {isOpen ? <section className="goluu-panel" role="dialog" aria-label="Chat with Goluu" aria-modal="false">
      <header className="goluu-panel__header">
        <div className="goluu-identity"><span className="goluu-orb"><Sparkles className="h-4 w-4" /></span><span><strong>Goluu</strong><small>{loading ? "Checking access…" : isAuthenticated ? "Study companion" : "Sign in to chat"}</small></span></div>
        <button className="goluu-close motion-press" type="button" onClick={() => setIsOpen(false)} aria-label="Close Goluu"><X className="h-4 w-4" /></button>
      </header>
      <div className="goluu-messages" ref={listRef} aria-live="polite">
        {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`goluu-message goluu-message--${message.role}`}><span>{message.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : "You"}</span><p>{message.content}</p></div>)}
        {isSending && <div className="goluu-thinking motion-confirm"><Loader2 className="h-4 w-4 animate-spin" />Goluu is thinking…</div>}
      </div>
      {isAuthenticated ? <div className="goluu-suggestions">{messages.length === 1 && prompts.map(prompt => <button className="motion-press" key={prompt} type="button" onClick={() => void send(prompt)} disabled={isSending}>{prompt}</button>)}</div> : <p className="goluu-access-note">Sign in to Study Shelf to ask Goluu a question.</p>}
      <form className="goluu-compose" onSubmit={onSubmit}>
        <textarea value={input} onChange={event => setInput(event.target.value)} placeholder={isAuthenticated ? "Ask Goluu anything study-related…" : "Sign in to start chatting"} disabled={!isAuthenticated || isSending} maxLength={1_200} rows={1} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} aria-label="Message Goluu" />
        <button className="motion-press" type="submit" disabled={!input.trim() || !isAuthenticated || isSending} aria-label="Send message"><Send className="h-4 w-4" /></button>
      </form>
    </section> : null}
    <button className="goluu-launcher motion-press" type="button" onClick={() => setIsOpen(open => !open)} aria-label={isOpen ? "Close Goluu" : "Open Goluu chat"} aria-expanded={isOpen}><span><MessageCircle className="h-5 w-5" /></span><em>Ask Goluu</em></button>
  </div>;
}
