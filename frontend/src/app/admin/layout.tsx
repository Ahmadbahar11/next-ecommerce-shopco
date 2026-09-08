import type { Metadata } from "next";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";

export const metadata: Metadata = {
  title: "Shopco Admin",
  description: "Admin dashboard for managing Shopco",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
