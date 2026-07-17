import Link from "next/link";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-navy-700 text-white hover:bg-navy-800 disabled:bg-navy-200 disabled:text-white/80",
  secondary:
    "border border-navy-700 bg-white text-navy-700 hover:bg-navy-50 disabled:border-line disabled:text-ink-faint",
  danger: "bg-danger text-white hover:bg-danger/90 disabled:bg-danger/40",
  ghost: "text-ink-muted hover:bg-canvas-tint hover:text-ink",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed";

export default function Button({
  children,
  variant = "primary",
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  href,
  ...props
}) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled || loading} className={classes} {...props}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
