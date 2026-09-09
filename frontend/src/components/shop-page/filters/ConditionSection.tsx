"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type ConditionSectionProps = {
  value: string;
  conditions: string[];
  onChange: (value: string) => void;
};

const ConditionSection = ({ value, conditions, onChange }: ConditionSectionProps) => {
  const options = [{ value: "", label: "All" }, ...conditions.map((condition) => ({ value: condition, label: condition }))];

  return (
    <Accordion type="single" collapsible defaultValue="filter-condition">
      <AccordionItem value="filter-condition" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Condition
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex items-center flex-wrap">
            {options.map((c) => (
              <button
                key={c.value}
                type="button"
                className={cn([
                  "bg-[#F0F0F0] m-1 flex items-center justify-center px-5 py-2.5 text-sm rounded-full max-h-[39px]",
                  value === c.value && "bg-black font-medium text-white",
                ])}
                onClick={() => onChange(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ConditionSection;
