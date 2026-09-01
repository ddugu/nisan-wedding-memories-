import Link from "next/link";

type Variant = "primary" | "outline" | "ghost" | "light" | "wine";

interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  ariaLabel?: string;
}

const styles: Record<Variant, string> = {
  primary: "bg-terracotta text-bg border border-terracotta hover:bg-terracotta-hover rounded-md",
  outline: "bg-transparent text-ink border border-line hover:border-terracotta hover:text-terracotta rounded-md",
  ghost: "bg-transparent text-ink border-transparent hover:text-terracotta rounded-md",
  light: "bg-bg-surface text-ink border border-line hover:border-terracotta/40 rounded-md",
  wine: "bg-wine text-bg border border-wine hover:opacity-90 rounded-md",
};

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
  fullWidth,
  ariaLabel,
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] text-[0.75rem] font-semibold tracking-[0.08em] uppercase transition-all duration-300 rounded-lg disabled:opacity-40 disabled:pointer-events-none ${fullWidth ? "w-full" : ""} ${styles[variant]} ${className}`;

  if (href) return <Link href={href} className={cls} aria-label={ariaLabel}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
