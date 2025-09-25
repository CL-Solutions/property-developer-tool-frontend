"use client"

import * as React from "react"
import { useTranslations } from 'next-intl'
import { LocaleLink } from '@/components/locale-link'
import {
  AlertTriangle,
  BedDouble,
  BuildingIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  TrendingUpIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();
  
  const data = {
    user: {
      name: t('sidebar.user.name'),
      email: t('sidebar.user.email'),
      avatar: "/avatars/developer.jpg",
    },
    navMain: [
      {
        title: t('navigation.dashboard'),
        url: "/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: t('navigation.projects'),
        url: "/projects",
        icon: BuildingIcon,
      },
      {
        title: t('navigation.documentRequests'),
        url: "/document-requests",
        icon: AlertTriangle,
      },
      {
        title: t('navigation.openRooms'),
        url: "/open-rooms",
        icon: BedDouble,
      },
      {
        title: t('navigation.analytics'),
        url: "/analytics",
        icon: TrendingUpIcon,
      },
    ],
    navSecondary: [
      {
        title: t('navigation.settings'),
        url: "#",
        icon: SettingsIcon,
      },
      {
        title: t('navigation.getHelp'),
        url: "#",
        icon: HelpCircleIcon,
      },
      {
        title: t('navigation.search'),
        url: "#",
        icon: SearchIcon,
      },
    ],
    documents: [
      {
        name: t('navigation.propertyDocuments'),
        url: "/documents",
        icon: FileTextIcon,
      },
      {
        name: t('navigation.reports'),
        url: "/reports",
        icon: ClipboardListIcon,
      },
      {
        name: t('navigation.dataLibrary'),
        url: "/data",
        icon: DatabaseIcon,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <LocaleLink href="/dashboard">
                <BuildingIcon className="h-5 w-5" />
                <span className="text-base font-semibold">{t('sidebar.propertyDeveloper')}</span>
              </LocaleLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}