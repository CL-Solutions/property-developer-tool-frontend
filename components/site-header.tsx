'use client'

import { useTranslations } from 'next-intl'
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationCenter } from "@/components/notification-center"
import { LanguageSwitcher } from "@/components/language-switcher"

export function SiteHeader() {
  const t = useTranslations();
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{t('sidebar.propertyDeveloper')}</h1>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <NotificationCenter />
        </div>
      </div>
    </header>
  )
}