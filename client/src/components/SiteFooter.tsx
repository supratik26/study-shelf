import { creatorCredit } from "@/lib/creatorCredit";

export default function SiteFooter() {
  return <footer className="archive-footer border-t border-[#151c4a]/12 px-5 py-7 text-center text-sm tracking-wide text-[#151c4a]/70 sm:px-8"><p aria-label={creatorCredit}>Made with <span aria-hidden="true" className="heart-shimmer">❤️</span> by <span className="font-semibold text-[#151c4a]">Supratik</span></p></footer>;
}
