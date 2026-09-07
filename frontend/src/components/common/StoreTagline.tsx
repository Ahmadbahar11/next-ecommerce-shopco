"use client";

import { useStoreBranding } from "@/lib/store-branding";

export default function StoreTagline() {
  const { branding } = useStoreBranding();
  return <>{branding.tagline}</>;
}
