import React from "react";

const brandsData: { id: string; name: string }[] = [
  { id: "nike", name: "Nike" },
  { id: "adidas", name: "adidas" },
  { id: "puma", name: "PUMA" },
  { id: "under-armour", name: "Under Armour" },
  { id: "new-balance", name: "New Balance" },
];

const Brands = () => {
  return (
    <div className="bg-black">
      <div className="max-w-frame mx-auto flex flex-wrap items-center justify-center md:justify-between py-5 md:py-0 sm:px-4 xl:px-0 space-x-7">
        {brandsData.map((brand) => (
          <span
            key={brand.id}
            className="text-white/90 font-bold text-lg lg:text-2xl my-5 md:my-11 tracking-wide"
          >
            {brand.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Brands;
