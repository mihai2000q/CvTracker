import React from 'react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar.tsx';
import { RiBriefcaseLine, RiBuilding2Line, RiFileTextLine, RiGlobalLine } from '@remixicon/react';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { href: '/jobs', label: 'Jobs', icon: <RiBriefcaseLine /> },
  { href: '/organizations', label: 'Organizations', icon: <RiBuilding2Line /> },
  { href: '/countries', label: 'Countries', icon: <RiGlobalLine /> },
  { href: '/documents', label: 'Documents', icon: <RiFileTextLine /> },
];

const AppSidebarCore = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Core</SidebarGroupLabel>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton render={<a href={item.href} />}>
              {item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>23</SidebarMenuBadge>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default AppSidebarCore;
