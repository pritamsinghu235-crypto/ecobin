import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-[#04130d] hover:bg-brand-bright shadow-[0_8px_30px_-8px_var(--color-brand)] hover:shadow-[0_12px_40px_-8px_var(--color-brand)]",
  outline: "border border-line text-ink hover:border-brand/50 hover:bg-surface/60",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface/60",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

type Props = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string } & React.ComponentProps<typeof Link>)
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Button({ variant = "primary", size = "md", className, children, ...props }: Props) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if ("href" in props && props.href) {
    return (
      <Link className={classes} {...(props as React.ComponentProps<typeof Link>)}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
