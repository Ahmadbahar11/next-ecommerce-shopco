"use client";

import Link from "next/link";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type FilterCategory = {
  name: string;
  slug: string;
};

const CategoriesSection = ({ categories }: { categories: FilterCategory[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("category");

  const hrefFor = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (current === slug) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    params.delete("subCategory");
    params.delete("page");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={hrefFor(category.slug)}
          onClick={(e) => {
            e.preventDefault();
            router.push(hrefFor(category.slug));
            router.refresh();
          }}
          className={cn(
            "flex items-center justify-between py-2",
            current === category.slug && "text-black font-medium"
          )}
        >
          {category.name} <MdKeyboardArrowRight />
        </Link>
      ))}
    </div>
  );
};

export default CategoriesSection;
