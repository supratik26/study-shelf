export const creatorCredit = "Made with ❤️ by Supratik";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#171b4f]/10 bg-[#f7f1e3]/70 px-5 py-5 text-center text-sm tracking-wide text-[#171b4f]/70 sm:px-8">
      <p aria-label={creatorCredit}>
        Made with <span aria-hidden="true" className="heart-shimmer">❤️</span> by <span className="font-semibold text-[#171b4f]">Supratik</span>
      </p>
    </footer>
  );
}
