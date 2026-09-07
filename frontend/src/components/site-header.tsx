"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const ROUTE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/navigation": "Navigation Menu",
  "/admin/banner": "Banner",
  "/admin/appearance": "Branding",
  "/admin/store-details": "Store Details",
  "/admin/reviews": "Reviews",
}

function titleFor(pathname: string) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]

  const match = Object.keys(ROUTE_TITLES)
    .filter((route) => route !== "/admin" && pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0]

  return match ? ROUTE_TITLES[match] : "Admin"
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{titleFor(pathname)}</h1>
      </div>
    </header>
  )
}
