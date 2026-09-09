"use client";

import React, { useState } from "react";
import CategoriesSection, { FilterCategory } from "@/components/shop-page/filters/CategoriesSection";
import DressStyleSection from "@/components/shop-page/filters/DressStyleSection";
import PriceSection, { PRICE_MAX, PRICE_MIN } from "@/components/shop-page/filters/PriceSection";
import ConditionSection from "@/components/shop-page/filters/ConditionSection";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FiltersProps = {
  categories: FilterCategory[];
  brands: string[];
  conditions: string[];
  onApplied?: () => void;
};

const Filters = ({ categories, brands, conditions, onApplied }: FiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState<number>(
    Number(searchParams.get("minPrice")) || PRICE_MIN
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    Number(searchParams.get("maxPrice")) || PRICE_MAX
  );
  const [condition, setCondition] = useState<string>(
    searchParams.get("condition") ?? ""
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice > PRICE_MIN) params.set("minPrice", String(minPrice));
    else params.delete("minPrice");

    if (maxPrice < PRICE_MAX) params.set("maxPrice", String(maxPrice));
    else params.delete("maxPrice");

    if (condition) params.set("condition", condition);
    else params.delete("condition");

    params.delete("page");

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    router.refresh();
    onApplied?.();
  };

  return (
    <>
      <hr className="border-t-black/10" />
      <CategoriesSection categories={categories} />
      <hr className="border-t-black/10" />
      <PriceSection
        min={minPrice}
        max={maxPrice}
        onChange={(lo, hi) => {
          setMinPrice(lo);
          setMaxPrice(hi);
        }}
      />
      <hr className="border-t-black/10" />
      <ConditionSection value={condition} conditions={conditions} onChange={setCondition} />
      <hr className="border-t-black/10" />
      <DressStyleSection brands={brands} />
      <Button
        type="button"
        onClick={applyFilters}
        className="bg-black w-full rounded-full text-sm font-medium py-4 h-12"
      >
        Apply Filter
      </Button>
    </>
  );
};

export default Filters;
