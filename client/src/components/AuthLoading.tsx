import { Loader2 } from "lucide-react";

export default function AuthLoading({ label = "Opening the shelf" }: { label?: string }) {
  return (
    <main className="container grid min-h-[62vh] place-items-center py-16">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#171b4f] text-[#f7f1e3] shadow-[4px_4px_0_rgba(210,139,23,0.75)]"><Loader2 className="h-5 w-5 animate-spin" /></span>
        <p className="mt-5 text-sm uppercase tracking-[0.19em] text-[#171b4f]/62">{label}</p>
      </div>
    </main>
  );
}
