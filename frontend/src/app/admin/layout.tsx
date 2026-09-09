import type { Metadata } from "next";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";

export const metadata: Metadata = {
  title: "Thrift Quest PK Admin",
  description: "Admin dashboard for managing Thrift Quest PK",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
