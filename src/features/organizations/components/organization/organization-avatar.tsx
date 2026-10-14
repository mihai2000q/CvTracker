import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { OrganizationSummary } from '@/features/organizations/types/organization.ts';
import { cn } from '@/lib/utils.ts';

// Stable hue (0-359) derived from the id, so an organization keeps its color across renames
export const getOrganizationHue = (seed: string) =>
  [...seed].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 360, 7);

interface Props extends Omit<React.ComponentProps<typeof Avatar>, 'children'> {
  organization: Pick<OrganizationSummary, 'id' | 'name'>;
  // 'gradient' is a filled tile with a white letter, 'outline' a tinted border and letter
  variant?: 'gradient' | 'outline';
  // Sizes the letter, since it has to follow the avatar's size
  letterClassName?: string;
}

// Props (and the ref) are forwarded so it can be used as a `render` target, like a hover card trigger
const OrganizationAvatar = ({
  organization,
  variant = 'gradient',
  className,
  letterClassName,
  ...props
}: Props) => {
  const hue = getOrganizationHue(organization.id);

  return (
    <Avatar className={cn('size-13 rounded-xl', className)} {...props}>
      <AvatarFallback
        className={cn(
          'text-lg font-bold',
          variant === 'gradient' && 'text-white',
          variant === 'outline' &&
            'border border-[oklch(0.6_0.15_var(--org-hue)_/_0.65)] bg-[oklch(0.6_0.15_var(--org-hue)_/_0.12)] text-[oklch(0.45_0.15_var(--org-hue))] dark:text-[oklch(0.75_0.14_var(--org-hue))]',
          letterClassName
        )}
        style={
          variant === 'gradient'
            ? {
                backgroundImage: `linear-gradient(135deg, oklch(0.68 0.17 ${hue}), oklch(0.54 0.18 ${(hue + 35) % 360}))`,
              }
            : ({ '--org-hue': hue } as React.CSSProperties)
        }
      >
        {organization.name[0]?.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

export default OrganizationAvatar;
