"use client"

import * as React from "react"
import {
  BarChartIcon,
  HelpCircleIcon,
  ImageIcon,
  LayoutDashboardIcon,
  ListTreeIcon,
  MapPinIcon,
  MegaphoneIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SquareMenuIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react"

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

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: ShoppingCartIcon,
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: UsersIcon,
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChartIcon,
    },
  ],
  navStore: [
    {
      title: "Products",
      url: "/admin/products",
      icon: PackageIcon,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: ListTreeIcon,
    },
    {
      title: "Navigation Menu",
      url: "/admin/navigation",
      icon: SquareMenuIcon,
    },
    {
      title: "Banner",
      url: "/admin/banner",
      icon: MegaphoneIcon,
    },
    {
      title: "Branding",
      url: "/admin/appearance",
      icon: ImageIcon,
    },
    {
      title: "Store Details",
      url: "/admin/store-details",
      icon: MapPinIcon,
    },
    {
      title: "Reviews",
      url: "/admin/reviews",
      icon: StarIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/admin">
                <ShoppingBagIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Shopco Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain items={data.navStore} label="Store Management" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
