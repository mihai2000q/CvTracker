import React from 'react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarLink,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
} from '@/components/ui/sidebar.tsx';
import {
  RiBriefcaseFill,
  RiBriefcaseLine,
  RiBuilding2Fill,
  RiBuilding2Line,
  RiEarthFill,
  RiEarthLine,
  RiFileTextFill,
  RiFileTextLine,
} from '@remixicon/react';
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
  activeIcon: React.ReactNode;
  count: keyof SidebarCounts;
}

const menuItems: MenuItem[] = [
  {
    href: '/jobs',
    label: 'Jobs',
    icon: <RiBriefcaseLine />,
    activeIcon: <RiBriefcaseFill />,
    count: 'jobs',
  },
  {
    href: '/organizations',
    label: 'Organizations',
    icon: <RiBuilding2Line />,
    activeIcon: <RiBuilding2Fill />,
    count: 'organizations',
  },
  {
    href: '/countries',
    label: 'Countries',
    icon: <RiEarthLine />,
    activeIcon: <RiEarthFill />,
    count: 'countries',
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: <RiFileTextLine />,
    activeIcon: <RiFileTextFill />,
    count: 'documents',
  },
];

const AppSidebarCore = ({ counts }: { counts?: SidebarCounts }) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Core</SidebarGroupLabel>
      <SidebarMenu>
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarLink href={item.href} icon={item.icon} activeIcon={item.activeIcon}>
              {item.label}
            </SidebarLink>
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
