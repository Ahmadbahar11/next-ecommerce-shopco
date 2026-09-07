import React from "react";
import { Product } from "@/types/product.types";

const SizeSelection = ({ data }: { data: Product }) => {
  if (!data.size) return null;

  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">Size</span>
      <div className="flex items-center flex-wrap lg:space-x-3">
        <span className="bg-black text-white font-medium flex items-center justify-center px-5 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base rounded-full m-1 lg:m-0 max-h-[46px]">
          {data.size}
        </span>
      </div>
    </div>
  );
};

export default SizeSelection;
