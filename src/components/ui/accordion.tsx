import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { cn } from 'cn';
import { RiArrowDownSLine } from '@remixicon/react';

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        'relative rounded-xl',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]',
        'after:ring-1 after:ring-transparent after:transition-shadow after:duration-150 after:ring-inset',
        'data-open:after:ring-ring/50',
        className
      )}
      {...props}
    />
  );
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:after:border-ring relative flex flex-1 items-center rounded-xl border border-transparent py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-3 aria-disabled:pointer-events-none aria-disabled:opacity-50',
          'hover:bg-muted',
          className
        )}
        {...props}
      >
        {children}
        <RiArrowDownSLine
          data-slot="accordion-trigger-icon"
          className={cn(
            'transition-[color,rotate] pointer-events-none ml-auto shrink-0 duration-150',
            'text-muted-foreground size-5 group-aria-expanded/accordion-trigger:rotate-180'
          )}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden text-sm"
      {...props}
    >
      <div
        className={cn(
          '[&_a]:hover:text-foreground h-(--accordion-panel-height) pt-0 pb-4 data-ending-style:h-0 data-starting-style:h-0 [&_p:not(:last-child)]:mb-4',
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
