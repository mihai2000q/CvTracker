import type { ReactNode } from 'react';

// One choice of a control whose choices are links, such as a sort or a filter: where it goes
// and whether the page is there now
export interface LinkOption {
  label: string;
  // An element, not a component: options travel from server to client components
  icon?: ReactNode;
  href: string;
  active: boolean;
}
