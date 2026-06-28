import { cn } from "@/lib/utils";

/** Distinctive geometric "Nexus" mark — an upward node/spark. */
export function Logo({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-primary/15" />
      <path
        d="M9 22V11l7 6 7-6v11"
        stroke="var(--color-primary)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="9" r="2.2" fill="var(--color-primary)" />
    </svg>
  );
}

export function BrandMark({
  className,
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={28} />
      {!collapsed && (
        <span className="text-[15px] font-semibold tracking-tight">Nexus</span>
      )}
    </div>
  );
}
