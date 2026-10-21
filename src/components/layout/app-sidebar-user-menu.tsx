'use client';

import React, { startTransition, useActionState } from 'react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { RiLogoutBoxLine } from '@remixicon/react';
import { signOut } from '@/features/auth/sign-out/actions/sign-out.ts';

interface Props {
  children: React.ReactNode;
}

const AppSidebarUserMenu = ({ children }: Props) => {
  const { isMobile } = useSidebar();
  const [, signOutAction] = useActionState(signOut, undefined);

  function handleSignOut() {
    startTransition(signOutAction);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            {children}
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--anchor-width)"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleSignOut}>
                <RiLogoutBoxLine />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default AppSidebarUserMenu;
