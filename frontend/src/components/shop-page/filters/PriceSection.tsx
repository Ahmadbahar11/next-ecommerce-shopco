"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

export const PRICE_MIN = 0;
export const PRICE_MAX = 40000;

type PriceSectionProps = {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
};

const PriceSection = ({ min, max, onChange }: PriceSectionProps) => {
  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Price
        </AccordionTrigger>
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
          <Slider
            defaultValue={[min, max]}
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={500}
            label="Rs"
            onValueChange={([lo, hi]) => onChange(lo, hi)}
          />
          <div className="mb-3" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceSection;
