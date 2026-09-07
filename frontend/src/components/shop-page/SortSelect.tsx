"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SortSelect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "most-popular";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  return (
    <Select value={sort} onValueChange={handleChange}>
      <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="most-popular">Most Popular</SelectItem>
        <SelectItem value="low-price">Low Price</SelectItem>
        <SelectItem value="high-price">High Price</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortSelect;
