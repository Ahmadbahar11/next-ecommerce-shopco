"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { UploadIcon } from "lucide-react"
import { toast } from "sonner"

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
import { Textarea } from "@/components/ui/textarea"
import { useStoreBranding } from "@/lib/store-branding"

export default function AppearancePage() {
  const { branding, setBranding } = useStoreBranding()
  const [draft, setDraft] = useState(branding)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(branding)
  }, [branding])

  function save() {
    setBranding(draft)
    setSaved(true)
    toast.success("Branding saved successfully")
    setTimeout(() => setSaved(false), 2000)
  }

  function onLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setDraft((d) => ({ ...d, logoUrl: url }))
  }

  return (
    <>
      <AdminPageHeader
        title="Branding"
        description="Manage your store's logo, name, and tagline shown across the site."
      />

      <div className="grid gap-6 px-4 lg:grid-cols-2 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>
              Shown in the storefront navbar and footer.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center overflow-hidden rounded-md border bg-muted">
                {draft.logoUrl ? (
                  <Image
                    src={draft.logoUrl}
                    alt="Logo preview"
                    width={64}
                    height={64}
                    className="size-full object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    {draft.storeName || "Logo"}
                  </span>
                )}
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon />
                  Upload logo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onLogoSelected}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Preview only for this browser session — use the Logo URL
                  field below for a logo that persists after a page reload.
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                placeholder="https://..."
                value={draft.logoUrl}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, logoUrl: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store identity</CardTitle>
            <CardDescription>
              Displayed in the header, footer, and browser tab.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="store-name">Store name</Label>
              <Input
                id="store-name"
                value={draft.storeName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, storeName: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea
                id="tagline"
                rows={3}
                value={draft.tagline}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, tagline: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={save}>Save changes</Button>
              {saved && (
                <span className="text-sm text-muted-foreground">
                  Saved — live on the storefront now.
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
