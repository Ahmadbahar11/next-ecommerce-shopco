"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tabs = [
    { value: "branding", label: "Branding", href: "/admin/settings/branding" },
    { value: "store-details", label: "Store Details", href: "/admin/settings/store-details" },
    { value: "navigation", label: "Navigation Menu", href: "/admin/settings/navigation" },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const activeTab = tabs.find((tab) => pathname.endsWith(tab.value))?.value ?? "branding"

    return (
        <>
            <div className="px-4 pt-6 lg:px-6">
                <Tabs value={activeTab} className="mb-6">
                    <TabsList>
                        {tabs.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value} asChild>
                                <Link href={tab.href}>{tab.label}</Link>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>
            {children}
        </>
    )
}