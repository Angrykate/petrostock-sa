import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Fil d'Ariane + retour pour les sous-pages (hors menu) */
export default function SubNav({ parentHref, parentLabel, current }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
      <Link
        href={parentHref}
        className="inline-flex items-center gap-1.5 font-medium text-navy-700 hover:underline"
      >
        <ArrowLeft size={14} />
        Retour — {parentLabel}
      </Link>
      <span className="text-ink-faint">/</span>
      <span className="text-ink-muted">{current}</span>
    </div>
  );
}
