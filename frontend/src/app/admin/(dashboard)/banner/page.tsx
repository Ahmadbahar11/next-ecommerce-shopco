"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { mockBanner } from "@/lib/admin/mock-data"

export default function BannerPage() {
  const [banner, setBanner] = useState(mockBanner)
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <AdminPageHeader
        title="Banner"
        description="Manage the announcement bar shown at the top of the storefront."
      />

      <div className="grid gap-6 px-4 lg:grid-cols-2 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Toggle the banner on or off and edit its message.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="banner-enabled">Show banner</Label>
                <p className="text-sm text-muted-foreground">
                  Displayed above the navbar on every page.
                </p>
              </div>
              <Switch
                id="banner-enabled"
                checked={banner.enabled}
                onCheckedChange={(checked) =>
                  setBanner((b) => ({ ...b, enabled: checked }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="banner-text">Message</Label>
              <Input
                id="banner-text"
                value={banner.text}
                onChange={(e) =>
                  setBanner((b) => ({ ...b, text: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cta-label">Link text</Label>
                <Input
                  id="cta-label"
                  value={banner.ctaLabel}
                  onChange={(e) =>
                    setBanner((b) => ({ ...b, ctaLabel: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cta-url">Link URL</Label>
                <Input
                  id="cta-url"
                  value={banner.ctaUrl}
                  onChange={(e) =>
                    setBanner((b) => ({ ...b, ctaUrl: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={save}>Save changes</Button>
              {saved && (
                <span className="text-sm text-muted-foreground">Saved.</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How it looks on the storefront.</CardDescription>
          </CardHeader>
          <CardContent>
            {banner.enabled ? (
              <div className="overflow-hidden rounded-md bg-black px-2 py-2 text-center text-white sm:px-4">
                <div className="relative mx-auto max-w-md">
                  <p className="text-xs sm:text-sm">
                    {banner.text || "Your announcement text"}{" "}
                    <span className="font-medium underline">
                      {banner.ctaLabel || "Call to action"}
                    </span>
                  </p>
                  <XIcon className="absolute right-0 top-1/2 hidden size-3.5 -translate-y-1/2 sm:block" />
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                Banner is hidden on the storefront.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
