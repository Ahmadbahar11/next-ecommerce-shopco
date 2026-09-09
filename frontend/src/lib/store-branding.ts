"use client";

import { useEffect, useState } from "react";
import { mockBranding } from "@/lib/admin/mock-data";

export type StoreBranding = {
  storeName: string;
  tagline: string;
  logoUrl: string;
};

const STORAGE_KEY = "shopco:branding";

function readStoredBranding(): StoreBranding {
  if (typeof window === "undefined") return mockBranding;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockBranding;
    const stored = { ...mockBranding, ...JSON.parse(raw) };
    if (stored.storeName === "SHOP.CO") {
      return { ...stored, storeName: mockBranding.storeName };
    }
    return stored;
  } catch {
    return mockBranding;
  }
}

export function useStoreBranding() {
  const [branding, setBrandingState] = useState<StoreBranding>(mockBranding);

  useEffect(() => {
    setBrandingState(readStoredBranding());
  }, []);

  function setBranding(next: StoreBranding) {
    setBrandingState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable (e.g. private browsing) — edits stay in-memory only
    }
  }

  return { branding, setBranding };
}
