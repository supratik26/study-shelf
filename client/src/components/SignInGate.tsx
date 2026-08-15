import { startLogin } from "@/const";
import { sendExternalMagicLink } from "@/lib/externalAuth";
import { isExternalDeployment } from "@/lib/supabase";
import { ArrowUpRight, Loader2, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";

type SignInGateProps = {
  title?: string;
  description?: string;
};

export default function SignInGate({
  title = "Your shared study library awaits.",
  description = "Sign in once to search the shelf, contribute your notes, and download material from your study group.",
}: SignInGateProps) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const submitEmailLink = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      await sendExternalMagicLink(email);
      setMessage("Check your email for the secure link to open your study shelf.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not send the sign-in link. Please try again.");
    } finally {
      setPending(false);
    }
  };
  return (
    <section className="container py-14 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#171b4f]/15 bg-[#171b4f] px-6 py-12 text-[#f7f1e3] shadow-[12px_14px_0_rgba(210,139,23,0.9)] sm:px-12 sm:py-16">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border border-[#f7f1e3]/25" />
        <div className="absolute bottom-8 right-8 hidden h-24 w-24 rotate-45 border border-[#f7f1e3]/20 sm:block" />
        <div className="relative max-w-2xl">
          <span className="eyebrow text-[#d28b17]">Members’ study room</span>
          <LockKeyhole className="mb-5 mt-6 h-6 w-6 text-[#d28b17]" strokeWidth={1.5} />
          <h1 className="editorial-title text-4xl leading-[1.04] sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#f7f1e3]/75">{description}</p>
          {isExternalDeployment ? (
            <form className="mt-9 max-w-md" onSubmit={submitEmailLink}>
              <label className="sr-only" htmlFor="study-email">Email address</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input id="study-email" className="min-h-11 flex-1 rounded-full border border-[#f7f1e3]/35 bg-[#f7f1e3]/10 px-4 text-sm text-[#f7f1e3] outline-none placeholder:text-[#f7f1e3]/55 focus:border-[#d28b17]" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} required />
                <button className="editorial-button editorial-button--amber shrink-0" disabled={pending}>{pending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : <>Email me a sign-in link <ArrowUpRight className="h-4 w-4" /></>}</button>
              </div>
              <p className="mt-4 text-xs tracking-wide text-[#f7f1e3]/60">A passwordless link keeps your shared study space private.</p>
              {message && <p className="mt-3 text-sm text-[#f7f1e3]" role="status">{message}</p>}
            </form>
          ) : <><button className="editorial-button editorial-button--amber mt-9" onClick={startLogin}>Continue with Manus<ArrowUpRight className="h-4 w-4" /></button><p className="mt-4 text-xs tracking-wide text-[#f7f1e3]/60">One click opens your secure study space.</p></>}
        </div>
      </div>
    </section>
  );
}
