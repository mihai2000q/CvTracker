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
import Link from 'next/link';
import { countJobApplications } from '@/features/job-applications/queries/count-job-applications.ts';
import { countOrganizations } from '@/features/organizations/queries/count-organizations.ts';
import { countCountries } from '@/features/countries/queries/count-countries.ts';
import { countDocuments } from '@/features/documents/queries/count-documents.ts';

interface SidebarCounts {
  jobs: number;
  organizations: number;
  countries: number;
  documents: number;
}

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  count: keyof SidebarCounts;
}

const menuItems: MenuItem[] = [
  { href: '/jobs', label: 'Jobs', icon: <RiBriefcaseLine />, count: 'jobs' },
  { href: '/organizations', label: 'Organizations', icon: <RiBuilding2Line />, count: 'organizations' },
  { href: '/countries', label: 'Countries', icon: <RiGlobalLine />, count: 'countries' },
  { href: '/documents', label: 'Documents', icon: <RiFileTextLine />, count: 'documents' },
];

const AppSidebarCore = ({ counts }: { counts?: SidebarCounts }) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Core</SidebarGroupLabel>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton render={<Link href={item.href} />}>
              {item.icon}
              <span>{item.label}</span>
            </SidebarMenuButton>
            {counts ? (
              counts[item.count] > 0 && <SidebarMenuBadge>{counts[item.count]}</SidebarMenuBadge>
            ) : (
              <SidebarMenuBadge aria-hidden className={'bg-muted animate-pulse'} />
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export const AppSidebarCoreWithCounts = async () => {
  const [jobs, organizations, countries, documents] = await Promise.all([
    countJobApplications(),
    countOrganizations(),
    countCountries(),
    countDocuments(),
  ]);
  return <AppSidebarCore counts={{ jobs, organizations, countries, documents }} />;
};

export default AppSidebarCore;
