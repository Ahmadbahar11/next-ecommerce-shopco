"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const DressStyleSection = ({ brands }: { brands: string[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("brand");

  const hrefFor = (brand: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (current === brand) {
      params.delete("brand");
    } else {
      params.set("brand", brand);
    }
    params.delete("page");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-style">
      <AccordionItem value="filter-style" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Brand
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex flex-col text-black/60 space-y-0.5">
            {brands.map((brand) => (
              <Link
                key={brand}
                href={hrefFor(brand)}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(hrefFor(brand));
                  router.refresh();
                }}
                className={cn(
                  "flex items-center justify-between py-2",
                  current === brand && "text-black font-medium"
                )}
              >
                {brand} <MdKeyboardArrowRight />
              </Link>
            ))}
            {brands.length === 0 && (
              <span className="text-sm text-black/40">No brands yet</span>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DressStyleSection;
