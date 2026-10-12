'use client';

import * as React from 'react';
import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import { cn } from 'cn';

function ScrollArea({
  className,
  children,
  viewportProps,
  orientation = 'vertical',
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  // Which scrollbars it can show. Each one only renders while the content actually overflows
  // in that direction, so 'horizontal' adds a bar only when something is wider than the area.
  orientation?: 'vertical' | 'horizontal' | 'both';
  // The `Viewport` is the element that actually scrolls - `Root` itself
  // doesn't (it's `position: relative`, non-scrolling). Anything that needs
  // to observe or react to scrolling (an `onScroll` handler, for example)
  // has to be attached here, not on `<ScrollArea>` itself.
  viewportProps?: ScrollAreaPrimitive.Viewport.Props;
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        {...viewportProps}
        className={cn(
          // `w-full h-full`, not `size-full`: a caller overriding just the
          // height (e.g. swapping in a `max-h-*` cap) needs that to be its
          // own utility group, not bundled into one `size-*` shorthand.
          'focus-visible:ring-ring/50 h-full w-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1',
          viewportProps?.className
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {orientation !== 'horizontal' && <ScrollBar orientation="vertical" />}
      {orientation !== 'vertical' && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-1.75 data-vertical:border-l data-vertical:border-l-transparent',
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="hover:bg-muted-foreground/40 bg-border relative flex-1 rounded-full transition-colors duration-100"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
