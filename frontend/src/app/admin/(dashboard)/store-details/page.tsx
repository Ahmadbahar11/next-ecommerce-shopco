"use client"

import { useState } from "react"

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
import { mockStoreDetails } from "@/lib/admin/mock-data"

export default function StoreDetailsPage() {
  const [details, setDetails] = useState(mockStoreDetails)
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <AdminPageHeader
        title="Store Details"
        description="Contact information and address shown to customers."
      />

      <div className="grid gap-6 px-4 lg:grid-cols-2 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact information</CardTitle>
            <CardDescription>
              Used for order support and the storefront footer.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Support email</Label>
              <Input
                id="email"
                type="email"
                value={details.email}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, email: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={details.phone}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, phone: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>Your store or warehouse address.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="address">Street address</Label>
              <Input
                id="address"
                value={details.address}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, address: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={details.city}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, city: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  value={details.state}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, state: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">ZIP / Postal code</Label>
                <Input
                  id="zip"
                  value={details.zip}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, zip: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={details.country}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, country: e.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Social links</CardTitle>
            <CardDescription>
              Shown as icons in the storefront footer.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                value={details.social.twitter}
                onChange={(e) =>
                  setDetails((d) => ({
                    ...d,
                    social: { ...d.social, twitter: e.target.value },
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={details.social.facebook}
                onChange={(e) =>
                  setDetails((d) => ({
                    ...d,
                    social: { ...d.social, facebook: e.target.value },
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={details.social.instagram}
                onChange={(e) =>
                  setDetails((d) => ({
                    ...d,
                    social: { ...d.social, instagram: e.target.value },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 px-4 lg:px-6">
        <Button onClick={save}>Save changes</Button>
        {saved && <span className="text-sm text-muted-foreground">Saved.</span>}
      </div>
    </>
  )
}
