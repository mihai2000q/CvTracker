import { RiExpandUpDownLine } from '@remixicon/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { getCurrentUser } from '@/lib/auth/session.ts';
import AppSidebarUserMenu from '@/components/layout/app-sidebar-user-menu.tsx';

const AppSidebarUser = async () => {
  const user = await getCurrentUser();

  return (
    <AppSidebarUserMenu>
      <Avatar className="h-8 w-8 rounded-xl">
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="text-muted-foreground truncate text-xs">{user.email}</span>
      </div>
      <RiExpandUpDownLine className="ml-auto size-4" />
    </AppSidebarUserMenu>
  );
};

export default AppSidebarUser;
