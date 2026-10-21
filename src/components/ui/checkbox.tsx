'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { RiCheckLine, RiSubtractLine } from '@remixicon/react';
import { cn } from '@/lib/utils.ts';

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'border-input focus-visible:ring-ring/50 data-checked:bg-primary data-checked:border-primary data-checked:text-primary-foreground data-indeterminate:bg-primary data-indeterminate:border-primary data-indeterminate:text-primary-foreground flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <RiSubtractLine className={'size-3'} />
            ) : (
              <RiCheckLine className={'size-3'} />
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
