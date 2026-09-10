import React from "react";
import PhotoSection from "./PhotoSection";
import { Product } from "@/types/product.types";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Rating from "@/components/ui/Rating";
import SizeSelection from "./SizeSelection";
import AddToCardSection from "./AddToCardSection";
import PriceDisplay from "@/components/common/PriceDisplay";

const Header = ({ data }: { data: Product }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <PhotoSection data={data} />
        </div>
        <div>
          {(data.brand || data.condition) && (
            <div className="flex items-center gap-2 mb-2">
              {data.brand && (
                <span className="text-black/50 text-sm uppercase tracking-wide">
                  {data.brand}
                </span>
              )}
              {data.condition && (
                <span
                  className={cn([
                    "rounded-full bg-[#F0F0F0] px-2.5 py-0.5 text-xs font-medium text-black/70",
                  ])}
                >
                  {data.condition}
                </span>
              )}
            </div>
          )}
          <h1
            className={cn([
              integralCF.className,
              "text-2xl md:text-[40px] md:leading-[40px] mb-3 md:mb-3.5 capitalize",
            ])}
          >
            {data.title}
          </h1>
          <div className="flex items-center mb-3 sm:mb-3.5">
            <Rating
              initialValue={data.rating}
              allowFraction
              SVGclassName="inline-block"
              emptyClassName="fill-gray-50"
              size={25}
              readonly
            />
            <span className="text-black text-xs sm:text-sm ml-[11px] sm:ml-[13px] pb-0.5 sm:pb-0">
              {data.rating.toFixed(1)}
              <span className="text-black/60">/5</span>
            </span>
          </div>
          <div className="mb-5">
            <PriceDisplay price={data.price} discount={data.discount} size="detail" />
          </div>
          <p className="text-sm sm:text-base text-black/60 mb-5">
            {data.description ??
              "Carefully inspected football gear, guaranteed authentic and ready for match day."}
          </p>
          {(data.conditionNotes || data.defectNotes || data.authenticityVerified || data.includesOriginalBox || data.insoleLengthMm) && (
            <div className="mb-5 grid gap-2 rounded-md border border-black/10 p-4 text-sm text-black/70">
              {data.conditionNotes && <p><strong>Condition:</strong> {data.conditionNotes}</p>}
              {data.defectNotes && <p><strong>Visible wear:</strong> {data.defectNotes}</p>}
              {data.authenticityVerified && <p>Authenticity verified</p>}
              {data.includesOriginalBox && <p>Original box included</p>}
              {data.insoleLengthMm && <p><strong>Insole length:</strong> {data.insoleLengthMm} mm</p>}
            </div>
          )}
          <hr className="h-[1px] border-t-black/10 mb-5" />
          <SizeSelection data={data} />
          <hr className="hidden md:block h-[1px] border-t-black/10 my-5" />
          <AddToCardSection data={data} />
        </div>
      </div>
    </>
  );
};

export default Header;
