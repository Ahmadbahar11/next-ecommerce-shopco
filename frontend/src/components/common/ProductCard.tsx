import React from "react";
import Rating from "../ui/Rating";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product.types";
import PriceDisplay from "./PriceDisplay";

type ProductCardProps = {
  data: Product;
};

const ProductCard = ({ data }: ProductCardProps) => {
  return (
    <Link
      href={`/shop/product/${data.id}/${data.title.split(" ").join("-")}`}
      className="flex flex-col items-start aspect-auto"
    >
      <div className="relative bg-[#F0EEED] rounded-[13px] lg:rounded-[20px] w-full lg:max-w-[295px] aspect-square mb-2.5 xl:mb-4 overflow-hidden">
        {data.condition && (
          <span
            className={`absolute left-2.5 top-2.5 xl:left-3 xl:top-3 z-10 rounded-full px-2.5 py-1 text-[10px] xl:text-xs font-medium ${
              data.condition === "new"
                ? "bg-black text-white"
                : "bg-white text-black/70 border border-black/10"
            }`}
          >
            {data.condition === "new" ? "Brand New" : "Pre-Owned"}
          </span>
        )}
        <Image
          src={data.srcUrl}
          width={295}
          height={298}
          className="rounded-md w-full h-full object-contain hover:scale-110 transition-all duration-500"
          alt={data.title}
          priority
        />
      </div>
      {data.brand && (
        <span className="text-black/50 text-xs xl:text-sm uppercase tracking-wide">
          {data.brand}
        </span>
      )}
      <strong className="text-black xl:text-xl">{data.title}</strong>
      <div className="flex items-end mb-1 xl:mb-2">
        <Rating
          initialValue={data.rating}
          allowFraction
          SVGclassName="inline-block"
          emptyClassName="fill-gray-50"
          size={19}
          readonly
        />
        <span className="text-black text-xs xl:text-sm ml-[11px] xl:ml-[13px] pb-0.5 xl:pb-0">
          {data.rating.toFixed(1)}
          <span className="text-black/60">/5</span>
        </span>
      </div>
      <PriceDisplay price={data.price} discount={data.discount} />
    </Link>
  );
};

export default ProductCard;
