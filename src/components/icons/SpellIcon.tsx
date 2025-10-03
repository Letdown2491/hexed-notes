import { cn } from "@/lib/utils";

interface SpellIconProps {
  className?: string;
}

export function SpellIcon({ className }: SpellIconProps) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 21.5l7.2-7.2" />
      <path d="M12 10l3.5-3.5" />
      <path d="M21.5 2.5l-7.2 7.2" />
      <path d="M19 5l2 2" />
      <path d="M15.5 3.5l1 1" />
      <path d="M18.5 6.5l1 1" />
      <path d="M6 18l1 1" />
      <path d="M4 16l1 1" />
      <path d="M8 20l1 1" />
    </svg>
  );
}

export default SpellIcon;
