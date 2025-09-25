import { AppSidebar } from "@/components/app-sidebar"
import { PropertyDashboard } from "@/components/property-dashboard"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <PropertyDashboard />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
