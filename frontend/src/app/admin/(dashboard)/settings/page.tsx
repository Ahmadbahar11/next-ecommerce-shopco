"use client"

import { useState } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppearancePage from "../appearance/page"
import StoreDetailsPage from "../store-details/page"
import NavigationPage from "../navigation/page"
import ProductMetadataPage from "../product-metadata/page"

type SettingsSection = "branding" | "store-details" | "navigation" | "metadata"

export default function SettingsPage() {
    const [section, setSection] = useState<SettingsSection>("branding")

    return (
        <div className="pb-10">
            <div className="px-4 pt-6 lg:px-6">
                <Tabs value={section} onValueChange={(value) => setSection(value as SettingsSection)}>
                    <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1">
                        <TabsTrigger value="branding">Branding</TabsTrigger>
                        <TabsTrigger value="store-details">Store Details</TabsTrigger>
                        <TabsTrigger value="navigation">Navigation Menu</TabsTrigger>
                        <TabsTrigger value="metadata">Product Metadata</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {section === "branding" && <AppearancePage />}
            {section === "store-details" && <StoreDetailsPage />}
            {section === "navigation" && <NavigationPage />}
            {section === "metadata" && <ProductMetadataPage />}
        </div>
    )
}