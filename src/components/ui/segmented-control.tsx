import Link from 'next/link';
import { cn } from 'cn';
import React from 'react';

interface SegmentedControlItem {
  label: string;
  href: string;
  active?: boolean;
  count?: number;
}

interface Props extends React.ComponentProps<'nav'> {
  items: SegmentedControlItem[];
  variant?: 'primary' | 'chart';
}

const ACTIVE_CLASS_NAMES = {
  primary: 'bg-primary text-primary-foreground',
  chart: 'bg-(--chart-3) text-white',
};

// A pill of links, one per view of the same list: each has its own URL, so it renders on the
// server and the active one comes from the page
function SegmentedControl({ items, variant = 'primary', className, ...props }: Props) {
  return (
    <nav
      data-slot="segmented-control"
      className={cn(
        'bg-card inline-flex w-fit items-center gap-1 rounded-full border p-1',
        className
      )}
      {...props}
    >
      {items.map(({ label, href, active, count }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[0.8125rem] font-semibold transition-colors outline-none focus-visible:ring-3',
            active ? ACTIVE_CLASS_NAMES[variant] : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {label}
          {count !== undefined && (
            <span
              className={cn(
                'text-xs font-medium tabular-nums',
              )}
            >
              {count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export { SegmentedControl };
export type { SegmentedControlItem };
