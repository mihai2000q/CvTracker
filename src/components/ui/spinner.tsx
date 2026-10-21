import { RiLoader4Line } from '@remixicon/react';
import { cn } from '@/lib/utils.ts';

function Spinner({ className, ...props }: React.ComponentProps<typeof RiLoader4Line>) {
  return (
    <RiLoader4Line
      data-slot="spinner"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
