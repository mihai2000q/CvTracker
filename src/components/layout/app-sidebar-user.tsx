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
import { RiExpandUpDownLine, RiLogoutBoxLine } from '@remixicon/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import type { User } from '@/lib/types.ts';
import { signOut } from '@/features/auth/sign-out/actions/sign-out.ts';

interface Props {
  user: User;
}

const AppSidebarUser = ({ user }: Props) => {
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
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="h-8 w-8 rounded-xl after:rounded-xl">
              <AvatarFallback className="rounded-xl after:rounded-xl">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-gray-400">{user.email}</span>
            </div>
            <RiExpandUpDownLine className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
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

export default AppSidebarUser;
