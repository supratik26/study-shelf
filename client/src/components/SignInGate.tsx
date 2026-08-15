import { startLogin } from "@/const";
import { startExternalGoogleSignIn } from "@/lib/externalAuth";
import { isExternalDeployment } from "@/lib/supabase";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useState } from "react";

type SignInGateProps = { title?: string; description?: string };
const logoUrl = "/manus-storage/study-shelf-logo_65280ab1.png";

export default function SignInGate({ title = "The archive is open.", description = "A curated collection of high-quality study materials for your academic journey. Share notes, discover resources, and elevate your learning." }: SignInGateProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const beginGoogleSignIn = async () => { setPending(true); setMessage(""); try { await startExternalGoogleSignIn(); } catch (error) { setMessage(error instanceof Error ? error.message : "We could not open Google Sign-In. Please try again."); setPending(false); } };
  return (
    <section id="sign-in" className="archive-landing container scroll-mt-24">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
        <div className="archive-landing-copy motion-rise"><p className="eyebrow mb-7">A shared study archive</p><h1 className="archive-landing-title">{title}</h1><p className="mt-8 max-w-xl text-[#151c4a]/78">{description}</p>{isExternalDeployment ? <div className="mt-9"><button type="button" className="editorial-button editorial-button--amber" onClick={() => void beginGoogleSignIn()} disabled={pending}>{pending ? <><Loader2 className="h-4 w-4 animate-spin" />Opening Google…</> : <><span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full bg-[#151c4a] text-[0.64rem] font-bold text-[#fffaf0]">G</span>Continue with Google <ArrowUpRight className="h-4 w-4" /></>}</button><p className="mt-4 text-xs font-medium tracking-wide text-[#151c4a]/58">Google keeps your study shelf private without waiting for an email link.</p>{message && <p className="mt-3 text-sm text-[#b24842]" role="status">{message}</p>}</div> : <div className="mt-9"><button type="button" className="editorial-button editorial-button--amber" onClick={startLogin}>Continue with Manus<ArrowUpRight className="h-4 w-4" /></button></div>}</div>
        <div className="archive-hero-card motion-reveal motion-stagger-2" aria-hidden="true"><img className="archive-hero-logo" src={logoUrl} alt="" /></div>
      </div>
    </section>
  );
}
