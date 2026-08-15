import { startLogin } from "@/const";
import { startExternalGoogleSignIn } from "@/lib/externalAuth";
import { isExternalDeployment } from "@/lib/supabase";
import { ArrowUpRight, Loader2, LockKeyhole } from "lucide-react";
import { useState } from "react";

type SignInGateProps = {
  title?: string;
  description?: string;
};

export default function SignInGate({
  title = "Your shared study library awaits.",
  description = "Sign in once to search the shelf, contribute your notes, and download material from your study group.",
}: SignInGateProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const beginGoogleSignIn = async () => {
    setPending(true);
    setMessage("");
    try {
      await startExternalGoogleSignIn();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not open Google Sign-In. Please try again.");
      setPending(false);
    }
  };

  return (
    <section id="sign-in" className="container scroll-mt-24 py-14 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#171b4f]/15 bg-[#171b4f] px-6 py-12 text-[#f7f1e3] shadow-[12px_14px_0_rgba(210,139,23,0.9)] sm:px-12 sm:py-16">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border border-[#f7f1e3]/25" />
        <div className="absolute bottom-8 right-8 hidden h-24 w-24 rotate-45 border border-[#f7f1e3]/20 sm:block" />
        <div className="relative max-w-2xl">
          <span className="eyebrow text-[#d28b17]">Members’ study room</span>
          <LockKeyhole className="mb-5 mt-6 h-6 w-6 text-[#d28b17]" strokeWidth={1.5} />
          <h1 className="editorial-title text-4xl leading-[1.04] sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#f7f1e3]/75">{description}</p>
          {isExternalDeployment ? (
            <div className="mt-9 max-w-md">
              <button type="button" className="editorial-button editorial-button--amber" onClick={() => void beginGoogleSignIn()} disabled={pending}>
                {pending ? <><Loader2 className="h-4 w-4 animate-spin" />Opening Google…</> : <><span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full bg-[#171b4f] text-[0.64rem] font-bold text-[#f7f1e3]">G</span>Continue with Google <ArrowUpRight className="h-4 w-4" /></>}
              </button>
              <p className="mt-4 text-xs tracking-wide text-[#f7f1e3]/60">Google keeps your study shelf private without waiting for an email link.</p>
              {message && <p className="mt-3 text-sm text-[#f7f1e3]" role="status">{message}</p>}
            </div>
          ) : <><button type="button" className="editorial-button editorial-button--amber mt-9" onClick={startLogin}>Continue with Manus<ArrowUpRight className="h-4 w-4" /></button><p className="mt-4 text-xs tracking-wide text-[#f7f1e3]/60">One click opens your secure study space.</p></>}
        </div>
      </div>
    </section>
  );
}
