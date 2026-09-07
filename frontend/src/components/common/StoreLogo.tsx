"use client";

import Image from "next/image";
import { useStoreBranding } from "@/lib/store-branding";

export default function StoreLogo() {
  const { branding } = useStoreBranding();

  if (branding.logoUrl) {
    return (
      <Image
        src={branding.logoUrl}
        alt={branding.storeName}
        width={140}
        height={40}
        className="h-8 w-auto object-contain"
        unoptimized
      />
    );
  }

  return <>{branding.storeName}</>;
}
